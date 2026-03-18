import React from 'react';
import { motion } from 'motion/react';
import { evaluateProject } from '../services/geminiService';
import { Project } from '../types';
import { EvaluationResult as EvalResultType } from '../services/geminiService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Loader2, Play, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DemoPage() {
  const [isEvaluating, setIsEvaluating] = React.useState(false);
  const [result, setResult] = React.useState<EvalResultType | null>(null);
  const [demoData, setDemoData] = React.useState({
    title: 'Predictive Maintenance for Industrial Equipment',
    description: 'Using LSTM networks to predict failures in manufacturing sensors.',
    content: 'This project implements an LSTM-based predictive maintenance system. We collected data from 50 sensors over 6 months. The model achieved 92% accuracy in predicting failures 24 hours in advance...'
  });

  const handleDemoEval = async () => {
    setIsEvaluating(true);
    try {
      const mockProject: Project = {
        id: 'demo',
        studentId: 'demo',
        studentName: 'Demo User',
        title: demoData.title,
        description: demoData.description,
        content: demoData.content,
        contentType: 'text',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      const evaluation = await evaluateProject(mockProject);
      setResult(evaluation);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const chartData = result ? [
    { subject: 'Innovation', A: result.scores.innovation },
    { subject: 'Technical Depth', A: result.scores.technicalDepth },
    { subject: 'Clarity', A: result.scores.clarity },
    { subject: 'Impact', A: result.scores.impact },
  ] : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white">Interactive Demo</h1>
        <p className="mt-4 text-zinc-400">Experience the AI evaluation without an account.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Demo Input</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={demoData.title}
                onChange={(e) => setDemoData({ ...demoData, title: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Project Title"
              />
              <textarea
                value={demoData.description}
                onChange={(e) => setDemoData({ ...demoData, description: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[100px]"
                placeholder="Description"
              />
              <textarea
                value={demoData.content}
                onChange={(e) => setDemoData({ ...demoData, content: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[200px]"
                placeholder="Project Content"
              />
              <button
                onClick={handleDemoEval}
                disabled={isEvaluating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-black hover:bg-emerald-400 transition-all disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Demo Evaluation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">Evaluation Result</h2>
                <button onClick={() => setResult(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <RefreshCcw className="h-4 w-4" />
                </button>
              </div>

              <div className="h-[250px] w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#3f3f46" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                    <Radar name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="prose prose-invert prose-sm max-w-none text-zinc-400">
                <ReactMarkdown>{result.feedback}</ReactMarkdown>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-3xl border border-dashed border-white/10 bg-white/5 text-zinc-500">
              <p>Results will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
