import axios from 'axios';

/**
 * Axios instance pre-configured to talk to the FastAPI backend.
 * Base URL reads from VITE_API_URL env var (default: http://localhost:8000)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ---------------------------------------------------------------------------
// Request interceptor – attach auth token if available
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor – normalise errors
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale token and redirect to login when auth is wired up
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;

// ---------------------------------------------------------------------------
// Typed helper functions
// ---------------------------------------------------------------------------

/** Fetch all pipelines (optionally filtered by status CSV) */
export const fetchPipelines = (status) =>
  api.get('/pipelines', { params: status ? { status } : {} });

/** Launch a new pipeline */
export const launchPipeline = (productNiche, budget) =>
  api.post('/pipelines', { product_niche: productNiche, budget_aud: budget });

/** Submit a HITL gateway decision */
export const submitGatewayDecision = (pipelineId, gatewayType, approved, feedback) =>
  api.post(`/pipelines/${pipelineId}/gateway`, {
    gateway_type: gatewayType,
    approved,
    feedback,
  });

/** Acknowledge a stop-loss event */
export const acknowledgeStopLoss = (pipelineId, action) =>
  api.post(`/pipelines/${pipelineId}/stop-loss`, { action });

/** Fetch a single pipeline by ID */
export const fetchPipeline = (pipelineId) =>
  api.get(`/pipelines/${pipelineId}`);

/** Cancel / kill a pipeline */
export const killPipeline = (pipelineId) =>
  api.delete(`/pipelines/${pipelineId}`);
