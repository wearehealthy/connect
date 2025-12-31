import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, UserPlus, Users, LogIn, LogOut, Sparkles, Home, User, BookOpen, Search } from 'lucide-react';
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
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-rose-100 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="bg-rose-50 p-2 rounded-full group-hover:bg-rose-100 transition-colors">
                <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
              </div>
              <span className="font-serif text-2xl font-bold text-slate-900 tracking-tight">Surrogacy<span className="text-rose-500">Connect</span></span>
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Home Button */}
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                isActive('/') ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {/* View Profiles Button (Like a Book) */}
            <Link
              to="/directory"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm border border-transparent ${
                isActive('/directory') 
                  ? 'bg-rose-50 text-rose-700 border-rose-100' 
                  : 'text-slate-600 bg-white hover:border-slate-200 hover:shadow-md'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Browse Candidates</span>
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
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-300"
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