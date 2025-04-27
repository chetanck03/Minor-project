import { createRoot } from 'react-dom/client';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Lazy load the App component
const App = lazy(() => import('./App.jsx'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-dark-300">
    <div className="w-12 h-12 border-4 border-accent-300 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

createRoot(document.getElementById('root')).render(
  <Suspense fallback={<LoadingFallback />}>
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#171923', // Dark theme background
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.3)',
          maxWidth: '350px',
          width: 'auto',
          border: '1px solid #2D3748'
        },
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#8B5CF6', // Accent color for success icon
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#EF4444', // Red for error icon
            secondary: '#fff',
          },
        },
      }}
    />
    <App />
  </Suspense>
);
