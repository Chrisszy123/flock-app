import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  User,
  Calendar,
  GraduationCap,
  Users,
  MapPin,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Church,
  Newspaper,
  BookOpen,
  ClipboardList,
  Wallet,
  Building2,
  Megaphone,
  Settings,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/features/auth/AuthContext';
import { RoleBadge } from '@/components/ui';
import type { Role } from '@/types';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  roles: Role[];
  section?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems: NavItem[] = [
    // Core
    { label: 'Dashboard', icon: Home, href: '/dashboard', roles: ['MEMBER', 'WORKER', 'LEADER', 'DIRECTORATE', 'ADMIN'] },
    { label: 'Profile', icon: User, href: '/profile', roles: ['MEMBER', 'WORKER', 'LEADER', 'DIRECTORATE', 'ADMIN'] },

    // Church
    { label: 'News', icon: Newspaper, href: '/news', roles: ['MEMBER', 'WORKER', 'LEADER', 'DIRECTORATE', 'ADMIN'], section: 'Church' },
    { label: 'Events', icon: Calendar, href: '/events', roles: ['MEMBER', 'WORKER', 'LEADER', 'DIRECTORATE', 'ADMIN'] },
    { label: 'Resources', icon: BookOpen, href: '/resources', roles: ['MEMBER', 'WORKER', 'LEADER', 'DIRECTORATE', 'ADMIN'] },
    { label: 'Giving', icon: Wallet, href: '/finance', roles: ['MEMBER', 'WORKER', 'LEADER', 'DIRECTORATE', 'ADMIN'] },

    // Workers
    { label: 'Training', icon: GraduationCap, href: '/training', roles: ['WORKER', 'LEADER', 'DIRECTORATE', 'ADMIN'], section: 'Workforce' },
    { label: 'Permissions', icon: ClipboardList, href: '/permissions', roles: ['WORKER', 'LEADER', 'DIRECTORATE', 'ADMIN'] },
    { label: 'Workers', icon: Users, href: '/workers', roles: ['LEADER', 'DIRECTORATE', 'ADMIN'] },

    // Management
    { label: 'Workforce', icon: Building2, href: '/workforce', roles: ['DIRECTORATE', 'ADMIN'], section: 'Management' },
    { label: 'Members', icon: Users, href: '/members', roles: ['ADMIN'] },
    { label: 'Locations', icon: MapPin, href: '/locations', roles: ['ADMIN'] },
    { label: 'Broadcast', icon: Megaphone, href: '/broadcast', roles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter((item) =>
    user && item.roles.includes(user.role)
  );

  // Group items by section for visual separation
  let lastSection: string | undefined;

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-dark-900/95 backdrop-blur-sm border-b border-secondary-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-secondary-400 hover:text-white rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Church className="w-7 h-7 text-primary-500" />
            <span className="font-display font-semibold text-white">GIC</span>
          </Link>
          <div className="w-10" />
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-72 bg-dark-900 border-r border-secondary-800/50 transition-transform duration-300 lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-secondary-800/50">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Church className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-semibold text-xl text-white">GIC</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-secondary-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
            {filteredNavItems.map((item) => {
              const showSection = item.section && item.section !== lastSection;
              if (item.section) lastSection = item.section;

              return (
                <div key={item.href}>
                  {showSection && (
                    <p className="text-xs font-semibold text-secondary-600 uppercase tracking-wider px-4 pt-5 pb-2">
                      {item.section}
                    </p>
                  )}
                  <NavLink
                    to={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                          : 'text-secondary-400 hover:text-white hover:bg-secondary-800/50'
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </NavLink>
                </div>
              );
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-secondary-800/50">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                  {user?.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                  <div className="mt-0.5">
                    <RoleBadge role={user?.role || 'MEMBER'} />
                  </div>
                </div>
                <ChevronDown
                  className={clsx(
                    'w-4 h-4 text-secondary-400 transition-transform',
                    isProfileOpen && 'rotate-180'
                  )}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-dark-800 border border-secondary-700/50 rounded-xl shadow-lg overflow-hidden animate-slide-in">
                  <Link
                    to="/profile"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsSidebarOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-secondary-300 hover:text-white hover:bg-secondary-700/50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
