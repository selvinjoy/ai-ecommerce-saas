import { useState, useEffect } from 'react';
import GatewayApproval from '../components/GatewayApproval';
import api from '../services/api';

export default function Gateway() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchPendingGateways();
  }, []);

  const fetchPendingGateways = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/pipelines?status=gateway_1,gateway_2');
      const pipelines = res.data || [];
      // Map pipelines to gateway objects
      const gatewayList = pipelines.map((p) => ({
        pipeline_id: p.pipeline_id,
        gateway_type: p.status === 'gateway_1' ? 'product_approval' : 'marketing_approval',
        data: p.gateway_data || {},
      }));
      setGateways(gatewayList);
    } catch (err) {
      setError('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = (pipelineId, approved) => {
    setGateways((prev) => prev.filter((g) => g.pipeline_id !== pipelineId));
    setSuccessMsg(
      approved
        ? `Pipeline ${pipelineId.slice(0, 8)} approved and resumed.`
        : `Pipeline ${pipelineId.slice(0, 8)} has been rejected.`
    );
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">HITL Gateway</h1>
        <p className="text-gray-400 mt-1">
          Review and approve AI-generated pipeline decisions before they proceed.
        </p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="mb-6 bg-green-900/30 border border-green-500 rounded-lg p-4">
          <p className="text-green-300 text-sm">{successMsg}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-500 rounded-lg p-4 flex justify-between">
          <p className="text-red-300 text-sm">{error}</p>
          <button onClick={fetchPendingGateways} className="text-red-300 hover:text-red-200 text-sm underline">
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <p className="text-gray-400">Loading pending approvals...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && gateways.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">All Clear</h2>
          <p className="text-gray-400">No pipelines are currently awaiting approval.</p>
        </div>
      )}

      {/* Gateway List */}
      {!loading && gateways.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-300">
              <span className="font-semibold text-yellow-400">{gateways.length}</span> pipeline(s) awaiting your review
            </p>
            <button
              onClick={fetchPendingGateways}
              className="text-gray-400 hover:text-white text-sm"
            >
              Refresh
            </button>
          </div>

          {/* Gateway 1: Product Approvals */}
          {gateways.filter((g) => g.gateway_type === 'product_approval').length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                Gateway 1 — Product Approvals
              </h2>
              <div className="space-y-4">
                {gateways
                  .filter((g) => g.gateway_type === 'product_approval')
                  .map((g) => (
                    <GatewayApproval
                      key={g.pipeline_id}
                      gateway={g}
                      onDecision={handleDecision}
                    />
                  ))}
              </div>
            </section>
          )}

          {/* Gateway 2: Marketing Approvals */}
          {gateways.filter((g) => g.gateway_type === 'marketing_approval').length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
                Gateway 2 — Marketing Strategy Approvals
              </h2>
              <div className="space-y-4">
                {gateways
                  .filter((g) => g.gateway_type === 'marketing_approval')
                  .map((g) => (
                    <GatewayApproval
                      key={g.pipeline_id}
                      gateway={g}
                      onDecision={handleDecision}
                    />
                  ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
