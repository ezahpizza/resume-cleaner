from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid

class Resume(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # Made optional since no auth
    original_filename: str
    original_text: str
    cleaned_text: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ResumeCleanRequest(BaseModel):
    resume_id: str

class FileUploadResponse(BaseModel):
    message: str
    resume_id: str
    original_text: str
    file_size: int
    word_count: int
    character_count: int
    file_type: str

class FileValidationResult(BaseModel):
    is_valid: bool
    error_message: Optional[str] = None
    file_size: int
    file_type: str