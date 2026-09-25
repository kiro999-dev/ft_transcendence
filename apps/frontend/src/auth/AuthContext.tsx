// AuthContext.tsx
import { createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true while we try silent refresh

  // On app load, try to get a fresh access token using the httpOnly refresh cookie
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await fetch('http://localhost:3000/auth/refresh', {
          method: 'POST',
          credentials: 'include', // sends the httpOnly cookie
        });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
        }
      } catch (error) {
        toast.error("something went wrong please try again ")
      } finally {
        setIsLoading(false);
      }
    };
    tryRefresh();
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};