import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase/client';
import Home from './components/Home';
import SignIn from './components/SignIn';

const theme = createTheme({
  shape: {
    borderRadius: 10
  },
  typography: {
    button: {
      textTransform: 'none'
    }
  }
});

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(( {data: {session} }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    });
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {!session ? <SignIn /> : <Home setSession={setSession} />}
      </ThemeProvider>
    </LocalizationProvider>
  );
}
