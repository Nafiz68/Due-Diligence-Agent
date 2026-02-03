import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface DocumentUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
}

export function DocumentUpload({ onUpload, maxFiles = 10, accept }: DocumentUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || {
      'application/pdf': ['.pdf'],
    },
    maxFiles,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-gray-600">Drop the files here...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-2">
              Drag and drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              PDF files only, up to {maxFiles} files
            </p>
          </>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="ml-2 text-sm text-gray-700 truncate">{file.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-2 p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleUpload} className="btn btn-primary w-full">
            Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
          </button>
        </div>
      )}
    </div>
  );
}

