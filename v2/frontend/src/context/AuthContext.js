'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Au chargement de l'app, on tente de restaurer la session via le cookie
  // de refresh (httpOnly) — sans ça, l'utilisateur serait déconnecté à
  // chaque rechargement de page.
  useEffect(() => {
    authService
      .refresh()
      .then(({ accessToken, user }) => {
        setAccessToken(accessToken);
        setUser(user);
      })
      .catch(() => {
        // Pas de session valide : c'est un cas normal, pas une erreur à afficher.
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user, accessToken } = await authService.login(email, password);
    setUser(user);
    setAccessToken(accessToken);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() doit être appelé à l’intérieur de <AuthProvider>.');
  }
  return context;
}
