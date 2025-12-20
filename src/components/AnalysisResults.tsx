import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { Button } from "@/components/ui/button";
import lossOverEpochs from '@/assets/loss_over_epochs.png';
import recallOverEpochs from '@/assets/recall_over_epochs.png';
import confusionMatrix from '@/assets/confusion_matrix.png';
import accuracyOverEpochs from '@/assets/accuracy_over_epochs.png';
import precisionOverEpochs from '@/assets/precision_over_epochs.png';
import f1ScoreOverEpochs from '@/assets/f1_score_over_epochs.png';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import WholeSlideViewer from "./WholeSlideViewer";
import CellTypeGraphs from "./CellTypeGraphs";

// Cell type explanation data
const cellExplanations = {
  n1: "N1 (anti-tumor neutrophils) directly attack cancer cells and inhibit tumor growth, contributing to positive patient outcomes.",
  n2: "N2 (pro-tumor neutrophils) promote tumor growth and metastasis by suppressing immune response and enabling cancer spread.",
  m1: "M1 (anti-tumor macrophages) identify and eliminate cancer cells while activating other immune responses against tumors.",
  m2: "M2 (pro-tumor macrophages) enhance tumor growth by promoting angiogenesis and suppressing anti-tumor immunity.",
  necrosis: "Necrotic tissue represents dead cells in the tumor environment, often indicating aggressive disease and poorer prognosis.",
  tumorcells: "Tumor cells are the primary cancerous cells that have undergone malignant transformation and drive cancer progression."
};

// Ratio analysis function
const getRatioAnalysis = (ratio: number, type: string): { result: string; interpretation: string; isPositive: boolean } => {
  switch(type) {
    case "macrophage-neutrophil":
      return ratio > 1 
        ? { result: "Worst Prognosis", interpretation: "Macrophage to neutrophil ratio > 1 indicates poor clinical outcome with increased tumor progression.", isPositive: false }
        : { result: "Better Immune Response", interpretation: "Macrophage to neutrophil ratio < 1 suggests more effective immune response against tumor cells.", isPositive: true };
    
    case "m1-m2":
      return ratio > 1
        ? { result: "Strong Anti-Tumor Response", interpretation: "M1 to M2 ratio > 1 indicates dominant anti-tumor activity with better prognosis.", isPositive: true }
        : { result: "Immune Suppression", interpretation: "M1 to M2 ratio < 1 suggests immune suppression and potential tumor progression.", isPositive: false };
    
    case "n1-n2":
      return ratio > 1
        ? { result: "Anti-Tumor Immune Activity", interpretation: "N1 to N2 ratio > 1 shows effective anti-tumor neutrophil activity, potentially slowing tumor growth.", isPositive: true }
        : { result: "Tumor Promoting", interpretation: "N1 to N2 ratio < 1 indicates dominance of tumor-promoting neutrophils, associated with worse outcomes.", isPositive: false };
    
    case "macrophage-necrosis":
      return ratio > 1
        ? { result: "More Damaged Tissue", interpretation: "Macrophage to necrosis ratio > 1 suggests extensive tissue damage and inflammation.", isPositive: false }
        : { result: "Blocking Tumor Spread", interpretation: "Macrophage to necrosis ratio < 1 may indicate better containment of tumor cells.", isPositive: true };
    
    case "neutrophil-necrosis":
      return ratio > 1
        ? { result: "Worst Prognosis", interpretation: "Neutrophil to necrosis ratio > 1 correlates with worse clinical outcomes in ovarian cancer.", isPositive: false }
        : { result: "Good Prognosis", interpretation: "Neutrophil to necrosis ratio < 1 is associated with better survival rates.", isPositive: true };
    
    default:
      return { result: "Unknown", interpretation: "No analysis available for this ratio.", isPositive: false };
  }
};

