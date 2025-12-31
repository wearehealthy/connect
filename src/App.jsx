import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection, query, where, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Heart, User, LogOut, UploadCloud, Baby, Stethoscope, Search, Sparkles, Loader2, Lock, ArrowRight, Dna } from 'lucide-react';

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'Surrogate' or 'Parent'
  const [view, setView] = useState('LOADING'); // LOADING, AUTH, ONBOARDING, GALLERY
  const [profileData, setProfileData] = useState(null);

  // 1. Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check if they have a role/profile in DB
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRole(data.role);
          // If they have completed the specific profile (surrogates or parents table), go to gallery
          // For simplicity, we assume if they have a role, they need to check if they completed onboarding
          checkOnboarding(currentUser.uid, data.role);
        } else {
          // User exists in Auth but not Firestore (rare, but handle it)
          setView('ONBOARDING');
        }
      } else {
        setUser(null);
        setRole(null);
        setView('AUTH');
      }
    });
    return () => unsub();
  }, []);

  const checkOnboarding = async (uid, userRole) => {
    const collectionName = userRole === 'Surrogate' ? 'surrogates' : 'parents';
    const q = query(collection(db, collectionName), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      setProfileData(querySnapshot.docs[0].data());
      setView('GALLERY');
    } else {
      setView('ONBOARDING');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('AUTH');
    setProfileData(null);
    setRole(null);
  };

  // --- RENDER ROUTER ---
  if (view === 'LOADING') return <LoadingScreen />;
  if (view === 'AUTH') return <AuthScreen />;
  if (view === 'ONBOARDING') return <OnboardingForm user={user} role={role} setView={setView} setProfileData={setProfileData} />;
  if (view === 'GALLERY') return <Gallery user={user} role={role} profile={profileData} onLogout={handleLogout} />;
  
  return null;
}

