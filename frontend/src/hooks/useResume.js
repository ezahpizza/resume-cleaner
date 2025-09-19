import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { resumeService } from '../services/resumeService';
import { validateFileSimple } from '../lib/fileValidation';

export const useResume = () => {
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [cleaningLoading, setCleaningLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const data = await resumeService.getResumes();
      setResumes(data);
    } catch (error) {
      toast.error('Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  const uploadResume = async (file) => {
    if (!file) return;

    // Validate file
    const validation = validateFileSimple(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setUploadLoading(true);
    setUploadProgress(0);
    setUploadedFileInfo({
      name: file.name,
      size: file.size,
      type: file.type
    });

    const onProgress = (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setUploadProgress(percentCompleted);
    };

    try {
      const response = await resumeService.uploadResume(file, onProgress);

      toast.success(
        `Resume uploaded successfully! ${response.word_count} words extracted.`
      );

      await fetchResumes();

      // Set the uploaded resume as current with enhanced data
      const newResume = {
        id: response.resume_id,
        original_filename: file.name,
        original_text: response.original_text,
        cleaned_text: null,
        file_size: response.file_size,
        word_count: response.word_count,
        character_count: response.character_count,
        file_type: response.file_type
      };
      setCurrentResume(newResume);

      // Show file info toast
      toast.success(
        `Processing complete: ${response.word_count} words, ${response.character_count} characters extracted`
      );

    } catch (error) {
      console.error('Upload error:', error);

      // Enhanced error handling
      let errorMessage = 'Upload failed. Please try again.';

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large. Please choose a file smaller than 10MB.';
      } else if (error.response?.status === 415) {
        errorMessage = 'Unsupported file type. Please upload a PDF or DOCX file.';
      } else if (error.response?.status === 409) {
        errorMessage = 'This resume has already been uploaded. Please select a different file.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      toast.error(errorMessage);
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
      setUploadedFileInfo(null);
    }
  };

  const cleanResume = async (resumeId) => {
    setCleaningLoading(true);
    try {
      const response = await resumeService.cleanResume(resumeId);

      toast.success('Resume cleaned successfully!');

      // Update current resume with cleaned text
      if (currentResume && currentResume.id === resumeId) {
        setCurrentResume(prev => ({
          ...prev,
          cleaned_text: response.cleaned_text
        }));
      }

      await fetchResumes();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Cleaning failed');
    } finally {
      setCleaningLoading(false);
    }
  };

  const downloadResume = async (resumeId, filename) => {
    try {
      const data = await resumeService.downloadResume(resumeId);

      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cleaned_${filename}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Resume downloaded successfully!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const viewResume = async (resumeId) => {
    try {
      const data = await resumeService.getResume(resumeId);
      setCurrentResume(data);
    } catch (error) {
      toast.error('Failed to load resume');
    }
  };

  return {
    resumes,
    currentResume,
    loading,
    uploadLoading,
    cleaningLoading,
    uploadProgress,
    uploadedFileInfo,
    fetchResumes,
    uploadResume,
    cleanResume,
    downloadResume,
    viewResume,
    setCurrentResume
  };
};