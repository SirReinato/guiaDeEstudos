import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";
import type { UserProfile } from "../types/database";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithUsername: (username: string, password: string) => Promise<{ error: Error | null; status?: string }>;
  signUpWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  recadastrarPerfilSeNecessario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Normalização do username para email interno no Supabase Auth
// Ex: "SirReinato" vira "sirreinato@guiadeestudos.internal"
export const formatUsernameToInternalEmail = (username: string): string => {
  const clean = username.trim().toLowerCase().replace(/\s+/g, ".");
  return `${clean}@guiadeestudos.internal`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (userId: string, usernameFallback?: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("Aviso ao buscar perfil:", error.message);
      }

      if (data) {
        setProfile(data as UserProfile);
      } else if (usernameFallback) {
        // Criar perfil se não existir ainda
        const cleanName = usernameFallback.trim();
        const isAdmin = cleanName.toLowerCase() === "sirreinato";
        const newProfile: Partial<UserProfile> = {
          id: userId,
          username: cleanName,
          role: isAdmin ? "admin" : "user",
          status: isAdmin ? "active" : "pending",
        };

        const { data: created, error: insertErr } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .maybeSingle();

        if (!insertErr && created) {
          setProfile(created as UserProfile);
        }
      }
    } catch (err) {
      console.error("Erro na busca de perfil:", err);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithUsername = async (username: string, password: string) => {
    const cleanUsername = username.trim();
    const internalEmail = formatUsernameToInternalEmail(cleanUsername);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password,
    });

    if (error) {
      return { error: error as Error };
    }

    if (data.user) {
      await fetchProfile(data.user.id, cleanUsername);
    }

    return { error: null };
  };

  const signUpWithUsername = async (username: string, password: string) => {
    const cleanUsername = username.trim();
    const internalEmail = formatUsernameToInternalEmail(cleanUsername);

    const { data, error } = await supabase.auth.signUp({
      email: internalEmail,
      password,
    });

    if (error) {
      return { error: error as Error };
    }

    if (data.user) {
      const isAdmin = cleanUsername.toLowerCase() === "sirreinato";
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        username: cleanUsername,
        role: isAdmin ? "admin" : "user",
        status: isAdmin ? "active" : "pending",
      });

      if (profileError) {
        console.warn("Aviso ao criar profile:", profileError.message);
      }

      await fetchProfile(data.user.id, cleanUsername);
    }

    return { error: null };
  };

  const recadastrarPerfilSeNecessario = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithUsername,
        signUpWithUsername,
        signOut,
        recadastrarPerfilSeNecessario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
};
