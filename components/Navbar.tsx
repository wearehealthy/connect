import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, UserPlus, Users, LogIn, LogOut, Sparkles, Home, User, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { currentUser, userRole, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  // Helper to determine profile link based on role
  const getProfileLink = () => {
    if (userRole === 'Intended Parent') return '/apply-ip';
    if (userRole) return `/apply?type=${userRole}`;
    return '/apply'; // Default fallback
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-rose-50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Heart className="h-7 w-7 text-rose-500 fill-current" />
              <span className="font-serif text-2xl font-bold text-slate-900 tracking-tight">Surrogacy Connect</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Home Button */}
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                isActive('/') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {/* View Profiles Button (Like a Book) */}
            <Link
              to="/directory?view=parents"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                location.search.includes('view=parents') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">View Profiles</span>
            </Link>

            {currentUser ? (
              <>
                {/* My Profile Button */}
                <Link
                  to={getProfileLink()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    isActive('/apply') || isActive('/apply-ip') ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-rose-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">My Profile</span>
                </Link>

                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md shadow-rose-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;