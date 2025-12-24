import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Heart, ArrowRight, User } from 'lucide-react';
import { UserRole } from '../types';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole | ''>('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Please select a role.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Generate a synthetic email based on first name for Firebase Auth
      const cleanName = firstName.trim().toLowerCase().replace(/\s+/g, '');
      const syntheticEmail = `${cleanName}@surrogacy.local`;

      const userCredential = await createUserWithEmailAndPassword(auth, syntheticEmail, password);
      const user = userCredential.user;

      // Create generic user record to store Role and First Name
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName,
        role: role,
        createdAt: new Date().toISOString()
      });

      // Redirect to Directory
      navigate('/directory');
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This name is already taken. Please try adding an initial (e.g. Sarah J).");
      } else if (err.code === 'auth/configuration-not-found') {
        setError("Configuration Error: Please enable Email/Password Authentication in the Firebase Console.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Login Error: Email/Password provider is disabled in Firebase Console.");
      } else {
        setError(err.message || "Failed to create account.");
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
           <h2 className="text-3xl font-serif font-bold text-slate-900">Join the Community</h2>
           <p className="text-slate-500">Start your journey today.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">I am a...</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white transition-colors"
              required
            >
              <option value="" disabled>Select your role</option>
              <option value="Intended Parent">Intended Parent</option>
              <option value="Surrogate">Surrogate</option>
              <option value="Egg Donor">Egg Donor</option>
              <option value="Sperm Donor">Sperm Donor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">First Name (Username)</label>
            <input 
              type="text" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-3 border rounded-xl"
              placeholder="e.g. Sarah"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-xl"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight className="ml-2 w-4 h-4" /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500 text-sm">
          Already have an account? <Link to="/login" className="text-rose-600 font-bold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;