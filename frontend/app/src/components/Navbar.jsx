import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to check active state
  const isActive = (path) => location.pathname === path;

  // Common styles for navigation items (Desktop)
  const getNavItemClasses = (path) => `
    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 border
    ${isActive(path) 
      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10'
    }
  `;

  // Common styles for navigation items (Mobile)
  const getMobileNavItemClasses = (path) => `
    flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-300 border
    ${isActive(path) 
      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
      : 'border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
    }
  `;

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300 supports-[backdrop-filter]:bg-slate-950/50">
      <div className="container mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* --- 1. Logo Section --- */}
        <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
                <div className="p-[2px] rounded-xl group-hover:shadow-[0_0_0_2px_rgba(59,130,246,0.9),0_0_14px_rgba(59,130,246,0.8),0_0_8px_rgba(236,72,153,0.45)] shadow-[0_0_0_1.5px_rgba(59,130,246,0.7),0_0_10px_rgba(59,130,246,0.6),0_0_6px_rgba(236,72,153,0.35)] transition-all duration-300 bg-slate-950">
                    <img
                        src="/logo.png"
                        alt="Code Sync Logo"
                        className="h-9 w-9 md:h-10 md:w-10 object-contain rounded-lg transition-transform group-hover:rotate-12"
                        style={{
                            filter: "invert(25%) sepia(70%) saturate(2000%) hue-rotate(230deg) brightness(102%) contrast(110%)",
                        }}
                    />
                </div>
                
                <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 transition-opacity hover:opacity-80 hidden sm:block">
                    Code Sync
                </span>
            </Link>
        </div>

        {/* --- 2. Desktop Navigation & Auth --- */}
        <div className="flex items-center gap-4 md:gap-6">
            
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-3">
                <Link to="/problems" className={getNavItemClasses('/problems')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Problems
                </Link>

                <Link to="/dashboard" className={getNavItemClasses('/dashboard')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                </Link>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-white/10 hidden md:block"></div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
                <SignedIn>
                    <div className="ring-2 ring-transparent hover:ring-purple-500/50 rounded-full transition-all duration-300 p-0.5">
                        <UserButton 
                            appearance={{
                                elements: {
                                    avatarBox: "w-9 h-9 border-2 border-white/10"
                                }
                            }}
                        />
                    </div>
                </SignedIn>

                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="btn btn-primary btn-sm shadow-lg shadow-blue-500/20 border-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                            Sign In
                        </button>
                    </SignInButton>
                </SignedOut>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* --- Mobile Menu Dropdown --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 space-y-2">
              <Link 
                to="/problems" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={getMobileNavItemClasses('/problems')}
              >
                <div className="p-2 rounded-lg bg-white/5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </div>
                Problems
              </Link>

              <Link 
                to="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={getMobileNavItemClasses('/dashboard')}
              >
                <div className="p-2 rounded-lg bg-white/5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </div>
                Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;