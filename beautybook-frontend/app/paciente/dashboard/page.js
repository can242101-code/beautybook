'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AppCard from '@/components/ui/AppCard';
import AppBadge from '@/components/ui/AppBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function PacienteDashboard() {
  const { user }         = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/citas')
      .then(r => setCitas(r.data))
      .finally(() => setLoading(false));
  }, []);

  const proximas = citas.filter(c => c.estado !== 'cancelada' && c.estado !== 'completada').slice(0, 3);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Bienvenido, {user?.name}</h3>
          <p className="text-muted mb-0">Gestiona tus citas dentales</p>
        </div>
        <Link className="btn btn-primary" href="/paciente/consultorios">
          + Nueva cita
        </Link>
      </div>

      <div className="row g-4 mb-4">
        {[
          { label: 'Citas totales',    value: citas.length,                                          color: 'primary' },
          { label: 'Próximas',         value: proximas.length,                                       color: 'success' },
          { label: 'Canceladas',       value: citas.filter(c => c.estado === 'cancelada').length,    color: 'danger' },
        ].map(s => (
          <div key={s.label} className="col-md-4">
            <div className={`card border-0 shadow-sm text-bg-${s.color}`}>
              <div className="card-body text-center py-4">
                <h2 className="fw-bold display-5 mb-0">{s.value}</h2>
                <p className="mb-0 opacity-75">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AppCard title="Próximas citas" subtitle="Tus citas más cercanas">
        {loading ? <LoadingSpinner /> : proximas.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <p>No tienes citas próximas.</p>
            <Link className="btn btn-outline-primary" href="/paciente/consultorios">Agendar ahora</Link>
          </div>
        ) : (
          <ul className="list-group list-group-flush">
            {proximas.map(c => (
              <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{c.tratamiento?.nombre}</strong>
                  <span className="text-muted ms-2 small">{c.consultorio?.nombre}</span>
                  <div className="text-muted small">{c.fecha} a las {c.hora_inicio}</div>
                </div>
                <AppBadge text={c.estado} />
              </li>
            ))}
          </ul>
        )}
      </AppCard>
    </>
  );
}
