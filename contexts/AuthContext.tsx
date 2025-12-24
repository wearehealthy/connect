import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

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

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};