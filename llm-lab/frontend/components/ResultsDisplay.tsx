'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import type { ExperimentResponse } from '@/lib/api';

interface ResultsDisplayProps {
  experiment: ExperimentResponse;
}

export default function ResultsDisplay({ experiment }: ResultsDisplayProps) {
  const [selectedResponse, setSelectedResponse] = useState(experiment.responses[0]);

  // Prepare data for metrics comparison chart
  const metricsChartData = experiment.responses.map((resp) => ({
    name: `T:${resp.temperature} P:${resp.top_p}`,
    temperature: resp.temperature,
    top_p: resp.top_p,
    overall: resp.metrics?.overall_score || 0,
    coherence: resp.metrics?.coherence_score || 0,
    diversity: resp.metrics?.lexical_diversity || 0,
    completeness: resp.metrics?.completeness_score || 0,
    structure: resp.metrics?.structure_score || 0,
    readability: resp.metrics?.readability_score || 0,
  }));

  // Prepare radar chart data for selected response
  const radarData = selectedResponse.metrics
    ? [
        { metric: 'Coherence', value: selectedResponse.metrics.coherence_score },
        { metric: 'Diversity', value: selectedResponse.metrics.lexical_diversity },
        { metric: 'Completeness', value: selectedResponse.metrics.completeness_score },
        { metric: 'Structure', value: selectedResponse.metrics.structure_score },
        { metric: 'Readability', value: selectedResponse.metrics.readability_score },
        {
          metric: 'Length',
          value: selectedResponse.metrics.length_appropriateness,
        },
      ]
    : [];

  const handleExport = () => {
    const data = JSON.stringify(experiment, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment-${experiment.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Find best response by overall score
  const bestResponse = experiment.responses.reduce((best, current) =>
    (current.metrics?.overall_score || 0) > (best.metrics?.overall_score || 0)
      ? current
      : best
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Export */}
      <div className="flex items-center justify-between glass p-6 rounded-2xl">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Experiment Results</h2>
          <p className="text-sm text-purple-700 font-medium">
            Generated {experiment.responses.length} responses
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-6 py-3 btn-gradient-success text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Export JSON
        </button>
      </div>

      {/* Best Response Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-white p-6 rounded-2xl shadow-2xl card-hover">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold mb-1">Best Response</p>
            <p className="text-sm text-yellow-100 font-medium">
              Temperature: <span className="font-bold">{bestResponse.temperature}</span> • 
              Top P: <span className="font-bold">{bestResponse.top_p}</span> • 
              Quality Score: <span className="font-bold">{bestResponse.metrics?.overall_score?.toFixed(3)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Overall Metrics Chart */}
      <div className="glass p-6 rounded-2xl shadow-xl card-hover">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          Overall Quality Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metricsChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#6b7280" />
            <YAxis domain={[0, 1]} stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                border: '2px solid #a78bfa',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="overall" fill="url(#colorGradient)" name="Overall Score" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#667eea" stopOpacity={1}/>
                <stop offset="100%" stopColor="#764ba2" stopOpacity={1}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Response Selector */}
      <div className="glass p-6 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Select Response to Analyze</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {experiment.responses.map((resp) => (
            <button
              key={resp.id}
              onClick={() => setSelectedResponse(resp)}
              className={`p-5 rounded-xl border-2 transition-all duration-300 shadow-md hover:shadow-xl ${
                selectedResponse.id === resp.id
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 scale-105 shadow-lg'
                  : 'border-purple-200 bg-white hover:border-purple-300 hover:scale-102'
              }`}
            >
              <div className="text-base font-bold text-purple-700">T: {resp.temperature}</div>
              <div className="text-base font-bold text-pink-700">P: {resp.top_p}</div>
              <div className="text-xs text-gray-600 mt-2 font-semibold bg-purple-100 px-2 py-1 rounded-full">
                {resp.metrics?.overall_score?.toFixed(3)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="glass p-6 rounded-2xl shadow-xl card-hover">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Quality Metrics Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#c7d2fe" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontWeight: 'bold' }} />
              <PolarRadiusAxis domain={[0, 1]} tick={{ fill: '#6b7280' }} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#667eea"
                fill="#667eea"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics Cards */}
        <div className="glass p-6 rounded-2xl shadow-xl card-hover">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Individual Metrics</h3>
          <div className="space-y-4">
            {selectedResponse.metrics &&
              Object.entries(selectedResponse.metrics).map(([key, value]) => {
                const percentage = value * 100;
                let gradientClass = 'metric-poor';
                if (value >= 0.8) gradientClass = 'metric-excellent';
                else if (value >= 0.6) gradientClass = 'metric-good';
                else if (value >= 0.4) gradientClass = 'metric-average';
                
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-bold text-purple-700">
                        {value.toFixed(3)}
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`absolute inset-y-0 left-0 ${gradientClass} rounded-full transition-all duration-500 shadow-md`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Response Content */}
      <div className="glass p-8 rounded-2xl shadow-xl card-hover">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Response Content</h3>
          <div className="text-sm font-semibold bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full text-purple-700">
            T: {selectedResponse.temperature} • P: {selectedResponse.top_p}
          </div>
        </div>
        <div className="prose max-w-none">
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl whitespace-pre-wrap text-sm leading-relaxed text-gray-800 border-2 border-purple-200 shadow-inner">
            {selectedResponse.content}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-purple-700">
          <span className="bg-purple-100 px-3 py-1.5 rounded-full">
            Word count: {selectedResponse.content.split(/\s+/).length}
          </span>
          <span className="bg-pink-100 px-3 py-1.5 rounded-full">
            Character count: {selectedResponse.content.length}
          </span>
        </div>
      </div>
    </div>
  );
}