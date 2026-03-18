import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Rocket, Shield, Zap, CheckCircle, ArrowRight, Brain, Code, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
              AI-Powered Excellence
            </span>
            <h1 className="mt-8 text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
              Evaluate Projects <br />
              <span className="text-emerald-500">with Precision.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-zinc-400 sm:text-xl">
              The ultimate platform for Data Science students to get instant, AI-driven feedback on their academic projects. Innovation, technical depth, and real-world impact—all in one place.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/login"
                className="group relative flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-black hover:bg-zinc-200 transition-all"
              >
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/demo"
                className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white hover:bg-white/10 transition-all"
              >
                Try Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-emerald-500" />}
              title="AI Analysis"
              description="Our advanced LLM analyzes your project content, code quality, and problem-solving approach."
            />
            <FeatureCard
              icon={<Code className="h-8 w-8 text-blue-500" />}
              title="Technical Depth"
              description="Get detailed feedback on the complexity and robustness of your data science techniques."
            />
            <FeatureCard
              icon={<Globe className="h-8 w-8 text-purple-500" />}
              title="Real-world Impact"
              description="Understand how your project translates to practical applications and industry standards."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-emerald-500/5 border border-emerald-500/10 p-12 text-center">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <StatItem value="10k+" label="Projects Evaluated" />
              <StatItem value="98%" label="Student Satisfaction" />
              <StatItem value="Instant" label="Feedback Delivery" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition-all">
      <div className="mb-6 inline-flex rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 group-hover:ring-white/20">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="mt-4 text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-white">{value}</div>
      <div className="mt-2 text-sm font-medium text-zinc-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}
