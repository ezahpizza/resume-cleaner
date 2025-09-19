import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Zap, 
  CheckCircle, 
  Clock,
  RefreshCw,
  XCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useResume } from '../hooks/useResume';
import { formatFileSize, formatDate } from '../lib/formatters';
import { toast } from 'sonner';
import FileUploadValidation from './FileUploadValidation';
import { resumeService } from '../services/resumeService';

const Dashboard = () => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [backendConnected, setBackendConnected] = useState(null);
  const {
    resumes,
    currentResume,
    loading,
    uploadLoading,
    cleaningLoading,
    uploadProgress,
    uploadedFileInfo,
    uploadResume,
    cleanResume,
    downloadResume,
    viewResume,
    fetchResumes,
    setCurrentResume
  } = useResume();

  // Check backend connection on mount
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        await resumeService.healthCheck();
        setBackendConnected(true);
      } catch (error) {
        setBackendConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleFileSelect = (file) => {
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      setSelectedFile(file);
      // Clear the file input immediately after selection to allow re-selection
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) {
      console.error('No file provided to handleFileUpload');
      return;
    }

    console.log('Starting upload for file:', file.name);

    try {
      await uploadResume(file);
      console.log('Upload completed successfully');

      // Clear selection after successful upload
      setSelectedFile(null);
      setValidationResult(null);

      // Clear the file input after successful upload
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      // Don't clear the file on error so user can retry
    }
  };

  const handleCleanResume = async (resumeId) => {
    await cleanResume(resumeId);
  };

  const handleDownload = async (resumeId, filename) => {
    await downloadResume(resumeId, filename);
  };

  const handleViewResume = async (resumeId) => {
    await viewResume(resumeId);
  };

  // Enhanced drag and drop handlers
  const handleDragOver = (e) => {
    if (backendConnected === false) return;
    e.preventDefault();
    e.stopPropagation();
    console.log('Drag over detected');
    setDragOver(true);
  };

  const handleDragEnter = (e) => {
    if (backendConnected === false) return;
    e.preventDefault();
    e.stopPropagation();
    console.log('Drag enter detected');
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (backendConnected === false) return;
    e.preventDefault();
    e.stopPropagation();
    console.log('Drag leave detected');
    // Only remove drag state if leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      console.log('Leaving drop zone entirely');
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    if (backendConnected === false) return;
    e.preventDefault();
    e.stopPropagation();
    console.log('Drop detected');
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Dropped files:', files);
    
    if (files.length === 0) {
      toast.error('No files were dropped');
      return;
    }
    
    if (files.length > 1) {
      toast.error('Please upload only one file at a time');
      return;
    }
    
    handleFileSelect(files[0]);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Resume Cleaner
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {backendConnected === null ? (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Checking...</span>
                  </div>
                ) : backendConnected ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Upload & Resume List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <Card className="glass border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span>Upload Resume</span>
                </CardTitle>
                <CardDescription>
                  Upload your PDF or DOCX resume to get started
                </CardDescription>
                {backendConnected === false && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-800">
                        Backend server is not running. Please start the backend server on port 8000.
                      </span>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`file-upload-area p-8 text-center transition-all duration-300 ${
                    dragOver ? 'drag-over' : ''
                  } ${(uploadLoading || backendConnected === false) ? 'pointer-events-none opacity-50' : ''}`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadLoading ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600">
                            {uploadProgress}%
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 font-medium">
                          {uploadProgress < 50 ? 'Uploading...' : 'Processing document...'}
                        </p>
                        {uploadedFileInfo && (
                          <div className="mt-2 text-sm text-gray-500">
                            <p>{uploadedFileInfo.name}</p>
                            <p>{(uploadedFileInfo.size / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                        )}
                      </div>
                      {/* Progress bar */}
                      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <FileText className={`w-12 h-12 mx-auto mb-4 transition-colors duration-300 ${
                        dragOver ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <p className={`mb-4 transition-colors duration-300 ${
                        dragOver ? 'text-blue-600 font-medium' : 'text-gray-600'
                      }`}>
                        {dragOver 
                          ? 'Drop your resume here to upload' 
                          : 'Drag and drop your resume here, or click to browse'
                        }
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => {
                          console.log('File input changed:', e.target.files);
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                        disabled={uploadLoading || backendConnected === false}
                      />
                      <label htmlFor="file-upload">
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer disabled:opacity-50"
                          disabled={uploadLoading || backendConnected === false}
                        >
                          Choose File
                        </Button>
                      </label>
                      <div className="mt-4 text-xs text-gray-500 space-y-1">
                        <p>Supports PDF and DOCX files up to 10MB</p>
                        <p>✓ Secure processing • ✓ No content stored permanently</p>
                      </div>
                      
                      {/* File Validation */}
                      {selectedFile && (
                        <div className="mt-6">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Selected File</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedFile(null);
                                setValidationResult(null);
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                          <FileUploadValidation 
                            file={selectedFile} 
                            onValidationComplete={(result) => {
                              console.log('Validation complete:', result);
                              setValidationResult(result);
                            }}
                          />
                          {validationResult && (
                            <div className="mt-2 text-xs">
                              Validation: {validationResult.isValid ? 'Valid' : 'Invalid'}
                              {validationResult.issues?.length > 0 && ` (${validationResult.issues.length} issues)`}
                            </div>
                          )}
                          {validationResult?.isValid && (
                            <div className="mt-4">
                              <Button
                                onClick={() => handleFileUpload(selectedFile)}
                                disabled={uploadLoading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                              >
                                {uploadLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Resume
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resume List */}
            <Card className="glass border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Resumes</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchResumes}
                    className="border-gray-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  {resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                {resumes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No resumes uploaded yet</p>
                    <p className="text-sm">Upload your first resume to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resumes.map((resume) => (
                      <div
                        key={resume.id}
                        className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                          currentResume?.id === resume.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleViewResume(resume.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 truncate flex-1 mr-2">
                            {resume.original_filename}
                          </h4>
                          <Badge variant={resume.cleaned_text ? "default" : "secondary"}>
                            {resume.cleaned_text ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {resume.cleaned_text ? 'Cleaned' : 'Original'}
                          </Badge>
                        </div>
                        
                        {/* Enhanced metadata display */}
                        <div className="space-y-1 mb-3">
                          <p className="text-xs text-gray-500">
                            {formatDate(resume.created_at)}
                          </p>
                          {resume.file_size && (
                            <p className="text-xs text-gray-500">
                              {formatFileSize(resume.file_size)}
                              {resume.extraction_metadata?.word_count && (
                                <span> • {resume.extraction_metadata.word_count} words</span>
                              )}
                            </p>
                          )}
                          {resume.extraction_metadata?.page_count && (
                            <p className="text-xs text-gray-500">
                              {resume.extraction_metadata.page_count} page{resume.extraction_metadata.page_count !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewResume(resume.id);
                            }}
                            className="flex-1 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {resume.cleaned_text ? (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(resume.id, resume.original_filename.split('.')[0]);
                              }}
                              className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCleanResume(resume.id);
                              }}
                              disabled={cleaningLoading}
                              className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Clean
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Resume Preview */}
          <div className="lg:col-span-2">
            <Card className="glass border-0 shadow-lg min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resume Preview</span>
                  {currentResume && (
                    <div className="flex space-x-2">
                      {!currentResume.cleaned_text && (
                        <Button
                          onClick={() => handleCleanResume(currentResume.id)}
                          disabled={cleaningLoading}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          {cleaningLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Cleaning...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Clean with AI
                            </>
                          )}
                        </Button>
                      )}
                      {currentResume.cleaned_text && (
                        <Button
                          onClick={() => handleDownload(currentResume.id, currentResume.original_filename.split('.')[0])}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      )}
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  {currentResume ? (
                    `Viewing: ${currentResume.original_filename}`
                  ) : (
                    'Select a resume to preview'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentResume ? (
                  <Tabs defaultValue="original" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="original">Original</TabsTrigger>
                      <TabsTrigger value="cleaned" disabled={!currentResume.cleaned_text}>
                        Cleaned {currentResume.cleaned_text && <CheckCircle className="w-4 h-4 ml-2 text-green-500" />}
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="original" className="mt-0">
                      <div className="resume-preview">
                        <div className="bg-white p-6 rounded-lg border shadow-sm max-h-96 overflow-y-auto">
                          <pre className="resume-text whitespace-pre-wrap text-sm">
                            {currentResume.original_text}
                          </pre>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="cleaned" className="mt-0">
                      {currentResume.cleaned_text ? (
                        <div className="resume-preview">
                          <div className="bg-white p-6 rounded-lg border shadow-sm max-h-96 overflow-y-auto">
                            <pre className="resume-text whitespace-pre-wrap text-sm">
                              {currentResume.cleaned_text}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Resume not cleaned yet</p>
                          <p className="mb-4">Click the "Clean with AI" button to fix grammar and punctuation errors</p>
                          <Button
                            onClick={() => handleCleanResume(currentResume.id)}
                            disabled={cleaningLoading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            {cleaningLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Cleaning...
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 mr-2" />
                                Clean with AI
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <FileText className="w-20 h-20 mx-auto mb-6 opacity-30" />
                    <h3 className="text-xl font-semibold mb-2">No resume selected</h3>
                    <p className="mb-6">Upload a new resume or select an existing one to get started</p>
                    <div className="space-y-2">
                      <p className="text-sm">✓ Upload PDF or DOCX files</p>
                      <p className="text-sm">✓ AI-powered grammar correction</p>
                      <p className="text-sm">✓ Download professional PDF</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;