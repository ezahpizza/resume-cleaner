export const validateResumeFile = (file) => {
  console.log('validateResumeFile called with:', {
    name: file.name,
    size: file.size,
    type: file.type
  });

  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = {
    'application/pdf': { name: 'PDF', extension: '.pdf' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      name: 'DOCX', extension: '.docx'
    }
  };

  const issues = [];
  const warnings = [];
  let isValid = true;

  // Check file type
  if (!allowedTypes[file.type]) {
    issues.push({
      type: 'error',
      message: `Unsupported file type: ${file.type}`,
      detail: 'Only PDF and DOCX files are supported'
    });
    isValid = false;
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  const expectedExtension = allowedTypes[file.type]?.extension;
  if (expectedExtension && extension !== expectedExtension) {
    issues.push({
      type: 'error',
      message: `File extension mismatch`,
      detail: `Expected ${expectedExtension} but got ${extension}`
    });
    isValid = false;
  }

  // Check file size
  if (file.size > maxSize) {
    issues.push({
      type: 'error',
      message: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
      detail: `Maximum allowed size is 10MB`
    });
    isValid = false;
  }

  // Check if file is empty
  if (file.size === 0) {
    issues.push({
      type: 'error',
      message: 'Empty file detected',
      detail: 'The selected file appears to be empty'
    });
    isValid = false;
  }

  // Warnings for large files (but still valid)
  if (file.size > 5 * 1024 * 1024 && file.size <= maxSize) {
    warnings.push({
      type: 'warning',
      message: `Large file: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
      detail: 'Processing may take longer for large files'
    });
  }

  // Warning for very long filenames
  if (file.name.length > 100) {
    warnings.push({
      type: 'warning',
      message: 'Long filename',
      detail: 'Consider using a shorter filename for better compatibility'
    });
  }

  const validationResult = {
    isValid,
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
      typeInfo: allowedTypes[file.type]
    },
    issues,
    warnings
  };

  console.log('validateResumeFile result:', validationResult);
  return validationResult;
};

export const validateFileSimple = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const allowedExtensions = ['.pdf', '.docx'];

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only PDF and DOCX files are supported. Please select a valid file.'
    };
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `Invalid file extension: ${extension}. Only .pdf and .docx files are allowed.`
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the maximum limit of 10MB.`
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'The selected file is empty. Please choose a valid resume file.'
    };
  }

  return { isValid: true };
};