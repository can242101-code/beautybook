'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AppTable from '@/components/ui/AppTable';
import AppModal from '@/components/ui/AppModal';
import AppAlert from '@/components/ui/AppAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const DIAS = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
const BLANK = { dia_semana: 'lunes', hora_inicio: '09:00', hora_fin: '18:00' };

export default function HorariosPage() {
  const [lista, setLista]     = useState([]);
  const [form, setForm]       = useState(BLANK);
  const [editId, setEditId]   = useState(null);
  const [msg, setMsg]         = useState({ text: '', type: 'success' });
  const [loading, setLoading] = useState(true);

  const cargar = () => api.get('/horarios').then(r => setLista(r.data)).finally(() => setLoading(false));
  useEffect(() => { cargar(); }, []);

  const handle  = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const resetForm   = () => { setForm(BLANK); setEditId(null); };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/horarios/${editId}`, form);
      } else {
        await api.post('/horarios', form);
      }
      setMsg({ text: 'Horario guardado correctamente.', type: 'success' });
      resetForm();
      cargar();
      document.getElementById('modalHorario')?.querySelector('[data-bs-dismiss]')?.click();
    } catch (err) {
      setMsg({ text: err.message, type: 'danger' });
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este horario?')) return;
    await api.delete(`/horarios/${id}`);
    cargar();
  };

  const headers = ['Día', 'Inicio', 'Fin', 'Acciones'];

  const rows = lista.map(h => (
    <tr key={h.id}>
      <td className="text-capitalize">{h.dia_semana}</td>
      <td>{h.hora_inicio}</td>
      <td>{h.hora_fin}</td>
      <td className="d-flex gap-2">
        <button className="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalHorario" onClick={() => { setForm(h); setEditId(h.id); }}>Editar</button>
        <button className="btn btn-outline-danger btn-sm" onClick={() => eliminar(h.id)}>Eliminar</button>
      </td>
    </tr>
  ));

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Horarios de atención</h3>
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalHorario" onClick={resetForm}>
          + Agregar horario
        </button>
      </div>

      <AppAlert type={msg.type} message={msg.text} onClose={() => setMsg({ text: '', type: 'success' })} />

      {loading ? <LoadingSpinner /> : <AppTable headers={headers} rows={rows} emptyMessage="No hay horarios configurados." />}

      <AppModal id="modalHorario" title={editId ? 'Editar horario' : 'Nuevo horario'}
        footer={<><button className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>Cancelar</button><button form="formHorario" type="submit" className="btn btn-primary">Guardar</button></>}>
        <form id="formHorario" onSubmit={guardar}>
          <div className="mb-3">
            <label className="form-label">Día de la semana</label>
            <select name="dia_semana" className="form-select" value={form.dia_semana} onChange={handle}>
              {DIAS.map(d => <option key={d} value={d} className="text-capitalize">{d}</option>)}
            </select>
          </div>
          <div className="row g-3">
            <div className="col-6"><label className="form-label">Hora inicio</label><input name="hora_inicio" type="time" className="form-control" value={form.hora_inicio} onChange={handle} required /></div>
            <div className="col-6"><label className="form-label">Hora fin</label><input name="hora_fin" type="time" className="form-control" value={form.hora_fin} onChange={handle} required /></div>
          </div>
        </form>
      </AppModal>
    </>
  );
}
