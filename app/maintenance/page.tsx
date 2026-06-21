export const metadata = { title: 'Back Soon | QYLAT' };

export default function MaintenancePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f2318 0%, #1a3a28 60%, #0f2318 100%)',
        padding: '2rem',
        fontFamily: 'Georgia, serif',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 3,
          background: 'linear-gradient(90deg, #8B6914, #E8C84A, #8B6914)',
          marginBottom: '2rem',
          borderRadius: 2,
        }}
      />

      <h1
        style={{
          color: '#E8C84A',
          fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          margin: '0 0 1rem',
          fontWeight: 700,
        }}
      >
        QYLAT
      </h1>

      <p
        style={{
          color: '#f0ebe0',
          fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
          margin: '0 0 0.75rem',
          fontWeight: 400,
          letterSpacing: '0.05em',
        }}
      >
        Under Maintenance
      </p>

      <p
        style={{
          color: '#a8c4b0',
          fontSize: '1rem',
          margin: 0,
          letterSpacing: '0.1em',
        }}
      >
        BRB ✦
      </p>

      <div
        style={{
          width: 64,
          height: 3,
          background: 'linear-gradient(90deg, #8B6914, #E8C84A, #8B6914)',
          marginTop: '2rem',
          borderRadius: 2,
        }}
      />
    </div>
  );
}
