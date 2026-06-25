'use client';
import { useState, useEffect } from 'react';

/**
 * HU07 - Panel de gestión de agenda del consultorio
 * Desarrollado por: Manuel Alfonso Castro Escalante
 */
export default function PanelConsultorioPage() {
  const [citas, setCitas]     = useState([]);
  const [fecha, setFecha]     = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const cargarCitas = async () => {
    setLoading(true);
    const r = await fetch(`/api/panel/citas?fecha=${fecha}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await r.json();
    setCitas(data.data ?? []);
    setLoading(false);
  };

  useEffect(() => { cargarCitas(); }, [fecha]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de agenda</h1>
      <input
        type="date" value={fecha}
        onChange={e => setFecha(e.target.value)}
        className="border rounded px-3 py-2 mb-6"
      />
      {loading ? (
        <p>Cargando citas...</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2 text-left">Hora</th>
              <th className="border px-4 py-2 text-left">Paciente</th>
              <th className="border px-4 py-2 text-left">Tratamiento</th>
              <th className="border px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {citas.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{c.hora_inicio}</td>
                <td className="border px-4 py-2">{c.paciente?.nombre}</td>
                <td className="border px-4 py-2">{c.tratamiento?.nombre}</td>
                <td className="border px-4 py-2 capitalize">{c.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
