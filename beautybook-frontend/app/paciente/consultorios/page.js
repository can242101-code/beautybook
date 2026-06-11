'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AppCard from '@/components/ui/AppCard';
import AppBadge from '@/components/ui/AppBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function ConsultoriosPublicosPage() {
  const [consultorios, setConsultorios] = useState([]);
  const [ciudad, setCiudad]             = useState('');
  const [loading, setLoading]           = useState(false);

  const buscar = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.get(`/consultorios${ciudad ? `?ciudad=${encodeURIComponent(ciudad)}` : ''}`);
      setConsultorios(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { buscar(); }, []);

  return (
    <>
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Consultorios disponibles</h3>
        <p className="text-muted">Encuentra un dentista y agenda tu cita.</p>
      </div>

      <form onSubmit={buscar} className="d-flex gap-2 mb-4">
        <input
          className="form-control"
          placeholder="Buscar por ciudad..."
          value={ciudad}
          onChange={e => setCiudad(e.target.value)}
        />
        <button type="submit" className="btn btn-primary px-4">Buscar</button>
      </form>

      {loading ? <LoadingSpinner /> : (
        <div className="row g-4">
          {consultorios.length === 0 ? (
            <div className="col-12 text-center text-muted py-5">No se encontraron consultorios.</div>
          ) : consultorios.map(c => (
            <div key={c.id} className="col-md-6 col-lg-4">
              <AppCard title={c.nombre} subtitle={`${c.ciudad} · ${c.direccion}`}>
                <p className="text-muted small mb-3">{c.descripcion || 'Sin descripción.'}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <AppBadge text={c.membrecia?.plan ?? 'gratuito'} />
                  <span className="text-muted small">{c.tratamientos?.length ?? 0} tratamientos</span>
                </div>
                <Link className="btn btn-primary btn-sm w-100 mt-3" href={`/paciente/consultorios/${c.id}`}>
                  Ver y agendar
                </Link>
              </AppCard>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
