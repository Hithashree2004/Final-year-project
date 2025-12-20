
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import AnalysisResults from "@/components/AnalysisResults";
import { useAnalysis } from "@/contexts/AnalysisContext";
import Logo from "@/components/Logo";

const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const { analysisResult } = useAnalysis();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button
                onClick={logout}
                variant="outline"
                className="text-gray-700"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {!analysisResult ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Ovarian Cancer Tissue Analysis
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Upload a histopathological whole slide image to analyze cell distribution and predict survival rate
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                <FileUpload />
              </div>

              {/* Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-lg mb-2 text-teal-800">Neutrophils (N1 & N2)</h3>
                  <p className="text-gray-600">N1 cells are anti-tumor neutrophils, while N2 cells promote tumor growth. The ratio between them is crucial for prognosis.</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-lg mb-2 text-teal-800">Macrophages (M1 & M2)</h3>
                  <p className="text-gray-600">M1 macrophages fight cancer cells, while M2 macrophages support tumor growth and spread. Their balance affects patient outcomes.</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-lg mb-2 text-teal-800">Necrosis</h3>
                  <p className="text-gray-600">Necrotic regions represent dead tissue, often found in aggressive tumors. Higher necrosis typically correlates with worse prognosis.</p>
                </div>
              </div>
            </>
          ) : (
            <AnalysisResults />
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
