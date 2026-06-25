import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: '100vh', padding: '2rem' }}
    >
      <img src="/logo.png" alt="BeautyBook" style={{ height: 80, width: 'auto' }} className="mb-4" />

      <h1 className="fw-bold" style={{ fontSize: '4rem', lineHeight: 1, color: 'var(--bs-primary)' }}>404</h1>
      <h4 className="fw-semibold mt-2 mb-2">Página no encontrada</h4>
      <p className="text-muted mb-4" style={{ maxWidth: 400 }}>
        La dirección que buscas no existe o fue movida. Verifica el enlace o regresa al inicio.
      </p>

      <div className="d-flex gap-3 flex-wrap justify-content-center">
        <Link href="/" className="btn btn-primary px-4 fw-medium d-flex align-items-center gap-2">
          <i className="bi bi-house" />
          Ir al inicio
        </Link>
        <Link href="/login" className="btn btn-outline-secondary px-4 fw-medium">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
