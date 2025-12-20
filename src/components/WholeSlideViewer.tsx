
import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/contexts/AnalysisContext";

interface PatchTooltipData {
  patchId: number;
  n1: number;
  n2: number;
  m1: number;
  m2: number;
  necrosis: number;
  tumorCells: number;
  x: number;
  y: number;
}

const WholeSlideViewer: React.FC = () => {
  const { analysisResult } = useAnalysis();
  const [selectedPatchNumber, setSelectedPatchNumber] = useState<string>("");
  const [highlightedPatch, setHighlightedPatch] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<PatchTooltipData | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  if (!analysisResult?.patchHistory || !analysisResult?.images) return null;

  const patches = analysisResult.patchHistory;
  const totalPatches = patches.length;
  
  // Calculate grid dimensions (as square as possible)
  const gridSize = Math.ceil(Math.sqrt(totalPatches));
  const patchSize = 80; // Size for each patch
  const gridWidth = gridSize * patchSize;
  const gridHeight = gridSize * patchSize;

  const handlePatchNumberSubmit = () => {
    const patchNum = parseInt(selectedPatchNumber);
    if (patchNum >= 1 && patchNum <= totalPatches) {
      setHighlightedPatch(patchNum - 1); // Convert to 0-based index
    } else {
      setHighlightedPatch(null);
    }
  };

  const handlePatchHover = (index: number, event: React.MouseEvent) => {
    const patch = patches[index];
    if (patch) {
      // Use the exact same percentages as shown in Current Image section
      setTooltipData({
        patchId: index + 1,
        n1: patch.n1,          // These are now the exact same percentages
        n2: patch.n2,          // These are now the exact same percentages
        m1: patch.m1,          // These are now the exact same percentages
        m2: patch.m2,          // These are now the exact same percentages
        necrosis: patch.necrosis,      // These are now the exact same percentages
        tumorCells: patch.tumorCells,  // These are now the exact same percentages
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const handlePatchLeave = () => {
    setTooltipData(null);
  };

  const renderPatchGrid = () => {
    const patchElements = [];
    
    for (let i = 0; i < totalPatches; i++) {
      const patch = patches[i];
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const x = col * patchSize;
      const y = row * patchSize;
      
      const isHighlighted = highlightedPatch === i;
      
      patchElements.push(
        <div
          key={i}
          className={`absolute cursor-pointer transition-all duration-200 overflow-hidden ${
            isHighlighted 
              ? 'border-4 border-red-500 z-10 transform scale-110' 
              : 'border border-gray-300 hover:border-gray-500'
          }`}
          style={{
            left: x,
            top: y,
            width: patchSize,
            height: patchSize,
          }}
          onMouseEnter={(e) => handlePatchHover(i, e)}
          onMouseLeave={handlePatchLeave}
          onMouseMove={(e) => handlePatchHover(i, e)}
          title={`Patch ${i + 1} - ${patch.fileName || 'Unknown'}`}
        >
          {patch.imageUrl && (
            <img
              src={patch.imageUrl}
              alt={`Patch ${i + 1} - ${patch.fileName || 'Unknown'}`}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          )}
        </div>
      );
    }
    
    return patchElements;
  };

  return (
    <div className="space-y-6">
      {/* Patch Navigation Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="patchNumber" className="text-sm font-medium">
              Enter Patch Number:
            </label>
            <Input
              id="patchNumber"
              type="number"
              min="1"
              max={totalPatches}
              value={selectedPatchNumber}
              onChange={(e) => setSelectedPatchNumber(e.target.value)}
              placeholder={`1-${totalPatches}`}
              className="w-24"
            />
            <Button onClick={handlePatchNumberSubmit} size="sm">
              Highlight
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Total Patches: <span className="font-semibold">{totalPatches}</span>
            <span className="ml-2 text-xs">(1 patch per input image)</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">Each patch represents one input image. Hover over any patch to see detailed cell counts and analysis data.</span>
        </div>
      </Card>

      {/* Whole Slide Image Grid */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Whole Slide Image - Reconstructed from Input Images</h3>
        <div className="flex justify-center">
          <div
            ref={gridRef}
            className="relative border-2 border-gray-400 bg-gray-100"
            style={{
              width: gridWidth,
              height: gridHeight,
            }}
          >
            {renderPatchGrid()}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Each patch corresponds to one input image from your folder. Total patches: {totalPatches}
        </p>
      </Card>

      {/* Tooltip */}
      {tooltipData && (
        <div
          className="fixed z-50 bg-black text-white text-xs rounded-lg p-3 pointer-events-none shadow-lg"
          style={{
            left: tooltipData.x + 10,
            top: tooltipData.y - 10,
          }}
        >
          <div className="font-semibold mb-2">Patch {tooltipData.patchId}</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span style={{ color: '#52c41a' }}>N1:</span>
              <span>{tooltipData.n1.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span style={{ color: '#f5222d' }}>N2:</span>
              <span>{tooltipData.n2.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span style={{ color: '#1890ff' }}>M1:</span>
              <span>{tooltipData.m1.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span style={{ color: '#fa8c16' }}>M2:</span>
              <span>{tooltipData.m2.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span style={{ color: '#722ed1' }}>Necrosis:</span>
              <span>{tooltipData.necrosis.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span style={{ color: '#eb2f96' }}>Tumor Cells:</span>
              <span>{tooltipData.tumorCells.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WholeSlideViewer;
