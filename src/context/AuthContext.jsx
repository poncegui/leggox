import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register' | 'forgot-password'
  const [loading, setLoading] = useState(true);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('leggox_user');
      const savedToken = localStorage.getItem('leggox_token');

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar usuario en localStorage cuando cambia
  useEffect(() => {
    if (user) {
      localStorage.setItem('leggox_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('leggox_user');
      localStorage.removeItem('leggox_token');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      // TODO: Reemplazar con llamada real a la API de Mercagarage
      const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al iniciar sesión');
      }

      const data = await response.json();

      // Guardar token y usuario
      localStorage.setItem('leggox_token', data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // TODO: Reemplazar con llamada real a la API de Mercagarage
      const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al registrarse');
      }

      const data = await response.json();

      // Guardar token y usuario
      localStorage.setItem('leggox_token', data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);

      return { success: true };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('leggox_user');
    localStorage.removeItem('leggox_token');
  };

  const openAuthModal = (view = 'login') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const switchAuthView = (view) => {
    setAuthView(view);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    authView,
    switchAuthView,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
