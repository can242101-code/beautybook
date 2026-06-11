'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AppAlert from '@/components/ui/AppAlert';

export default function PerfilConsultorioPage() {
  const { user, setUser } = useAuth();
  const c                 = user?.consultorio ?? {};

  const [form, setForm] = useState({
    nombre:      c.nombre      ?? '',
    direccion:   c.direccion   ?? '',
    ciudad:      c.ciudad      ?? '',
    telefono:    c.telefono    ?? '',
    descripcion: c.descripcion ?? '',
  });
  const [msg, setMsg]         = useState({ text: '', type: 'success' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMsg({ text: '', type: 'success' });
    try {
      const { data } = await api.patch('/consultorio/perfil', form);
      setUser(u => ({ ...u, consultorio: data }));
      setMsg({ text: 'Perfil actualizado correctamente.', type: 'success' });
    } catch (err) {
      setMsg({ text: err.message, type: 'danger' });
      setErrors(err.errors ?? {});
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', required = false) => (
    <div className="mb-3">
      <label className="form-label">
        {label}
        {!required && <span className="text-muted ms-1 small">(opcional)</span>}
      </label>
      <input
        name={name}
        type={type}
        className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
        value={form[name]}
        onChange={handle}
        required={required}
      />
      {errors[name] && <div className="invalid-feedback">{errors[name][0]}</div>}
    </div>
  );

  return (
    <>
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Perfil del consultorio</h3>
        <p className="text-muted mb-0">Esta información es visible para los pacientes al buscar consultorios.</p>
      </div>

      <div className="row g-4">
        {/* Formulario */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <AppAlert type={msg.type} message={msg.text} onClose={() => setMsg({ text: '', type: 'success' })} />

              <form onSubmit={guardar}>
                {field('nombre',    'Nombre del consultorio', 'text', true)}
                {field('direccion', 'Dirección',              'text', true)}
                {field('ciudad',    'Ciudad',                 'text', true)}
                {field('telefono',  'Teléfono',               'tel')}

                <div className="mb-4">
                  <label className="form-label">
                    Descripción
                    <span className="text-muted ms-1 small">(opcional)</span>
                  </label>
                  <textarea
                    name="descripcion"
                    className="form-control"
                    rows="3"
                    maxLength={500}
                    placeholder="Describe brevemente tu consultorio, especialidades, años de experiencia…"
                    value={form.descripcion}
                    onChange={handle}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  {loading
                    ? <><span className="spinner-border spinner-border-sm" /> Guardando…</>
                    : <><i className="bi bi-check2" /> Guardar cambios</>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Panel de membrecía (solo lectura) */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-bottom py-3">
              <span className="fw-semibold d-flex align-items-center gap-2">
                <i className="bi bi-award text-primary" />
                Membrecía activa
              </span>
            </div>
            <div className="card-body p-3">
              <ul className="list-unstyled mb-0">
                {[
                  { label: 'Plan',          value: c.membrecia?.plan        ?? '—' },
                  { label: 'Vence el',      value: c.membrecia?.fecha_vencimiento ?? '—' },
                  { label: 'Estado',        value: c.activo ? 'Activo' : 'Bloqueado' },
                ].map(r => (
                  <li key={r.label} className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted small">{r.label}</span>
                    <span className="fw-semibold small text-capitalize">{r.value}</span>
                  </li>
                ))}
              </ul>
              <p className="text-muted small mt-3 mb-0">
                Para cambiar de plan contacta al administrador de la plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
