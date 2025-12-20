
import { useState, useRef } from "react";
import { toast } from "sonner";

export const useFileSelection = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Filter out non-image files
    const imageFiles = files.filter(file => file.type.startsWith("image/"));
    
    if (imageFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }
    
    if (imageFiles.length !== files.length) {
      toast.warning(`${files.length - imageFiles.length} non-image files were ignored`);
    }
    
    // Check file sizes
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB in bytes
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} files exceed the 2GB size limit and were ignored`);
      const validFiles = imageFiles.filter(file => file.size <= maxSize);
      if (validFiles.length === 0) return;
      setSelectedFiles(validFiles);
    } else {
      setSelectedFiles(imageFiles);
    }
    
    // Create previews for the first 5 images only (to avoid performance issues)
    const previewLimit = 5;
    const filesToPreview = imageFiles.slice(0, previewLimit);
    
    const urls: string[] = [];
    filesToPreview.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        urls.push(reader.result as string);
        if (urls.length === filesToPreview.length) {
          setPreviewUrls(urls);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
  };

  return {
    selectedFiles,
    previewUrls,
    fileInputRef,
    folderInputRef,
    handleFileChange,
    handleReset
  };
};