// --- SUB-COMPONENTS ---

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
    <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
    <p className="font-serif text-slate-500 animate-pulse">Connecting...</p>
  </div>
);

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Parent'); // Default for signup
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        // Auth listener in App handle logic
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Save initial role
        await setDoc(doc(db, 'users', cred.user.uid), {
          email,
          role: selectedRole,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-white/50">
        <div className="text-center mb-8">
          <Heart className="w-10 h-10 text-rose-500 mx-auto mb-2 fill-rose-500" />
          <h1 className="text-3xl font-serif font-bold text-slate-900">Surrogacy Connect</h1>
          <p className="text-slate-500 mt-2">{isLogin ? 'Welcome back.' : 'Start your journey.'}</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                onClick={() => setSelectedRole('Parent')}
                className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${selectedRole === 'Parent' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-100 text-slate-400'}`}
              >
                I am a Parent
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('Surrogate')}
                className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${selectedRole === 'Surrogate' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-100 text-slate-400'}`}
              >
                I am a Surrogate
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all" required />
          </div>

          <button disabled={loading} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Log In' : 'Create Account')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-rose-600 font-bold hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

// --- ONBOARDING FORMS ---

const OnboardingForm = ({ user, role, setView, setProfileData }) => {
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);

  // Common State
  const [formData, setFormData] = useState({});

  const handleUpload = async (file) => {
    if (!file) return null;
    const storageRef = ref(storage, `${role.toLowerCase()}s/${user.uid}_${Date.now()}`);
    const snap = await uploadBytes(storageRef, file);
    return await getDownloadURL(snap.ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const photoUrl = await handleUpload(photo);
      const collectionName = role === 'Surrogate' ? 'surrogates' : 'parents';
      
      const payload = {
        ...formData,
        uid: user.uid,
        photoUrl: photoUrl || null,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, collectionName), payload);
      setProfileData(payload);
      setView('GALLERY'); // Done!
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Create Your Profile</h2>
        <p className="text-slate-500 mb-8">Tell us about yourself so we can find your match.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PRIVATE CONTACT INFO */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center"><Lock className="w-4 h-4 mr-2" /> Private Info (Not Public)</h3>
            <div className="grid grid-cols-2 gap-4">
              <input name="realName" placeholder="Full Name" onChange={handleChange} className="p-3 border rounded-xl" required />
              <input name="phone" placeholder="Phone Number" onChange={handleChange} className="p-3 border rounded-xl" required />
              <input name="location" placeholder="City, State" onChange={handleChange} className="p-3 border rounded-xl col-span-2" required />
            </div>
          </div>

          {/* DYNAMIC FIELDS BASED ON ROLE */}
          {role === 'Surrogate' ? (
            <>
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center"><Stethoscope className="w-5 h-5 mr-2 text-rose-500" /> Medical Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <input name="height" placeholder="Height (in)" type="number" onChange={handleChange} className="p-3 border rounded-xl" required />
                  <input name="bmi" placeholder="BMI (18-50)" type="number" min="18" max="50" onChange={handleChange} className="p-3 border rounded-xl" required />
                  <input name="births" placeholder="# Prior Births" type="number" onChange={handleChange} className="p-3 border rounded-xl" required />
                </div>
                <select name="vaccination" onChange={handleChange} className="w-full p-3 border rounded-xl bg-white" required>
                  <option value="">Vaccination Status</option>
                  <option value="Fully Vaccinated">Fully Vaccinated</option>
                  <option value="Not Vaccinated">Not Vaccinated</option>
                </select>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center"><Heart className="w-5 h-5 mr-2 text-rose-500" /> The "Why"</h3>
                <textarea name="bio" rows={4} placeholder="Why do you want to be a surrogate? What is your dream match?" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-emerald-500" /> The Vibe</h3>
                <input name="budget" placeholder="Budget Range (e.g. $120k - $150k)" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
                <textarea name="sundayVibe" rows={3} placeholder="Describe a perfect Sunday morning in your future family's life." onChange={handleChange} className="w-full p-3 border rounded-xl" required />
                <textarea name="promise" rows={3} placeholder="What is your promise to the woman who carries your child?" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
              </div>
            </>
          )}

          {/* PHOTO UPLOAD */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors">
            <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-slate-600">Upload Profile Photo</p>
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} className="mt-2 text-sm text-slate-500" required />
          </div>

          <button disabled={loading} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- THE GALLERY (VIEWING THE OTHER SIDE) ---

const Gallery = ({ user, role, profile, onLogout }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // THE FLIP LOGIC:
  // If I am a Surrogate, I fetch 'parents'.
  // If I am a Parent, I fetch 'surrogates'.
  const targetCollection = role === 'Surrogate' ? 'parents' : 'surrogates';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = collection(db, targetCollection);
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role, targetCollection]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-rose-50 p-2 rounded-full">
             <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          </div>
          <span className="font-serif text-xl font-bold text-slate-900">Surrogacy Connect</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-400 uppercase">Logged in as {role}</p>
            <p className="text-sm font-bold text-slate-900">{profile.realName}</p>
          </div>
          <button onClick={onLogout} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="bg-white py-12 px-6 text-center border-b border-slate-100">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
          {role === 'Surrogate' ? 'Meet Intended Parents' : 'Find Your Surrogate'}
        </h1>
        <p className="text-slate-500">
          {role === 'Surrogate' 
            ? 'Families waiting for a miracle like you.' 
            : 'Incredible women ready to help you build your family.'}
        </p>
      </header>

      {/* GRID */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-rose-500" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map(item => (
              <Card key={item.id} data={item} type={targetCollection} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const Card = ({ data, type }) => {
  // Determine what to show based on who we are looking at
  const isSurrogate = type === 'surrogates'; // We are viewing a surrogate

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 group">
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        {data.photoUrl ? (
          <img src={data.photoUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300"><User className="w-12 h-12" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-serif font-bold">{data.realName?.split(' ')[0]}</h3>
          <p className="text-sm opacity-90 font-medium">{data.location}</p>
        </div>
      </div>

      <div className="p-6">
        {isSurrogate ? (
          // VIEWING SURROGATE CARD
          <div className="space-y-4">
             <div className="flex justify-between text-sm font-bold text-slate-500 border-b border-slate-100 pb-4">
               <span>BMI: {data.bmi}</span>
               <span>Height: {data.height}"</span>
               <span>Births: {data.births}</span>
             </div>
             <p className="text-slate-600 italic line-clamp-3">"{data.bio}"</p>
             <div className="pt-2">
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${data.vaccination === 'Fully Vaccinated' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                 {data.vaccination}
               </span>
             </div>
          </div>
        ) : (
          // VIEWING PARENT CARD
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" /> Budget: {data.budget}
             </div>
             <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Sunday Morning Vibe:</h4>
                <p className="text-slate-600 text-sm italic line-clamp-2">"{data.sundayVibe}"</p>
             </div>
             <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Our Promise:</h4>
                <p className="text-slate-600 text-sm italic line-clamp-2">"{data.promise}"</p>
             </div>
          </div>
        )}

        <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-2">
          View Profile <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};