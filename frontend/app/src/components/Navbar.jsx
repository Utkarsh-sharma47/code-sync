import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, LayoutDashboard, Menu, X, Sparkles } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to check active state
  const isActive = (path) => location.pathname === path;

  // Premium Nav Item Styles (Blue Glow for Active)
  const getNavItemClasses = (path) => `
    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 border
    ${isActive(path) 
      ? 'bg-blue-500/10 border-blue-500/50 text-white shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]' 
      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10'
    }
  `;

  // Mobile Nav Item Styles
  const getMobileNavItemClasses = (path) => `
    flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 border
    ${isActive(path) 
      ? 'bg-blue-500/10 border-blue-500/30 text-white shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]' 
      : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
    }
  `;

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="container mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* --- 1. Logo Section --- */}
        <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
                
                {/* Logo Icon Container */}
                <div className="
                    p-2 rounded-xl bg-[#0A0A0A] 
                    transition-all duration-500 relative
                    
                    /* 1. Base State: Subtle Permanent Glow + Standard Border */
                    border border-white/20
                    shadow-[0_0_10px_-5px_rgba(255,290,325,0.35),0_0_5px_-4px_rgba(200,210,255,0.2)]


                    /* 2. Hover State: Pink/Blue Border + Intense Glow */
                    group-hover:border-pink-300/50
                    group-hover:shadow-[0_0_25px_0px_rgba(59,130,246,0.5),0_0_15px_0px_rgba(236,72,153,0.5)]
                ">
                    {/* Using Image with fallback */}
                    <div className="relative flex items-center justify-center">
                        <img
                            src="/logo.png"
                            alt="Code Sync"
                            className="h-8 w-8 object-contain relative z-10"
                            style={{ filter: "brightness(0) invert(1)" }} // Forces white logo
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                        />
                        {/* Fallback Icon if image fails */}
                        <Code2 size={32} className="text-white hidden" />
                    </div>
                </div>
                
                {/* Text: Pure White */}
                <span className="text-xl md:text-2xl font-bold tracking-tight text-white transition-opacity group-hover:opacity-90 hidden sm:block">
                    Code Sync
                </span>
            </Link>
        </div>

        {/* --- 2. Desktop Navigation & Auth --- */}
        <div className="flex items-center gap-4 md:gap-6">
            
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-2">
                <Link to="/problems" className={getNavItemClasses('/problems')}>
                    <Code2 size={16} className={isActive('/problems') ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'} />
                    Problems
                </Link>

                <Link to="/dashboard" className={getNavItemClasses('/dashboard')}>
                    <LayoutDashboard size={16} className={isActive('/dashboard') ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'} />
                    Dashboard
                </Link>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-white/10 hidden md:block"></div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
                <SignedIn>
                    <div className="p-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-pink-500/20 hover:from-blue-500/50 hover:to-pink-500/50 transition-all duration-300">
                        <UserButton 
                            appearance={{
                                elements: {
                                    avatarBox: "w-9 h-9 border-2 border-[#050505]"
                                }
                            }}
                        />
                    </div>
                </SignedIn>

                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="
                            flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white
                            bg-gradient-to-r from-blue-600 to-pink-600 
                            hover:shadow-[0_0_20px_-5px_rgba(236,72,153,0.4)] hover:scale-105
                            border border-white/10 transition-all duration-300
                        ">
                            <Sparkles size={16} /> Sign In
                        </button>
                    </SignInButton>
                </SignedOut>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
            className="md:hidden border-b border-white/5 bg-[#050505]/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <Link 
                to="/problems" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={getMobileNavItemClasses('/problems')}
              >
                <div className={`p-2 rounded-lg ${isActive('/problems') ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-slate-400'}`}>
                    <Code2 size={20} />
                </div>
                Problems
              </Link>

              <Link 
                to="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={getMobileNavItemClasses('/dashboard')}
              >
                <div className={`p-2 rounded-lg ${isActive('/dashboard') ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-slate-400'}`}>
                    <LayoutDashboard size={20} />
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