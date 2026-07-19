import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKERS_KEY = 'payroll_workers';
const ATTENDANCE_KEY = 'payroll_attendance';

export async function getWorkers() {
  const raw = await AsyncStorage.getItem(WORKERS_KEY);
  return JSON.parse(raw || '[]');
}

export async function saveWorkers(workers) {
  await AsyncStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
}

export async function getAttendance() {
  const raw = await AsyncStorage.getItem(ATTENDANCE_KEY);
  return JSON.parse(raw || '{}');
}

export async function saveAttendance(attendance) {
  await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
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
