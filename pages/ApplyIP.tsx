import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, HeartHandshake, Users, Lock, Image as ImageIcon } from 'lucide-react';
import { ParentProfile } from '../types';

const ApplyIP: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [nurseryFile, setNurseryFile] = useState<File | null>(null);

  const getInitialEmail = () => {
    if (!currentUser?.email) return '';
    if (currentUser.email.endsWith('@surrogacy.local')) return '';
    return currentUser.email;
  };

  const [formData, setFormData] = useState<Partial<ParentProfile>>({
    names: '', email: getInitialEmail(), phone: '', location: '',
    qSunday: '', qPromise: '', qFuture: '',
    budgetRange: '$100k - $140k', embryoPref: 'Single Embryo', commStyle: 'Weekly Updates'
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
             setFormData(prev => ({ ...prev, names: userData.firstName }));
          }
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    try {
      let photoUrl = '';
      let nurseryPhotoUrl = '';
      
      if (photoFile) {
        const storageRef = ref(storage, `parents/${currentUser.uid}_profile`);
        const snapshot = await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(snapshot.ref);
      }
      
      if (nurseryFile) {
        const storageRef = ref(storage, `parents/${currentUser.uid}_nursery`);
        const snapshot = await uploadBytes(storageRef, nurseryFile);
        nurseryPhotoUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "parents"), {
        ...formData,
        uid: currentUser.uid,
        type: 'Intended Parent',
        photoUrl,
        nurseryPhotoUrl,
        createdAt: new Date().toISOString()
      });

      navigate('/directory');
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-full mb-4">
            <Users className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-slate-900">Intended Parent Profile</h1>
        <p className="text-slate-500 mt-2 text-lg">Create your profile so surrogates can find you.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Private Info */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><Lock className="w-4 h-4 mr-2" /> Confidential Contact Info</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="names" value={formData.names} placeholder="First Names (e.g., Sarah & Mike)" className="p-3 border rounded-xl" onChange={handleChange} required />
              <input name="location" placeholder="City, State" className="p-3 border rounded-xl" onChange={handleChange} required />
              {/* Email is now editable */}
              <input name="email" type="email" placeholder="Contact Email" value={formData.email} className="p-3 border rounded-xl" onChange={handleChange} required />
              <input name="phone" type="tel" placeholder="Phone" className="p-3 border rounded-xl" onChange={handleChange} required />
           </div>
        </div>

        {/* The Pitch */}
        <div className="bg-white rounded-2xl p-8 border border-emerald-100 shadow-sm space-y-6">
           <h3 className="text-2xl font-serif font-bold text-slate-800">Your Story</h3>
           <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Describe a typical Sunday morning in your future child's life.</label>
              <textarea name="qSunday" rows={3} className="w-full p-4 border rounded-xl bg-emerald-50/30 focus:bg-white transition-all" onChange={handleChange} required />
           </div>
           <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">What is your promise to the woman who carries your child?</label>
              <textarea name="qPromise" rows={3} className="w-full p-4 border rounded-xl bg-emerald-50/30 focus:bg-white transition-all" onChange={handleChange} required />
           </div>
           <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Years from now, how do you hope to describe your relationship with your surrogate?</label>
              <textarea name="qFuture" rows={3} className="w-full p-4 border rounded-xl bg-emerald-50/30 focus:bg-white transition-all" onChange={handleChange} required />
           </div>
        </div>

        {/* Hard Gates */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-slate-800 mb-6">Matching Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Budget Range</label>
                  <select name="budgetRange" className="w-full p-3 border rounded-xl" onChange={handleChange}>
                      <option value="$100k - $140k">$100k - $140k</option>
                      <option value="$140k - $180k">$140k - $180k</option>
                      <option value="$180k+">$180k+</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Embryos</label>
                  <select name="embryoPref" className="w-full p-3 border rounded-xl" onChange={handleChange}>
                      <option value="Single Embryo">Single Embryo</option>
                      <option value="Twin Pregnancy OK">Twin Pregnancy OK</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Communication</label>
                  <select name="commStyle" className="w-full p-3 border rounded-xl" onChange={handleChange}>
                      <option value="Daily Texts">Daily Texts</option>
                      <option value="Weekly Updates">Weekly Updates</option>
                      <option value="Milestones Only">Milestones Only</option>
                  </select>
               </div>
            </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center"><ImageIcon className="mr-2" /> Profile Photos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center">
                 <p className="text-sm font-bold mb-2">Couple / Individual Photo</p>
                 <input type="file" accept="image/*" onChange={(e) => e.target.files && setPhotoFile(e.target.files[0])} className="w-full text-sm text-slate-500" />
              </div>
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center">
                 <p className="text-sm font-bold mb-2">Home / Nursery Photo</p>
                 <input type="file" accept="image/*" onChange={(e) => e.target.files && setNurseryFile(e.target.files[0])} className="w-full text-sm text-slate-500" />
              </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 rounded-2xl shadow-xl text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <HeartHandshake className="mr-2" />}
          Publish Parent Profile
        </button>
      </form>
    </div>
  );
};

export default ApplyIP;