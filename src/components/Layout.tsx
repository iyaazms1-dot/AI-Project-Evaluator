import React from 'react';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar />
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[10%] h-[1000px] w-[1000px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[10%] h-[1000px] w-[1000px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>
    </div>
  );
}
