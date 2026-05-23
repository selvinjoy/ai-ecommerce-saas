import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  research: 'bg-blue-500',
  gateway_1: 'bg-yellow-500',
  storefront: 'bg-purple-500',
  marketing: 'bg-pink-500',
  gateway_2: 'bg-yellow-500',
  ads: 'bg-orange-500',
  supplier: 'bg-teal-500',
  legal: 'bg-green-500',
  stop_loss: 'bg-red-500',
  completed: 'bg-green-600',
  failed: 'bg-red-600',
  paused: 'bg-gray-500',
};

const STATUS_LABELS = {
  research: 'Research',
  gateway_1: 'Awaiting Product Approval',
  storefront: 'Building Storefront',
  marketing: 'Marketing Strategy',
  gateway_2: 'Awaiting Marketing Approval',
  ads: 'Running Ads',
  supplier: 'Sourcing Supplier',
  legal: 'Legal & Compliance',
  stop_loss: 'Stop-Loss Triggered',
  completed: 'Completed',
  failed: 'Failed',
  paused: 'Paused',
};

const PIPELINE_STAGES = [
  'research',
  'gateway_1',
  'storefront',
  'marketing',
  'gateway_2',
  'ads',
  'supplier',
  'legal',
  'completed',
];

export default function PipelineCard({ pipeline }) {
  const {
    pipeline_id,
    product_niche,
    status,
    created_at,
    metrics,
  } = pipeline;

  const stageIndex = PIPELINE_STAGES.indexOf(status);
  const progressPct = stageIndex >= 0
    ? Math.round(((stageIndex + 1) / PIPELINE_STAGES.length) * 100)
    : 0;

  const colorClass = STATUS_COLORS[status] || 'bg-gray-500';
  const label = STATUS_LABELS[status] || status;

  const isGateway = status === 'gateway_1' || status === 'gateway_2';
  const isStopLoss = status === 'stop_loss';

  return (
    <div className={`bg-gray-800 rounded-xl p-5 border ${
      isGateway ? 'border-yellow-500' : isStopLoss ? 'border-red-500' : 'border-gray-700'
    } hover:border-gray-500 transition-colors`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-lg leading-tight">{product_niche}</h3>
          <p className="text-gray-400 text-xs mt-1">{pipeline_id.slice(0, 8)}...</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${colorClass}`}>
          {label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-700/50 rounded-lg p-2 text-center">
            <p className="text-gray-400 text-xs">ROAS</p>
            <p className="text-white font-semibold text-sm">
              {metrics.roas ? `${metrics.roas}x` : '--'}
            </p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-2 text-center">
            <p className="text-gray-400 text-xs">Ad Spend</p>
            <p className="text-white font-semibold text-sm">
              {metrics.ad_spend ? `$${metrics.ad_spend}` : '--'}
            </p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-2 text-center">
            <p className="text-gray-400 text-xs">Revenue</p>
            <p className="text-white font-semibold text-sm">
              {metrics.revenue ? `$${metrics.revenue}` : '--'}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-xs">
          {new Date(created_at).toLocaleDateString('en-AU')}
        </p>
        <Link
          to={`/pipeline/${pipeline_id}`}
          className="text-blue-400 hover:text-blue-300 text-xs font-medium"
        >
          View Details &rarr;
        </Link>
      </div>

      {/* Gateway Alert */}
      {isGateway && (
        <div className="mt-3 pt-3 border-t border-yellow-500/30">
          <Link
            to="/gateway"
            className="w-full block text-center bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold py-2 rounded-lg transition-colors"
          >
            Review & Approve
          </Link>
        </div>
      )}

      {/* Stop Loss Alert */}
      {isStopLoss && (
        <div className="mt-3 pt-3 border-t border-red-500/30">
          <p className="text-red-400 text-xs text-center">Campaign paused — stop-loss triggered</p>
        </div>
      )}
    </div>
  );
}
