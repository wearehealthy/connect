export type Role = 'Surrogate' | 'Egg Donor' | 'Sperm Donor';
export type UserRole = 'Intended Parent' | Role;

export interface UserProfile {
  id?: string;
  uid: string; // Links to Auth
  type: Role;
  createdAt: string;

  // --- COMMON PRIVATE INFO (Never Public) ---
  realName: string;
  phone: string;
  email: string;
  address: string;
  dob: string;

  // --- THE VIBE (Emotional Connection) ---
  qDream?: string; 
  qWhy?: string;   
  qSupport?: string; 
  
  // Donor Specific Vibe
  qTrait?: string; 
  qMessage?: string; 

  // --- HARD GATES ---
  height?: string;
  weight?: string;
  bmi?: number;
  priorBirths?: number;
  cSectionCount?: number;
  isSmoker?: string;
  vaccinationStatus?: string;
  
  terminationView?: string; 
  embryoTransferPref?: string; 
  reductionView?: string; 

  // Stats
  eyeColor?: string;
  hairColor?: string;
  skinTone?: string;
  gpa?: string;
  highestDegree?: string;
  talents?: string;
  build?: string;
  familyHistory?: string;
  occupation?: string;
  
  // Uploads
  profilePhotoUrl?: string;
  familyPhotoUrl?: string;
  adultPhotoUrl?: string; 
  voiceRecordingUrl?: string;
}

export interface ParentProfile {
  id?: string;
  uid: string; // Links to Auth
  type: 'Intended Parent';
  createdAt: string;

  // Contact
  names: string; 
  email: string;
  phone: string;
  location: string;

  // The Pitch
  qSunday: string; 
  qPromise: string; 
  qFuture: string; 

  // Hard Gates
  budgetRange: string;
  embryoPref: string; 
  commStyle: string; 

  photoUrl?: string;
  nurseryPhotoUrl?: string;
}