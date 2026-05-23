import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Gateway from './pages/Gateway';
import Analytics from './pages/Analytics';

function Sidebar() {
  const navItem = (to, label, icon) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {label}
    </NavLink>
  );

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <h1 className="text-white font-bold text-lg leading-tight">
          AI Commerce
          <span className="text-blue-400"> SaaS</span>
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">Pipeline Automation</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItem('/', 'Dashboard', '📊')}
        {navItem('/gateway', 'HITL Gateway', '🔐')}
        {navItem('/analytics', 'Analytics', '📈')}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-800">
        <p className="text-gray-600 text-xs">Phase 1 — MVP</p>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-gray-950 min-h-screen">
        <Sidebar />
        {/* Main content offset by sidebar width */}
        <main className="ml-56 flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/gateway" element={<Gateway />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
