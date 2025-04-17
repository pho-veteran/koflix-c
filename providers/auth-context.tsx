import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, FirebaseUser } from '../lib/firebase-auth';
import { User } from '@/types/user';
import { getUserDetail, createOrUpdateUser } from '@/api/users';

// Enhanced auth context with proper types
export type AuthContextType = {
  firebaseUser: FirebaseUser;
  user: User | null;
  authInitialized: boolean;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook for using auth context with proper typing
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Auth provider props
type AuthProviderProps = {
  children: ReactNode;
};

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);

      const userData = await getUserDetail();

      if (userData) {
        setUser(userData);
        console.log("User data fetched:", userData);
      } else {
        const newUser = await createOrUpdateUser({
          name: 'Koflix User',
          emailOrPhone: firebaseUser?.email || firebaseUser?.phoneNumber || undefined
        });
        setUser(newUser);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (firebaseUser) {
      setIsLoading(true);
      await fetchUserData();
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setFirebaseUser(currentUser);
      setAuthInitialized(true);

      if (currentUser) {
        fetchUserData();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      user,
      authInitialized,
      isLoading,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
}