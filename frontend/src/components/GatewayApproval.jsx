import { useState } from 'react';
import api from '../services/api';

export default function GatewayApproval({ gateway, onDecision }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(null);

  const isGateway1 = gateway.gateway_type === 'product_approval';
  const data = gateway.data || {};

  const handleDecision = async (approved) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/pipelines/${gateway.pipeline_id}/gateway`, {
        approved,
        feedback,
        gateway_type: gateway.gateway_type,
      });
      onDecision(gateway.pipeline_id, approved);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit decision');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-yellow-500/50 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
          <span className="text-yellow-400 text-lg">{isGateway1 ? '🔍' : '📣'}</span>
        </div>
        <div>
          <h3 className="text-white font-semibold">
            {isGateway1 ? 'Gateway 1: Product Approval' : 'Gateway 2: Marketing Strategy Approval'}
          </h3>
          <p className="text-gray-400 text-sm">
            Pipeline: {gateway.pipeline_id?.slice(0, 12)}...
          </p>
        </div>
        <span className="ml-auto px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
          Awaiting Your Review
        </span>
      </div>

      {/* Data Display */}
      {isGateway1 ? (
        <div className="space-y-3 mb-4">
          {data.product_niche && (
            <InfoRow label="Product Niche" value={data.product_niche} />
          )}
          {data.market_size && (
            <InfoRow label="Market Size" value={data.market_size} />
          )}
          {data.competition_level && (
            <InfoRow label="Competition" value={data.competition_level} />
          )}
          {data.estimated_margin && (
            <InfoRow label="Est. Margin" value={`${data.estimated_margin}%`} />
          )}
          {data.trending_score && (
            <InfoRow label="Trend Score" value={`${data.trending_score}/10`} />
          )}
          {data.au_compliance && (
            <InfoRow
              label="AU Compliance"
              value={data.au_compliance}
              highlight={data.au_compliance === 'FAIL' ? 'red' : 'green'}
            />
          )}
          {data.summary && (
            <div className="bg-gray-700/50 rounded-lg p-3 mt-2">
              <p className="text-gray-300 text-sm">{data.summary}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {data.target_audience && (
            <InfoRow label="Target Audience" value={data.target_audience} />
          )}
          {data.ad_budget_aud && (
            <InfoRow label="Ad Budget (AUD)" value={`$${data.ad_budget_aud}`} />
          )}
          {data.platforms && (
            <InfoRow label="Platforms" value={data.platforms?.join(', ')} />
          )}
          {data.stop_loss_threshold && (
            <InfoRow label="Stop-Loss Threshold" value={`$${data.stop_loss_threshold} AUD`} highlight="orange" />
          )}
          {data.creative_angles && (
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-2 font-medium uppercase tracking-wide">Creative Angles</p>
              <ul className="space-y-1">
                {data.creative_angles.map((angle, i) => (
                  <li key={i} className="text-gray-300 text-sm">• {angle}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-1">Feedback (optional)</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Add notes or modification requests..."
          rows={3}
          className="w-full bg-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 border border-gray-600 focus:border-yellow-500 focus:outline-none resize-none"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-3">{error}</p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleDecision(true)}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
        >
          {loading ? 'Submitting...' : 'Approve & Continue'}
        </button>
        <button
          onClick={() => handleDecision(false)}
          disabled={loading}
          className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
        >
          Reject Pipeline
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  const valueColor =
    highlight === 'red' ? 'text-red-400' :
    highlight === 'green' ? 'text-green-400' :
    highlight === 'orange' ? 'text-orange-400' :
    'text-white';
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-700">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`text-sm font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}
