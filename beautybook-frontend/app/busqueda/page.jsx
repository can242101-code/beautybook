'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * HU01 - Búsqueda de consultorios por nombre o especialidad
 * Desarrollado por: Flor Yazmín Cordero Estañol
 */
export default function BusquedaPage() {
  const [query, setQuery]           = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando]     = useState(false);
  const router = useRouter();

  const buscar = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBuscando(true);
    const r = await fetch(`/api/consultorios?q=${encodeURIComponent(query)}`);
    const data = await r.json();
    setResultados(data.data ?? []);
    setBuscando(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
        Encuentra tu consultorio dental
      </h1>

      <form onSubmit={buscar} className="flex gap-3 max-w-2xl mx-auto mb-10">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre, especialidad o ubicación..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          disabled={buscando}
        >
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {resultados.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
            <h2 className="text-lg font-bold">{c.nombre}</h2>
            <p className="text-sm text-gray-500 mb-2">{c.especialidad}</p>
            <p className="text-sm text-gray-400 mb-4">{c.direccion}</p>
            <button
              onClick={() => router.push(`/consultorios/${c.id}`)}
              className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-100"
            >
              Ver disponibilidad
            </button>
          </div>
        ))}
        {resultados.length === 0 && !buscando && query && (
          <p className="col-span-3 text-center text-gray-500">
            No se encontraron consultorios para "{query}".
          </p>
        )}
      </div>
    </main>
  );
}
