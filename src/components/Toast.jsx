import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((type, message, description = '', duration = 5000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, description, duration }]);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, desc, dur) => show('success', msg, desc, dur), [show]);
  const error = useCallback((msg, desc, dur) => show('error', msg, desc, dur), [show]);
  const info = useCallback((msg, desc, dur) => show('info', msg, desc, dur), [show]);
  const warning = useCallback((msg, desc, dur) => show('warning', msg, desc, dur), [show]);

  const api = React.useMemo(() => ({ show, dismiss, success, error, info, warning }), [
    show, dismiss, success, error, info, warning
  ]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, dismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, dismiss }) {
  const { id, type, message, description, duration } = toast;
  const timerRef = useRef(null);
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef(Date.now());
  const progressBarRef = useRef(null);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      dismiss(id);
    }, remainingTimeRef.current);

    if (progressBarRef.current) {
      progressBarRef.current.style.transition = `width ${remainingTimeRef.current}ms linear`;
      progressBarRef.current.style.width = '0%';
    }
  };

  const pauseTimer = () => {
    clearTimeout(timerRef.current);
    remainingTimeRef.current -= (Date.now() - startTimeRef.current);
    if (remainingTimeRef.current < 0) remainingTimeRef.current = 0;

    if (progressBarRef.current) {
      const computedStyle = window.getComputedStyle(progressBarRef.current);
      const width = computedStyle.width;
      progressBarRef.current.style.transition = 'none';
      progressBarRef.current.style.width = width;
    }
  };

  useEffect(() => {
    startTimer();
    return () => clearTimeout(timerRef.current);
  }, [id]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`toast-item ${type}`}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
    >
      <div className="toast-content-wrapper">
        <div className="toast-icon-container">{getIcon()}</div>
        <div className="toast-text">
          <div className="toast-title">{message}</div>
          {description && <div className="toast-description">{description}</div>}
        </div>
        <button className="toast-close-btn" onClick={() => dismiss(id)}>
          &times;
        </button>
      </div>
      <div className="toast-progress-container">
        <div ref={progressBarRef} className="toast-progress-bar" style={{ width: '100%' }} />
      </div>
    </div>
  );
}
