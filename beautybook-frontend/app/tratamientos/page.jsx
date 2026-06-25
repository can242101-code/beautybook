'use client';
import { useEffect, useState } from 'react';

/**
 * HU02 - Visualización de tratamientos y precios del consultorio
 * Desarrollado por: Manuel Alfonso Castro Escalante
 */
export default function TratamientosPage({ params }) {
  const [tratamientos, setTratamientos] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetch(`/api/consultorios/${params.id}/tratamientos`)
      .then(r => r.json())
      .then(data => { setTratamientos(data); setLoading(false); });
  }, [params.id]);

  if (loading) return <p className="text-center mt-10">Cargando tratamientos...</p>;

  return (
    <section className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Tratamientos disponibles</h1>
      <ul className="divide-y divide-gray-200">
        {tratamientos.map(t => (
          <li key={t.id} className="py-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{t.nombre}</p>
              <p className="text-sm text-gray-500">{t.descripcion}</p>
            </div>
            <span className="text-green-600 font-bold">${t.precio} MXN</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
