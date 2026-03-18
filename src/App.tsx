import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import EvaluationResult from './pages/EvaluationResult';
import DemoPage from './pages/DemoPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/evaluation/:projectId"
            element={
              <PrivateRoute>
                <EvaluationResult />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
