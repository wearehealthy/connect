import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Directory from './pages/Directory';
import Apply from './pages/Apply';
import ApplyIP from './pages/ApplyIP';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/apply-ip" element={<ApplyIP />} />
            </Routes>
          </main>
          
          <footer className="bg-white border-t border-slate-200 mt-auto py-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="font-serif text-xl font-bold text-slate-900 mb-2">Surrogacy Connect</p>
              <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} All rights reserved.</p>
            </div>
          </footer>
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;