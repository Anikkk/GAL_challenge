import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gal-challenge-backend.vercel.app/';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export interface GenerateRequest {
  prompt: string;
  model: string;
  temperature_range: number[];
  top_p_range: number[];
}

export interface ResponseMetrics {
  coherence_score: number;
  lexical_diversity: number;
  completeness_score: number;
  structure_score: number;
  readability_score: number;
  length_appropriateness: number;
  overall_score?: number;
}

export interface ResponseData {
  id: number;
  temperature: number;
  top_p: number;
  model: string;
  content: string;
  metrics: ResponseMetrics | null;
  created_at: string;
}

export interface ExperimentResponse {
  id: number;
  prompt: string;
  created_at: string;
  responses: ResponseData[];
}

export interface ExperimentListItem {
  id: number;
  prompt: string;
  created_at: string;
  response_count: number;
}

export const generateResponses = async (request: GenerateRequest): Promise<ExperimentResponse> => {
  const response = await api.post('/api/generate', request);
  return response.data;
};

export const getExperiments = async (): Promise<ExperimentListItem[]> => {
  const response = await api.get('/api/experiments');
  return response.data;
};

export const getExperiment = async (id: number): Promise<ExperimentResponse> => {
  const response = await api.get(`/api/experiments/${id}`);
  return response.data;
};

export const deleteExperiment = async (id: number): Promise<void> => {
  await api.delete(`/api/experiments/${id}`);
};

export const exportExperiments = async (experimentIds: number[], format: 'json' | 'csv') => {
  const response = await api.post('/api/export', {
    experiment_ids: experimentIds,
    format,
  });
  return response.data;
};

export const getMetricsInfo = async () => {
  const response = await api.get('/api/metrics/info');
  return response.data;
};

