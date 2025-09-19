import React, { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, FileText, HardDrive } from 'lucide-react';
import { validateResumeFile } from '../lib/fileValidation';
import { formatFileSize, getProcessingTimeEstimate } from '../lib/formatters';

const FileUploadValidation = ({ file, onValidationComplete }) => {
  const [validation, setValidation] = useState(null);

  React.useEffect(() => {
    if (file) {
      validateFile(file);
    }
  }, [file]);

  const validateFile = (file) => {
    const validationResult = validateResumeFile(file);
    setValidation(validationResult);
    
    if (onValidationComplete) {
      onValidationComplete(validationResult);
    }
  };



  if (!validation) return null;

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      {/* File Info */}
      <div className="flex items-start space-x-3">
        <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">
            {validation.file.name}
          </h4>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-sm text-gray-500">
              {formatFileSize(validation.file.size)}
            </span>
            {validation.file.typeInfo && (
              <Badge variant="outline" className="text-xs">
                {validation.file.typeInfo.name}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {validation.isValid ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Validation Issues */}
      {validation.issues.length > 0 && (
        <div className="space-y-2">
          {validation.issues.map((issue, index) => (
            <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{issue.message}</strong>
                {issue.detail && (
                  <div className="text-sm mt-1">{issue.detail}</div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Validation Warnings */}
      {validation.warnings.length > 0 && (
        <div className="space-y-2">
          {validation.warnings.map((warning, index) => (
            <Alert key={index} variant="warning" className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>{warning.message}</strong>
                {warning.detail && (
                  <div className="text-sm mt-1">{warning.detail}</div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Success Message */}
      {validation.isValid && validation.issues.length === 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>File validation passed!</strong>
            <div className="text-sm mt-1">
              Your {validation.file.typeInfo?.name} file is ready for upload and processing.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Processing Estimate */}
      {validation.isValid && (
        <div className="text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-3 h-3" />
            <span>
              Estimated processing time: {
                getProcessingTimeEstimate(validation.file.size)
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadValidation;