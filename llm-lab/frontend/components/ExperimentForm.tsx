'use client';

import { useState } from 'react';
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
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create New Experiment</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your prompt and configure parameters to generate and analyze multiple LLM responses
          </p>
        </div>

        {/* Main Prompt Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
          <div className="space-y-6">
            {/* Prompt Label */}
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <label htmlFor="prompt" className="text-xl font-bold text-gray-800">
                Your Prompt
              </label>
            </div>

            {/* Prompt Input */}
            <div className="relative group">
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here... Be specific about what you want the AI to generate."
                className="w-full h-40 px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 resize-none transition-all duration-300 shadow-sm hover:shadow-md bg-gray-50 focus:bg-white"
                required
                disabled={isLoading}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>

            {/* Character Count */}
            <div className="flex justify-end">
              <span className="text-sm text-gray-500 font-medium">
                {prompt.length} characters
              </span>
            </div>
          </div>
        </div>

        {/* Quick Examples Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <h3 className="text-xl font-bold text-gray-800">Quick Examples</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examplePrompts.map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => fillExample(example)}
                  className="p-4 text-left bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-all duration-300 text-blue-800 font-medium shadow-sm hover:shadow-md hover:scale-105 hover:border-blue-300"
                  disabled={isLoading}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">{example}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="toggle-highlight text-lg w-full"
            >
              {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
            </button>
          </div>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 animate-fadeIn">
            <div className="space-y-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                <h3 className="text-2xl font-bold text-gray-800">Advanced Configuration</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Model Selection */}
                <div className="space-y-4">
                  <label htmlFor="model" className="block text-lg font-bold text-gray-800 flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                    <span>Model</span>
                  </label>
                  <select
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-5 py-4 text-lg border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all shadow-sm hover:shadow-md bg-white cursor-pointer"
                    disabled={isLoading}
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4o-mini">GPT-4</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="mock">Mock (No API Key Required)</option>
                  </select>
                  <p className="text-sm text-gray-600 font-medium">
                    Mock mode generates sample responses without API keys
                  </p>
                </div>

                {/* Temperature Range */}
                <div className="space-y-4">
                  <label htmlFor="temperature" className="block text-lg font-bold text-gray-800 flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                    <span>Temperature</span>
                  </label>
                  <input
                    id="temperature"
                    type="text"
                    value={temperatureValues}
                    onChange={(e) => setTemperatureValues(e.target.value)}
                    placeholder="0.3, 0.7, 1.0"
                    className="w-full px-5 py-4 text-lg border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all shadow-sm hover:shadow-md bg-white"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-600 font-medium">
                    Controls randomness (0.0 - 2.0)
                  </p>
                </div>

                {/* Top P Range */}
                <div className="space-y-4">
                  <label htmlFor="topP" className="block text-lg font-bold text-gray-800 flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500"></div>
                    <span>Top P</span>
                  </label>
                  <input
                    id="topP"
                    type="text"
                    value={topPValues}
                    onChange={(e) => setTopPValues(e.target.value)}
                    placeholder="0.9, 1.0"
                    className="w-full px-5 py-4 text-lg border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400 transition-all shadow-sm hover:shadow-md bg-white"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-600 font-medium">
                    Controls diversity (0.0 - 1.0)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button Section */}
        <div className="flex justify-center pt-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="primary-action btn-gradient disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none w-full"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner" aria-hidden="true"></span>
                  <span>Generating Responses...</span>
                </>
              ) : (
                <span>Generate &amp; Analyze Responses</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}