'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AppCard from '@/components/ui/AppCard';
import AppBadge from '@/components/ui/AppBadge';
import AppAlert from '@/components/ui/AppAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ConsultorioDashboard() {
  const { user }              = useAuth();
  const [citas, setCitas]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState({ text: '', type: 'success' });

  const cargar = () => {
    setLoading(true);
    api.get('/consultorio/agenda')
      .then(r => setCitas(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const cambiarEstado = async (id, estado) => {
    try {
      await api.patch(`/consultorio/citas/${id}/estado`, { estado });
      setMsg({ text: `Cita marcada como ${estado}.`, type: 'success' });
      cargar();
    } catch (err) {
      setMsg({ text: err.message, type: 'danger' });
    }
  };

  const membrecia = user?.consultorio?.membrecia;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">{user?.consultorio?.nombre ?? user?.name}</h3>
          <p className="text-muted mb-0">
            Agenda de hoy —{' '}
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {membrecia && <AppBadge text={membrecia.plan} />}
      </div>

      {/* Estadísticas */}
      <div className="row g-4 mb-4">
        {[
          { label: 'Citas hoy',   value: citas.length,                                          color: 'primary' },
          { label: 'Confirmadas', value: citas.filter(c => c.estado === 'confirmada').length,   color: 'success' },
          { label: 'Pendientes',  value: citas.filter(c => c.estado === 'pendiente').length,    color: 'warning' },
          { label: 'Completadas', value: citas.filter(c => c.estado === 'completada').length,   color: 'secondary' },
        ].map(s => (
          <div key={s.label} className="col-6 col-md-3">
            <div className={`card border-0 shadow-sm text-bg-${s.color}`}>
              <div className="card-body text-center py-3">
                <h2 className="fw-bold display-6 mb-0">{s.value}</h2>
                <p className="mb-0 opacity-75 small">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AppAlert type={msg.type} message={msg.text} onClose={() => setMsg({ text: '', type: 'success' })} />

      {/* Lista de citas */}
      <AppCard title="Citas de hoy" subtitle="Gestiona el estado de cada cita">
        {loading ? <LoadingSpinner /> : citas.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">No hay citas agendadas para hoy.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {citas.map(c => (
              <li key={c.id} className="list-group-item px-0 py-3">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">

                  {/* Info de la cita */}
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-center" style={{ minWidth: '3rem' }}>
                      <div className="fw-bold">{c.hora_inicio}</div>
                      <div className="text-muted small">{c.hora_fin}</div>
                    </div>
                    <div>
                      <div className="fw-semibold">{c.paciente?.user?.name}</div>
                      <div className="text-muted small">
                        {c.tratamiento?.nombre}
                        <span className="ms-1 opacity-75">({c.tratamiento?.duracion_minutos} min)</span>
                      </div>
                      {c.notas && (
                        <div className="text-muted small fst-italic mt-1">
                          <i className="bi bi-chat-left-text me-1" />{c.notas}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estado + acciones */}
                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <AppBadge text={c.estado} />
                    {c.estado === 'pendiente' && (
                      <button
                        className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                        onClick={() => cambiarEstado(c.id, 'confirmada')}
                      >
                        <i className="bi bi-check2" /> Confirmar
                      </button>
                    )}
                    {c.estado === 'confirmada' && (
                      <button
                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                        onClick={() => cambiarEstado(c.id, 'completada')}
                      >
                        <i className="bi bi-check2-all" /> Completar
                      </button>
                    )}
                  </div>

                </div>
              </li>
            ))}
          </ul>
        )}
      </AppCard>
    </>
  );
}
