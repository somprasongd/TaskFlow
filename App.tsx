import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import CalendarView from './pages/CalendarView';
import Categories from './pages/Categories';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--bg-color, #0f172a)',
        color: 'var(--text-color, #f8fafc)'
      }}>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <TaskProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute>
                    <CalendarView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/categories" 
                element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                } 
              />
               <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </TaskProvider>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;