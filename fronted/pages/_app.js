// pages/_app.js
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
    // Apply saved theme
    const saved = localStorage.getItem('fitai-theme') || 'dark';
    document.documentElement.classList.toggle('light', saved === 'light');
  }, []);

  const Layout = Component.Layout || (({ children }) => children);

  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a2236',
            color: '#f1f5f9',
            border: '1px solid #2a3a52',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#14b8a6', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </>
  );
}
