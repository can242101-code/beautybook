'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { api } from '@/lib/api';
import AppBadge from '@/components/ui/AppBadge';
import AppAlert from '@/components/ui/AppAlert';
import AppModal from '@/components/ui/AppModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const hoy = new Date();

function esVencido(c) {
  return c.activo && c.membrecia?.fecha_vencimiento && new Date(c.membrecia.fecha_vencimiento) < hoy;
}

const FILTROS = [
  { key: 'todos',      label: 'Todos' },
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'activos',    label: 'Activos' },
  { key: 'vencidos',   label: 'Vencidos' },
];

function ConsultoriosContent() {
  const params = useSearchParams();

  const [lista,        setLista]   = useState([]);
  const [busqueda,     setBusqueda]= useState('');
  const [filtro,       setFiltro]  = useState(params.get('filtro') ?? 'todos');
  const [seleccionado, setSelec]   = useState(null);
  const [form,         setForm]    = useState({ plan: 'basico', dias_vigencia: 30 });
  const [msg,          setMsg]     = useState({ text: '', type: 'success' });
  const [loading,      setLoading] = useState(true);

  const cargar = () =>
    api.get('/admin/consultorios')
      .then(r => setLista(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { cargar(); }, []);

  const conteos = useMemo(() => ({
    todos:      lista.length,
    pendientes: lista.filter(c => !c.activo).length,
    activos:    lista.filter(c => c.activo && !esVencido(c)).length,
    vencidos:   lista.filter(c => esVencido(c)).length,
  }), [lista]);

  const filtrados = useMemo(() => {
    let base = lista;
    if (filtro === 'pendientes') base = base.filter(c => !c.activo);
    if (filtro === 'activos')    base = base.filter(c => c.activo && !esVencido(c));
    if (filtro === 'vencidos')   base = base.filter(c => esVencido(c));

    const q = busqueda.toLowerCase().trim();
    if (!q) return base;
    return base.filter(c =>
      c.nombre?.toLowerCase().includes(q) ||
      c.ciudad?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q) ||
      c.cedula_profesional?.toLowerCase().includes(q)
    );
  }, [lista, filtro, busqueda]);

  const actualizar = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/consultorios/${seleccionado.id}/membrecia`, form);
      setMsg({ text: 'Membrecía actualizada correctamente.', type: 'success' });
      cargar();
      document.getElementById('modalMembrecia')?.querySelector('[data-bs-dismiss]')?.click();
    } catch (err) {
      setMsg({ text: err.message, type: 'danger' });
    }
  };

  const activar = async (id) => {
    try {
      await api.patch(`/admin/consultorios/${id}/activar`);
      setMsg({ text: 'Consultorio activado correctamente.', type: 'success' });
      cargar();
    } catch (err) {
      setMsg({ text: err.message, type: 'danger' });
    }
  };

  const bloquear = async (id) => {
    if (!confirm('¿Bloquear este consultorio? Dejará de aparecer en la plataforma.')) return;
    try {
      await api.patch(`/admin/consultorios/${id}/bloquear`);
      setMsg({ text: 'Consultorio bloqueado.', type: 'warning' });
      cargar();
    } catch (err) {
      setMsg({ text: err.message, type: 'danger' });
    }
  };

  return (
    <>
      {/* Encabezado */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Consultorios</h3>
          <p className="text-muted mb-0 small">
            Gestiona los consultorios registrados en la plataforma.
          </p>
        </div>
        <span className="badge text-bg-secondary fs-6 fw-normal px-3 py-2">
          {lista.length} total
        </span>
      </div>

      <AppAlert
        type={msg.type}
        message={msg.text}
        onClose={() => setMsg({ text: '', type: 'success' })}
      />

      {/* Filtros + búsqueda */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-3 px-4">
          <div className="d-flex flex-wrap align-items-center gap-3">

            {/* Tabs de filtro */}
            <div className="d-flex flex-wrap gap-2 flex-grow-1">
              {FILTROS.map(f => (
                <button
                  key={f.key}
                  className={`btn btn-sm rounded-pill ${filtro === f.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFiltro(f.key)}
                >
                  {f.label}
                  <span
                    className={`ms-2 badge rounded-pill ${filtro === f.key ? 'bg-white text-primary' : 'bg-secondary-subtle text-secondary-emphasis'}`}
                    style={{ fontSize: '.65rem' }}
                  >
                    {conteos[f.key]}
                  </span>
                </button>
              ))}
            </div>

            {/* Búsqueda */}
            <div className="input-group" style={{ maxWidth: 260 }}>
              <span className="input-group-text bg-transparent border-end-0">
                <i className="bi bi-search text-muted" style={{ fontSize: '.8rem' }} />
              </span>
              <input
                type="search"
                className="form-control form-control-sm border-start-0 ps-0"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, ciudad…"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Tabla */}
      {loading ? <LoadingSpinner /> : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--bs-border-color)' }}>
                  <th className="px-4 py-3 fw-semibold" style={{ fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Consultorio</th>
                  <th className="py-3 fw-semibold" style={{ fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Cédula profesional</th>
                  <th className="py-3 fw-semibold" style={{ fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Ciudad</th>
                  <th className="py-3 fw-semibold" style={{ fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Plan</th>
                  <th className="py-3 fw-semibold" style={{ fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Vence</th>
                  <th className="py-3 fw-semibold" style={{ fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Estado</th>
                  <th className="py-3 pe-4 fw-semibold" style={{ fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-5">
                      <i className="bi bi-inbox fs-2 d-block mb-2 opacity-50" />
                      {busqueda ? 'Sin resultados para esa búsqueda.' : 'No hay consultorios en esta categoría.'}
                    </td>
                  </tr>
                ) : filtrados.map(c => {
                  const vencido = esVencido(c);
                  let estadoText  = 'activo';
                  let estadoVar   = 'success';
                  if (!c.activo)   { estadoText = 'pendiente'; estadoVar = 'warning'; }
                  if (vencido)     { estadoText = 'vencido';   estadoVar = 'danger'; }

                  return (
                    <tr key={c.id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-2 fw-bold flex-shrink-0"
                            style={{
                              width: 38, height: 38,
                              background: 'rgba(var(--bb-primary-rgb),.1)',
                              color: 'var(--bb-primary)',
                              fontSize: '.9rem',
                            }}
                          >
                            {c.nombre?.[0]?.toUpperCase() ?? 'C'}
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ fontSize: '.875rem' }}>{c.nombre}</div>
                            <div className="text-muted" style={{ fontSize: '.75rem' }}>{c.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {c.cedula_profesional ? (
                          <span className="badge bg-secondary-subtle text-secondary-emphasis font-monospace">
                            {c.cedula_profesional}
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="small">{c.ciudad ?? '—'}</td>
                      <td>
                        <AppBadge text={c.membrecia?.plan ?? 'sin plan'} />
                      </td>
                      <td>
                        {c.membrecia?.fecha_vencimiento ? (
                          <span className={`small ${vencido ? 'text-danger fw-semibold' : 'text-muted'}`}>
                            {vencido && <i className="bi bi-exclamation-triangle-fill me-1" />}
                            {new Date(c.membrecia.fecha_vencimiento).toLocaleDateString('es-MX', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <AppBadge text={estadoText} variant={estadoVar} />
                      </td>
                      <td className="pe-4">
                        <div className="d-flex gap-2 flex-wrap">
                          {!c.activo ? (
                            <button
                              className="btn btn-success btn-sm d-flex align-items-center gap-1"
                              onClick={() => activar(c.id)}
                            >
                              <i className="bi bi-check2-circle" /> Activar
                            </button>
                          ) : (
                            <>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                data-bs-toggle="modal"
                                data-bs-target="#modalMembrecia"
                                onClick={() => setSelec(c)}
                              >
                                <i className="bi bi-credit-card me-1" />Membrecía
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => bloquear(c.id)}
                              >
                                <i className="bi bi-slash-circle me-1" />Bloquear
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtrados.length > 0 && (
            <div className="card-footer bg-transparent text-muted small px-4 py-2">
              Mostrando {filtrados.length} de {lista.length} consultorios
            </div>
          )}
        </div>
      )}

      {/* Modal membrecía */}
      <AppModal
        id="modalMembrecia"
        title={`Membrecía — ${seleccionado?.nombre ?? ''}`}
        footer={
          <>
            <button className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button form="formMembrecia" type="submit" className="btn btn-primary">
              <i className="bi bi-save me-1" />Guardar cambios
            </button>
          </>
        }
      >
        <form id="formMembrecia" onSubmit={actualizar}>
          <div className="mb-4">
            <label className="form-label fw-medium">Plan de membrecía</label>
            <div className="row g-2">
              {[
                { v: 'gratuito', label: 'Gratuito',  desc: '20 citas / mes',             icon: 'bi-gift',      color: '#64748b' },
                { v: 'basico',   label: 'Básico',    desc: '100 citas / mes',             icon: 'bi-star',      color: 'var(--bb-primary)' },
                { v: 'premium',  label: 'Premium',   desc: 'Ilimitado + notif. WhatsApp', icon: 'bi-lightning-charge-fill', color: '#d97706' },
              ].map(p => (
                <div key={p.v} className="col-12">
                  <label
                    className={`d-flex align-items-center gap-3 p-3 rounded-3 border cursor-pointer ${form.plan === p.v ? 'border-primary' : ''}`}
                    style={{
                      cursor: 'pointer',
                      background: form.plan === p.v ? 'rgba(var(--bb-primary-rgb),.06)' : 'transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name="plan_radio"
                      className="form-check-input flex-shrink-0"
                      checked={form.plan === p.v}
                      onChange={() => setForm(f => ({ ...f, plan: p.v }))}
                    />
                    <i className={`bi ${p.icon}`} style={{ color: p.color, fontSize: '1.1rem', width: '1.2rem', textAlign: 'center' }} />
                    <div>
                      <div className="fw-semibold small">{p.label}</div>
                      <div className="text-muted" style={{ fontSize: '.75rem' }}>{p.desc}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label fw-medium">Vigencia (días)</label>
            <div className="d-flex gap-2 mb-2 flex-wrap">
              {[30, 90, 180, 365].map(d => (
                <button
                  key={d}
                  type="button"
                  className={`btn btn-sm ${form.dias_vigencia == d ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setForm(f => ({ ...f, dias_vigencia: d }))}
                >
                  {d === 365 ? '1 año' : `${d} días`}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="365"
              className="form-control form-control-sm"
              value={form.dias_vigencia}
              onChange={e => setForm(f => ({ ...f, dias_vigencia: Number(e.target.value) }))}
            />
          </div>
        </form>
      </AppModal>
    </>
  );
}

export default function AdminConsultoriosPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ConsultoriosContent />
    </Suspense>
  );
}
