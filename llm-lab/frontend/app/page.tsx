'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Beaker, Sparkles, TrendingUp, History } from 'lucide-react';
import { generateResponses, getExperiments, type GenerateRequest } from '@/lib/api';
import ExperimentForm from '@/components/ExperimentForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import ExperimentHistory from '@/components/ExperimentHistory';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [currentExperiment, setCurrentExperiment] = useState<any>(null);

  const generateMutation = useMutation({
    mutationFn: generateResponses,
    onSuccess: (data) => {
      setCurrentExperiment(data);
    },
  });

  const { data: experiments, refetch: refetchExperiments } = useQuery({
    queryKey: ['experiments'],
    queryFn: getExperiments,
  });

  const handleGenerate = async (request: GenerateRequest) => {
    setCurrentExperiment(null);
    await generateMutation.mutateAsync(request);
    refetchExperiments();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 p-3 rounded-2xl shadow-lg shine">
                <Beaker className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black gradient-text">LLM Lab</h1>
                <p className="text-sm text-purple-700 font-semibold">Response Quality Analyzer</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('new')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg ${
                  activeTab === 'new'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl scale-105'
                    : 'bg-white/80 text-purple-700 hover:bg-white hover:scale-105'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                New Experiment
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl scale-105'
                    : 'bg-white/80 text-purple-700 hover:bg-white hover:scale-105'
                }`}
              >
                <History className="w-5 h-5" />
                History
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {activeTab === 'new' ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Info Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white p-8 rounded-2xl shadow-2xl card-hover">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative flex items-start gap-5">
                <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm flex-shrink-0">
                  <TrendingUp className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-3">
                    🚀 Experiment with LLM Parameters
                  </h2>
                  <p className="text-purple-100 leading-relaxed text-lg">
                    Generate multiple responses with different temperature and top_p
                    combinations. Our custom quality metrics will help you understand
                    which parameters produce better results for your use case.
                  </p>
                </div>
              </div>
            </div>

            {/* Experiment Form */}
            <div className="glass rounded-2xl shadow-2xl p-8">
              <ExperimentForm
                onSubmit={handleGenerate}
                isLoading={generateMutation.isPending}
              />
            </div>

            {/* Results */}
            {generateMutation.isError && (
              <div className="glass border-2 border-red-400 bg-red-50 text-red-900 p-6 rounded-2xl shadow-xl">
                <p className="font-bold text-lg mb-2">⚠️ Error generating responses:</p>
                <p className="text-sm">
                  {(generateMutation.error as Error)?.message || 'Unknown error'}
                </p>
              </div>
            )}

            {currentExperiment && (
              <ResultsDisplay experiment={currentExperiment} />
            )}
          </div>
        ) : (
          <div className="animate-fadeIn">
            <ExperimentHistory
              experiments={experiments || []}
              onExperimentSelect={(exp) => {
                setCurrentExperiment(exp);
                setActiveTab('new');
              }}
              onRefresh={refetchExperiments}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-white/20 glass relative z-10">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm font-semibold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
            Built for GenAI-Labs Challenge • Analyzing LLM response quality through custom metrics ✨
          </p>
        </div>
      </footer>
    </div>
  );
}
