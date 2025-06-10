import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, History, Settings, Hexagon } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export const LayoutHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <header className="mb-6">{children}</header>;
};

export const LayoutContent: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={twMerge('', className)}>{children}</div>;
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active }) => {
  return (
    <Link
      to={to}
      className={twMerge(
        'flex items-center px-4 py-3 text-sm font-medium rounded-md',
        active
          ? 'bg-emerald-800 text-white'
          : 'text-gray-300 hover:bg-emerald-700 hover:text-white'
      )}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-emerald-900">
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-emerald-950">
          <div className="flex items-center space-x-2">
            <Hexagon className="h-8 w-8 text-emerald-500" />
            <span className="text-white font-bold text-lg">CatanMaster Pro</span>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavItem
            to="/"
            icon={<LayoutGrid size={20} />}
            label="Dashboard"
            active={pathname === '/'}
          />
          <NavItem
            to="/games"
            icon={<History size={20} />}
            label="Games"
            active={pathname.startsWith('/games')}
          />
          <NavItem
            to="/players"
            icon={<Users size={20} />}
            label="Players"
            active={pathname.startsWith('/players')}
          />
          <NavItem
            to="/settings"
            icon={<Settings size={20} />}
            label="Settings"
            active={pathname === '/settings'}
          />
        </nav>
      </div>
    </div>
  );
};