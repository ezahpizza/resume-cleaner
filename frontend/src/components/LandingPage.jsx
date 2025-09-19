import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { FileText, Zap, Download, Shield, CheckCircle, Star } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      title: "Smart Upload",
      description: "Upload your resume in PDF or DOCX format with our intuitive drag-and-drop interface."
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered Cleaning",
      description: "Advanced AI technology fixes grammar, punctuation, and spelling errors while preserving your content."
    },
    {
      icon: <Download className="w-8 h-8 text-blue-600" />,
      title: "Instant Download",
      description: "Get your polished resume as a professional PDF ready for job applications."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Secure & Private",
      description: "Your resume data is encrypted and secure. We never share your personal information."
    }
  ];

  const benefits = [
    "Fix grammar and punctuation errors instantly",
    "Preserve original formatting and structure",
    "Professional PDF output",
    "Fast processing with AI technology",
    "Secure file handling"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
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
            <Link to="/dashboard">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Polish Your Resume with
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                AI Precision
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your resume with our advanced AI technology. Fix grammar, punctuation, and spelling errors 
              while preserving your unique voice and formatting. Get job-ready in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-full text-lg transition-all duration-200 hover:scale-105 shadow-xl">
                  Start Cleaning Now
                </Button>
              </Link>
              <Button variant="outline" className="border-2 border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-full text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-200">
                Learn More
              </Button>
            </div>
          </div>

          {/* Demo Preview */}
          <div className="mt-16 relative">
            <div className="glass-dark rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Before: Original Resume
                  </h3>
                  <div className="bg-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
                    <p>john doe</p>
                    <p>software engineer</p>
                    <p>Im a dedicated software engineer with 5 year experience in web development. i have worked on various project using react, node.js and other technologies.</p>
                    <p className="text-red-400">❌ Grammar errors</p>
                    <p className="text-red-400">❌ Missing capitalization</p>
                    <p className="text-red-400">❌ Punctuation issues</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    After: AI-Cleaned Resume
                  </h3>
                  <div className="bg-white/10 rounded-lg p-4 font-mono text-sm text-gray-300">
                    <p>John Doe</p>
                    <p>Software Engineer</p>
                    <p>I'm a dedicated software engineer with 5 years of experience in web development. I have worked on various projects using React, Node.js, and other technologies.</p>
                    <p className="text-green-400">✅ Perfect grammar</p>
                    <p className="text-green-400">✅ Proper capitalization</p>
                    <p className="text-green-400">✅ Clean punctuation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Perfect Resumes
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides everything you need to create a polished, professional resume.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in">
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose Resume Cleaner?
              </h3>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of professionals who trust our AI technology to perfect their resumes and land their dream jobs.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link to="/dashboard" className="inline-block mt-8">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-200 hover:scale-105 shadow-lg">
                  Get Started Today
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <div className="glass rounded-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-xl p-6 shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="ml-4 text-gray-500 text-sm">resume.pdf</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="mt-6 flex items-center justify-center space-x-1 text-green-600">
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <span className="ml-2 font-semibold">Perfect Score!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Perfect Your Resume?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have successfully polished their resumes with our AI technology.
          </p>
          <Link to="/dashboard">
            <Button className="bg-white text-blue-600 hover:bg-gray-50 font-bold px-8 py-4 rounded-full text-lg transition-all duration-200 hover:scale-105 shadow-xl">
              Start Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-xl font-bold">Resume Cleaner</h4>
          </div>
          <p className="text-gray-400 mb-8">
            Professional resume cleaning powered by advanced AI technology.
          </p>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-500">
              © 2025 Resume Cleaner. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;