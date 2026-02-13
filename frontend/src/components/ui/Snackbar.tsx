import { useEffect } from 'react';
import { useSnackbarStore } from '../../store/snackbar.store';
import anime from 'animejs';

export function Snackbar() {
  const { isOpen, message, type, duration, hideSnackbar } = useSnackbarStore();

  useEffect(() => {
    if (isOpen) {
        // Animation in
        anime({
            targets: '.snackbar-container',
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad',
            // Wait for duration then hide? No, handled by useEffect callback
        });

        if (duration && duration > 0) {
            const timer = setTimeout(() => {
                hideSnackbar();
            }, duration);
            return () => clearTimeout(timer);
        }
    }
  }, [isOpen, duration, hideSnackbar]);

  if (!isOpen) return null;

  const getBackgroundColor = () => {
      switch (type) {
          case 'success': return 'var(--success-500)';
          case 'error': return 'var(--danger-500)';
          case 'warning': return 'var(--warning-500)';
          case 'info': default: return 'var(--primary-500)';
      }
  };

  const getIcon = () => {
      switch (type) {
          case 'success': return '✓';
          case 'error': return '✕';
          case 'warning': return '⚠';
          case 'info': default: return 'ℹ';
      }
  };

  return (
    <div className="snackbar-container" style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '12px 24px',
        backgroundColor: getBackgroundColor(),
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '400px',
        fontSize: '14px',
        fontWeight: '500',
        animation: 'slideIn 0.3s ease-out', // Fallback animation if needed
    }}>
        <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
        }}>
            {getIcon()}
        </div>
        <span style={{ flex: 1 }}>{message}</span>
        <button 
            onClick={hideSnackbar} 
            style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                opacity: 0.8,
                padding: '0 4px',
                lineHeight: 1,
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
            ×
        </button>
    </div>
  );
}
