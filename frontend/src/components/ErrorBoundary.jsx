import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught an error]', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '2rem auto', background: '#fff', borderRadius: '12px', border: '1px solid #fecaca', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 1rem' }}>Something went wrong</h2>
          <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <pre style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.78rem', color: '#1e293b', border: '1px solid #e2e8f0' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#2E073F', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

