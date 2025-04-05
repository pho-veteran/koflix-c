import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from './firebase-auth';

// Enhanced auth context with proper types
export type AuthContextType = {
  user: any;
  authInitialized: boolean;
  isLoading: boolean;
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

// Auth navigation protection logic
function useProtectedRoute(user: any) {
  const segments = useSegments();
  const router = useRouter();
  
  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    const inMainGroup = segments[0] === "(main)";
    
    if (!user && inMainGroup) {
      // If user is not signed in and trying to access protected routes
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup && segments[1] !== "reset-password") {
      // If user is signed in and trying to access auth routes
      router.replace("/(main)/home");
    }
  }, [user, segments, router]);
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Apply route protection
  useProtectedRoute(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthInitialized(true);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, authInitialized, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}