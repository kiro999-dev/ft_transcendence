import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";

type User = {
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = user !== null;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const refreshResponse = await fetch(
          "http://localhost:3000/auth/refresh",
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!refreshResponse.ok) {
          setUser(null);
          return;
        }

        const refreshData = await refreshResponse.json();
        const newAccessToken = refreshData.accessToken;

        setAccessToken(newAccessToken);


        const userResponse = await fetch(
          "http://localhost:3000/users/me",
          {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          }
        );

        if (!userResponse.ok) {
          setUser(null);
          return;
        }

        const userData = await userResponse.json();
        setUser(userData);

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
      await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error(error);
      // Even if the request fails, still clear local state below,
      // so the user isn't stuck "logged in" on a dead session.
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
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