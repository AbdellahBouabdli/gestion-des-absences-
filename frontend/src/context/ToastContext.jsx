import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [state, setState] = useState({ open: false, message: '', severity: 'success' });

  const show = useCallback((message, severity = 'success') => {
    setState({ open: true, message, severity });
  }, []);

  const close = useCallback((_, reason) => {
    if (reason === 'clickaway') return;
    setState((current) => ({ ...current, open: false }));
  }, []);

  const toast = useMemo(
    () => ({
      show,
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      info: (message) => show(message, 'info'),
      warning: (message) => show(message, 'warning'),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={4200}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ maxWidth: 430 }}
      >
        <Alert
          severity={state.severity}
          variant="filled"
          onClose={close}
          sx={{ borderRadius: 3, alignItems: 'center', boxShadow: '0 16px 40px rgba(16,38,59,.24)' }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}
