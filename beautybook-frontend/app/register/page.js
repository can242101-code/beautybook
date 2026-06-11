'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import AppAlert from '@/components/ui/AppAlert';
import ThemeToggle from '@/components/layout/ThemeToggle';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const REDIRECT = { paciente: '/paciente/dashboard', consultorio: '/consultorio/dashboard' };

function RegisterForm() {
  const params = useSearchParams();
  const [role, setRole] = useState('paciente');
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', telefono: '', nombre: '', direccion: '', ciudad: '' });
  const [error, setError]   = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { setUser }         = useAuth();
  const router              = useRouter();

  useEffect(() => { setRole(params.get('rol') || 'paciente'); }, [params]);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post('/register', { ...form, role });
      localStorage.setItem('bb-token', data.token);
      setUser(data.user);
      router.push(REDIRECT[role] ?? '/');
    } catch (err) {
      setError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text') => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input name={name} type={type} className={`form-control ${errors[name] ? 'is-invalid' : ''}`} value={form[name]} onChange={handle} />
      {errors[name] && <div className="invalid-feedback">{errors[name][0]}</div>}
    </div>
  );

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body-secondary py-4">
      <div className="card shadow border-0 w-100" style={{ maxWidth: 500 }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-calendar2-check fs-4 text-primary" />
              <span className="fw-bold fs-5">BeautyBook</span>
            </div>
            <ThemeToggle />
          </div>

          <h5 className="mb-3">Crear cuenta</h5>

          <div className="btn-group w-100 mb-4" role="group">
            <button type="button" className={`btn btn-${role === 'paciente' ? 'primary' : 'outline-primary'} d-flex align-items-center justify-content-center gap-2`} onClick={() => setRole('paciente')}>
              <i className="bi bi-person" /> Paciente
            </button>
            <button type="button" className={`btn btn-${role === 'consultorio' ? 'primary' : 'outline-primary'} d-flex align-items-center justify-content-center gap-2`} onClick={() => setRole('consultorio')}>
              <i className="bi bi-building" /> Consultorio
            </button>
          </div>

          <AppAlert type="danger" message={error} />

          <form onSubmit={submit}>
            {field('name', 'Nombre completo')}
            {field('email', 'Correo electrónico', 'email')}
            {field('telefono', 'Teléfono (opcional)', 'tel')}
            {field('password', 'Contraseña', 'password')}
            {field('password_confirmation', 'Confirmar contraseña', 'password')}

            {role === 'consultorio' && (
              <>
                <hr className="my-3" />
                <p className="text-muted small mb-3">Datos del consultorio</p>
                {field('nombre', 'Nombre del consultorio')}
                {field('direccion', 'Dirección')}
                {field('ciudad', 'Ciudad')}
              </>
            )}

            <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creando cuenta…</> : 'Registrarse'}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RegisterForm />
    </Suspense>
  );
}
