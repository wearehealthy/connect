import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  currentUser: User | null;
  userRole: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, userRole: null, loading: true, logout: async () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(
      auth, 
      async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            // Fetch role from Firestore 'users' collection
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserRole(docSnap.data().role);
            }
          } catch (e) {
            console.error("Error fetching user role:", e);
          }
        } else {
          setUserRole(null);
        }
        setLoading(false);
      },
      (error) => {
        // Catch initialization errors (like auth/configuration-not-found)
        console.error("Auth initialization error:", error);
        setLoading(false); // Ensure app loads even if auth fails
      }
    );

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
        <p className="text-slate-500 font-serif animate-pulse">Connecting to Community...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};