// New function to determine survival rate based on cell counts
const getSurvivalRateFromCounts = (counts: any) => {
  const { n1, n2, m1, m2, tumorCells, total } = counts;
  
  // Calculate percentages
  const n1Percent = (n1 / total) * 100;
  const n2Percent = (n2 / total) * 100;
  const m1Percent = (m1 / total) * 100;
  const m2Percent = (m2 / total) * 100;
  const tumorCellsPercent = (tumorCells / total) * 100;
  
  // Anti-tumor cells (N1 + M1) vs Pro-tumor cells (N2 + M2 + Tumor Cells)
  const antiTumorPercent = n1Percent + m1Percent;
  const proTumorPercent = n2Percent + m2Percent + tumorCellsPercent;
  
  // Determine survival rate category
  if (antiTumorPercent > 40 && (n1Percent > 15 || m1Percent > 15) && tumorCellsPercent < 30) {
    // High N1 and M1 counts with lower tumor cells = Good survival (70-85%)
    const percentage = Math.round(70 + (antiTumorPercent - 40) * 0.5);
    return { rate: "Good", color: "text-green-600", value: Math.min(percentage, 85), percentage: `${Math.min(percentage, 85)}%` };
  } else if (proTumorPercent > antiTumorPercent && (tumorCellsPercent > 35 || n2Percent > 25 || m2Percent > 25)) {
    // High tumor cells, N2 and M2 counts = Less survival (15-35%)
    const percentage = Math.round(35 - (proTumorPercent - antiTumorPercent) * 0.3);
    return { rate: "Less", color: "text-red-600", value: Math.max(percentage, 15), percentage: `${Math.max(percentage, 15)}%` };
  } else {
    // Intermediate counts = Moderate survival (40-65%)
    const percentage = Math.round(50 + (antiTumorPercent - proTumorPercent) * 0.2);
    return { rate: "Moderate", color: "text-yellow-600", value: Math.min(Math.max(percentage, 40), 65), percentage: `${Math.min(Math.max(percentage, 40), 65)}%` };
  }
};

