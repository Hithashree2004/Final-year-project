
import React, { createContext, useState, useContext, ReactNode } from "react";

interface TumorCellCounts {
  n1: number;
  n2: number;
  m1: number;
  m2: number;
  necrosis: number;
  tumorCells: number;
  total: number;
}

interface PatchData {
  patchId: number;
  n1: number;
  n2: number;
  m1: number;
  m2: number;
  necrosis: number;
  tumorCells: number;
  imageUrl?: string;
  fileName?: string;
}

interface ConfusionMatrixItem {
  name: string;
  value: number;
}

interface MetricsHistoryItem {
  iteration: number;
  precision: number;
  recall: number;
  f1Score: number;
  rSquared: number;
}

interface AnalysisMetrics {
  confusionMatrix: ConfusionMatrixItem[];
  history: MetricsHistoryItem[];
  finalPrecision: number;
  finalRecall: number;
  finalF1Score: number;
  finalRSquared: number;
}

interface ImageAnalysisResult {
  counts: TumorCellCounts;
  percentages: {
    n1: number;
    n2: number;
    m1: number;
    m2: number;
    necrosis: number;
    tumorCells: number;
  };
  survivalRate: number;
  imageUrl: string;
  fileName: string;
  metrics: AnalysisMetrics;
}

interface TumorAnalysisResult {
  images: ImageAnalysisResult[];
  currentImageIndex: number;
  patchHistory: PatchData[];
  overallMetrics: AnalysisMetrics;
}

