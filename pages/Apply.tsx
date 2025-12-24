import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Send, Lock, UploadCloud, Heart, Activity, Brain, Dna, Mic, Sparkles } from 'lucide-react';
import { UserProfile, Role } from '../types';

const Apply: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  const initialType = (searchParams.get('type') as Role) || 'Surrogate';
  const [role, setRole] = useState<Role>(initialType);

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    profile: null,
    family: null,
    childhood: null,
    adult: null,
    voice: null
  });

  const getInitialEmail = () => {
    if (!currentUser?.email) return '';
    // If it's our synthetic email, start empty so they enter a real one
    if (currentUser.email.endsWith('@surrogacy.local')) return '';
    return currentUser.email;
  };

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    realName: '', phone: '', email: getInitialEmail(), address: '', dob: '',
    // Vibe
    qDream: '', qWhy: '', qSupport: '', qTrait: '', qMessage: '',
    // Medical/Hard Gates
    height: '', weight: '', priorBirths: 1, cSectionCount: 0, isSmoker: 'No',
    terminationView: 'Medical Termination Only', embryoTransferPref: 'Single Embryo Only (SET)', reductionView: 'No Reduction',
    vaccinationStatus: 'Fully Vaccinated',
    // Donor Stats
    eyeColor: '', hairColor: '', skinTone: '', gpa: '', highestDegree: '', talents: '',
    build: 'Athletic', familyHistory: 'None', occupation: ''
  });

  // Fetch First Name from Users collection to pre-fill
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.firstName) {
             setFormData(prev => ({ ...prev, realName: userData.firstName }));
          }
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    if (role === 'Surrogate' && formData.height && formData.weight) {
      const h = Number(formData.height);
      const w = Number(formData.weight);
      if (h > 0 && w > 0) {
        const calculatedBMI = parseFloat(((w / (h * h)) * 703).toFixed(1));
        setFormData(prev => ({ ...prev, bmi: calculatedBMI }));
      }
    }
  }, [formData.height, formData.weight, role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    try {
      const finalData: any = { ...formData, uid: currentUser.uid, type: role, createdAt: new Date().toISOString() };
      
      const processUpload = async (fileKey: string, urlKey: string, folder: string) => {
        if (files[fileKey]) {
          const url = await uploadFile(files[fileKey]!, folder);
          finalData[urlKey] = url;
        }
      };

      if (role === 'Surrogate') {
        if (files.profile) await processUpload('profile', 'profilePhotoUrl', 'surrogates');
        if (files.family) await processUpload('family', 'familyPhotoUrl', 'surrogates');
      } else if (role === 'Egg Donor') {
        if (files.childhood) await processUpload('childhood', 'childhoodPhotoUrl', 'egg_donors');
        if (files.adult) await processUpload('adult', 'adultPhotoUrl', 'egg_donors');
      } else if (role === 'Sperm Donor') {
        if (files.childhood) await processUpload('childhood', 'childhoodPhotoUrl', 'sperm_donors');
        if (files.adult) await processUpload('adult', 'adultPhotoUrl', 'sperm_donors');
        if (files.voice) await processUpload('voice', 'voiceRecordingUrl', 'sperm_donors_audio');
      }

      await addDoc(collection(db, "surrogates"), finalData);
      navigate('/directory');
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- SECTION COMPONENTS ---

  const renderPrivateSection = () => (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 px-4 py-1 rounded-bl-xl text-xs font-bold flex items-center">
        <Lock className="w-3 h-3 mr-1" /> PRIVATE (Confidential)
      </div>
      <h3 className="text-xl font-serif font-bold text-slate-800 mb-6">The Basics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <input name="realName" value={formData.realName} placeholder="Full Legal Name" className="p-3 border rounded-xl" required onChange={handleChange} />
        <input name="phone" placeholder="Phone Number" className="p-3 border rounded-xl" required onChange={handleChange} />
        {/* Email is now editable */}
        <input name="email" type="email" placeholder="Contact Email Address" value={formData.email} className="p-3 border rounded-xl" required onChange={handleChange} />
        <input name="dob" type="date" placeholder="Date of Birth" className="p-3 border rounded-xl" required onChange={handleChange} />
        <textarea name="address" placeholder="Full Home Address" className="p-3 border rounded-xl sm:col-span-2" required onChange={handleChange} />
      </div>
    </div>
  );

  const renderVibeSection = () => (
    <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
      <h3 className="text-xl font-serif font-bold text-rose-600 mb-2 flex items-center"><Sparkles className="mr-2 w-5 h-5" /> The Vibe</h3>
      <p className="text-slate-500 mb-6 text-sm">This is your dating profile for intended parents. Be authentic.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">In a perfect world, what does this pregnancy look like to you?</label>
          <textarea name="qDream" rows={3} placeholder="Do you want them at appointments? Do you want to text daily?" className="w-full p-4 border rounded-xl bg-rose-50/30 focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none transition-all" onChange={handleChange} required />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Surrogacy is a huge sacrifice. What is the specific moment or feeling that made you decide to do this?</label>
          <textarea name="qWhy" rows={3} placeholder="Was it watching a friend struggle? A love for being pregnant?" className="w-full p-4 border rounded-xl bg-rose-50/30 focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none transition-all" onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Who is your biggest cheerleader?</label>
          <textarea name="qSupport" rows={2} placeholder="Tell us about the person who will be helping you." className="w-full p-4 border rounded-xl bg-rose-50/30 focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none transition-all" onChange={handleChange} required />
        </div>

        {role !== 'Surrogate' && (
          <>
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">If the child inherits one personality trait from you, what do you hope it is?</label>
               <input name="qTrait" className="w-full p-4 border rounded-xl" onChange={handleChange} />
            </div>
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Write a 3 sentence note to the future parents.</label>
               <textarea name="qMessage" rows={3} className="w-full p-4 border rounded-xl" onChange={handleChange} />
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderSurrogateMedical = () => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <h3 className="text-xl font-serif font-bold text-slate-800 flex items-center"><Activity className="mr-2 w-5 h-5 text-emerald-500" /> Medical & Matching Gates</h3>
      
      {/* Physical Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="col-span-1">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Height (in)</label>
          <input name="height" type="number" placeholder="67" className="w-full p-3 border rounded-xl" onChange={handleChange} required />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weight (lbs)</label>
          <input name="weight" type="number" placeholder="150" className="w-full p-3 border rounded-xl" onChange={handleChange} required />
        </div>
        <div className="col-span-1">
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">BMI</label>
           <input value={formData.bmi || ''} readOnly className="w-full p-3 border rounded-xl bg-slate-100 font-bold" />
        </div>
        <div className="col-span-1">
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Births</label>
           <input name="priorBirths" type="number" className="w-full p-3 border rounded-xl" onChange={handleChange} required />
        </div>
      </div>

      {/* The Hard Gates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Termination Views</label>
          <select name="terminationView" className="w-full p-3 border rounded-xl bg-slate-50" onChange={handleChange}>
             <option value="Medical Termination Only">Medical Termination Only</option>
             <option value="Pro-Life (No Termination)">Pro-Life (No Termination)</option>
             <option value="Any Termination OK">Any Termination OK</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Embryo Transfer</label>
          <select name="embryoTransferPref" className="w-full p-3 border rounded-xl bg-slate-50" onChange={handleChange}>
             <option value="Single Embryo Only (SET)">Single Embryo Only (SET)</option>
             <option value="Willing to Transfer 2 (Twins)">Willing to Transfer 2 (Twins)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Selective Reduction</label>
          <select name="reductionView" className="w-full p-3 border rounded-xl bg-slate-50" onChange={handleChange}>
             <option value="No Reduction">No Reduction</option>
             <option value="Willing to Reduce Multiples">Willing to Reduce Multiples</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Vaccination Status</label>
          <input name="vaccinationStatus" placeholder="e.g. Fully Vaccinated" className="w-full p-3 border rounded-xl bg-slate-50" onChange={handleChange} />
        </div>
      </div>
    </div>
  );

  const renderDonorStats = () => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-serif font-bold text-slate-800 mb-6 flex items-center"><Dna className="mr-2 w-5 h-5 text-blue-500" /> Genetic Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           <input name="height" placeholder="Height" className="p-3 border rounded-xl" onChange={handleChange} required />
           <input name="eyeColor" placeholder="Eye Color" className="p-3 border rounded-xl" onChange={handleChange} required />
           <input name="hairColor" placeholder="Hair Color" className="p-3 border rounded-xl" onChange={handleChange} required />
           <input name="gpa" placeholder="GPA" className="p-3 border rounded-xl" onChange={handleChange} />
           <input name="highestDegree" placeholder="Degree" className="p-3 border rounded-xl" onChange={handleChange} />
           <input name="occupation" placeholder="Occupation" className="p-3 border rounded-xl" onChange={handleChange} />
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-serif font-bold text-slate-900">Create Your Profile</h1>
        <p className="text-slate-500 mt-2">Let's find your perfect match.</p>
      </div>

      <div className="mb-8 bg-white p-2 rounded-full shadow-sm border border-slate-200 inline-flex mx-auto justify-center w-full sm:w-auto">
          {(['Surrogate', 'Egg Donor', 'Sperm Donor'] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                role === r 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {renderPrivateSection()}
        {renderVibeSection()}
        
        {role === 'Surrogate' ? renderSurrogateMedical() : renderDonorStats()}

        {/* Photos */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-slate-800 mb-6 flex items-center"><UploadCloud className="mr-2 w-5 h-5" /> Photos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center hover:bg-slate-50 transition-colors">
                    <p className="font-bold text-slate-600 mb-1">Main Profile Photo</p>
                    <p className="text-xs text-slate-400 mb-4">Bright, smiling headshot</p>
                    <input type="file" accept="image/*" onChange={handleFileChange('profile')} className="w-full text-sm text-slate-500" />
                </div>
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center hover:bg-slate-50 transition-colors">
                    <p className="font-bold text-slate-600 mb-1">{role === 'Surrogate' ? 'Family/Lifestyle' : 'Childhood Photo'}</p>
                    <p className="text-xs text-slate-400 mb-4">{role === 'Surrogate' ? 'Show us your life' : 'Age 2-10'}</p>
                    <input type="file" accept="image/*" onChange={handleFileChange(role === 'Surrogate' ? 'family' : 'childhood')} className="w-full text-sm text-slate-500" />
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 rounded-2xl shadow-xl text-lg font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:scale-[1.01] transition-all flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
          Publish Profile
        </button>
      </form>
    </div>
  );
};

export default Apply;