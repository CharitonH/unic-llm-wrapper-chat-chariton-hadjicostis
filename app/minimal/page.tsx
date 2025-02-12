export default function Minimal404Page() {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        {/* Optionally include your logo */}
        <img
          src="/logo.png"
          alt="Logo"
          width={120}
          height={120}
          style={{ marginBottom: '1rem' }}
        />
        <h1>404 - Page Not Found</h1>
        <p>The page you requested does not exist.</p>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          Go to Homepage
        </a>
      </div>
    );
  }
  