'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AppTable from '@/components/ui/AppTable';
import AppBadge from '@/components/ui/AppBadge';
import AppModal from '@/components/ui/AppModal';
import AppAlert from '@/components/ui/AppAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const BLANK = { nombre: '', duracion_minutos: 30, precio: '', descripcion: '' };

export default function TratamientosPage() {
  const [lista, setLista]     = useState([]);
  const [form, setForm]       = useState(BLANK);
  const [editId, setEditId]   = useState(null);
  const [msg, setMsg]         = useState({ text: '', type: 'success' });
  const [loading, setLoading] = useState(true);

  const cargar = () => api.get('/tratamientos').then(r => setLista(r.data)).finally(() => setLoading(false));
  useEffect(() => { cargar(); }, []);

  const handle  = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const abrirEditar = (t) => { setForm(t); setEditId(t.id); };
  const resetForm   = () => { setForm(BLANK); setEditId(null); };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/tratamientos/${editId}`, form);
        setMsg({ text: 'Tratamiento actualizado.', type: 'success' });
      } else {
        await api.post('/tratamientos', form);
        setMsg({ text: 'Tratamiento creado.', type: 'success' });
      }
      resetForm();
      cargar();
      document.getElementById('modalTratamiento')?.querySelector('[data-bs-dismiss]')?.click();
    } catch (err) {
      setMsg({ text: err.message, type: 'danger' });
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este tratamiento?')) return;
    await api.delete(`/tratamientos/${id}`);
    cargar();
  };

  const headers = ['Nombre', 'Duración', 'Precio', 'Estado', 'Acciones'];

  const rows = lista.map(t => (
    <tr key={t.id}>
      <td className="fw-semibold">{t.nombre}</td>
      <td>{t.duracion_minutos} min</td>
      <td>${parseFloat(t.precio).toFixed(2)}</td>
      <td><AppBadge text={t.activo ? 'activa' : 'inactiva'} /></td>
      <td className="d-flex gap-2">
        <button className="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalTratamiento" onClick={() => abrirEditar(t)}>Editar</button>
        <button className="btn btn-outline-danger btn-sm" onClick={() => eliminar(t.id)}>Eliminar</button>
      </td>
    </tr>
  ));

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Tratamientos</h3>
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalTratamiento" onClick={resetForm}>
          + Nuevo tratamiento
        </button>
      </div>

      <AppAlert type={msg.type} message={msg.text} onClose={() => setMsg({ text: '', type: 'success' })} />

      {loading ? <LoadingSpinner /> : <AppTable headers={headers} rows={rows} emptyMessage="No hay tratamientos registrados." />}

      <AppModal id="modalTratamiento" title={editId ? 'Editar tratamiento' : 'Nuevo tratamiento'}
        footer={<><button className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>Cancelar</button><button form="formTratamiento" type="submit" className="btn btn-primary">Guardar</button></>}>
        <form id="formTratamiento" onSubmit={guardar}>
          <div className="mb-3"><label className="form-label">Nombre</label><input name="nombre" className="form-control" value={form.nombre} onChange={handle} required /></div>
          <div className="mb-3"><label className="form-label">Duración (minutos)</label><input name="duracion_minutos" type="number" min="10" max="480" className="form-control" value={form.duracion_minutos} onChange={handle} required /></div>
          <div className="mb-3"><label className="form-label">Precio ($)</label><input name="precio" type="number" step="0.01" min="0" className="form-control" value={form.precio} onChange={handle} required /></div>
          <div className="mb-3"><label className="form-label">Descripción</label><textarea name="descripcion" className="form-control" rows="2" value={form.descripcion || ''} onChange={handle} /></div>
        </form>
      </AppModal>
    </>
  );
}
