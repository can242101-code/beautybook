'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AppAlert from '@/components/ui/AppAlert';
import ThemeToggle from '@/components/layout/ThemeToggle';

const REDIRECT = { paciente: '/paciente/dashboard', consultorio: '/consultorio/dashboard', gestor: '/admin/dashboard' };

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }           = useAuth();
  const router              = useRouter();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.push(REDIRECT[user.role] ?? '/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body-secondary">
      <div className="card shadow border-0 w-100" style={{ maxWidth: 420 }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-calendar2-check fs-4 text-primary" />
              <span className="fw-bold fs-5">BeautyBook</span>
            </div>
            <ThemeToggle />
          </div>

          <h5 className="mb-1">Iniciar sesión</h5>
          <p className="text-muted small mb-4">Accede a tu cuenta para continuar.</p>

          <AppAlert type="danger" message={error} />

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handle} required autoFocus />
            </div>
            <div className="mb-4">
              <label className="form-label">Contraseña</label>
              <input name="password" type="password" className="form-control" value={form.password} onChange={handle} required />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Ingresando…</> : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
