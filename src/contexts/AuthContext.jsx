import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const INITIAL_ADMIN = {
  email: 'm@gmail.com',
  password: 'admin123'
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function login(email, password) {
    try {
      // Check if it matches initial admin credentials
      if (email === INITIAL_ADMIN.email && password === INITIAL_ADMIN.password) {
        // Set up initial admin in Firestore if not exists
        const adminDoc = await getDoc(doc(db, 'admins', INITIAL_ADMIN.email));
        if (!adminDoc.exists()) {
          await setDoc(doc(db, 'admins', INITIAL_ADMIN.email), {
            email: INITIAL_ADMIN.email,
            password: INITIAL_ADMIN.password,
            createdAt: new Date()
          });
        }
        setCurrentUser({ email: INITIAL_ADMIN.email });
        return { success: true };
      }

      const adminDoc = await getDoc(doc(db, 'admins', email));
      if (!adminDoc.exists()) {
        throw new Error('Unauthorized access');
      }

      const admin = adminDoc.data();
      if (admin.password !== password) {
        throw new Error('Invalid credentials');
      }

      setCurrentUser({ email });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  function logout() {
    setCurrentUser(null);
  }

  useEffect(() => {
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}