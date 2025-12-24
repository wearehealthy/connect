import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, ParentProfile, Role } from '../types';
import { Loader2, HeartHandshake, X, Sparkles, Quote, CheckCircle, Ban, Users, Filter, Lock, Baby } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Directory: React.FC = () => {
  const { userRole, currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  
  // Filters
  const [filterType, setFilterType] = useState<Role | 'All'>('All');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [embryoFilter, setEmbryoFilter] = useState('All');

  // Determine what to show
  // Default: Logged in Surrogate sees Parents. Everyone else sees Surrogates.
  // Override: ?view=parents forces Parent view. ?view=surrogates forces Surrogate view.
  const viewParam = searchParams.get('view');
  const defaultIsSurrogateLooking = userRole && userRole !== 'Intended Parent';
  
  let showParents = false;
  if (viewParam === 'parents') showParents = true;
  else if (viewParam === 'surrogates') showParents = false;
  else showParents = defaultIsSurrogateLooking;

  const handleToggleView = (view: 'parents' | 'surrogates') => {
    setSearchParams({ view });
    setFilterType('All'); // Reset filters on switch
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const collectionName = showParents ? 'parents' : 'surrogates';
        
        const querySnapshot = await getDocs(collection(db, collectionName));
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showParents]);

  // --- RENDERING HELPERS ---

  const getFirstName = (name: string) => name ? name.split(' ')[0] : 'Member';
  const getAge = (dob: string) => {
    if (!dob) return '';
    const ageDifMs = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
  };

  // --- FILTERS LOGIC ---
  const filteredData = data.filter(item => {
    if (!showParents) {
      // Intended Parent View (Filtering Surrogates)
      return filterType === 'All' || item.type === filterType;
    } else {
      // Surrogate View (Filtering Parents)
      const matchBudget = budgetFilter === 'All' || item.budgetRange === budgetFilter;
      const matchEmbryo = embryoFilter === 'All' || item.embryoPref === embryoFilter;
      return matchBudget && matchEmbryo;
    }
  });


  // --- CARD COMPONENTS ---

  const ParentCard = ({ p }: { p: ParentProfile }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
       <div className="relative aspect-video bg-emerald-50 overflow-hidden">
          <img src={p.photoUrl || "https://placehold.co/600x400"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Family" />
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-emerald-800 text-xs font-bold">Intended Parents</div>
       </div>
       <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-serif font-bold text-slate-900 mb-1">{p.names}</h3>
          <p className="text-sm text-slate-500 mb-4">{p.location}</p>
          
          <div className="bg-emerald-50 p-4 rounded-xl mb-4">
             <Quote className="w-4 h-4 text-emerald-500 mb-2" />
             <p className="text-slate-700 text-sm italic line-clamp-3">"{p.qSunday}"</p>
          </div>

          <div className="flex gap-2 mb-4">
             <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded">{p.budgetRange}</span>
             <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded">{p.embryoPref}</span>
          </div>

          <button onClick={() => setSelectedProfile(p)} className="mt-auto w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
            View Family Profile
          </button>
       </div>
    </div>
  );

  const SurrogateCard = ({ p }: { p: UserProfile }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
        <img src={p.profilePhotoUrl || "https://placehold.co/400x600"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Profile" />
        <div className="absolute bottom-4 left-4 text-white drop-shadow-md">
           <h3 className="text-2xl font-serif font-bold">{getFirstName(p.realName)}, {getAge(p.dob)}</h3>
           <p className="text-sm opacity-90 font-medium tracking-wide">{p.type}</p>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <Quote className="w-4 h-4 text-rose-400 mb-2" />
          <p className="text-slate-600 text-sm leading-relaxed italic line-clamp-3">"{p.qWhy || p.qMessage || "Excited to help..."}"</p>
        </div>
        {p.type === 'Surrogate' && (
          <div className="flex flex-wrap gap-2 mb-4">
             {p.embryoTransferPref?.includes('Twins') && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold">Twins OK</span>}
             {p.reductionView === 'No Reduction' && <span className="text-xs bg-rose-50 text-rose-700 px-2 py-1 rounded font-bold">No Reduc</span>}
          </div>
        )}
        <button onClick={() => setSelectedProfile(p)} className="mt-auto w-full py-3 bg-white border-2 border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-colors">
             View Full Profile
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="w-10 h-10 animate-spin text-rose-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      
      {/* Top Toggle Bar */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-full shadow-sm border border-slate-200 inline-flex">
          <button 
            onClick={() => handleToggleView('surrogates')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${!showParents ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Users className="w-4 h-4" /> Find Surrogates
          </button>
          <button 
            onClick={() => handleToggleView('parents')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${showParents ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Baby className="w-4 h-4" /> Find Parents
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900">
            {showParents ? 'Intended Parents' : 'Surrogates & Donors'}
          </h1>
          <p className="text-slate-500 mt-2">
            {showParents 
              ? 'Families looking for someone like you.' 
              : 'Browse incredible surrogates and donors.'}
          </p>
        </div>
        
        {/* DYNAMIC FILTERS */}
        {!showParents ? (
           <div className="flex bg-white p-1 rounded-full border shadow-sm overflow-x-auto">
             {['All', 'Surrogate', 'Egg Donor', 'Sperm Donor'].map((t) => (
               <button 
                 key={t} onClick={() => setFilterType(t as Role | 'All')}
                 className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filterType === t ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
               >
                 {t === 'All' ? 'All' : t + 's'}
               </button>
             ))}
           </div>
        ) : (
           <div className="flex gap-2">
              <select onChange={(e) => setBudgetFilter(e.target.value)} className="bg-white border px-3 py-2 rounded-lg text-sm font-bold text-slate-700">
                 <option value="All">Any Budget</option>
                 <option value="$100k - $140k">$100k - $140k</option>
                 <option value="$140k - $180k">$140k - $180k</option>
                 <option value="$180k+">$180k+</option>
              </select>
              <select onChange={(e) => setEmbryoFilter(e.target.value)} className="bg-white border px-3 py-2 rounded-lg text-sm font-bold text-slate-700">
                 <option value="All">Any Embryo Pref</option>
                 <option value="Single Embryo">Single Embryo</option>
                 <option value="Twin Pregnancy OK">Twins OK</option>
              </select>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredData.map(item => (
           <React.Fragment key={item.id}>
             {showParents ? <ParentCard p={item} /> : <SurrogateCard p={item} />}
           </React.Fragment>
        ))}
        {filteredData.length === 0 && <div className="col-span-3 text-center text-slate-500 py-12">No profiles found matching your criteria.</div>}
      </div>

      {/* DETAIL MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
             <div className="p-4 flex justify-end absolute top-0 right-0 z-10">
                <button onClick={() => setSelectedProfile(null)} className="bg-white/50 hover:bg-white backdrop-blur p-2 rounded-full text-slate-900"><X /></button>
             </div>
             
             {selectedProfile.type === 'Intended Parent' ? (
                // PARENT MODAL CONTENT
                <>
                  <img src={selectedProfile.photoUrl} className="w-full h-64 object-cover" />
                  <div className="p-8 space-y-6">
                     <h2 className="text-3xl font-serif font-bold text-slate-900">{selectedProfile.names}</h2>
                     <p className="text-emerald-600 font-bold">{selectedProfile.location}</p>
                     
                     <div className="space-y-4">
                        <div className="bg-emerald-50 p-6 rounded-xl">
                           <h3 className="font-bold text-emerald-800 mb-2">Our Sunday Morning</h3>
                           <p className="text-slate-700 italic">"{selectedProfile.qSunday}"</p>
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900">Our Promise to You</h3>
                           <p className="text-slate-600">{selectedProfile.qPromise}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                           <div className="border p-3 rounded-lg"><span className="block text-slate-400 font-bold text-xs uppercase">Budget</span>{selectedProfile.budgetRange}</div>
                           <div className="border p-3 rounded-lg"><span className="block text-slate-400 font-bold text-xs uppercase">Embryos</span>{selectedProfile.embryoPref}</div>
                        </div>
                     </div>
                     {currentUser ? (
                         <button className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">Connect with {selectedProfile.names}</button>
                     ) : (
                         <button onClick={() => navigate('/signup')} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                             <Lock className="w-4 h-4" /> Sign Up to Connect
                         </button>
                     )}
                  </div>
                </>
             ) : (
                // SURROGATE MODAL CONTENT
                <>
                  <img src={selectedProfile.profilePhotoUrl} className="w-full h-80 object-cover" />
                  <div className="p-8 space-y-6">
                     <h2 className="text-3xl font-serif font-bold text-slate-900">{getFirstName(selectedProfile.realName)}</h2>
                     
                     <div className="bg-rose-50 p-6 rounded-xl">
                        <h3 className="font-bold text-rose-800 mb-2">The Dream</h3>
                        <p className="text-slate-700 italic">"{selectedProfile.qDream}"</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                       <div className="border p-3 rounded-lg"><span className="block text-slate-400 font-bold text-xs uppercase">BMI</span>{selectedProfile.bmi || 'N/A'}</div>
                       <div className="border p-3 rounded-lg"><span className="block text-slate-400 font-bold text-xs uppercase">Births</span>{selectedProfile.priorBirths}</div>
                     </div>
                     
                     {currentUser ? (
                        <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">Request Match</button>
                     ) : (
                        <button onClick={() => navigate('/signup')} className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4" /> Sign Up to Connect
                        </button>
                     )}
                  </div>
                </>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;