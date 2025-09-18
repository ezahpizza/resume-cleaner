import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  LogOut, 
  Zap, 
  CheckCircle, 
  Clock,
  RefreshCw,
  User
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ user, onLogout }) => {
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [cleaningLoading, setCleaningLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get(`${API}/resume/list`);
      setResumes(response.data);
    } catch (error) {
      toast.error('Failed to fetch resumes');
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error('Only PDF and DOCX files are supported');
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Resume uploaded successfully!');
      await fetchResumes();
      
      // Set the uploaded resume as current
      const newResume = {
        id: response.data.resume_id,
        original_filename: file.name,
        original_text: response.data.original_text,
        cleaned_text: null
      };
      setCurrentResume(newResume);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCleanResume = async (resumeId) => {
    setCleaningLoading(true);
    try {
      const response = await axios.post(`${API}/resume/clean`, {
        resume_id: resumeId
      });

      toast.success('Resume cleaned successfully!');
      
      // Update current resume with cleaned text
      if (currentResume && currentResume.id === resumeId) {
        setCurrentResume(prev => ({
          ...prev,
          cleaned_text: response.data.cleaned_text
        }));
      }
      
      await fetchResumes();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Cleaning failed');
    } finally {
      setCleaningLoading(false);
    }
  };

  const handleDownload = async (resumeId, filename) => {
    try {
      const response = await axios.get(`${API}/resume/${resumeId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
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

  const handleViewResume = async (resumeId) => {
    try {
      const response = await axios.get(`${API}/resume/${resumeId}`);
      setCurrentResume(response.data);
    } catch (error) {
      toast.error('Failed to load resume');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-4 h-4" />
                <span className="font-medium">{user?.username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center space-x-2 border-gray-300 hover:border-red-400 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
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
              </CardHeader>
              <CardContent>
                <div
                  className={`file-upload-area p-8 text-center transition-all duration-300 ${
                    dragOver ? 'drag-over' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadLoading ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <p className="text-gray-600">Uploading and processing...</p>
                    </div>
                  ) : (
                    <>
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Drag and drop your resume here, or click to browse
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer">
                          Choose File
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Supports PDF and DOCX files up to 10MB
                      </p>
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
                          <h4 className="font-medium text-gray-900 truncate">
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
                        <p className="text-xs text-gray-500 mb-3">
                          {formatDate(resume.created_at)}
                        </p>
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