export default function StopLossAlert({ pipeline, onAcknowledge }) {
  const { pipeline_id, product_niche, metrics } = pipeline;

  return (
    <div className="bg-red-900/20 border border-red-500 rounded-xl p-5">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-red-400 text-xl">⚠️</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-red-300 font-semibold">
              Stop-Loss Triggered: {product_niche}
            </h3>
            <span className="text-gray-400 text-xs">
              Pipeline {pipeline_id?.slice(0, 8)}...
            </span>
          </div>

          <p className="text-gray-300 text-sm mt-1">
            Ad campaign has been automatically paused. The spend threshold was exceeded without meeting the minimum ROAS target.
          </p>

          {/* Metrics Summary */}
          {metrics && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-gray-800 rounded-lg p-2 text-center">
                <p className="text-gray-400 text-xs">Ad Spend</p>
                <p className="text-red-300 font-semibold text-sm">
                  ${metrics.ad_spend ?? '--'} AUD
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2 text-center">
                <p className="text-gray-400 text-xs">ROAS</p>
                <p className="text-red-300 font-semibold text-sm">
                  {metrics.roas != null ? `${metrics.roas}x` : '--'}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2 text-center">
                <p className="text-gray-400 text-xs">Threshold</p>
                <p className="text-orange-300 font-semibold text-sm">
                  ${metrics.stop_loss_threshold ?? '--'} AUD
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onAcknowledge(pipeline_id, 'resume')}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Resume with New Budget
            </button>
            <button
              onClick={() => onAcknowledge(pipeline_id, 'kill')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-lg transition-colors"
            >
              Kill Pipeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
