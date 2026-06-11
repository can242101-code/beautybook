'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AppCard from '@/components/ui/AppCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function AdminDashboard() {
  const [lista, setLista]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/consultorios').then(r => setLista(r.data)).finally(() => setLoading(false));
  }, []);

  const activos  = lista.filter(c => c.activo).length;
  const vencidos = lista.filter(c => c.membrecia && new Date(c.membrecia.fecha_vencimiento) < new Date()).length;

  return (
    <>
      <h3 className="fw-bold mb-4">Panel del gestor</h3>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="row g-4 mb-4">
            {[
              { label: 'Total consultorios', value: lista.length,  color: 'primary' },
              { label: 'Activos',            value: activos,       color: 'success' },
              { label: 'Membrecía vencida',  value: vencidos,      color: 'danger' },
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

          <AppCard title="Acciones rápidas">
            <Link className="btn btn-primary me-2" href="/admin/consultorios">Ver todos los consultorios</Link>
          </AppCard>
        </>
      )}
    </>
  );
}
