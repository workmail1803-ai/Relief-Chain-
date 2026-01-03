/**
 * LoadingScreen Component (MVC Pattern)
 * View Layer - Full screen loading indicator
 */
import React from 'react';

const LoadingScreen = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8fafc', // Light slate background for a clean look
            zIndex: 9999,
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <div className="spinner" style={{
                width: '50px',
                height: '50px',
                border: '4px solid rgba(59, 130, 246, 0.2)', // Light blue
                borderTop: '4px solid #3b82f6', // Primary blue
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <h2 style={{
                fontFamily: "'Inter', sans-serif",
                color: '#1e293b', // Slate 800
                fontSize: '1.25rem',
                fontWeight: '500',
                letterSpacing: '0.025em',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
                Relief Chain
            </h2>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
};

export default LoadingScreen;
