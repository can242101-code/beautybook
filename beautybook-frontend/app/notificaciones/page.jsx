'use client';
import { useEffect, useState } from 'react';

/**
 * HU08 - Centro de notificaciones del paciente
 * Desarrollado por: Flor Yazmín Cordero Estañol
 */
export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    fetch('/api/notificaciones', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then(data => setNotificaciones(data.data ?? []));
  }, []);

  const marcarLeida = async (id) => {
    await fetch(`/api/notificaciones/${id}/leer`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    );
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Notificaciones</h1>
      {notificaciones.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No tienes notificaciones.</p>
      ) : (
        <ul className="space-y-3">
          {notificaciones.map(n => (
            <li
              key={n.id}
              className={`p-4 rounded-lg border ${n.leida ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
            >
              <p className="font-medium">{n.titulo}</p>
              <p className="text-sm text-gray-500 mt-1">{n.mensaje}</p>
              {!n.leida && (
                <button
                  onClick={() => marcarLeida(n.id)}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  Marcar como leída
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
