// components/Layout.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import {
  LayoutDashboard, Utensils, Dumbbell, Droplets,
  User, LogOut, Sun, Moon, Menu, X, Zap, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/food',        icon: Utensils,        label: 'Nutrition'   },
  { href: '/activity',    icon: Dumbbell,        label: 'Activity'    },
  { href: '/water',       icon: Droplets,        label: 'Hydration'   },
  { href: '/profile',     icon: User,            label: 'Profile'     },
];

export default function Layout({ children }) {
  const router   = useRouter();
  const { user, logout } = useAuthStore();
  const [dark, setDark]       = useState(true);
  const [mobile, setMobile]   = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('fitai-theme') || 'dark';
    setDark(saved === 'dark');
    document.documentElement.classList.toggle('light', saved === 'light');
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    const theme = next ? 'dark' : 'light';
    localStorage.setItem('fitai-theme', theme);
    document.documentElement.classList.toggle('light', !next);
  };

  const handleLogout = () => { logout(); router.push('/auth/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-6 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
          <Zap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-lg font-bold gradient-text">FitAI</span>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Track. Improve. Win.</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = router.pathname === href;
          return (
            <Link key={href} href={href} onClick={() => setMobile(false)}>
              <div className={`nav-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-3' : ''}`}>
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
                {!collapsed && active && <ChevronRight size={14} className="ml-auto" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1">
        <button onClick={toggleTheme}
          className={`nav-link w-full text-left ${collapsed ? 'justify-center px-3' : ''}`}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {!collapsed && user && (
          <div className="card mt-2 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'rgba(20,184,166,0.2)', color: 'var(--brand)' }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
          </div>
        )}

        <button onClick={handleLogout}
          className={`nav-link w-full text-left ${collapsed ? 'justify-center px-3' : ''}`}
          style={{ color: 'var(--danger)' }}>
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', flexShrink: 0 }}>
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 left-0 z-10 hidden lg:flex"
          style={{ left: collapsed ? 52 : 240 }}>
        </button>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute hidden lg:flex items-center justify-center w-6 h-6 rounded-full border text-xs transition-all duration-300"
          style={{
            left: collapsed ? 52 : 252,
            top: '50%',
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
            transform: 'translateY(-50%)',
            zIndex: 10,
          }}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobile && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobile(false)}
          style={{ background: 'rgba(0,0,0,0.6)' }} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 lg:hidden transition-transform duration-300 ${mobile ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        <div className="absolute top-4 right-4">
          <button onClick={() => setMobile(false)} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <button onClick={() => setMobile(true)} style={{ color: 'var(--text-secondary)' }}>
            <Menu size={22} />
          </button>
          <span className="text-lg font-bold gradient-text">FitAI</span>
          <button onClick={toggleTheme} style={{ color: 'var(--text-secondary)' }}>
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
