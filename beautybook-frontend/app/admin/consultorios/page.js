'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AppTable from '@/components/ui/AppTable';
import AppBadge from '@/components/ui/AppBadge';
import AppModal from '@/components/ui/AppModal';
import AppAlert from '@/components/ui/AppAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminConsultoriosPage() {
  const [lista, setLista]         = useState([]);
  const [seleccionado, setSelec]  = useState(null);
  const [form, setForm]           = useState({ plan: 'basico', dias_vigencia: 30 });
  const [msg, setMsg]             = useState({ text: '', type: 'success' });
  const [loading, setLoading]     = useState(true);

  const cargar = () => api.get('/admin/consultorios').then(r => setLista(r.data)).finally(() => setLoading(false));
  useEffect(() => { cargar(); }, []);

  const actualizar = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/consultorios/${seleccionado.id}/membrecia`, form);
      setMsg({ text: 'Membrecía actualizada.', type: 'success' });
      cargar();
      document.getElementById('modalMembrecia')?.querySelector('[data-bs-dismiss]')?.click();
    } catch (err) {
      setMsg({ text: err.message, type: 'danger' });
    }
  };

  const bloquear = async (id) => {
    if (!confirm('¿Bloquear este consultorio?')) return;
    await api.patch(`/admin/consultorios/${id}/bloquear`);
    setMsg({ text: 'Consultorio bloqueado.', type: 'warning' });
    cargar();
  };

  const headers = ['Consultorio', 'Ciudad', 'Plan', 'Vence', 'Estado', 'Acciones'];

  const rows = lista.map(c => (
    <tr key={c.id}>
      <td><strong>{c.nombre}</strong><br /><small className="text-muted">{c.user?.email}</small></td>
      <td>{c.ciudad}</td>
      <td><AppBadge text={c.membrecia?.plan ?? 'sin plan'} /></td>
      <td className="small">{c.membrecia?.fecha_vencimiento ?? '—'}</td>
      <td><AppBadge text={c.activo ? 'activa' : 'bloqueada'} variant={c.activo ? 'success' : 'danger'} /></td>
      <td className="d-flex gap-2">
        <button className="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalMembrecia" onClick={() => setSeleccionado(c)}>
          Membrecía
        </button>
        {c.activo && <button className="btn btn-outline-danger btn-sm" onClick={() => bloquear(c.id)}>Bloquear</button>}
      </td>
    </tr>
  ));

  return (
    <>
      <h3 className="fw-bold mb-4">Administración de consultorios</h3>
      <AppAlert type={msg.type} message={msg.text} onClose={() => setMsg({ text: '', type: 'success' })} />
      {loading ? <LoadingSpinner /> : <AppTable headers={headers} rows={rows} emptyMessage="No hay consultorios registrados." />}

      <AppModal id="modalMembrecia" title={`Membrecía — ${seleccionado?.nombre}`}
        footer={<><button className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button><button form="formMembrecia" type="submit" className="btn btn-primary">Actualizar</button></>}>
        <form id="formMembrecia" onSubmit={actualizar}>
          <div className="mb-3">
            <label className="form-label">Plan</label>
            <select className="form-select" value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
              <option value="gratuito">Gratuito (20 citas/mes)</option>
              <option value="basico">Básico (100 citas/mes)</option>
              <option value="premium">Premium (ilimitado + WhatsApp)</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Vigencia (días)</label>
            <input type="number" min="1" max="365" className="form-control" value={form.dias_vigencia} onChange={e => setForm(f => ({ ...f, dias_vigencia: e.target.value }))} />
          </div>
        </form>
      </AppModal>
    </>
  );
}
