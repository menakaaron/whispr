"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { setApiTokenGetter } from "@/lib/apiClient";
import { api } from "@/lib/apiClient";
import * as cognito from "@/lib/cognito";

/** Turn Cognito config errors into a message that explains the fix (e.g. USER_SRP_AUTH). */
function cognitoFriendlyMessage(message: string): string {
  if (message.includes("USER_SRP_AUTH") && message.toLowerCase().includes("not enabled")) {
    return "Sign-in is not configured for this app. An administrator must enable USER_SRP_AUTH for the Cognito App Client (see README: Cognito setup).";
  }
  return message;
}

export type AuthUser = {
  email: string;
  sub: string;
};

type AuthState = {
  user: AuthUser | null;
  idToken: string | null;
  loading: boolean;
  error: string | null;
};

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: cognito.SignUpParams) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = idToken;

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    setApiTokenGetter(() => tokenRef.current);
  }, []);

  useEffect(() => {
    const restore = async () => {
      try {
        const session = await cognito.getSession();
        const payload = parseJwt(session.idToken);
        const email = (payload.email ?? payload.preferred_username ?? payload.sub) as string;
        setUser({ email, sub: payload.sub as string });
        setIdToken(session.idToken);
      } catch {
        setUser(null);
        setIdToken(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const { idToken: token } = await cognito.signIn(email, password);
      const payload = parseJwt(token);
      const sub = payload.sub as string;
      setUser({ email, sub });
      setIdToken(token);
      setApiTokenGetter(() => token);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(cognitoFriendlyMessage(message));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (params: cognito.SignUpParams) => {
    setError(null);
    setLoading(true);
    try {
      await cognito.signUp(params);
      await signIn(params.email, params.password);
      await api.post("/users", {
        email: params.email,
        nativeLanguage: params.nativeLanguage,
        targetLanguage: params.targetLanguage,
        proficiencyLevel: params.proficiencyLevel,
        learningGoals: params.learningGoals,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign up failed";
      const friendly =
        msg.toLowerCase().includes("not confirmed") || msg.toLowerCase().includes("confirm")
          ? "Please check your email to verify your account, then sign in."
          : cognitoFriendlyMessage(msg);
      setError(friendly);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  const signOut = useCallback(() => {
    cognito.signOut();
    setUser(null);
    setIdToken(null);
    setApiTokenGetter(() => null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      idToken,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      clearError,
    }),
    [user, idToken, loading, error, signIn, signUp, signOut, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function parseJwt(token: string): Record<string, unknown> {
  const base64 = token.split(".")[1];
  if (!base64) return {};
  try {
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return {};
  }
}
