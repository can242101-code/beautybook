'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AppTable from '@/components/ui/AppTable';
import AppBadge from '@/components/ui/AppBadge';
import AppAlert from '@/components/ui/AppAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function MisCitasPage() {
  const [citas, setCitas]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState('');

  const cargar = () => {
    setLoading(true);
    api.get('/citas').then(r => setCitas(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const cancelar = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    try {
      await api.patch(`/citas/${id}/cancelar`);
      setMsg('Cita cancelada correctamente.');
      cargar();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const headers = ['Tratamiento', 'Consultorio', 'Fecha', 'Hora', 'Estado', 'Acciones'];

  const rows = citas.map(c => (
    <tr key={c.id}>
      <td>{c.tratamiento?.nombre}</td>
      <td>{c.consultorio?.nombre}</td>
      <td>{c.fecha}</td>
      <td>{c.hora_inicio}</td>
      <td><AppBadge text={c.estado} /></td>
      <td>
        {['pendiente', 'confirmada'].includes(c.estado) && (
          <button className="btn btn-outline-danger btn-sm" onClick={() => cancelar(c.id)}>
            Cancelar
          </button>
        )}
      </td>
    </tr>
  ));

  return (
    <>
      <h3 className="fw-bold mb-4">Mis citas</h3>
      <AppAlert type="info" message={msg} onClose={() => setMsg('')} />
      {loading ? <LoadingSpinner /> : <AppTable headers={headers} rows={rows} emptyMessage="Aún no tienes citas agendadas." />}
    </>
  );
}
