import { useState, useEffect } from 'react';
import api from '../services/api';

function StatCard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  };
  const textColors = {
    blue: 'text-blue-300',
    green: 'text-green-300',
    orange: 'text-orange-300',
    red: 'text-red-300',
    purple: 'text-purple-300',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5`}>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${textColors[color]}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pipelines').then((res) => {
      setPipelines(res.data || []);
    }).finally(() => setLoading(false));
  }, []);

  // Aggregate stats
  const total = pipelines.length;
  const active = pipelines.filter((p) => !['completed', 'failed', 'stop_loss'].includes(p.status)).length;
  const completed = pipelines.filter((p) => p.status === 'completed').length;
  const stopLoss = pipelines.filter((p) => p.status === 'stop_loss').length;
  const pending = pipelines.filter((p) => p.status === 'gateway_1' || p.status === 'gateway_2').length;

  const totalRevenue = pipelines.reduce((sum, p) => sum + (p.metrics?.revenue || 0), 0);
  const totalAdSpend = pipelines.reduce((sum, p) => sum + (p.metrics?.ad_spend || 0), 0);
  const avgRoas = pipelines.filter((p) => p.metrics?.roas).length > 0
    ? (pipelines.reduce((sum, p) => sum + (p.metrics?.roas || 0), 0) /
       pipelines.filter((p) => p.metrics?.roas).length).toFixed(2)
    : '--';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Aggregate performance across all pipelines</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-20">Loading analytics...</p>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
            <StatCard label="Total Pipelines" value={total} color="blue" />
            <StatCard label="Active" value={active} color="purple" />
            <StatCard label="Completed" value={completed} color="green" />
            <StatCard label="Pending Approval" value={pending} color="orange" sub="requires review" />
            <StatCard label="Stop-Loss Hits" value={stopLoss} color="red" />
            <StatCard label="Avg ROAS" value={avgRoas !== '--' ? `${avgRoas}x` : '--'} color="green" />
          </div>

          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Revenue Overview (AUD)</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Revenue</span>
                  <span className="text-green-300 font-semibold text-lg">${totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Ad Spend</span>
                  <span className="text-orange-300 font-semibold text-lg">${totalAdSpend.toFixed(2)}</span>
                </div>
                <div className="h-px bg-gray-700 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Net Profit</span>
                  <span className={`font-bold text-xl ${
                    totalRevenue - totalAdSpend >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${(totalRevenue - totalAdSpend).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Pipeline Status Breakdown</h2>
              <div className="space-y-3">
                {[
                  { label: 'Research', status: 'research', color: 'bg-blue-500' },
                  { label: 'Awaiting Approval', status: ['gateway_1', 'gateway_2'], color: 'bg-yellow-500' },
                  { label: 'Running Ads', status: 'ads', color: 'bg-orange-500' },
                  { label: 'Completed', status: 'completed', color: 'bg-green-600' },
                  { label: 'Failed / Stop-Loss', status: ['failed', 'stop_loss'], color: 'bg-red-500' },
                ].map(({ label, status, color }) => {
                  const count = Array.isArray(status)
                    ? pipelines.filter((p) => status.includes(p.status)).length
                    : pipelines.filter((p) => p.status === status).length;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{label}</span>
                        <span className="text-gray-400">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pipeline Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">All Pipelines</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium px-5 py-3">Pipeline</th>
                    <th className="text-left text-gray-400 font-medium px-5 py-3">Status</th>
                    <th className="text-right text-gray-400 font-medium px-5 py-3">Revenue</th>
                    <th className="text-right text-gray-400 font-medium px-5 py-3">Ad Spend</th>
                    <th className="text-right text-gray-400 font-medium px-5 py-3">ROAS</th>
                    <th className="text-left text-gray-400 font-medium px-5 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelines.map((p) => (
                    <tr key={p.pipeline_id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="px-5 py-3">
                        <p className="text-white font-medium">{p.product_niche}</p>
                        <p className="text-gray-500 text-xs">{p.pipeline_id.slice(0, 12)}...</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-gray-300 capitalize">{p.status?.replace('_', ' ')}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-green-300">
                        ${p.metrics?.revenue ?? '0.00'}
                      </td>
                      <td className="px-5 py-3 text-right text-orange-300">
                        ${p.metrics?.ad_spend ?? '0.00'}
                      </td>
                      <td className="px-5 py-3 text-right text-white">
                        {p.metrics?.roas ? `${p.metrics.roas}x` : '--'}
                      </td>
                      <td className="px-5 py-3 text-gray-400">
                        {new Date(p.created_at).toLocaleDateString('en-AU')}
                      </td>
                    </tr>
                  ))}
                  {pipelines.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                        No pipeline data available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
