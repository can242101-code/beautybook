'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';

const LINKS = {
  paciente: [
    { href: '/paciente/dashboard',    label: 'Inicio',       icon: 'bi-house' },
    { href: '/paciente/consultorios', label: 'Consultorios', icon: 'bi-building' },
    { href: '/paciente/citas',        label: 'Mis citas',    icon: 'bi-calendar3' },
  ],
  consultorio: [
    { href: '/consultorio/dashboard',    label: 'Panel',        icon: 'bi-grid' },
    { href: '/consultorio/tratamientos', label: 'Tratamientos', icon: 'bi-clipboard2-pulse' },
    { href: '/consultorio/horarios',     label: 'Horarios',     icon: 'bi-clock' },
    { href: '/consultorio/perfil',       label: 'Perfil',       icon: 'bi-person-gear' },
  ],
  gestor: [
    { href: '/admin/dashboard',    label: 'Panel',        icon: 'bi-grid' },
    { href: '/admin/consultorios', label: 'Consultorios', icon: 'bi-buildings' },
  ],
};

const closeOffcanvas = () => {
  if (typeof window === 'undefined') return;
  const el = document.getElementById('navOffcanvas');
  window.bootstrap?.Offcanvas?.getInstance(el)?.hide();
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const router           = useRouter();
  const links            = user ? (LINKS[user.role] ?? []) : [];

  const handleLogout = async () => {
    closeOffcanvas();
    await logout();
    router.push('/login');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg border-bottom">
        <div className="container">

          {/* Hamburguesa — extremo izquierdo, solo mobile */}
          <button
            className="btn border-0 p-0 d-lg-none lh-1"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#navOffcanvas"
            aria-controls="navOffcanvas"
            aria-label="Abrir menú"
            style={{ minWidth: '2.25rem', minHeight: '2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <i className="bi bi-list" style={{ fontSize: '1.6rem', lineHeight: 1 }} />
          </button>

          {/* Marca */}
          <Link className="navbar-brand fw-bold d-flex align-items-center gap-2 ms-2 ms-lg-0" href="/">
            <i className="bi bi-calendar2-check text-primary" />
            BeautyBook
          </Link>

          {/* Desktop (lg+): nav + acciones */}
          <div className="d-none d-lg-flex align-items-center gap-1 ms-auto">
            {links.length > 0 && (
              <ul className="navbar-nav me-2 flex-row gap-1">
                {links.map(l => (
                  <li key={l.href} className="nav-item">
                    <Link className="nav-link px-3" href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            )}
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-muted small ms-2 d-none d-xl-flex align-items-center gap-1">
                  <i className="bi bi-person-circle me-1" />{user.name}
                </span>
                <button
                  className="btn btn-outline-secondary btn-sm ms-1 d-flex align-items-center gap-1"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right" /> Salir
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-primary btn-sm ms-2" href="/login">Ingresar</Link>
                <Link className="btn btn-primary btn-sm ms-1" href="/register">Registrarse</Link>
              </>
            )}
          </div>

          {/* Toggle de tema — extremo derecho, solo mobile */}
          <div className="d-flex d-lg-none align-items-center ms-auto">
            <ThemeToggle />
          </div>

        </div>
      </nav>

      {/* Offcanvas — sale desde la izquierda (mismo lado que el botón) */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="navOffcanvas"
        aria-labelledby="navOffcanvasLabel"
        style={{ maxWidth: '280px' }}
      >
        <div className="offcanvas-header border-bottom py-3">
          <div className="d-flex align-items-center gap-2" id="navOffcanvasLabel">
            <i className="bi bi-calendar2-check text-primary" />
            <span className="fw-bold">BeautyBook</span>
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar" />
        </div>

        <div className="offcanvas-body d-flex flex-column p-0">
          <nav className="flex-grow-1 py-2">
            {links.map(l => (
              <Link
                key={l.href}
                className="d-flex align-items-center gap-3 px-4 py-3 text-decoration-none nav-link"
                href={l.href}
                onClick={closeOffcanvas}
              >
                <i className={`bi ${l.icon} text-primary`} style={{ width: '1.1rem', textAlign: 'center' }} />
                <span>{l.label}</span>
              </Link>
            ))}
          </nav>

          <div className="border-top p-4 d-flex flex-column gap-2">
            {user ? (
              <>
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <i className="bi bi-person-circle" />
                  <span className="text-truncate">{user.name}</span>
                </div>
                <button
                  className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right" /> Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-primary btn-sm w-100" href="/login" onClick={closeOffcanvas}>
                  Ingresar
                </Link>
                <Link className="btn btn-primary btn-sm w-100" href="/register" onClick={closeOffcanvas}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
