
import React from "react";
import { Card } from "@/components/ui/card";
import { useAnalysis } from "@/contexts/AnalysisContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CellTypeGraphs: React.FC = () => {
  const { analysisResult } = useAnalysis();

  if (!analysisResult?.patchHistory) return null;

  const patchData = analysisResult.patchHistory.map((patch, index) => ({
    patchNumber: index + 1,
    m1: patch.m1,
    m2: patch.m2,
    n1: patch.n1,
    n2: patch.n2,
    necrosis: patch.necrosis,
    tumorCells: patch.tumorCells,
    // Get corresponding image counts for tooltip
    imageData: analysisResult.images[index]
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label, cellType }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const imageData = data.imageData;
      
      if (!imageData) return null;

      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-medium">{`Patch ${label}`}</p>
          {cellType === 'macrophages' && (
            <>
              <p style={{ color: '#f5222d' }}>{`M1: ${imageData.counts.m1.toLocaleString()} cells (${data.m1.toFixed(1)}%)`}</p>
              <p style={{ color: '#52c41a' }}>{`M2: ${imageData.counts.m2.toLocaleString()} cells (${data.m2.toFixed(1)}%)`}</p>
            </>
          )}
          {cellType === 'neutrophils' && (
            <>
              <p style={{ color: '#52c41a' }}>{`N1: ${imageData.counts.n1.toLocaleString()} cells (${data.n1.toFixed(1)}%)`}</p>
              <p style={{ color: '#f5222d' }}>{`N2: ${imageData.counts.n2.toLocaleString()} cells (${data.n2.toFixed(1)}%)`}</p>
            </>
          )}
          {cellType === 'necrosis' && (
            <p style={{ color: '#1890ff' }}>{`Necrosis: ${imageData.counts.necrosis.toLocaleString()} cells (${data.necrosis.toFixed(1)}%)`}</p>
          )}
          {cellType === 'tumorCells' && (
            <p style={{ color: '#fa8c16' }}>{`Tumor Cells: ${imageData.counts.tumorCells.toLocaleString()} cells (${data.tumorCells.toFixed(1)}%)`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Macrophages Graph */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Macrophages Content Across Patches</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={patchData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="patchNumber"
                label={{ 
                  value: 'Patch Number', 
                  position: 'insideBottom', 
                  offset: -40 
                }}
              />
              <YAxis 
                label={{ 
                  value: 'Percentage (%)',
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} cellType="macrophages" />} />
              <Line 
                type="monotone" 
                dataKey="m1" 
                stroke="#f5222d" 
                name="M1" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="m2" 
                stroke="#52c41a" 
                name="M2" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Neutrophils Graph */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Neutrophils Content Across Patches</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={patchData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="patchNumber"
                label={{ 
                  value: 'Patch Number', 
                  position: 'insideBottom', 
                  offset: -40 
                }}
              />
              <YAxis 
                label={{ 
                  value: 'Percentage (%)',
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} cellType="neutrophils" />} />
              <Line 
                type="monotone" 
                dataKey="n1" 
                stroke="#52c41a" 
                name="N1" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="n2" 
                stroke="#f5222d" 
                name="N2" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Necrosis Graph */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Necrosis Content Across Patches</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={patchData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="patchNumber"
                label={{ 
                  value: 'Patch Number', 
                  position: 'insideBottom', 
                  offset: -40 
                }}
              />
              <YAxis 
                label={{ 
                  value: 'Percentage (%)',
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} cellType="necrosis" />} />
              <Line 
                type="monotone" 
                dataKey="necrosis" 
                stroke="#1890ff" 
                name="Necrosis" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Tumor Cells Graph */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Tumor Content Across Patches</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={patchData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="patchNumber"
                label={{ 
                  value: 'Patch Number', 
                  position: 'insideBottom', 
                  offset: -40 
                }}
              />
              <YAxis 
                label={{ 
                  value: 'Percentage (%)',
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} cellType="tumorCells" />} />
              <Line 
                type="monotone" 
                dataKey="tumorCells" 
                stroke="#fa8c16" 
                name="Tumor Cells" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default CellTypeGraphs;
