import { useState, useEffect } from 'react';
import { getWorkers, getAttendance, calcPayroll, daysInMonth } from '../store';

export default function Payroll({ year, month }) {
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    setWorkers(getWorkers());
    setAttendance(getAttendance());
  }, [year, month]);

  if (workers.length === 0) {
    return <div className="empty-state">ابتدا کارگران را در بخش «کارگران» ثبت کنید</div>;
  }

  const days = daysInMonth(year, month);
  const payrolls = workers.map(w => ({ worker: w, ...calcPayroll(w, year, month, attendance) }));
  const grandTotal = payrolls.reduce((s, p) => s + p.total, 0);

  function fmt(n) {
    return Number(n || 0).toLocaleString('fa-IR');
  }

  return (
    <div>
      <div className="section-header">
        <h2>گزارش حقوق — {month}/{year}</h2>
        <span className="days-info">تعداد روزهای ماه: {days}</span>
      </div>

      <div className="payroll-cards">
        {payrolls.map(p => (
          <div key={p.worker.id} className="payroll-card">
            <div className="payroll-name">{p.worker.name}</div>
            {p.worker.role && <div className="payroll-role">{p.worker.role}</div>}
            <div className={`payroll-type badge ${p.worker.type === 'fixed' ? 'badge-fixed' : 'badge-daily'}`}>
              {p.worker.type === 'daily' ? 'روزمزد' : 'ماهیانه ثابت'}
            </div>

            <table className="payroll-detail-table">
              <tbody>
                {p.worker.type === 'daily' ? (
                  <>
                    <tr><td>روزهای حاضر</td><td>{p.presentDays} روز</td></tr>
                    <tr><td>روزهای غایب</td><td className="absent-val">{p.absentDays} روز</td></tr>
                    <tr><td>دستمزد پایه</td><td>{fmt(p.base)} تومان</td></tr>
                  </>
                ) : (
                  <tr><td>حقوق پایه</td><td>{fmt(p.base)} تومان</td></tr>
                )}
                <tr><td>اضافه‌کاری</td><td>{p.overtimeHours} ساعت</td></tr>
                <tr><td>اضافه‌کاری به تومان</td><td className="overtime-val">{fmt(p.overtimePay)} تومان</td></tr>
              </tbody>
            </table>

            <div className="payroll-total">
              جمع کل: <strong>{fmt(p.total)}</strong> تومان
            </div>
          </div>
        ))}
      </div>

      <div className="grand-total-card">
        <span>جمع کل حقوق همه کارگران:</span>
        <strong>{fmt(grandTotal)} تومان</strong>
      </div>

      <button className="btn-print" onClick={() => window.print()}>🖨️ چاپ / ذخیره PDF</button>
    </div>
  );
}
