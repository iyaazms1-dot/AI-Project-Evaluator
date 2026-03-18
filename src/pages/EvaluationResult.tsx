import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Download, CheckCircle, Lightbulb, MessageSquare, Loader2 } from 'lucide-react';
import { Project, Evaluation } from '../types';
import ReactMarkdown from 'react-markdown';
import { handleFirestoreError, OperationType } from '../firebase';

export default function EvaluationResult() {
  const { projectId } = useParams();
  const [project, setProject] = React.useState<Project | null>(null);
  const [evaluation, setEvaluation] = React.useState<Evaluation | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);
        }

        const q = query(collection(db, 'evaluations'), where('projectId', '==', projectId));
        const evalSnapshot = await getDocs(q);
        if (!evalSnapshot.empty) {
          setEvaluation({ id: evalSnapshot.docs[0].id, ...evalSnapshot.docs[0].data() } as Evaluation);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `projects/${projectId} or evaluations`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!project || !evaluation) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-zinc-400">
        <p>Evaluation not found.</p>
        <Link to="/dashboard" className="mt-4 text-emerald-500 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const chartData = [
    { subject: 'Innovation', A: evaluation.scores.innovation, fullMark: 100 },
    { subject: 'Technical Depth', A: evaluation.scores.technicalDepth, fullMark: 100 },
    { subject: 'Clarity', A: evaluation.scores.clarity, fullMark: 100 },
    { subject: 'Impact', A: evaluation.scores.impact, fullMark: 100 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all">
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Score Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 rounded-3xl border border-white/10 bg-white/5 p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 text-4xl font-bold text-emerald-500 ring-4 ring-emerald-500/20">
              {evaluation.scores.overall}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">Overall Score</h2>
            <p className="text-sm text-zinc-400">Based on AI Evaluation</p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#3f3f46" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-4">
            {chartData.map((item) => (
              <div key={item.subject} className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{item.subject}</span>
                <div className="flex items-center gap-4 flex-1 mx-4">
                  <div className="h-1.5 flex-1 rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.A}%` }} />
                  </div>
                  <span className="text-sm font-bold text-white w-8">{item.A}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Detailed Feedback */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-8"
          >
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-emerald-500" />
              AI Feedback
            </h3>
            <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed">
              <ReactMarkdown>{evaluation.feedback}</ReactMarkdown>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-8"
          >
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Improvement Suggestions
            </h3>
            <ul className="space-y-4">
              {evaluation.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3 text-zinc-300">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
