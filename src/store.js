const WORKERS_KEY = 'payroll_workers';
const ATTENDANCE_KEY = 'payroll_attendance';

export function getWorkers() {
  return JSON.parse(localStorage.getItem(WORKERS_KEY) || '[]');
}

export function saveWorkers(workers) {
  localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
}

export function getAttendance() {
  return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '{}');
}

export function saveAttendance(attendance) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
}

export function getAttendanceKey(year, month, day, workerId) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}_${workerId}`;
}

export function getMonthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function calcPayroll(worker, year, month, attendance) {
  const days = daysInMonth(year, month);

  if (worker.type === 'fixed') {
    let overtime = 0;
    for (let d = 1; d <= days; d++) {
      const key = getAttendanceKey(year, month, d, worker.id);
      const rec = attendance[key];
      if (rec && rec.overtime) overtime += Number(rec.overtime);
    }
    const overtimePay = overtime * (worker.overtimeRate || 0);
    return {
      base: worker.monthlySalary,
      overtimeHours: overtime,
      overtimePay,
      deductions: 0,
      total: worker.monthlySalary + overtimePay,
    };
  }

  // Daily wage
  let present = 0;
  let overtime = 0;
  for (let d = 1; d <= days; d++) {
    const key = getAttendanceKey(year, month, d, worker.id);
    const rec = attendance[key];
    if (rec) {
      if (rec.status === 'present') present++;
      if (rec.overtime) overtime += Number(rec.overtime);
    }
  }
  const base = present * worker.dailyWage;
  const overtimePay = overtime * (worker.overtimeRate || 0);
  return {
    base,
    presentDays: present,
    absentDays: days - present,
    overtimeHours: overtime,
    overtimePay,
    total: base + overtimePay,
  };
}
