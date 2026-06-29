import { useState } from 'react';
import Workers from './components/Workers';
import Attendance from './components/Attendance';
import Payroll from './components/Payroll';
import './index.css';

const TABS = [
  { id: 'workers', label: '👷 کارگران' },
  { id: 'attendance', label: '📋 حضور و غیاب' },
  { id: 'payroll', label: '💰 محاسبه حقوق' },
];

export default function App() {
  const [tab, setTab] = useState('workers');
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  return (
    <div className="app" dir="rtl">
      <header className="app-header">
        <h1>سیستم حضور و حقوق کارگران</h1>
        <div className="month-nav">
          <button onClick={() => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }}>◀ قبلی</button>
          <span className="month-display">{month}/{year}</span>
          <button onClick={() => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }}>بعدی ▶</button>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === 'workers' && <Workers />}
        {tab === 'attendance' && <Attendance year={year} month={month} />}
        {tab === 'payroll' && <Payroll year={year} month={month} />}
      </main>
    </div>
  );
}
