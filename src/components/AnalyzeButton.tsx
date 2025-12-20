
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAnalysis } from "@/contexts/AnalysisContext";

interface AnalyzeButtonProps {
  selectedFiles: File[];
  onReset: () => void;
  isAnalyzing: boolean;
}

const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({ 
  selectedFiles, 
  onReset, 
  isAnalyzing 
}) => {
  const { analyzeMultipleImages } = useAnalysis();

  const handleAnalyzeClick = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files first");
      return;
    }

    try {
      await analyzeMultipleImages(selectedFiles);
      toast.success(`Analysis completed successfully for ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error("Failed to analyze images");
      console.error(error);
    }
  };

  if (selectedFiles.length === 0) {
    return null;
  }

  return (
    <>
      <Button 
        type="button" 
        onClick={onReset}
        variant="outline"
        disabled={isAnalyzing}
      >
        Reset
      </Button>
      
      <Button
        type="button"
        onClick={handleAnalyzeClick}
        className="bg-medical-700 hover:bg-medical-800"
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <span className="animate-pulse-opacity">Analyzing...</span>
            <span className="ml-2 animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
          </>
        ) : (
          `Analyze ${selectedFiles.length} Image${selectedFiles.length > 1 ? 's' : ''}`
        )}
      </Button>
    </>
  );
};

export default AnalyzeButton;
