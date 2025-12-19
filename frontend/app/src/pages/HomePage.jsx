import React from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";

// Define animation variants for staggered entrances
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- Background Ambient Glow Effects --- */}
      <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow delay-700" />

      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-slate-950/50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex-1">
            <Link to="/" className="flex items-center gap-3 group">
              
              {/* IMAGE LOGO - Matches Navbar Style */}
              <div className="
                  p-2 rounded-xl bg-slate-900 
                  transition-all duration-500 relative
                  border border-white/10
                  
                  /* 1. Default State: Visible Soft White Glow */
                  shadow-[0_0_15px_rgba(255,255,255,0.1)]

                  /* 2. Hover State: Intense Pinkish-Blue Glow */
                  group-hover:border-white/30
                  group-hover:shadow-[0_0_25px_rgba(236,72,153,0.5),0_0_15px_rgba(59,130,246,0.3)]
              ">
                <img
                  src="/logo.png"
                  alt="Code Sync Logo"
                  className="h-10 w-10 object-contain relative z-10 transition-transform group-hover:rotate-12"
                  style={{ filter: "brightness(0) invert(1)" }} // Forces white logo
                />
              </div>

              {/* BRAND TEXT - White */}
              <span className="text-3xl font-extrabold tracking-tight text-white transition-opacity group-hover:opacity-90">
                Code Sync
              </span>
            </Link>
          </div>

          {/* Auth Buttons (Navbar) */}
          <div className="flex-none">
            <SignedIn>
              <SignOutButton>
                <button className="btn btn-ghost btn-sm bg-red-900 hover:bg-red-800 text-slate-300 hover:text-white transition-colors">
                  Sign Out
                </button>
              </SignOutButton>
            </SignedIn>
            
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn btn-primary btn-md shadow-lg shadow-blue-500/20">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* --- Main Content Container --- */}
      <motion.div
        className="container mx-auto px-6 pt-32 pb-16 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- Hero Section --- */}
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          
          {/* --- Left Column: Text Content --- */}
          <motion.div
            className="lg:w-1/2 space-y-8 text-center lg:text-left"
            variants={itemVariants}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-pink-500/30 text-blue-400 text-sm font-semibold uppercase tracking-wider mb-4 shadow-[0_0_12px_rgba(236,72,153,0.35)] ring-1 ring-pink-500/30"
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 20px rgba(236,72,153,0.6)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
              Real-time Collaboration
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight"
              variants={itemVariants}
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 animate-gradient-x pb-2">
                Synchronous problem solving platform,
              </span>
              <span className="block text-white">Shared Reasoning</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              variants={itemVariants}
            >
              The ultimate platform for collaborative coding interviews and pair
              programming. Connect face-to-face, code in real-time, and ace your
              technical interviews.
            </motion.p>

            {/* Feature Checkmarks */}
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm font-medium text-slate-300"
              variants={itemVariants}
            >
              {["Live Video Chat", "Code Editor", "Multi-Language"].map(
                (feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </div>
                )
              )}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mt-8"
              variants={itemVariants}
            >
              <SignedIn>
                {/* User is Logged In: Show button to go to Dashboard */}
                <Link to="/dashboard">
                  <button className="btn btn-primary btn-lg px-8 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 group">
                    Go to Dashboard
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </Link>
              </SignedIn>

              <SignedOut>
                {/* User is Logged Out: Show button to Open Login Modal */}
                <SignInButton mode="modal">
                  <button className="btn btn-primary btn-lg px-8 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 group">
                    Start Collaborating
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </SignInButton>
              </SignedOut>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-6 mt-12 border-t border-white/10 pt-8"
              variants={itemVariants}
            >
              {[
                { label: "Active Users", value: "10K+" },
                { label: "Sessions", value: "50K+" },
                { label: "Uptime", value: "99.9%" },
              ].map((stat, index) => (
                <div key={index} className="text-center sm:text-left">
                  <h3 className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* --- Right Column: Hero Image --- */}
          <motion.div className="lg:w-1/2 lg:-mt-20" variants={itemVariants}>
            <div className="relative group perspective-1000">
              {/* Decorative blur */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>

              <img
                src="/codeSyncHome4.jpg"
                alt="Code Sync Interface"
                className="relative rounded-2xl shadow-2xl shadow-black/50 w-full h-auto object-cover transform transition-transform duration-700 hover:scale-[1.02] hover:rotate-1"
              />

              {/* Floating UI Elements */}
              <div className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl hidden md:block animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-300">
                    System Online
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- Features Section --- */}
        <motion.div
          className="mt-40 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6"
            variants={itemVariants}
          >
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Succeed
            </span>
          </motion.h2>
          <motion.p
            className="text-slate-400 text-lg max-w-2xl mx-auto mb-16"
            variants={itemVariants}
          >
            Powerful features designed to make your coding interviews seamless
            and productive.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              className="card bg-base-100/5 backdrop-blur-sm border border-white/5 shadow-xl hover:shadow-blue-500/10 hover:bg-white/5 hover:-translate-y-2 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="card-body items-center text-center p-8">
                <div className="p-4 bg-blue-600/20 rounded-2xl mb-4 text-blue-400 group-hover:text-blue-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="card-title text-xl font-bold mb-2">
                  HD Video Call
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Crystal clear video and audio for seamless communication
                  during interviews.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="card bg-base-100/5 backdrop-blur-sm border border-white/5 shadow-xl hover:shadow-purple-500/10 hover:bg-white/5 hover:-translate-y-2 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="card-body items-center text-center p-8">
                <div className="p-4 bg-purple-600/20 rounded-2xl mb-4 text-purple-400 group-hover:text-purple-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <h3 className="card-title text-xl font-bold mb-2">
                  Live Code Editor
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Collaborate in real-time with syntax highlighting and multiple
                  language support.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="card bg-base-100/5 backdrop-blur-sm border border-white/5 shadow-xl hover:shadow-blue-500/10 hover:bg-white/5 hover:-translate-y-2 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="card-body items-center text-center p-8">
                <div className="p-4 bg-blue-600/20 rounded-2xl mb-4 text-blue-400 group-hover:text-blue-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="card-title text-xl font-bold mb-2">
                  Easy Collaboration
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Share your screen, discuss solutions, and learn from each
                  other in real-time.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePage;