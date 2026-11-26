import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  Lock,
  Sparkles,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="flex justify-between items-center px-6 lg:px-12 py-5 border-b border-slate-100 backdrop-blur-md bg-white/90 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-brand-600 to-indigo-700 w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/20">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Resolve<span className="text-brand-600">X</span>
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <Link to="/login" className="px-4 py-2 font-semibold text-sm rounded-lg text-slate-700 hover:text-brand-600 hover:bg-slate-100/80 transition-all">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200/60 text-brand-700 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={13} className="text-brand-600 animate-pulse" />
            Next-Gen Customer Support SaaS
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12] mb-6 max-w-4xl"
          >
            Resolve Customer Tickets with{' '}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Enterprise Precision
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Empower support agents with automated workflows, immutable audit logging,
            event-driven notifications, and rich real-time ticket analytics.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="btn btn-primary px-7 py-3 text-base shadow-glow hover:shadow-glow-lg transition-all duration-300"
            >
              Start Free Today <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="px-7 py-3 text-base font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all duration-300"
            >
              Explore Live Demo
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left"
        >
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Event-Driven Core</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Asynchronous event bus decouples core CRUD operations from notifications and real-time audit logs.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-5 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-200">
              <Lock size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Strict Role-Based Security</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              HttpOnly secure cookies, object-level ticket authorization, and zero trust client-side privileges.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Executive Analytics</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Instant visibility into ticket SLA resolution rates, categories, and priority distributions.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
