import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Satellite, 
  Cpu, 
  FileText, 
  Settings, 
  LogOut, 
  Leaf, 
  User,
  Menu,
  X
} from 'lucide-react';
import { auth, signInWithPopup, googleProvider, signOut } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { SatelliteAnalysis } from './components/SatelliteAnalysis';
import { EdgeDiagnostics } from './components/EdgeDiagnostics';
import { MLOpsDashboard } from './components/MLOpsDashboard';
import { FieldReports } from './components/FieldReports';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

type Tab = 'dashboard' | 'satellite' | 'edge' | 'reports';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        toast.success(`Welcome back, ${user.displayName || 'User'}`);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.info("Logged out successfully");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0c0a] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <div className="p-4 bg-emerald-900/30 rounded-2xl border border-emerald-500/30">
              <Leaf className="w-16 h-16 text-emerald-500" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-emerald-50">Agri-Mind Orchestrator</h1>
            <p className="mt-3 text-emerald-500/70">Industrial Intelligence for Modern Agriculture</p>
          </div>
          <Button 
            onClick={handleLogin}
            className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-900/20"
          >
            Sign in with Google
          </Button>
          <p className="text-xs text-emerald-900/50">
            Secure enterprise access. Authorized personnel only.
          </p>
        </div>
        <Toaster position="top-right" theme="dark" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c0a] text-emerald-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'w-64' : 'w-20'} 
        bg-[#0d110d] border-r border-emerald-900/30 transition-all duration-300 flex flex-col z-50
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-emerald-900/30">
          <Leaf className="w-8 h-8 text-emerald-500 shrink-0" />
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight truncate">Agri-Mind</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="MLOps Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<Satellite size={20} />} 
            label="Satellite Analysis" 
            active={activeTab === 'satellite'} 
            onClick={() => setActiveTab('satellite')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<Cpu size={20} />} 
            label="Edge Diagnostics" 
            active={activeTab === 'edge'} 
            onClick={() => setActiveTab('edge')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            label="Field Reports" 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')}
            collapsed={!isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-emerald-900/30 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-900/10">
            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center overflow-hidden shrink-0">
              {user.photoURL ? <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" /> : <User size={16} />}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.displayName}</p>
                <p className="text-xs text-emerald-500/50 truncate">{user.email}</p>
              </div>
            )}
          </div>
          <SidebarItem 
            icon={<LogOut size={20} />} 
            label="Log Out" 
            active={false} 
            onClick={handleLogout}
            collapsed={!isSidebarOpen}
            className="text-red-400 hover:bg-red-900/10 hover:text-red-300"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-emerald-900/30 bg-[#0d110d]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-emerald-500 hover:bg-emerald-900/20"
          >
            {isSidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/20 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <MLOpsDashboard />}
          {activeTab === 'satellite' && <SatelliteAnalysis />}
          {activeTab === 'edge' && <EdgeDiagnostics />}
          {activeTab === 'reports' && <FieldReports />}
        </div>
      </main>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, collapsed, className = "" }: { 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  collapsed: boolean,
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
        ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' : 'text-emerald-500/70 hover:bg-emerald-900/20 hover:text-emerald-400'}
        ${className}
      `}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="font-medium text-sm">{label}</span>}
    </button>
  );
}
