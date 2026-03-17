import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ListOrdered, Users, Activity,
  Zap, Settings, ChevronDown, Bell, Search,
} from 'lucide-react';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sequences', icon: ListOrdered, label: 'Sequences' },
  { to: '/prospects', icon: Users, label: 'Prospects' },
  { to: '/enrollments', icon: Activity, label: 'Enrollments' },
];

export function Layout() {
  const location = useLocation();

  const pageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/sequences')) return 'Sequences';
    if (location.pathname.startsWith('/prospects')) return 'Prospects';
    if (location.pathname.startsWith('/enrollments')) return 'Enrollments';
    return 'Outreach Sequencer';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-gray-900 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-700/50">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-[15px]">Outreach</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider px-2 mb-2">Main</p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}

          <div className="pt-4">
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider px-2 mb-2">Account</p>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 w-full transition-colors">
              <Settings className="w-4 h-4 flex-shrink-0" />
              Settings
            </button>
          </div>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-700/50">
          <button className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
              JS
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-gray-200 text-xs font-medium truncate">John Sales</p>
              <p className="text-gray-500 text-[10px] truncate">john@company.com</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 flex items-center gap-4 px-6 py-3 flex-shrink-0">
          <h1 className="text-gray-900 font-semibold text-base">{pageTitle()}</h1>
          <div className="flex-1 max-w-md ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
