'use client';

import { useState } from 'react';
import { Play, Settings, Loader2 } from 'lucide-react';
import type { GenerateRequest } from '@/lib/api';

interface ExperimentFormProps {
  onSubmit: (request: GenerateRequest) => Promise<void>;
  isLoading: boolean;
}

export default function ExperimentForm({ onSubmit, isLoading }: ExperimentFormProps) {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [temperatureValues, setTemperatureValues] = useState('0.3, 0.7, 1.0');
  const [topPValues, setTopPValues] = useState('0.9, 1.0');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse temperature and top_p values
    const temperature_range = temperatureValues
      .split(',')
      .map(v => parseFloat(v.trim()))
      .filter(v => !isNaN(v) && v >= 0 && v <= 2);
    
    const top_p_range = topPValues
      .split(',')
      .map(v => parseFloat(v.trim()))
      .filter(v => !isNaN(v) && v >= 0 && v <= 1);

    if (temperature_range.length === 0 || top_p_range.length === 0) {
      alert('Please enter valid parameter values');
      return;
    }

    await onSubmit({
      prompt,
      model,
      temperature_range,
      top_p_range,
    });
  };

  const examplePrompts = [
    "Explain the concept of machine learning to a 10-year-old",
    "Write a professional email declining a job offer",
    "Describe the benefits of regular exercise",
    "Explain quantum computing in simple terms",
  ];

  const fillExample = (example: string) => {
    setPrompt(example);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt Input */}
      <div className="relative">
        <label htmlFor="prompt" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
          Your Prompt
        </label>
        <div className="relative group">
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full h-32 px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 resize-none transition-all duration-300 shadow-sm hover:shadow-md bg-white"
            required
            disabled={isLoading}
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs font-medium text-purple-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Quick Examples:
          </span>
          {examplePrompts.map((example, i) => (
            <button
              key={i}
              type="button"
              onClick={() => fillExample(example)}
              className="text-xs px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 rounded-full transition-all duration-300 text-purple-800 font-medium shadow-sm hover:shadow-md"
              disabled={isLoading}
            >
              {example.slice(0, 30)}...
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
      >
        <Settings className="w-4 h-4" />
        {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
      </button>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl border-2 border-purple-200 shadow-lg animate-fadeIn">
          {/* Model Selection */}
          <div className="relative">
            <label htmlFor="model" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></span>
              Model
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all shadow-sm hover:shadow-md bg-white cursor-pointer"
              disabled={isLoading}
            >
              <option value="gpt-3.5-turbo">🤖 GPT-3.5 Turbo</option>
              <option value="gpt-4o-mini">🧠 GPT-4</option>
              <option value="claude-3-sonnet">🎭 Claude 3 Sonnet</option>
              <option value="mock">✨ Mock (No API Key Required)</option>
            </select>
            <p className="mt-2 text-xs text-purple-700 font-medium">
              Mock mode generates sample responses without API keys
            </p>
          </div>

          {/* Temperature Range */}
          <div className="relative">
            <label htmlFor="temperature" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></span>
              Temperature Values
            </label>
            <input
              id="temperature"
              type="text"
              value={temperatureValues}
              onChange={(e) => setTemperatureValues(e.target.value)}
              placeholder="0.3, 0.7, 1.0"
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-400 transition-all shadow-sm hover:shadow-md bg-white"
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-orange-700 font-medium">
              🔥 Comma-separated values (0.0 - 2.0). Controls randomness.
            </p>
          </div>

          {/* Top P Range */}
          <div className="relative">
            <label htmlFor="topP" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500"></span>
              Top P Values
            </label>
            <input
              id="topP"
              type="text"
              value={topPValues}
              onChange={(e) => setTopPValues(e.target.value)}
              placeholder="0.9, 1.0"
              className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-400 transition-all shadow-sm hover:shadow-md bg-white"
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-green-700 font-medium">
              🎯 Comma-separated values (0.0 - 1.0). Controls diversity.
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full btn-gradient text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl disabled:transform-none relative overflow-hidden group"
      >
        <div className="absolute inset-0 shine opacity-0 group-hover:opacity-100"></div>
        {isLoading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Generating Responses...
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            Generate & Analyze Responses
          </>
        )}
      </button>
    </form>
  );
}