interface AnalysisContextType {
  isAnalyzing: boolean;
  analysisResult: TumorAnalysisResult | null;
  analysisMode: "proposed" | "existing";
  setAnalysisMode: (mode: "proposed" | "existing") => void;
  analyzeImage: (file: File) => Promise<void>;
  analyzeMultipleImages: (files: File[]) => Promise<void>;
  setCurrentImageIndex: (index: number) => void;
  resetAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

// Deterministic random number generator based on seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate seed from string (file name)
const generateSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Generate deterministic random number in range
const seededRandomInRange = (seed: number, min: number, max: number): number => {
  const random = seededRandom(seed);
  return Math.floor(random * (max - min + 1)) + min;
};

// Fisher-Yates shuffle algorithm with seeded random
const seededShuffle = (array: number[], seed: number): number[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TumorAnalysisResult | null>(null);
  const [analysisMode, setAnalysisMode] = useState<"proposed" | "existing">("proposed");

  // Generate mock analysis for a single image with deterministic values
  const generateImageAnalysis = (file: File, folderSeed: number, imageIndex: number, totalImages: number, goodSurvivalIndices: Set<number>): ImageAnalysisResult => {
    const imageUrl = URL.createObjectURL(file);
    
    // Create deterministic seed for this specific file and mode
    const fileSeed = generateSeed(file.name + analysisMode);
    const combinedSeed = folderSeed + fileSeed;
    
    // Check if this patch should have good survival rate
    const isGoodSurvivalPatch = goodSurvivalIndices.has(imageIndex);
    
    // Generate base counts using deterministic random with survival bias
    let n1Count, n2Count, m1Count, m2Count, necrosisCount, tumorCellsCount;
    
    if (isGoodSurvivalPatch) {
      // Force good survival rates for randomly selected patches
      if (analysisMode === "existing") {
        // Higher anti-tumor cells for good survival
        n1Count = seededRandomInRange(combinedSeed + 1, 200, 400);
        n2Count = seededRandomInRange(combinedSeed + 2, 50, 150);
        m1Count = seededRandomInRange(combinedSeed + 3, 180, 350);
        m2Count = seededRandomInRange(combinedSeed + 4, 80, 200);
        necrosisCount = seededRandomInRange(combinedSeed + 5, 30, 100);
        tumorCellsCount = seededRandomInRange(combinedSeed + 6, 100, 250);
      } else {
        // Even higher for proposed method
        n1Count = seededRandomInRange(combinedSeed + 1, 250, 450);
        n2Count = seededRandomInRange(combinedSeed + 2, 40, 120);
        m1Count = seededRandomInRange(combinedSeed + 3, 220, 380);
        m2Count = seededRandomInRange(combinedSeed + 4, 70, 180);
        necrosisCount = seededRandomInRange(combinedSeed + 5, 25, 90);
        tumorCellsCount = seededRandomInRange(combinedSeed + 6, 80, 200);
      }
    } else {
      // Regular distribution for other patches (mostly moderate to poor survival)
      if (analysisMode === "existing") {
        // Lower counts for existing method
        n1Count = seededRandomInRange(combinedSeed + 1, 50, 250);
        n2Count = seededRandomInRange(combinedSeed + 2, 100, 350);
        m1Count = seededRandomInRange(combinedSeed + 3, 80, 260);
        m2Count = seededRandomInRange(combinedSeed + 4, 150, 450);
        necrosisCount = seededRandomInRange(combinedSeed + 5, 50, 200);
        tumorCellsCount = seededRandomInRange(combinedSeed + 6, 200, 600);
      } else {
        // Higher counts for proposed method with consistent differences
        const baseN1 = seededRandomInRange(combinedSeed + 1, 50, 250);
        const baseN2 = seededRandomInRange(combinedSeed + 2, 100, 350);
        const baseM1 = seededRandomInRange(combinedSeed + 3, 80, 260);
        const baseM2 = seededRandomInRange(combinedSeed + 4, 150, 450);
        const baseNecrosis = seededRandomInRange(combinedSeed + 5, 50, 200);
        const baseTumorCells = seededRandomInRange(combinedSeed + 6, 200, 600);
        
        // Add consistent differences (10-80 range) based on file seed
        const variations = [
          seededRandomInRange(combinedSeed + 7, 10, 80),  // N1 difference
          seededRandomInRange(combinedSeed + 8, 10, 50),  // N2 difference
          seededRandomInRange(combinedSeed + 9, 20, 80),  // M1 difference
          seededRandomInRange(combinedSeed + 10, 15, 45), // M2 difference
          seededRandomInRange(combinedSeed + 11, 25, 75), // Necrosis difference
          seededRandomInRange(combinedSeed + 12, 15, 80), // Tumor cells difference
        ];
        
        n1Count = baseN1 + variations[0];
        n2Count = baseN2 + variations[1];
        m1Count = baseM1 + variations[2];
        m2Count = baseM2 + variations[3];
        necrosisCount = baseNecrosis + variations[4];
        tumorCellsCount = baseTumorCells + variations[5];
      }
    }
    
    const totalCount = n1Count + n2Count + m1Count + m2Count + necrosisCount + tumorCellsCount;
    
    // Calculate percentages
    const n1Percentage = (n1Count / totalCount) * 100;
    const n2Percentage = (n2Count / totalCount) * 100;
    const m1Percentage = (m1Count / totalCount) * 100;
    const m2Percentage = (m2Count / totalCount) * 100;
    const necrosisPercentage = (necrosisCount / totalCount) * 100;
    const tumorCellsPercentage = (tumorCellsCount / totalCount) * 100;
    
    // Calculate survival rate
    const goodCellsRatio = (n1Count + m1Count) / totalCount;
    const badCellsRatio = (n2Count + m2Count + necrosisCount + tumorCellsCount) / totalCount;
    const survivalRate = Math.min(Math.max((goodCellsRatio / (goodCellsRatio + badCellsRatio)) * 100, 10), 95);
    
    // Generate deterministic statistical metrics
    const precision = 0.75 + (seededRandom(combinedSeed + 13) * 0.15);
    const recall = 0.70 + (seededRandom(combinedSeed + 14) * 0.20);
    const f1Score = 2 * (precision * recall) / (precision + recall);
    const rSquared = 0.65 + (seededRandom(combinedSeed + 15) * 0.25);
    
    // Generate deterministic confusion matrix
    const confusionMatrix = [
      { name: 'True Positive', value: seededRandomInRange(combinedSeed + 16, 70, 90) },
      { name: 'False Positive', value: seededRandomInRange(combinedSeed + 17, 5, 20) },
      { name: 'False Negative', value: seededRandomInRange(combinedSeed + 18, 5, 20) },
      { name: 'True Negative', value: seededRandomInRange(combinedSeed + 19, 70, 90) },
    ];
    
    // Generate deterministic metric history for line charts
    const metricsHistory = Array.from({ length: 10 }, (_, i) => ({
      iteration: i + 1,
      precision: 0.5 + ((i / 9) * 0.3) + (seededRandom(combinedSeed + 20 + i) * 0.1),
      recall: 0.45 + ((i / 9) * 0.35) + (seededRandom(combinedSeed + 30 + i) * 0.1),
      f1Score: 0.48 + ((i / 9) * 0.32) + (seededRandom(combinedSeed + 40 + i) * 0.1),
      rSquared: 0.4 + ((i / 9) * 0.4) + (seededRandom(combinedSeed + 50 + i) * 0.1),
    }));

    return {
      counts: {
        n1: n1Count,
        n2: n2Count,
        m1: m1Count,
        m2: m2Count,
        necrosis: necrosisCount,
        tumorCells: tumorCellsCount,
        total: totalCount
      },
      percentages: {
        n1: parseFloat(n1Percentage.toFixed(2)),
        n2: parseFloat(n2Percentage.toFixed(2)),
        m1: parseFloat(m1Percentage.toFixed(2)),
        m2: parseFloat(m2Percentage.toFixed(2)),
        necrosis: parseFloat(necrosisPercentage.toFixed(2)),
        tumorCells: parseFloat(tumorCellsPercentage.toFixed(2)),
      },
      survivalRate: parseFloat(survivalRate.toFixed(1)),
      imageUrl,
      fileName: file.name,
      metrics: {
        confusionMatrix,
        history: metricsHistory,
        finalPrecision: precision,
        finalRecall: recall,
        finalF1Score: f1Score,
        finalRSquared: rSquared
      }
    };
  };

  // Analyze multiple images
  const analyzeMultipleImages = async (files: File[]) => {
    try {
      setIsAnalyzing(true);
      
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate folder seed based on all file names combined
      const folderSignature = files.map(f => f.name).sort().join('');
      const folderSeed = generateSeed(folderSignature + analysisMode);
      
      // Always select exactly 5 patches for good survival rates
      const goodPatchesCount = 5;
      const actualGoodPatches = Math.min(goodPatchesCount, files.length);
      
      console.log(`Selecting exactly ${actualGoodPatches} patches out of ${files.length} for good survival rates`);
      
      // Create array of intermediate indices (skip first 20% and last 20%)
      const skipStart = Math.floor(files.length * 0.2);
      const skipEnd = Math.floor(files.length * 0.8);
      const intermediateIndices = Array.from({ length: skipEnd - skipStart }, (_, i) => i + skipStart);
      
      // If we don't have enough intermediate indices, use all indices except first few
      let availableIndices: number[];
      if (intermediateIndices.length < actualGoodPatches) {
        availableIndices = Array.from({ length: files.length }, (_, i) => i).slice(Math.min(5, files.length - actualGoodPatches));
      } else {
        availableIndices = intermediateIndices;
      }
      
      // Randomly select from available indices
      const shuffledIndices = seededShuffle(availableIndices, folderSeed);
      const goodSurvivalIndices = new Set(shuffledIndices.slice(0, actualGoodPatches));
      
      console.log(`Good survival patches will be at indices:`, Array.from(goodSurvivalIndices).sort());
      
      // Generate analysis for each image using the same folder seed and random good survival selection
      const imageResults = files.map((file, index) => generateImageAnalysis(file, folderSeed, index, files.length, goodSurvivalIndices));
      
      // Generate patch history data using EXACT SAME percentages as image results
      console.log(`Generating ${files.length} patches for ${files.length} input images`);
      
      const patchHistory: PatchData[] = imageResults.map((imageResult, i) => ({
        patchId: i + 1,
        n1: imageResult.percentages.n1,        // Use exact same percentages
        n2: imageResult.percentages.n2,        // Use exact same percentages
        m1: imageResult.percentages.m1,        // Use exact same percentages
        m2: imageResult.percentages.m2,        // Use exact same percentages
        necrosis: imageResult.percentages.necrosis,    // Use exact same percentages
        tumorCells: imageResult.percentages.tumorCells, // Use exact same percentages
        imageUrl: imageResult.imageUrl,
        fileName: imageResult.fileName
      }));

      // Generate overall metrics (average of all images)
      const avgPrecision = imageResults.reduce((sum, img) => sum + img.metrics.finalPrecision, 0) / imageResults.length;
      const avgRecall = imageResults.reduce((sum, img) => sum + img.metrics.finalRecall, 0) / imageResults.length;
      const avgF1Score = imageResults.reduce((sum, img) => sum + img.metrics.finalF1Score, 0) / imageResults.length;
      const avgRSquared = imageResults.reduce((sum, img) => sum + img.metrics.finalRSquared, 0) / imageResults.length;

      const overallMetrics: AnalysisMetrics = {
        confusionMatrix: imageResults[0].metrics.confusionMatrix,
        history: imageResults[0].metrics.history,
        finalPrecision: avgPrecision,
        finalRecall: avgRecall,
        finalF1Score: avgF1Score,
        finalRSquared: avgRSquared
      };
      
      const result: TumorAnalysisResult = {
        images: imageResults,
        currentImageIndex: 0,
        patchHistory,
        overallMetrics
      };
      
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Single image analysis (for backward compatibility)
  const analyzeImage = async (file: File) => {
    await analyzeMultipleImages([file]);
  };

  const setCurrentImageIndex = (index: number) => {
    if (analysisResult && index >= 0 && index < analysisResult.images.length) {
      setAnalysisResult({
        ...analysisResult,
        currentImageIndex: index
      });
    }
  };

  const resetAnalysis = () => {
    if (analysisResult) {
      analysisResult.images.forEach(img => {
        if (img.imageUrl) {
          URL.revokeObjectURL(img.imageUrl);
        }
      });
    }
    setAnalysisResult(null);
  };

  return (
    <AnalysisContext.Provider
      value={{
        isAnalyzing,
        analysisResult,
        analysisMode,
        setAnalysisMode,
        analyzeImage,
        analyzeMultipleImages,
        setCurrentImageIndex,
        resetAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
};
