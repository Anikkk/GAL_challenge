'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Trash2, Eye, RefreshCw } from 'lucide-react';
import { deleteExperiment, getExperiment, type ExperimentListItem } from '@/lib/api';

interface ExperimentHistoryProps {
  experiments: ExperimentListItem[];
  onExperimentSelect: (experiment: any) => void;
  onRefresh: () => void;
}

export default function ExperimentHistory({
  experiments,
  onExperimentSelect,
  onRefresh,
}: ExperimentHistoryProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteExperiment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const handleView = async (id: number) => {
    const experiment = await getExperiment(id);
    onExperimentSelect(experiment);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this experiment?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (experiments.length === 0) {
    return (
      <div className="glass p-12 rounded-2xl shadow-xl text-center card-hover">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Clock className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold gradient-text mb-3">
          No Experiments Yet
        </h3>
        <p className="text-gray-600 text-lg">
          Create your first experiment to start analyzing LLM responses ✨
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between glass p-6 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Experiment History</h2>
          <p className="text-sm text-purple-700 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            {experiments.length} experiments saved
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-6 py-3 btn-gradient text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Experiments List */}
      <div className="grid gap-4">
        {experiments.map((experiment, index) => (
          <div
            key={experiment.id}
            className="glass p-6 rounded-2xl shadow-lg card-hover relative overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300 to-pink-300 opacity-20 rounded-full -mr-16 -mt-16"></div>
            
            <div className="flex items-start justify-between gap-4 relative">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-lg shadow-md">
                    #{experiment.id}
                  </span>
                  <h3 className="text-lg font-bold text-gray-800 truncate flex-1">
                    {experiment.prompt}
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 bg-purple-100 px-3 py-1.5 rounded-full text-purple-700 font-semibold">
                    <Clock className="w-4 h-4" />
                    {formatDate(experiment.created_at)}
                  </span>
                  <span className="bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-1.5 rounded-full text-blue-700 font-semibold">
                    🎯 {experiment.response_count} responses
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => handleView(experiment.id)}
                  className="flex items-center gap-2 px-5 py-3 btn-gradient text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Eye className="w-5 h-5" />
                  View
                </button>
                <button
                  onClick={() => handleDelete(experiment.id)}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-2 px-5 py-3 btn-gradient-danger text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

