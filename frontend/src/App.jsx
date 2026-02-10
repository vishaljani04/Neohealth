import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import InputData from './pages/InputData';
import { authService } from './services/api';

import SplashScreen from './components/SplashScreen';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await authService.me();
          setUser(res.data);
        }
      } catch (e) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleDataUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Optional: keep a small loader if auth is somehow slower than splash (unlikely given 2.5s splash)
  if (loading) return null;

  return (
    <Router>
      <div className="app-container">
        {user && <Navbar user={user} setUser={setUser} onDataUpdate={handleDataUpdate} />}
        <main className="content">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
            {/* If user is not logged in, redirect to Login. This happens automatically after Splash via Navigate */}
            <Route path="/" element={user ? <Dashboard key={refreshTrigger} onDataUpdate={handleDataUpdate} /> : <Navigate to="/login" />} />
            <Route path="/input" element={user ? <InputData /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
