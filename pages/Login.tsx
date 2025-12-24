import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Heart } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanName = firstName.trim().toLowerCase().replace(/\s+/g, '');
      const syntheticEmail = `${cleanName}@surrogacy.local`;
      
      await signInWithEmailAndPassword(auth, syntheticEmail, password);
      navigate('/directory');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/configuration-not-found') {
        setError("Configuration Error: Please enable Email/Password Authentication in the Firebase Console.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Login Error: Email/Password provider is disabled in Firebase Console.");
      } else {
        setError("Invalid name or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
           <Heart className="w-10 h-10 text-rose-500 mx-auto mb-2" />
           <h2 className="text-3xl font-serif font-bold text-slate-900">Welcome Back</h2>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
            <input 
              type="text" 
              placeholder="Your Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-3 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-xl"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500 text-sm">
          New here? <Link to="/signup" className="text-rose-600 font-bold hover:underline">Create an Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;