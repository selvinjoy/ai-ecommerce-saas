/**
 * Dashboard - Main pipeline overview page
 * Shows all active pipelines, their status, and pending gateway approvals
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePipelineStore } from '../store/pipelineStore';
import PipelineCard from '../components/PipelineCard';
import StopLossAlert from '../components/StopLossAlert';

export default function Dashboard() {
  const { pipelines, fetchPipelines, createPipeline, loading } = usePipelineStore();

  useEffect(() => {
    fetchPipelines();
    // Poll every 30 seconds
    const interval = setInterval(fetchPipelines, 30000);
    return () => clearInterval(interval);
  }, [fetchPipelines]);

  const pendingGateways = pipelines.filter(
    (p) => p.status === 'awaiting_gateway_1' || p.status === 'awaiting_gateway_2'
  );

  const stopLossTriggered = pipelines.filter((p) => p.status === 'stop_loss_triggered');

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">AI E-Commerce Pipelines</h1>
          <p className="text-gray-400 mt-1">Autonomous product-to-fulfilment automation</p>
        </div>
        <button
          onClick={() => createPipeline({ target_market: 'AU' })}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          + Launch New Pipeline
        </button>
      </div>

      {/* Stop-Loss Alerts */}
      {stopLossTriggered.length > 0 && (
        <div className="mb-6">
          {stopLossTriggered.map((p) => (
            <StopLossAlert key={p.pipeline_id} pipeline={p} />
          ))}
        </div>
      )}

      {/* Pending Gateway Approvals Banner */}
      {pendingGateways.length > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
          <p className="text-yellow-400 font-semibold">
            {pendingGateways.length} pipeline(s) waiting for your approval
          </p>
          <Link to="/gateway" className="text-yellow-300 underline text-sm">
            Review approvals -&gt;
          </Link>
        </div>
      )}

      {/* Pipeline Grid */}
      {loading ? (
        <div className="text-gray-400 text-center py-20">Loading pipelines...</div>
      ) : pipelines.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No pipelines yet.</p>
          <p className="text-gray-600 text-sm mt-2">Click "Launch New Pipeline" to start your first AI-powered product search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pipelines.map((pipeline) => (
            <PipelineCard key={pipeline.pipeline_id} pipeline={pipeline} />
          ))}
        </div>
      )}
    </div>
  );
}
