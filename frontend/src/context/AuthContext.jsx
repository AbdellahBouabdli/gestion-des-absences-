import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { authApi } from '../api/endpoints';
import { TOKEN_KEY, USER_KEY } from '../api/client';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [booting, setBooting] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('campus:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('campus:unauthorized', handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    if (!token) {
      setBooting(false);
      return;
    }
    let active = true;
    authApi
      .me()
      .then((profile) => {
        if (!active) return;
        setUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      })
      .catch(() => {
        if (active) logout();
      })
      .finally(() => {
        if (active) setBooting(false);
      });
    return () => {
      active = false;
    };
    // Runs once on app boot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authApi.login({ email, password });
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const value = useMemo(
    () => ({ token, user, booting, login, logout, isAuthenticated: Boolean(token && user) }),
    [token, user, booting, login, logout],
  );

  if (booting) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: '#10263b',
          color: 'white',
        }}
      >
        <Stack alignItems="center" spacing={2.5}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.12)',
              fontFamily: "'Manrope Variable'",
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            CP
          </Box>
          <CircularProgress size={24} sx={{ color: '#45c7b5' }} />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.55)', letterSpacing: '.12em' }}>
            CAMPUS PRÉSENCE
          </Typography>
        </Stack>
      </Box>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
