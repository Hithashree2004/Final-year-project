
import React from "react";
import { Image } from "lucide-react";

interface FilePreviewProps {
  previewUrls: string[];
  selectedFiles: File[];
}

const FilePreview: React.FC<FilePreviewProps> = ({ previewUrls, selectedFiles }) => {
  if (previewUrls.length === 0) {
    return (
      <div className="flex justify-center mb-4">
        <Image className="h-12 w-12 text-medical-500" />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {previewUrls.map((url, index) => (
          <div key={index} className="overflow-hidden rounded-md">
            <img 
              src={url} 
              alt={`Preview ${index + 1}`} 
              className="h-24 w-full object-cover"
            />
          </div>
        ))}
      </div>
      {selectedFiles.length > previewUrls.length && (
        <p className="mt-2 text-sm text-gray-500">
          +{selectedFiles.length - previewUrls.length} more {selectedFiles.length - previewUrls.length === 1 ? 'file' : 'files'}
        </p>
      )}
      <p className="mt-2 text-sm text-gray-500">
        {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
      </p>
    </div>
  );
};

export default FilePreview;
