from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from datetime import datetime, timezone
from models import Resume, ResumeCleanRequest, FileUploadResponse
from database import db
from file_processing import validate_uploaded_file, extract_text_from_file, create_pdf_from_text
from ai_service import ai_service
from config import config
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/resume/upload", response_model=FileUploadResponse)
async def upload_resume(
    file: UploadFile = File(...)
):
    """Enhanced resume upload with comprehensive validation and processing"""

    # Validate file before processing
    validation_result = validate_uploaded_file(file)
    if not validation_result.is_valid:
        raise HTTPException(status_code=400, detail=validation_result.error_message)

    try:
        # Read file content
        file_content = await file.read()
        actual_file_size = len(file_content)

        # Validate file size after reading content
        if actual_file_size > config.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size ({actual_file_size / 1024 / 1024:.1f}MB) exceeds maximum allowed size (10MB)"
            )

        # Check for empty file
        if actual_file_size == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        # Extract text based on file type with enhanced processing
        extraction_result = extract_text_from_file(file_content, file.content_type)
        extracted_text = extraction_result["text"]

        # Additional validation for resume content
        if len(extracted_text.split()) < 10:
            raise HTTPException(
                status_code=400,
                detail="The extracted text is too short. Please ensure your resume contains sufficient content."
            )

        # Create enhanced resume record (no user_id needed)
        resume = Resume(
            user_id="",  # Empty user_id since no auth
            original_filename=file.filename,
            original_text=extracted_text
        )

        # Store in database with additional metadata
        resume_doc = resume.dict()
        resume_doc.update({
            "file_size": actual_file_size,
            "file_type": file.content_type,
            "extraction_metadata": extraction_result,
            "processing_status": "completed"
        })

        await db.get_collection("resumes").insert_one(resume_doc)

        logger.info(f"Resume uploaded successfully - File: {file.filename}, Size: {actual_file_size} bytes")

        return FileUploadResponse(
            message="Resume uploaded and processed successfully",
            resume_id=resume.id,
            original_text=extracted_text,
            file_size=actual_file_size,
            word_count=extraction_result["word_count"],
            character_count=extraction_result["character_count"],
            file_type=file.content_type
        )

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error during file upload - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while processing your file: {str(e)}")

@router.post("/resume/clean")
async def clean_resume(
    request: ResumeCleanRequest
):
    """Clean resume using AI"""
    # Get resume from database
    resume_doc = await db.get_collection("resumes").find_one({"id": request.resume_id})
    if not resume_doc:
        raise HTTPException(status_code=404, detail="Resume not found")

    try:
        # Clean text using AI service
        cleaned_text = await ai_service.clean_resume_text(resume_doc["original_text"])

        # Update resume with cleaned text
        await db.get_collection("resumes").update_one(
            {"id": request.resume_id},
            {
                "$set": {
                    "cleaned_text": cleaned_text,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )

        return {
            "message": "Resume cleaned successfully",
            "cleaned_text": cleaned_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning resume: {str(e)}")

@router.get("/resume/list")
async def list_resumes():
    """List all resumes"""
    resumes_docs = await db.get_collection("resumes").find().to_list(100)
    return [Resume(**resume_doc) for resume_doc in resumes_docs]

@router.get("/resume/{resume_id}")
async def get_resume(
    resume_id: str
):
    """Get a specific resume"""
    resume_doc = await db.get_collection("resumes").find_one({"id": resume_id})
    if not resume_doc:
        raise HTTPException(status_code=404, detail="Resume not found")

    return Resume(**resume_doc)

@router.get("/resume/{resume_id}/download")
async def download_resume(
    resume_id: str
):
    """Download cleaned resume as PDF"""
    resume_doc = await db.get_collection("resumes").find_one({"id": resume_id})
    if not resume_doc:
        raise HTTPException(status_code=404, detail="Resume not found")

    if not resume_doc.get("cleaned_text"):
        raise HTTPException(status_code=400, detail="Resume has not been cleaned yet")

    try:
        # Create PDF from cleaned text
        filename = f"cleaned_{resume_doc['original_filename'].rsplit('.', 1)[0]}"
        pdf_path = create_pdf_from_text(resume_doc["cleaned_text"], filename)

        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"{filename}.pdf"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")