import { createContext, useContext, useState, useEffect ,useLayoutEffect} from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";

import { apiFetch, configureApiAuth, updateAccessToken ,refreshAccessToken,API_URL} from "../lib/api";
type User = {
  two_fa?: boolean;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  organization_id: string;
};

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isLoading: boolean;
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = user !== null;

  useLayoutEffect(() => {
    configureApiAuth({
      onTokenChange: setAccessTokenState,
      onAuthFailure: () => {
        setAccessTokenState(null);
        setUser(null);
      },
    });
  }, []);
   useEffect(() => {
  const initializeAuth = async () => {
    try {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        setUser(null);
        return;
      }

      const userResponse = await apiFetch("/users/me");
      if (!userResponse.ok) {
        setUser(null);
        return;
      }
      setUser(await userResponse.json());
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  initializeAuth();
}, []);
   const logout = async () => {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers:{
        "Authorization":`Bearer ${accessToken}`
      },
    });
  } catch (error) {
    console.error(error);
  } finally {
    updateAccessToken(null);
    setUser(null);
  }
};

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken: updateAccessToken,
        isLoading,
        user,
        isAuthenticated,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