const AnalysisResults: React.FC = () => {
  const { analysisResult, resetAnalysis, setCurrentImageIndex } = useAnalysis();
  const [currentPatchIndex, setCurrentPatchIndex] = useState(0);

  if (!analysisResult) return null;

  const { images, currentImageIndex, patchHistory } = analysisResult;
  const currentImage = images[currentImageIndex];

  const {
    counts,
    percentages,
    imageUrl,
    fileName
  } = currentImage;

  // Get survival rate based on cell counts
  const survivalInfo = getSurvivalRateFromCounts(counts);

  // Create patch data with proper numbering (1 to total patches)
  const patchDataWithNumbers = patchHistory ? patchHistory.map((patch, index) => ({
    ...patch,
    displayPatchId: `${index + 1}`,
    // Use the actual counts from the corresponding image for consistency
    actualCounts: images[index] ? {
      n1: images[index].counts.n1,
      n2: images[index].counts.n2,
      m1: images[index].counts.m1,
      m2: images[index].counts.m2,
      necrosis: images[index].counts.necrosis,
      tumorCells: images[index].counts.tumorCells,
      total: images[index].counts.total
    } : null
  })) : [];
  
  const currentPatch = patchHistory ? patchHistory[currentPatchIndex] : null;
  const currentPatchDisplay = currentPatch ? `${currentPatchIndex + 1}` : null;

  const getCurrentPatchCounts = () => {
    if (!currentPatch) return null;
    
    const baseTotal = Math.floor(Math.random() * 2000) + 3000;
    
    return {
      n1: Math.round((currentPatch.n1 / 100) * baseTotal),
      n2: Math.round((currentPatch.n2 / 100) * baseTotal),
      m1: Math.round((currentPatch.m1 / 100) * baseTotal),
      m2: Math.round((currentPatch.m2 / 100) * baseTotal),
      necrosis: Math.round((currentPatch.necrosis / 100) * baseTotal),
      tumorCells: Math.round((currentPatch.tumorCells / 100) * baseTotal),
      total: baseTotal
    };
  };

  const currentPatchCounts = getCurrentPatchCounts();
  
  const totalMacrophages = counts.m1 + counts.m2;
  const totalNeutrophils = counts.n1 + counts.n2;
  
  const macrophageNeutrophilRatio = totalMacrophages / (totalNeutrophils || 1);
  const m1m2Ratio = counts.m1 / (counts.m2 || 1);
  const n1n2Ratio = counts.n1 / (counts.n2 || 1);
  const macrophageNecrosisRatio = totalMacrophages / (counts.necrosis || 1);
  const neutrophilNecrosisRatio = totalNeutrophils / (counts.necrosis || 1);
  
  const macNeutAnalysis = getRatioAnalysis(macrophageNeutrophilRatio, "macrophage-neutrophil");
  const m1m2Analysis = getRatioAnalysis(m1m2Ratio, "m1-m2");
  const n1n2Analysis = getRatioAnalysis(n1n2Ratio, "n1-n2");
  const macNecAnalysis = getRatioAnalysis(macrophageNecrosisRatio, "macrophage-necrosis");
  const neutNecAnalysis = getRatioAnalysis(neutrophilNecrosisRatio, "neutrophil-necrosis");

  const pieChartData = currentPatch ? [
    { name: "N1 (Good)", value: currentPatch.n1, color: "#52c41a" },
    { name: "N2 (Bad)", value: currentPatch.n2, color: "#f5222d" },
    { name: "M1 (Good)", value: currentPatch.m1, color: "#1890ff" },
    { name: "M2 (Bad)", value: currentPatch.m2, color: "#fa8c16" },
    { name: "Necrosis", value: currentPatch.necrosis, color: "#722ed1" },
    { name: "Tumor Cells", value: currentPatch.tumorCells, color: "#eb2f96" },
  ] : [
    { name: "N1 (Good)", value: percentages.n1, color: "#52c41a" },
    { name: "N2 (Bad)", value: percentages.n2, color: "#f5222d" },
    { name: "M1 (Good)", value: percentages.m1, color: "#1890ff" },
    { name: "M2 (Bad)", value: percentages.m2, color: "#fa8c16" },
    { name: "Necrosis", value: percentages.necrosis, color: "#722ed1" },
    { name: "Tumor Cells", value: percentages.tumorCells, color: "#eb2f96" },
  ];

  // Use the actual counts from the current image consistently
  const countsData = [
    { name: "N1", value: counts.n1, fill: "#52c41a" },
    { name: "N2", value: counts.n2, fill: "#f5222d" },
    { name: "M1", value: counts.m1, fill: "#1890ff" },
    { name: "M2", value: counts.m2, fill: "#fa8c16" },
    { name: "Necrosis", value: counts.necrosis, fill: "#722ed1" },
    { name: "Tumor Cells", value: counts.tumorCells, fill: "#eb2f96" },
  ];

  const currentPatchRatios = currentPatch ? {
    macrophageNeutrophilRatio: (currentPatch.m1 + currentPatch.m2) / ((currentPatch.n1 + currentPatch.n2) || 1),
    m1m2Ratio: currentPatch.m1 / (currentPatch.m2 || 1),
    n1n2Ratio: currentPatch.n1 / (currentPatch.n2 || 1),
    macrophageNecrosisRatio: (currentPatch.m1 + currentPatch.m2) / (currentPatch.necrosis || 1),
    neutrophilNecrosisRatio: (currentPatch.n1 + currentPatch.n2) / (currentPatch.necrosis || 1)
  } : null;

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ovarian Cancer Tissue Analysis
        </h1>
        <p className="text-lg text-gray-600">
          Patch analysis report and clinical matrix assessment
        </p>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="current">Current Image</TabsTrigger>
          <TabsTrigger value="all">All Patches</TabsTrigger>
          <TabsTrigger value="individual">Cell Type Graphs</TabsTrigger>
          <TabsTrigger value="graphs">Additional Graphs</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Matrix</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="result">Result</TabsTrigger>
        </TabsList>
        
        {/* Current Image Tab */}
        <TabsContent value="current" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column: Image */}
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Current Image</h3>
                <span className="text-sm text-gray-500">
                  {currentImageIndex + 1} of {images.length} - {fileName}
                </span>
              </div>
              <div className="rounded-md overflow-hidden border border-gray-200 mb-4">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={`Analyzed histopathological image: ${fileName}`}
                    className="w-full h-auto object-cover"
                  />
                )}
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handlePreviousImage}
                  disabled={currentImageIndex === 0}
                  variant="outline"
                >
                  Previous Image
                </Button>
                <Button
                  onClick={handleNextImage}
                  disabled={currentImageIndex === images.length - 1}
                  variant="outline"
                >
                  Next Image
                </Button>
              </div>
            </Card>

            {/* Right column: Current Image Analysis */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Image Analysis - {fileName}</h3>
              
              {/* Tumor Cell Counts Section - Use exact same counts as below */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-md font-medium mb-3">Tumor Cell Counts</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between">
                    <span className="text-sm">N1 Cells:</span>
                    <span className="font-medium text-green-600">{counts.n1.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">N2 Cells:</span>
                    <span className="font-medium text-red-600">{counts.n2.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">M1 Cells:</span>
                    <span className="font-medium text-blue-600">{counts.m1.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">M2 Cells:</span>
                    <span className="font-medium text-orange-600">{counts.m2.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Necrosis:</span>
                    <span className="font-medium text-purple-600">{counts.necrosis.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tumor Cells:</span>
                    <span className="font-medium text-pink-600">{counts.tumorCells.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Total:</span>
                    <span className="font-bold">{counts.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {countsData.map((item) => {
                  const percentage = percentages[item.name.toLowerCase() === 'tumor cells' ? 'tumorCells' : item.name.toLowerCase() as keyof typeof percentages];
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm font-medium" style={{ color: item.fill }}>
                          {item.value.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                        style={{ backgroundColor: '#f0f0f0' }}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        {cellExplanations[(item.name.toLowerCase() === 'tumor cells' ? 'tumorcells' : item.name.toLowerCase()) as keyof typeof cellExplanations]}
                      </p>
                    </div>
                  );
                })}
                <div className="pt-4 border-t mt-4">
                  <div className="text-center">
                    <span className="text-gray-600">Survival Rate</span>
                  </div>
                  <div className="text-center">
                    <span className={`text-3xl font-bold ${survivalInfo.color}`}>
                      {survivalInfo.rate}
                    </span>
                    <p className={`mt-1 text-lg font-semibold ${survivalInfo.color}`}>
                      {survivalInfo.percentage}
                    </p>
                    <p className={`mt-1 ${survivalInfo.color}`}>
                      Prognosis
                    </p>
                  </div>
                  <div className="mt-2">
                    <Progress value={survivalInfo.value} className="h-2" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* All Patches Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">All Patches Analysis</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={patchDataWithNumbers || []}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="displayPatchId"
                    label={{ 
                      value: 'Patch Number', 
                      position: 'insideBottom', 
                      offset: -40 
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    label={{ 
                      value: 'Count (%)',
                      angle: -90,
                      position: 'insideLeft'
                    }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const actualCounts = data.actualCounts;
                        
                        return (
                          <div className="bg-white p-3 border rounded shadow-md">
                            <p className="font-medium">{`Patch ${data.displayPatchId}`}</p>
                            {actualCounts ? (
                              <>
                                <p style={{ color: '#52c41a' }}>{`N1: ${actualCounts.n1.toLocaleString()} cells`}</p>
                                <p style={{ color: '#f5222d' }}>{`N2: ${actualCounts.n2.toLocaleString()} cells`}</p>
                                <p style={{ color: '#1890ff' }}>{`M1: ${actualCounts.m1.toLocaleString()} cells`}</p>
                                <p style={{ color: '#fa8c16' }}>{`M2: ${actualCounts.m2.toLocaleString()} cells`}</p>
                                <p style={{ color: '#722ed1' }}>{`Necrosis: ${actualCounts.necrosis.toLocaleString()} cells`}</p>
                                <p style={{ color: '#eb2f96' }}>{`Tumor Cells: ${actualCounts.tumorCells.toLocaleString()} cells`}</p>
                                <div className="border-t pt-1 mt-1">
                                  <p className="font-medium">{`Total: ${actualCounts.total.toLocaleString()} cells`}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <p style={{ color: '#52c41a' }}>{`N1: ${data.n1}%`}</p>
                                <p style={{ color: '#f5222d' }}>{`N2: ${data.n2}%`}</p>
                                <p style={{ color: '#1890ff' }}>{`M1: ${data.m1}%`}</p>
                                <p style={{ color: '#fa8c16' }}>{`M2: ${data.m2}%`}</p>
                                <p style={{ color: '#722ed1' }}>{`Necrosis: ${data.necrosis}%`}</p>
                                <p style={{ color: '#eb2f96' }}>{`Tumor Cells: ${data.tumorCells}%`}</p>
                              </>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="n1" stackId="1" fill="#52c41a" stroke="#52c41a" name="N1" />
                  <Area type="monotone" dataKey="n2" stackId="1" fill="#f5222d" stroke="#f5222d" name="N2" />
                  <Area type="monotone" dataKey="m1" stackId="1" fill="#1890ff" stroke="#1890ff" name="M1" />
                  <Area type="monotone" dataKey="m2" stackId="1" fill="#fa8c16" stroke="#fa8c16" name="M2" />
                  <Area type="monotone" dataKey="necrosis" stackId="1" fill="#722ed1" stroke="#722ed1" name="Necrosis" />
                  <Area type="monotone" dataKey="tumorCells" stackId="1" fill="#eb2f96" stroke="#eb2f96" name="Tumor Cells" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        {/* New Cell Type Graphs Tab */}
        <TabsContent value="individual" className="space-y-4">
          <CellTypeGraphs />
        </TabsContent>

        {/* Additional Graphs Tab */}
        <TabsContent value="graphs" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Cell Count Distribution - {fileName}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={countsData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 50,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      scale="band"
                      tickLine={false}
                    />
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Count']} />
                    <Bar dataKey="value" name="Count">
                      {countsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Line Chart */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Cell Type Trend Analysis</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={patchDataWithNumbers ? patchDataWithNumbers.filter((_, i) => i % 10 === 0) : []}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="displayPatchId" 
                      label={{ value: 'Patch Sample', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Percentage (%)', 
                        angle: -90, 
                        position: 'insideLeft',
                        offset: 10
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="n1" stroke="#52c41a" name="N1" strokeWidth={2} dot={{ r: 1 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="n2" stroke="#f5222d" name="N2" strokeWidth={2} dot={{ r: 1 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="m1" stroke="#1890ff" name="M1" strokeWidth={2} dot={{ r: 1 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="m2" stroke="#fa8c16" name="M2" strokeWidth={2} dot={{ r: 1 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="necrosis" stroke="#722ed1" name="Necrosis" strokeWidth={2} dot={{ r: 1 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="tumorCells" stroke="#eb2f96" name="Tumor Cells" strokeWidth={2} dot={{ r: 1 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          {/* Cell Type Information Card */}
          <Card className="p-4 mt-4">
            <h3 className="text-lg font-medium mb-4">Understanding Cell Types</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-teal-700">Anti-Tumor Cells</h4>
                  <p className="text-sm text-gray-700 mt-1"><span className="font-medium" style={{ color: '#52c41a' }}>N1 Neutrophils:</span> {cellExplanations.n1}</p>
                  <p className="text-sm text-gray-700 mt-2"><span className="font-medium" style={{ color: '#1890ff' }}>M1 Macrophages:</span> {cellExplanations.m1}</p>
                </div>
                <div>
                  <h4 className="font-medium text-teal-700">Cancerous Cells</h4>
                  <p className="text-sm text-gray-700 mt-1"><span className="font-medium" style={{ color: '#eb2f96' }}>Tumor Cells:</span> {cellExplanations.tumorcells}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-teal-700">Pro-Tumor Cells</h4>
                  <p className="text-sm text-gray-700 mt-1"><span className="font-medium" style={{ color: '#f5222d' }}>N2 Neutrophils:</span> {cellExplanations.n2}</p>
                  <p className="text-sm text-gray-700 mt-2"><span className="font-medium" style={{ color: '#fa8c16' }}>M2 Macrophages:</span> {cellExplanations.m2}</p>
                </div>
                <div>
                  <h4 className="font-medium text-teal-700">Necrotic Tissue & Prognosis</h4>
                  <p className="text-sm text-gray-700 mt-1"><span className="font-medium" style={{ color: '#722ed1' }}>Necrosis:</span> {cellExplanations.necrosis}</p>
                  <p className="text-sm text-gray-700 mt-2">Higher ratios of N1:N2 and M1:M2 with lower tumor cell counts correlate with improved survival outcomes.</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Clinical Matrix Tab */}
        <TabsContent value="clinical" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Clinical Matrix Analysis - {fileName}</h3>
            <p className="text-sm text-gray-600 mb-6">
              Analysis of key cell population ratios and their clinical implications for ovarian cancer prognosis.
            </p>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ratio</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Clinical Interpretation</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Macrophages to Neutrophils</TableCell>
                    <TableCell>{macrophageNeutrophilRatio.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs">{macNeutAnalysis.interpretation}</TableCell>
                    <TableCell className={macNeutAnalysis.isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {macNeutAnalysis.result}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">M1 to M2 Macrophages</TableCell>
                    <TableCell>{m1m2Ratio.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs">{m1m2Analysis.interpretation}</TableCell>
                    <TableCell className={m1m2Analysis.isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {m1m2Analysis.result}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">N1 to N2 Neutrophils</TableCell>
                    <TableCell>{n1n2Ratio.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs">{n1n2Analysis.interpretation}</TableCell>
                    <TableCell className={n1n2Analysis.isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {n1n2Analysis.result}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Macrophages to Necrosis</TableCell>
                    <TableCell>{macrophageNecrosisRatio.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs">{macNecAnalysis.interpretation}</TableCell>
                    <TableCell className={macNecAnalysis.isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {macNecAnalysis.result}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Neutrophils to Necrosis</TableCell>
                    <TableCell>{neutrophilNecrosisRatio.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs">{neutNecAnalysis.interpretation}</TableCell>
                    <TableCell className={neutNecAnalysis.isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {neutNecAnalysis.result}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-lg mb-2">Combined Clinical Assessment</h4>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-xl font-bold">Overall Prognosis:</div>
                <div className={`text-xl font-bold ${survivalInfo.color}`}>
                  {survivalInfo.rate} ({survivalInfo.percentage})
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Based on cellular composition analysis, this sample shows 
                {m1m2Ratio > 1 ? " favorable" : " concerning"} M1:M2 macrophage ratio and
                {n1n2Ratio > 1 ? " positive" : " negative"} N1:N2 neutrophil distribution.
                {macrophageNeutrophilRatio > 1 
                  ? " The high macrophage to neutrophil ratio suggests potential for aggressive disease progression." 
                  : " The balanced macrophage to neutrophil ratio is associated with better disease control."}
                {neutrophilNecrosisRatio > 1
                  ? " Elevated neutrophil to necrosis ratio indicates inflammatory tumor microenvironment with possible poor outcomes."
                  : " Lower neutrophil to necrosis ratio suggests better controlled inflammatory response."}
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          {/* Whole Slide Viewer */}
          <WholeSlideViewer />
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Cell Distribution (%) - {fileName}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name} ${typeof value === 'number' ? value.toFixed(1) : value}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => {
                      return typeof value === 'number' ? `${value.toFixed(1)}%` : value;
                    }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Summary Card */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Analysis Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Image</span>
                  <span className="font-semibold">{fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Images Analyzed</span>
                  <span className="font-semibold">{images.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Patches</span>
                  <span className="font-semibold">{patchHistory?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cells Detected</span>
                  <span className="font-semibold">{counts.total.toLocaleString()}</span>
                </div>
                
                {/* Key clinical ratios summary */}
                <div className="pt-2 border-t">
                  <h4 className="font-medium mb-2">Key Clinical Ratios</h4>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <span className="text-gray-600 text-sm">M1:M2 Ratio</span>
                      <div className={`font-medium ${m1m2Analysis.isPositive ? "text-green-600" : "text-red-600"}`}>
                        {m1m2Ratio.toFixed(2)} - {m1m2Analysis.result}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600 text-sm">N1:N2 Ratio</span>
                      <div className={`font-medium ${n1n2Analysis.isPositive ? "text-green-600" : "text-red-600"}`}>
                        {n1n2Ratio.toFixed(2)} - {n1n2Analysis.result}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-center mb-2">
                    <span className="text-gray-600">Survival Rate</span>
                  </div>
                  <div className="text-center">
                    <span className={`text-3xl font-bold ${survivalInfo.color}`}>
                      {survivalInfo.rate}
                    </span>
                    <p className={`mt-1 text-lg font-semibold ${survivalInfo.color}`}>
                      {survivalInfo.percentage}
                    </p>
                    <p className={`mt-1 ${survivalInfo.color}`}>
                      Prognosis
                    </p>
                  </div>
                  <div className="mt-2">
                    <Progress value={survivalInfo.value} className="h-2" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        {/* Result Tab - Training Metrics */}
        <TabsContent value="result" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-6 text-center">Training Metrics Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="text-md font-medium text-center">Loss over Epochs</h4>
                <img src={lossOverEpochs} alt="Loss over Epochs" className="w-full rounded-lg border" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-md font-medium text-center">Accuracy over Epochs</h4>
                <img src={accuracyOverEpochs} alt="Accuracy over Epochs" className="w-full rounded-lg border" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-md font-medium text-center">Precision over Epochs</h4>
                <img src={precisionOverEpochs} alt="Precision over Epochs" className="w-full rounded-lg border" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-md font-medium text-center">Recall over Epochs</h4>
                <img src={recallOverEpochs} alt="Recall over Epochs" className="w-full rounded-lg border" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-md font-medium text-center">F1 Score over Epochs</h4>
                <img src={f1ScoreOverEpochs} alt="F1 Score over Epochs" className="w-full rounded-lg border" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-md font-medium text-center">Confusion Matrix</h4>
                <img src={confusionMatrix} alt="Confusion Matrix" className="w-full rounded-lg border" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mt-8">
        <Button 
          onClick={resetAnalysis}
          size="lg"
          className="bg-teal-700 hover:bg-teal-800"
        >
          Analyze New Images
        </Button>
      </div>
    </div>
  );
};

export default AnalysisResults;
