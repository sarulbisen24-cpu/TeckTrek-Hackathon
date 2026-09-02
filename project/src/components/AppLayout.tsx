import { useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { classNames } from '@/utils/helpers';
import {
  Car, Home, Search, CalendarClock, LayoutDashboard, Bell, User as UserIcon,
  Shield, Info, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home, roles: ['user', 'admin'] },
  { to: '/search', label: 'Search Parking', icon: Search, roles: ['user', 'admin'] },
  { to: '/bookings', label: 'Bookings', icon: CalendarClock, roles: ['user', 'admin'] },
  { to: '/dashboard-stats', label: 'Dashboard', icon: LayoutDashboard, roles: ['user', 'admin'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['user', 'admin'] },
  { to: '/profile', label: 'Profile', icon: UserIcon, roles: ['user', 'admin'] },
  { to: '/admin', label: 'Admin', icon: Shield, roles: ['admin'] },
  { to: '/about', label: 'About', icon: Info, roles: ['user', 'admin'] },
];

export default function AppLayout() {
  const { currentUser, logout, notifications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleItems = navItems.filter((item) => item.roles.includes(currentUser.role));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-blue-100">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
          <Car className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-800 leading-tight">SmartPark</h1>
          <p className="text-xs text-gray-400">Smart Parking System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || (item.to === '/admin' && location.pathname.startsWith('/admin'));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={classNames(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all group',
                isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 font-medium text-sm">{item.label}</span>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className={classNames(
                  'text-xs font-bold px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                )}>
                  {unreadCount}
                </span>
              )}
              <ChevronRight className={classNames('w-4 h-4 transition-opacity', isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40')} />
            </NavLink>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-red-600 hover:bg-red-50 transition-all w-full mt-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </nav>

      {/* User card */}
      <div className="px-3 py-3 border-t border-blue-100">
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl">
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-400 truncate capitalize">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white flex flex-col shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-800">SmartPark</span>
          </div>
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
