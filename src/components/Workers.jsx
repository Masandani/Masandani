import { useState, useEffect } from 'react';
import { getWorkers, saveWorkers } from '../store';

const defaultForm = {
  name: '',
  role: '',
  type: 'daily',
  dailyWage: '',
  monthlySalary: '',
  overtimeRate: '',
};

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { setWorkers(getWorkers()); }, []);

  function save() {
    if (!form.name.trim()) return alert('نام کارگر را وارد کنید');
    const updated = editId
      ? workers.map(w => w.id === editId ? { ...w, ...form, id: editId } : w)
      : [...workers, { ...form, id: Date.now().toString() }];
    saveWorkers(updated);
    setWorkers(updated);
    setForm(defaultForm);
    setEditId(null);
    setShowForm(false);
  }

  function remove(id) {
    if (!confirm('حذف شود؟')) return;
    const updated = workers.filter(w => w.id !== id);
    saveWorkers(updated);
    setWorkers(updated);
  }

  function startEdit(w) {
    setForm({ name: w.name, role: w.role || '', type: w.type, dailyWage: w.dailyWage || '', monthlySalary: w.monthlySalary || '', overtimeRate: w.overtimeRate || '' });
    setEditId(w.id);
    setShowForm(true);
  }

  return (
    <div>
      <div className="section-header">
        <h2>لیست کارگران</h2>
        <button className="btn-primary" onClick={() => { setForm(defaultForm); setEditId(null); setShowForm(true); }}>+ افزودن کارگر</button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>{editId ? 'ویرایش کارگر' : 'افزودن کارگر جدید'}</h3>
          <div className="form-grid">
            <label>نام و نام خانوادگی
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: علی محمدی" />
            </label>
            <label>سمت / شغل
              <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="مثال: نگهبان، کارگر ساده" />
            </label>
            <label>نوع قرارداد
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="daily">روزمزد</option>
                <option value="fixed">ماهیانه ثابت</option>
              </select>
            </label>
            {form.type === 'daily' ? (
              <label>دستمزد روزانه (تومان)
                <input type="number" value={form.dailyWage} onChange={e => setForm(f => ({ ...f, dailyWage: e.target.value }))} placeholder="0" />
              </label>
            ) : (
              <label>حقوق ماهانه (تومان)
                <input type="number" value={form.monthlySalary} onChange={e => setForm(f => ({ ...f, monthlySalary: e.target.value }))} placeholder="0" />
              </label>
            )}
            <label>نرخ اضافه‌کاری (تومان/ساعت)
              <input type="number" value={form.overtimeRate} onChange={e => setForm(f => ({ ...f, overtimeRate: e.target.value }))} placeholder="0" />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={save}>{editId ? 'ذخیره تغییرات' : 'افزودن'}</button>
            <button className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>انصراف</button>
          </div>
        </div>
      )}

      {workers.length === 0 ? (
        <div className="empty-state">هیچ کارگری ثبت نشده است</div>
      ) : (
        <div className="workers-grid">
          {workers.map(w => (
            <div key={w.id} className="worker-card">
              <div className="worker-name">{w.name}</div>
              {w.role && <div className="worker-role">{w.role}</div>}
              <div className="worker-type badge">{w.type === 'daily' ? 'روزمزد' : 'ماهیانه ثابت'}</div>
              <div className="worker-wage">
                {w.type === 'daily'
                  ? `دستمزد روزانه: ${Number(w.dailyWage).toLocaleString('fa-IR')} تومان`
                  : `حقوق ماهانه: ${Number(w.monthlySalary).toLocaleString('fa-IR')} تومان`}
              </div>
              {w.overtimeRate > 0 && (
                <div className="worker-overtime">اضافه‌کاری: {Number(w.overtimeRate).toLocaleString('fa-IR')} ت/ساعت</div>
              )}
              <div className="worker-actions">
                <button className="btn-edit" onClick={() => startEdit(w)}>ویرایش</button>
                <button className="btn-delete" onClick={() => remove(w.id)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
