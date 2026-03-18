import React from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from 'motion/react';
import { Plus, FileText, Github, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Project } from '../types';
import { evaluateProject } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../firebase';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [newProject, setNewProject] = React.useState({
    title: '',
    description: '',
    githubLink: '',
    content: ''
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'projects'),
      where('studentId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'projects');
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUploading(true);
    setError(null);
    try {
      const projectData: Omit<Project, 'id'> = {
        studentId: user.uid,
        studentName: user.displayName || 'Student',
        title: newProject.title,
        description: newProject.description,
        githubLink: newProject.githubLink,
        content: newProject.content,
        contentType: 'text',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      let docRef;
      try {
        docRef = await addDoc(collection(db, 'projects'), projectData);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'projects');
        return;
      }
      
      // Trigger AI Evaluation
      let evaluation;
      try {
        evaluation = await evaluateProject({ id: docRef.id, ...projectData } as Project);
      } catch (err) {
        console.error("AI Evaluation failed:", err);
        setError("AI Evaluation failed. Please try again.");
        return;
      }
      
      // Save Evaluation
      try {
        await addDoc(collection(db, 'evaluations'), {
          projectId: docRef.id,
          studentId: user.uid,
          ...evaluation,
          evaluatedBy: 'AI',
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'evaluations');
        return;
      }

      // Update Project Status
      try {
        await setDoc(doc(db, 'projects', docRef.id), { status: 'evaluated' }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `projects/${docRef.id}`);
        return;
      }
      
      setNewProject({ title: '', description: '', githubLink: '', content: '' });
      navigate(`/evaluation/${docRef.id}`);
    } catch (err: any) {
      console.error("Error uploading project:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Submission Form */}
        <div className="w-full md:w-1/3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-8"
          >
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Plus className="h-6 w-6 text-emerald-500" />
              New Submission
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Project Title</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. Sentiment Analysis of Tweets"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Description</label>
                <textarea
                  required
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[100px]"
                  placeholder="Briefly explain your project goals..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">GitHub Link (Optional)</label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                  <input
                    type="url"
                    value={newProject.githubLink}
                    onChange={(e) => setNewProject({ ...newProject, githubLink: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Project Content / Code Snippets</label>
                <textarea
                  required
                  value={newProject.content}
                  onChange={(e) => setNewProject({ ...newProject, content: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[200px] font-mono text-sm"
                  placeholder="Paste your project summary, key findings, or code here..."
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="break-words">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-black hover:bg-emerald-400 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    Submit for Evaluation
                    <Plus className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Project History */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Project History</h2>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Clock className="h-4 w-4" />
              Last updated: Just now
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-3xl border border-dashed border-white/10 bg-white/5 text-zinc-500">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>No projects submitted yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => project.status === 'evaluated' && navigate(`/evaluation/${project.id}`)}
                  className={cn(
                    "group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 transition-all",
                    project.status === 'evaluated' ? "cursor-pointer hover:bg-white/10" : "opacity-70"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center",
                      project.status === 'evaluated' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500"
                    )}>
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{project.title}</h3>
                      <p className="text-sm text-zinc-400">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {project.status === 'evaluated' ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Evaluated
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-3 py-1 text-xs font-medium text-zinc-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Processing
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
