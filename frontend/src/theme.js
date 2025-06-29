// src/theme.js
import { createTheme } from '@mui/material/styles';

const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#368589',
      },
      secondary: {
        main: '#ffffff',
        black: '#000000',
        changepass: '#DC3545',
      },
      background: {
        default: mode === 'light' ? '#ffffff' : '#1e1e1e',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#000000' : '#ffffff',
      },
    },
    typography: {
      fontFamily: 'Be Vietnam Pro, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });

export default getTheme;
