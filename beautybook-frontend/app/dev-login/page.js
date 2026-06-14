'use client';
// Página de acceso rápido — solo disponible en entorno de desarrollo
if (process.env.NODE_ENV === 'production') {
  // En producción este módulo exporta null: la ruta devuelve página vacía
}

const CUENTAS = [
  {
    rol: 'Gestor / Admin',
    email: 'gestor@beautybook.com',
    token: '76|vPg8QfvEyCX8qwT0FNdFbTadn8jHWRKRWODLHnxU2accebe0',
    destino: '/admin/dashboard',
    color: 'danger',
    icono: 'bi-shield-lock',
  },
  {
    rol: 'Paciente',
    email: 'karla.paciente@beautybook.com',
    token: '79|npVuJzsQyWd4QtOU0KaccJEOnL0JU5HsuwKveGoLf103b66a',
    destino: '/paciente/dashboard',
    color: 'success',
    icono: 'bi-person',
  },
  {
    rol: 'Consultorio',
    email: 'demo_cons@beautybook.com',
    token: '78|234rvoDOvSrJLNrvnbBHfpszba6EorPFin5ujoq937edbefa',
    destino: '/consultorio/dashboard',
    color: 'primary',
    icono: 'bi-building',
  },
];

export default function DevLoginPage() {
  if (process.env.NODE_ENV === 'production') return null;

  const entrar = (cuenta) => {
    localStorage.setItem('bb-token', cuenta.token);
    window.location.href = cuenta.destino;
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' }}>
      <div style={{ maxWidth: 420, width: '100%', padding: '1rem' }}>

        <div className="text-center mb-4">
          <i className="bi bi-calendar2-check text-white" style={{ fontSize: '2.5rem' }} />
          <h3 className="text-white fw-bold mt-2 mb-1">BeautyBook</h3>
          <p className="text-white-50 small">Acceso rápido por rol</p>
        </div>

        <div className="d-flex flex-column gap-3">
          {CUENTAS.map(c => (
            <button
              key={c.rol}
              className={`btn btn-${c.color} py-3 d-flex align-items-center gap-3 text-start`}
              style={{ borderRadius: '0.75rem', fontWeight: 500 }}
              onClick={() => entrar(c)}
            >
              <i className={`bi ${c.icono} fs-4`} style={{ width: 28 }} />
              <div>
                <div className="fw-bold">{c.rol}</div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>{c.email}</div>
              </div>
              <i className="bi bi-arrow-right ms-auto" />
            </button>
          ))}
        </div>

        <p className="text-center text-white-50 small mt-4 mb-0">
          <a href="/login" className="text-white-50">← Ir al login normal</a>
        </p>
      </div>
    </div>
  );
}
