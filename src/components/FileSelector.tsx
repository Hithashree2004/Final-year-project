
import React from "react";

// Extend HTMLInputElement to include webkitdirectory
declare module "react" {
  interface InputHTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

interface FileSelectorProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  folderInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalyzing: boolean;
}

const FileSelector: React.FC<FileSelectorProps> = ({
  fileInputRef,
  folderInputRef,
  onFileChange,
  isAnalyzing
}) => {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-3">
      {/* Hidden file inputs for programmatic access */}
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        onChange={onFileChange}
        accept="image/*"
        multiple
        disabled={isAnalyzing}
      />
      <input
        ref={folderInputRef}
        type="file"
        className="sr-only"
        onChange={onFileChange}
        accept="image/*"
        webkitdirectory=""
        directory=""
        multiple
        disabled={isAnalyzing}
      />
    </div>
  );
};

export default FileSelector;
