
import React from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Folder } from "lucide-react";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { useFileSelection } from "@/hooks/useFileSelection";
import FileSelector from "@/components/FileSelector";
import FilePreview from "@/components/FilePreview";
import AnalyzeButton from "@/components/AnalyzeButton";

const FileUpload: React.FC = () => {
  const { isAnalyzing, analysisMode, setAnalysisMode } = useAnalysis();
  const {
    selectedFiles,
    previewUrls,
    fileInputRef,
    folderInputRef,
    handleFileChange,
    handleReset
  } = useFileSelection();

  const handleUploadFolder = () => {
    folderInputRef.current?.click();
  };

  return (
    <Card className="w-full p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Upload Histopathological Images</h2>
      <p className="text-gray-500 mb-6 text-center">
        Upload whole slide images of ovarian cancerous cells for analysis
      </p>

      {/* Analysis Mode Selection */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Analysis Mode</h3>
        <RadioGroup 
          value={analysisMode} 
          onValueChange={setAnalysisMode}
          className="flex flex-row gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="proposed" id="proposed" />
            <Label htmlFor="proposed" className="cursor-pointer">Proposed Method</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existing" id="existing" />
            <Label htmlFor="existing" className="cursor-pointer">Existing Method</Label>
          </div>
        </RadioGroup>
        <p className="text-sm text-gray-500 mt-2">
          {analysisMode === "proposed" 
            ? "Enhanced analysis with improved cell detection"
            : "Traditional analysis method"
          }
        </p>
      </div>

      {/* Upload Options */}
      <div className="mb-6 flex justify-center">
        <Button
          onClick={handleUploadFolder}
          variant="outline"
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          <Folder className="h-4 w-4" />
          Upload Folder
        </Button>
      </div>
      
      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-medical-300 px-6 py-10">
        <div className="text-center">
          <FilePreview previewUrls={previewUrls} selectedFiles={selectedFiles} />
          
          <FileSelector
            fileInputRef={fileInputRef}
            folderInputRef={folderInputRef}
            onFileChange={handleFileChange}
            isAnalyzing={isAnalyzing}
          />

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <AnalyzeButton
              selectedFiles={selectedFiles}
              onReset={handleReset}
              isAnalyzing={isAnalyzing}
            />
          </div>
          
          {previewUrls.length === 0 && (
            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG, TIFF up to 2GB each
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FileUpload;
