import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, Role } from '../types';
import { Loader2, X, Filter, Lock, Ruler, Weight, Baby, Palette, Stethoscope, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// --- STYLES ---
const CustomStyles = () => (
  <style>{`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 20px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #94a3b8;
    }
  `}</style>
);

// --- CONSTANTS ---
const HAIR_COLORS = ['Blonde', 'Brown', 'Black', 'Red', 'Auburn', 'Grey'];
const EYE_COLORS = ['Blue', 'Brown', 'Green', 'Hazel', 'Grey'];

// --- HELPER FUNCTIONS ---
const getFirstName = (name: string) => name ? name.split(' ')[0] : 'Member';
  
const getAge = (dob: string) => {
  if (!dob) return 0;
  const ageDifMs = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
};

const getHeightString = (inches?: string) => {
  if (!inches) return "N/A";
  const h = parseInt(inches);
  const feet = Math.floor(h / 12);
  const rem = h % 12;
  return `${feet}'${rem}"`;
};

// --- SUB COMPONENTS ---

interface FilterSectionProps {
  title: string;
  icon?: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 py-5 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left group">
        <h4 className="flex items-center text-xs font-bold text-slate-900 uppercase tracking-wider group-hover:text-rose-600 transition-colors">
          {Icon && <Icon className="w-4 h-4 mr-2 text-rose-500" />} {title}
        </h4>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && <div className="mt-4 animate-in slide-in-from-top-2 duration-200">{children}</div>}
    </div>
  );
};

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (c: boolean) => void;
  subtitle?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, subtitle }) => (
  <label className="flex items-start space-x-3 cursor-pointer group mb-3">
    <div className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${checked ? 'bg-rose-500 border-rose-500' : 'bg-white border-slate-300 group-hover:border-rose-400'}`}>
      {checked && <Check className="w-3.5 h-3.5 text-white" />}
    </div>
    <div>
      <span className={`text-sm block leading-tight ${checked ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{label}</span>
      {subtitle && <span className="text-[10px] text-slate-400 font-bold uppercase">{subtitle}</span>}
    </div>
    <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
  </label>
);

interface SurrogateCardProps {
  p: UserProfile;
  onSelect: (p: UserProfile) => void;
}

const SurrogateCard: React.FC<SurrogateCardProps> = ({ p, onSelect }) => (
  <div 
    onClick={() => onSelect(p)}
    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden cursor-pointer flex flex-col h-full"
  >
    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
      <img 
        src={p.profilePhotoUrl || `https://ui-avatars.com/api/?name=${p.realName}&background=random`} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        alt="Profile" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
      
      <div className="absolute top-3 left-3 flex flex-col gap-2">
         <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${
           p.type === 'Surrogate' ? 'bg-white/90 text-rose-600' : 
           p.type === 'Egg Donor' ? 'bg-white/90 text-purple-600' : 'bg-white/90 text-blue-600'
         }`}>
           {p.type}
         </span>
      </div>

      <div className="absolute bottom-4 left-4 text-white drop-shadow-md">
         <h3 className="text-2xl font-serif font-bold">{getFirstName(p.realName)}, {getAge(p.dob)}</h3>
         <p className="text-sm font-medium opacity-90 flex items-center gap-2">
           {p.type === 'Surrogate' && <><Baby className="w-3 h-3" /> {p.priorBirths || 0} Births</>}
           {p.type !== 'Surrogate' && <><Palette className="w-3 h-3" /> {p.eyeColor} Eyes</>}
         </p>
      </div>
    </div>
    
    <div className="p-5 flex-1 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500 mb-2">
         <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{getHeightString(p.height)}</span>
         {p.bmi && <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">BMI {p.bmi}</span>}
         {p.highestDegree && <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{p.highestDegree}</span>}
      </div>
      
      <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 italic">
        "{p.qWhy || p.qMessage || "Excited to help a family..."}"
      </p>

      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wide group-hover:text-rose-500 transition-colors">
         <span>View Full Profile</span>
         <span className="text-lg">→</span>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const Directory: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  
  // --- FILTERS STATE ---
  const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 50]);
  const [bmiMax, setBmiMax] = useState<number>(40); // Default to 40 (Max)
  const [hairColors, setHairColors] = useState<string[]>([]);
  const [eyeColors, setEyeColors] = useState<string[]>([]);

  // Expanded Medical Filters
  const [termViews, setTermViews] = useState<string[]>([]);
  const [transferPrefs, setTransferPrefs] = useState<string[]>([]);
  const [reductionViews, setReductionViews] = useState<string[]>([]);
  const [vaccineReq, setVaccineReq] = useState(false);
  const [expReq, setExpReq] = useState(false);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'surrogates'));
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserProfile[];
        setData(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Role
      if (roleFilter !== 'All' && item.type !== roleFilter) return false;

      // 2. Age
      const age = getAge(item.dob);
      if (age < ageRange[0] || age > ageRange[1]) return false;

      // 3. BMI
      if (item.bmi && item.bmi > bmiMax) return false;

      // 4. Traits
      // Helper to check loose matching for colors
      const checkColor = (itemColor: string | undefined, filters: string[]) => {
        if (!itemColor) return false;
        return filters.some(f => itemColor.toLowerCase().includes(f.toLowerCase()));
      };

      if (hairColors.length > 0 && !checkColor(item.hairColor, hairColors)) return false;
      if (eyeColors.length > 0 && !checkColor(item.eyeColor, eyeColors)) return false;

      // 5. Medical
      // Termination
      if (termViews.length > 0) {
        if (!item.terminationView || !termViews.includes(item.terminationView)) return false;
      }
      // Transfer
      if (transferPrefs.length > 0) {
        if (!item.embryoTransferPref || !transferPrefs.includes(item.embryoTransferPref)) return false;
      }
      // Reduction
      if (reductionViews.length > 0) {
        if (!item.reductionView || !reductionViews.includes(item.reductionView)) return false;
      }

      // 6. Hard Gates
      if (vaccineReq && (!item.vaccinationStatus || !item.vaccinationStatus.toLowerCase().includes('vaccinated'))) return false;
      if (expReq && (item.priorBirths === undefined || item.priorBirths < 1)) return false;

      return true;
    });
  }, [data, roleFilter, ageRange, bmiMax, hairColors, eyeColors, termViews, transferPrefs, reductionViews, vaccineReq, expReq]);

  // --- RENDER ---
  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[80vh]">
      <Loader2 className="w-12 h-12 animate-spin text-rose-500 mb-4" />
      <p className="text-slate-400 font-serif">Loading Directory...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col">
      <CustomStyles />
      <div className="max-w-[1800px] mx-auto w-full flex-1">
        <div className="flex items-start h-full">
          
          {/* --- SIDEBAR FILTERS (Desktop) --- */}
          {/* Adjusted to be sticky and fill available height cleanly */}
          <aside className="hidden lg:flex flex-col w-80 sticky top-20 h-[calc(100vh-5rem)] bg-white border-r border-slate-200 z-40">
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              
              {!currentUser && (
                <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 mb-8 shadow-sm">
                  <h3 className="font-serif font-bold text-rose-900 mb-2 flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Join the Community</h3>
                  <p className="text-xs text-rose-700 mb-4 leading-relaxed">Create a free account to view full profiles, see photos, and contact candidates directly.</p>
                  <Link to="/signup" className="block w-full py-2.5 bg-rose-600 text-white text-center rounded-lg text-sm font-bold hover:bg-rose-700 shadow-md transition-all">Sign Up Free</Link>
                </div>
              )}

              <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-slate-900">Filters</h2>
                <span className="text-xs font-bold text-slate-400 uppercase">{filteredData.length} Results</span>
              </div>

              <div className="space-y-1">
                <FilterSection title="Role Type" icon={Baby}>
                  <div className="space-y-2">
                    {['All', 'Surrogate', 'Egg Donor', 'Sperm Donor'].map(r => (
                      <label key={r} className="flex items-center cursor-pointer group">
                        <input 
                          type="radio" 
                          name="role" 
                          className="peer hidden" 
                          checked={roleFilter === r} 
                          onChange={() => setRoleFilter(r as Role | 'All')} 
                        />
                        <div className="w-4 h-4 rounded-full border border-slate-300 peer-checked:border-rose-500 peer-checked:bg-rose-500 mr-3 flex items-center justify-center transition-colors">
                           <div className="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
                        </div>
                        <span className={`text-sm group-hover:text-slate-900 ${roleFilter === r ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{r}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Age Range (18-50)" icon={Filter}>
                   <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                          <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-slate-400">Min</label>
                          <input 
                              type="number" 
                              value={ageRange[0]} 
                              onChange={(e) => setAgeRange([Math.max(18, Math.min(50, parseInt(e.target.value) || 18)), ageRange[1]])}
                              min={18} max={50}
                              className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-rose-500 transition-colors bg-slate-50 focus:bg-white"
                          />
                      </div>
                      <span className="text-slate-300">-</span>
                      <div className="relative flex-1">
                          <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-slate-400">Max</label>
                          <input 
                              type="number" 
                              value={ageRange[1]} 
                              onChange={(e) => setAgeRange([ageRange[0], Math.max(18, Math.min(50, parseInt(e.target.value) || 50))])}
                              min={18} max={50}
                              className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-rose-500 transition-colors bg-slate-50 focus:bg-white"
                          />
                      </div>
                   </div>
                </FilterSection>

                <FilterSection title="Max BMI Cutoff" icon={Weight}>
                  <div className="px-2 pt-2">
                     <div className="flex items-center gap-2 mb-3">
                        <input 
                          type="number" 
                          min="15" 
                          max="40" 
                          value={bmiMax} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) setBmiMax(val);
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:border-rose-500 outline-none transition-colors"
                        />
                     </div>
                     <input 
                       type="range" min="15" max="40" 
                       value={Math.max(15, Math.min(40, bmiMax))}
                       onChange={e => setBmiMax(parseInt(e.target.value))}
                       className="w-full accent-rose-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                        <span>15</span>
                        <span>40</span>
                     </div>
                  </div>
                </FilterSection>

                <FilterSection title="Medical & Ethics" icon={Stethoscope}>
                   <div className="space-y-5">
                      {/* Termination */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Termination</p>
                        {['Medical Termination Only', 'Pro-Life (No Termination)', 'Any Termination OK'].map(opt => (
                           <Checkbox 
                              key={opt} label={opt} 
                              checked={termViews.includes(opt)} 
                              onChange={c => c ? setTermViews([...termViews, opt]) : setTermViews(termViews.filter(x => x !== opt))} 
                           />
                        ))}
                      </div>
                      
                      {/* Embryos */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Embryo Transfer</p>
                        {['Single Embryo Only (SET)', 'Willing to Transfer 2 (Twins)'].map(opt => (
                           <Checkbox 
                              key={opt} label={opt} 
                              checked={transferPrefs.includes(opt)} 
                              onChange={c => c ? setTransferPrefs([...transferPrefs, opt]) : setTransferPrefs(transferPrefs.filter(x => x !== opt))} 
                           />
                        ))}
                      </div>

                      {/* Reduction */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Reduction</p>
                        {['No Reduction', 'Willing to Reduce Multiples'].map(opt => (
                           <Checkbox 
                              key={opt} label={opt} 
                              checked={reductionViews.includes(opt)} 
                              onChange={c => c ? setReductionViews([...reductionViews, opt]) : setReductionViews(reductionViews.filter(x => x !== opt))} 
                           />
                        ))}
                      </div>

                      {/* General Boolean */}
                      <div className="pt-2 border-t border-slate-100">
                        <Checkbox label="Fully Vaccinated" checked={vaccineReq} onChange={setVaccineReq} />
                        <Checkbox label="Prior Birth Experience" checked={expReq} onChange={setExpReq} subtitle="Proven Surrogates" />
                      </div>
                   </div>
                </FilterSection>

                <FilterSection title="Traits" icon={Palette} defaultOpen={false}>
                   <div className="space-y-4">
                     <div>
                       <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Hair Color</span>
                       <div className="flex flex-wrap gap-2">
                         {HAIR_COLORS.map(c => (
                           <button 
                             key={c} 
                             onClick={() => setHairColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                             className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${hairColors.includes(c) ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                           >
                             {c}
                           </button>
                         ))}
                       </div>
                     </div>
                     <div>
                       <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Eye Color</span>
                       <div className="flex flex-wrap gap-2">
                         {EYE_COLORS.map(c => (
                           <button 
                             key={c} 
                             onClick={() => setEyeColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                             className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${eyeColors.includes(c) ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                           >
                             {c}
                           </button>
                         ))}
                       </div>
                     </div>
                   </div>
                </FilterSection>
              </div>
            </div>
            
            {/* Sticky bottom reset - inside the flex container */}
            <div className="p-4 bg-white border-t border-slate-100">
                <button 
                  onClick={() => {
                     setRoleFilter('All');
                     setAgeRange([18, 50]);
                     setTermViews([]);
                     setTransferPrefs([]);
                     setReductionViews([]);
                     setVaccineReq(false);
                     setExpReq(false);
                     setBmiMax(40);
                     setHairColors([]);
                     setEyeColors([]);
                  }} 
                  className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                >
                  Reset All Filters
                </button>
            </div>
          </aside>

          {/* --- MAIN CONTENT GRID --- */}
          <main className="flex-1 p-4 lg:p-8">
             
             {/* Header */}
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
               <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Find Your Match</h1>
                  <p className="text-slate-500 mt-2">Browsing {filteredData.length} available profiles</p>
               </div>
               
               {/* Mobile Filter Toggle */}
               <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm font-bold text-slate-700">
                  <Filter className="w-4 h-4" /> Filters
               </button>
             </div>

             {/* Mobile Filter Drawer */}
             {showMobileFilters && (
               <div className="lg:hidden bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8 animate-in slide-in-from-top-4 fixed inset-0 z-[60] overflow-y-auto m-4 mt-20">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl font-serif text-slate-900">Filters</h3>
                    <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5" /></button>
                  </div>
                  
                  {/* Full Mobile Controls */}
                  <div className="space-y-6 pb-6">
                     {/* Role */}
                     <div>
                       <label className="block text-sm font-bold mb-2 text-slate-900">Role</label>
                       <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="w-full p-3 border rounded-lg bg-slate-50 text-slate-700 focus:bg-white focus:border-rose-500 outline-none transition-colors">
                          <option value="All">All Roles</option>
                          <option value="Surrogate">Surrogates</option>
                          <option value="Egg Donor">Egg Donors</option>
                          <option value="Sperm Donor">Sperm Donors</option>
                       </select>
                     </div>

                     {/* Age */}
                     <div>
                       <label className="block text-sm font-bold mb-2 text-slate-900">Age Range</label>
                       <div className="flex gap-3">
                         <div className="flex-1">
                            <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Min</span>
                            <input type="number" value={ageRange[0]} onChange={e => setAgeRange([parseInt(e.target.value), ageRange[1]])} className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white focus:border-rose-500 outline-none transition-colors" />
                         </div>
                         <div className="flex-1">
                            <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Max</span>
                            <input type="number" value={ageRange[1]} onChange={e => setAgeRange([ageRange[0], parseInt(e.target.value)])} className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white focus:border-rose-500 outline-none transition-colors" />
                         </div>
                       </div>
                     </div>

                     {/* BMI */}
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-bold text-slate-900 flex items-center"><Weight className="w-4 h-4 mr-2" /> Max BMI</label>
                          <input 
                            type="number"
                            min="15" max="40"
                            value={bmiMax}
                            onChange={(e) => setBmiMax(Math.min(40, Math.max(15, parseInt(e.target.value) || 15)))}
                            className="w-16 p-1 text-center border rounded-md text-sm font-bold bg-white"
                          />
                       </div>
                       <input 
                          type="range" min="15" max="40" 
                          value={bmiMax} 
                          onChange={(e) => setBmiMax(parseInt(e.target.value))}
                          className="w-full accent-rose-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                       />
                       <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                          <span>15</span>
                          <span>40</span>
                       </div>
                     </div>

                     {/* Medical & Ethics */}
                     <div className="space-y-6 pt-2">
                        <h4 className="font-bold text-slate-900 flex items-center border-b border-slate-100 pb-2"><Stethoscope className="w-4 h-4 mr-2 text-rose-500" /> Medical & Ethics</h4>
                        
                        {/* Termination */}
                        <div className="space-y-3">
                           <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded inline-block">Termination</span>
                           {['Medical Termination Only', 'Pro-Life (No Termination)', 'Any Termination OK'].map(opt => (
                              <Checkbox 
                                  key={opt} label={opt} 
                                  checked={termViews.includes(opt)} 
                                  onChange={c => c ? setTermViews([...termViews, opt]) : setTermViews(termViews.filter(x => x !== opt))} 
                               />
                           ))}
                        </div>
                        {/* Preferences */}
                         <div className="space-y-3">
                           <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded inline-block">Preferences</span>
                            {['Single Embryo Only (SET)', 'Willing to Transfer 2 (Twins)'].map(opt => (
                               <Checkbox key={opt} label={opt} checked={transferPrefs.includes(opt)} onChange={c => c ? setTransferPrefs([...transferPrefs, opt]) : setTransferPrefs(transferPrefs.filter(x => x !== opt))} />
                            ))}
                            {['No Reduction', 'Willing to Reduce Multiples'].map(opt => (
                               <Checkbox key={opt} label={opt} checked={reductionViews.includes(opt)} onChange={c => c ? setReductionViews([...reductionViews, opt]) : setReductionViews(reductionViews.filter(x => x !== opt))} />
                            ))}
                        </div>
                        {/* Gates */}
                        <div className="pt-2 border-t border-slate-100">
                             <Checkbox label="Fully Vaccinated" checked={vaccineReq} onChange={setVaccineReq} />
                             <Checkbox label="Prior Birth Experience" checked={expReq} onChange={setExpReq} subtitle="Proven Surrogates" />
                        </div>
                     </div>

                     {/* Traits */}
                     <div className="space-y-4 pt-2">
                        <h4 className="font-bold text-slate-900 flex items-center border-b border-slate-100 pb-2"><Palette className="w-4 h-4 mr-2 text-purple-500" /> Traits</h4>
                        <div>
                           <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Hair Color</span>
                           <div className="flex flex-wrap gap-2">
                             {HAIR_COLORS.map(c => (
                               <button 
                                 key={c} 
                                 onClick={() => setHairColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                                 className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${hairColors.includes(c) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600'}`}
                               >
                                 {c}
                               </button>
                             ))}
                           </div>
                        </div>
                        <div>
                           <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Eye Color</span>
                           <div className="flex flex-wrap gap-2">
                             {EYE_COLORS.map(c => (
                               <button 
                                 key={c} 
                                 onClick={() => setEyeColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                                 className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${eyeColors.includes(c) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600'}`}
                               >
                                 {c}
                               </button>
                             ))}
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Reset Button */}
                   <button 
                      onClick={() => {
                         setRoleFilter('All');
                         setAgeRange([18, 50]);
                         setTermViews([]);
                         setTransferPrefs([]);
                         setReductionViews([]);
                         setVaccineReq(false);
                         setExpReq(false);
                         setBmiMax(40);
                         setHairColors([]);
                         setEyeColors([]);
                         setShowMobileFilters(false);
                      }} 
                      className="w-full mt-4 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wide bg-slate-50 hover:bg-white hover:border-rose-200 hover:text-rose-600 transition-all sticky bottom-0"
                    >
                      Reset All Filters
                   </button>
               </div>
             )}

             {/* Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredData.map(item => (
                  <SurrogateCard key={item.id} p={item} onSelect={setSelectedProfile} />
                ))}
             </div>

             {filteredData.length === 0 && (
               <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 mt-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Filter className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No matches found</h3>
                  <p className="text-slate-500">Try adjusting your filters to see more results.</p>
               </div>
             )}
          </main>
        </div>
      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden my-auto animate-in zoom-in-50 duration-200 flex flex-col md:flex-row max-h-[90vh]">
             
             {/* Left: Image */}
             <div className="w-full md:w-2/5 relative h-64 md:h-auto bg-slate-100">
                <img 
                  src={selectedProfile.profilePhotoUrl || `https://ui-avatars.com/api/?name=${selectedProfile.realName}`} 
                  className="w-full h-full object-cover" 
                />
                <button onClick={() => setSelectedProfile(null)} className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 backdrop-blur p-2 rounded-full text-white md:hidden"><X /></button>
             </div>

             {/* Right: Content */}
             <div className="flex-1 p-8 md:p-10 overflow-y-auto relative custom-scrollbar">
                <button onClick={() => setSelectedProfile(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hidden md:block"><X className="w-5 h-5" /></button>
                
                <div className="mb-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${selectedProfile.type === 'Surrogate' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                    {selectedProfile.type}
                  </span>
                  <h2 className="text-4xl font-serif font-bold text-slate-900 mb-1">{getFirstName(selectedProfile.realName)}</h2>
                  <p className="text-slate-500 text-lg flex gap-4">
                     <span>{getAge(selectedProfile.dob)} years old</span>
                     <span>•</span>
                     <span>{selectedProfile.address?.split(',').pop() || 'USA'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                   <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-slate-400 uppercase">Height</div>
                      <div className="text-slate-900 font-bold">{getHeightString(selectedProfile.height)}</div>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-slate-400 uppercase">BMI</div>
                      <div className="text-slate-900 font-bold">{selectedProfile.bmi || 'N/A'}</div>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-slate-400 uppercase">Hair</div>
                      <div className="text-slate-900 font-bold">{selectedProfile.hairColor || 'N/A'}</div>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-slate-400 uppercase">Eyes</div>
                      <div className="text-slate-900 font-bold">{selectedProfile.eyeColor || 'N/A'}</div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="prose prose-slate">
                      <h3 className="font-serif font-bold text-xl text-slate-900 mb-3">About Me</h3>
                      <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 italic text-slate-700">
                        "{selectedProfile.qDream || selectedProfile.qWhy || selectedProfile.qMessage}"
                      </div>
                   </div>

                   <div>
                      <h3 className="font-serif font-bold text-xl text-slate-900 mb-4">Medical & Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <div className="flex-1">
                               <div className="text-xs font-bold text-slate-400 uppercase">Vaccination</div>
                               <div className="text-slate-700 font-medium">{selectedProfile.vaccinationStatus || 'Unknown'}</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <div className="flex-1">
                               <div className="text-xs font-bold text-slate-400 uppercase">Termination</div>
                               <div className="text-slate-700 font-medium">{selectedProfile.terminationView}</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <div className="flex-1">
                               <div className="text-xs font-bold text-slate-400 uppercase">Embryo Transfer</div>
                               <div className="text-slate-700 font-medium">{selectedProfile.embryoTransferPref}</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <div className="flex-1">
                               <div className="text-xs font-bold text-slate-400 uppercase">Reduction</div>
                               <div className="text-slate-700 font-medium">{selectedProfile.reductionView}</div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Call to Action */}
                   <div className="pt-6 border-t border-slate-100">
                     {currentUser ? (
                        <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            Request Match with {getFirstName(selectedProfile.realName)}
                        </button>
                     ) : (
                        <button onClick={() => navigate('/signup')} className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4" /> Sign Up to View Contact Info
                        </button>
                     )}
                     <p className="text-center text-xs text-slate-400 mt-3">
                       Strict confidentiality rules apply.
                     </p>
                   </div>
                </div>

             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;