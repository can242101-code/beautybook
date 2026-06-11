import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

const PASOS = [
  {
    num: '01',
    icon: 'bi-search',
    title: 'Encuentra tu consultorio',
    text:  'Busca por ciudad, consulta tratamientos disponibles y compara precios sin compromiso.',
  },
  {
    num: '02',
    icon: 'bi-calendar3',
    title: 'Elige fecha y horario',
    text:  'Ve la disponibilidad en tiempo real y selecciona el horario que mejor se ajuste a ti.',
  },
  {
    num: '03',
    icon: 'bi-check2-circle',
    title: 'Confirma tu cita',
    text:  'Recibe confirmación inmediata. Sin llamadas, sin esperas, sin formularios complicados.',
  },
];

const BENEFICIOS = [
  {
    icon: 'bi-shield-check',
    title: 'Sin conflictos de horario',
    text:  'El sistema verifica automáticamente la disponibilidad para evitar citas duplicadas.',
  },
  {
    icon: 'bi-bell',
    title: 'Notificaciones automáticas',
    text:  'Confirmación por correo al agendar y recordatorio 24 horas antes de tu cita.',
  },
  {
    icon: 'bi-bar-chart-line',
    title: 'Panel para consultorios',
    text:  'Gestiona agenda, tratamientos, horarios y membrecías desde un solo lugar.',
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── Hero ── */}
        <section className="hero-section text-white py-5">
          <div className="container py-4 py-lg-5">
            <div className="row align-items-center g-5">
              <div className="col-lg-7">
                <p className="text-uppercase small fw-semibold opacity-75 mb-3 letter-spacing-1">
                  Plataforma de citas dentales
                </p>
                <h1 className="display-4 fw-bold lh-sm mb-4">
                  Agenda tu cita dental<br className="d-none d-md-block" /> en segundos
                </h1>
                <p className="lead opacity-75 mb-5">
                  Consulta disponibilidad en tiempo real, elige tu tratamiento
                  y confirma sin llamadas ni esperas.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Link className="btn btn-light btn-lg fw-semibold px-4" href="/register?rol=paciente">
                    <i className="bi bi-person me-2" />
                    Soy paciente
                  </Link>
                  <Link className="btn btn-outline-light btn-lg px-4" href="/register?rol=consultorio">
                    <i className="bi bi-building me-2" />
                    Tengo un consultorio
                  </Link>
                </div>
              </div>

              {/* Stats lado derecho */}
              <div className="col-lg-5">
                <div className="row g-3">
                  {[
                    { val: '3',    label: 'pasos para agendar'     },
                    { val: '24/7', label: 'disponibilidad online'   },
                    { val: '100%', label: 'sin llamadas telefónicas' },
                  ].map(s => (
                    <div key={s.label} className="col-6 col-lg-12 col-xl-6">
                      <div className="rounded-3 p-3 h-100" style={{ background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(4px)' }}>
                        <div className="display-6 fw-bold">{s.val}</div>
                        <div className="small opacity-75">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cómo funciona ── */}
        <section className="py-5 py-lg-6">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-2">Cómo funciona</h2>
              <p className="text-muted">Tres pasos para tener tu cita agendada.</p>
            </div>
            <div className="row g-4">
              {PASOS.map((p, i) => (
                <div key={p.num} className="col-md-4">
                  <div className="d-flex gap-3 align-items-start h-100 card border-0 shadow-sm p-4">
                    <div className="step-number flex-shrink-0">{p.num}</div>
                    <div>
                      <i className={`bi ${p.icon} text-primary d-block mb-2`} style={{ fontSize: '1.5rem' }} />
                      <h6 className="fw-bold mb-1">{p.title}</h6>
                      <p className="text-muted small mb-0">{p.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Beneficios ── */}
        <section className="py-5 bg-body-secondary">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-2">¿Por qué BeautyBook?</h2>
              <p className="text-muted">Diseñado para pacientes y consultorios dentales.</p>
            </div>
            <div className="row g-4">
              {BENEFICIOS.map(b => (
                <div key={b.title} className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm p-4">
                    <i className={`bi ${b.icon} text-primary mb-3`} style={{ fontSize: '2rem' }} />
                    <h6 className="fw-bold mb-2">{b.title}</h6>
                    <p className="text-muted small mb-0">{b.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="border-top py-4">
        <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2 text-muted small">
            <i className="bi bi-calendar2-check text-primary" />
            <span className="fw-semibold text-body">BeautyBook</span>
          </div>
          <span className="text-muted small">© 2026 — Plataforma de citas dentales</span>
        </div>
      </footer>
    </>
  );
}
