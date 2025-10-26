'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50">
      {/* Subtle background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 right-24 w-72 h-72 bg-gradient-to-br from-indigo-200 to-transparent rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-24 left-16 w-80 h-80 bg-gradient-to-br from-sky-200 to-transparent rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col items-center gap-2 text-center md:flex-row md:items-center md:justify-center md:gap-6 md:text-left">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 px-3 py-2 rounded-2xl shadow-lg">

              </div>
              <div className="flex flex-col items-center md:items-start leading-none">
                <h1 className="text-3xl font-black gradient-text tracking-tight">LLM Lab</h1>
                <p className="text-sm text-slate-700 font-semibold mt-0.5">Response Quality Analyzer</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveTab('new')}
                className={`btn-tab ${activeTab === 'new' ? 'btn-tab-active' : ''}`}
              >
                New Experiment
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`btn-tab ${activeTab === 'history' ? 'btn-tab-active' : ''}`}
              >
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
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white p-8 rounded-2xl shadow-xl card-hover">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative flex items-start gap-5">
                <div className="bg-white/15 px-5 py-4 rounded-2xl backdrop-blur-sm flex-shrink-0 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900">
                  Overview
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-3">
                    Experiment with LLM Parameters
                  </h2>
                  <p className="text-violet-100 leading-relaxed text-lg">
                    Generate multiple responses with different temperature and top_p
                    combinations. Our custom quality metrics will help you understand
                    which parameters produce better results for your use case.
                  </p>
                </div>
              </div>
            </div>

            {/* Experiment Form */}
            <div className="glass rounded-3xl shadow-2xl p-12">
              <ExperimentForm
                onSubmit={handleGenerate}
                isLoading={generateMutation.isPending}
              />
            </div>

            {/* Results */}
            {generateMutation.isError && (
              <div className="glass border-2 border-red-400 bg-red-50 text-red-900 p-6 rounded-2xl shadow-xl">
                <p className="font-bold text-lg mb-2">Error generating responses:</p>
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