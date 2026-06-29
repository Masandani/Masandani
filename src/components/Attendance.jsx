import { useState, useEffect } from 'react';
import { getWorkers, getAttendance, saveAttendance, getAttendanceKey, daysInMonth } from '../store';

export default function Attendance({ year, month }) {
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  useEffect(() => {
    setWorkers(getWorkers());
    setAttendance(getAttendance());
  }, []);

  const days = daysInMonth(year, month);

  function setRecord(workerId, field, value) {
    const key = getAttendanceKey(year, month, selectedDay, workerId);
    const updated = {
      ...attendance,
      [key]: { ...(attendance[key] || { status: 'absent', overtime: 0 }), [field]: value },
    };
    saveAttendance(updated);
    setAttendance(updated);
  }

  function getRecord(workerId) {
    const key = getAttendanceKey(year, month, selectedDay, workerId);
    return attendance[key] || { status: 'absent', overtime: 0 };
  }

  function markAllPresent() {
    const updated = { ...attendance };
    workers.forEach(w => {
      const key = getAttendanceKey(year, month, selectedDay, w.id);
      updated[key] = { ...(updated[key] || {}), status: 'present', overtime: updated[key]?.overtime || 0 };
    });
    saveAttendance(updated);
    setAttendance(updated);
  }

  if (workers.length === 0) {
    return <div className="empty-state">ابتدا کارگران را در بخش «کارگران» ثبت کنید</div>;
  }

  const dayArray = Array.from({ length: days }, (_, i) => i + 1);

  return (
    <div>
      <div className="section-header">
        <h2>حضور و غیاب — {month}/{year}</h2>
      </div>

      <div className="day-picker">
        {dayArray.map(d => {
          const anyPresent = workers.some(w => {
            const key = getAttendanceKey(year, month, d, w.id);
            return attendance[key]?.status === 'present';
          });
          return (
            <button
              key={d}
              className={`day-btn${d === selectedDay ? ' selected' : ''}${anyPresent ? ' has-data' : ''}`}
              onClick={() => setSelectedDay(d)}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div className="card">
        <div className="attendance-day-header">
          <h3>روز {selectedDay} ماه {month}</h3>
          <button className="btn-secondary btn-sm" onClick={markAllPresent}>✓ همه حاضر</button>
        </div>

        <table className="attendance-table">
          <thead>
            <tr>
              <th>نام کارگر</th>
              <th>سمت</th>
              <th>وضعیت</th>
              <th>اضافه‌کاری (ساعت)</th>
            </tr>
          </thead>
          <tbody>
            {workers.map(w => {
              const rec = getRecord(w.id);
              return (
                <tr key={w.id} className={rec.status === 'present' ? 'row-present' : 'row-absent'}>
                  <td>{w.name}</td>
                  <td>{w.role || '—'}</td>
                  <td>
                    <div className="toggle-group">
                      <button
                        className={`toggle-btn${rec.status === 'present' ? ' active-present' : ''}`}
                        onClick={() => setRecord(w.id, 'status', 'present')}
                      >حاضر</button>
                      <button
                        className={`toggle-btn${rec.status === 'absent' ? ' active-absent' : ''}`}
                        onClick={() => setRecord(w.id, 'status', 'absent')}
                      >غایب</button>
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="overtime-input"
                      min="0"
                      max="12"
                      step="0.5"
                      value={rec.overtime || ''}
                      placeholder="0"
                      onChange={e => setRecord(w.id, 'overtime', e.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
