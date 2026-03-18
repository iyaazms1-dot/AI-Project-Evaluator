import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogOut, LayoutDashboard, FileText, User, Menu, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <FileText className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ProjectEval</span>
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Dashboard</Link>
                <Link to="/projects" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">My Projects</Link>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <User className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-zinc-300">{user.displayName || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Login</Link>
                <Link
                  to="/login"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-zinc-400 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-black px-4 py-4 space-y-4">
          {user ? (
            <>
              <Link to="/dashboard" className="block text-sm font-medium text-zinc-400">Dashboard</Link>
              <Link to="/projects" className="block text-sm font-medium text-zinc-400">My Projects</Link>
              <button onClick={handleLogout} className="block text-sm font-medium text-red-400">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm font-medium text-zinc-400">Login</Link>
              <Link to="/login" className="block text-sm font-medium text-white">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
