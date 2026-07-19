import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getWorkers, getAttendance, calcPayroll, daysInMonth } from '../store';
import { colors } from '../theme';

function fmt(n) {
  return Number(n || 0).toLocaleString('fa-IR');
}

export default function Payroll({ year, month }) {
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});

  const load = useCallback(() => {
    Promise.all([getWorkers(), getAttendance()]).then(([w, a]) => {
      setWorkers(w);
      setAttendance(a);
    });
  }, []);

  useEffect(() => { load(); }, [load, year, month]);

  if (workers.length === 0) {
    return <Text style={styles.emptyState}>ابتدا کارگران را در بخش «کارگران» ثبت کنید</Text>;
  }

  const days = daysInMonth(year, month);
  const payrolls = workers.map(w => ({ worker: w, ...calcPayroll(w, year, month, attendance) }));
  const grandTotal = payrolls.reduce((s, p) => s + p.total, 0);

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>گزارش حقوق — {month}/{year}</Text>
        <Text style={styles.daysInfo}>تعداد روزهای ماه: {days}</Text>
      </View>

      {payrolls.map(p => (
        <View key={p.worker.id} style={styles.card}>
          <Text style={styles.name}>{p.worker.name}</Text>
          {!!p.worker.role && <Text style={styles.role}>{p.worker.role}</Text>}
          <View style={[styles.badge, p.worker.type === 'fixed' ? styles.badgeGreen : styles.badgeBlue]}>
            <Text style={p.worker.type === 'fixed' ? styles.badgeGreenText : styles.badgeBlueText}>
              {p.worker.type === 'daily' ? 'روزمزد' : 'ماهیانه ثابت'}
            </Text>
          </View>

          <View style={styles.detailTable}>
            {p.worker.type === 'daily' ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailValue}>{p.presentDays} روز</Text>
                  <Text style={styles.detailLabel}>روزهای حاضر</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailValue, styles.absentVal]}>{p.absentDays} روز</Text>
                  <Text style={styles.detailLabel}>روزهای غایب</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailValue}>{fmt(p.base)} تومان</Text>
                  <Text style={styles.detailLabel}>دستمزد پایه</Text>
                </View>
              </>
            ) : (
              <View style={styles.detailRow}>
                <Text style={styles.detailValue}>{fmt(p.base)} تومان</Text>
                <Text style={styles.detailLabel}>حقوق پایه</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{p.overtimeHours} ساعت</Text>
              <Text style={styles.detailLabel}>اضافه‌کاری</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailValue, styles.overtimeVal]}>{fmt(p.overtimePay)} تومان</Text>
              <Text style={styles.detailLabel}>اضافه‌کاری به تومان</Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalValue}>{fmt(p.total)} تومان</Text>
            <Text style={styles.totalLabel}>جمع کل:</Text>
          </View>
        </View>
      ))}

      <View style={styles.grandTotalCard}>
        <Text style={styles.grandTotalValue}>{fmt(grandTotal)} تومان</Text>
        <Text style={styles.grandTotalLabel}>جمع کل حقوق همه کارگران:</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, color: colors.primaryDark, fontWeight: 'bold', textAlign: 'right' },
  daysInfo: { fontSize: 13, color: colors.muted, textAlign: 'right', marginTop: 4 },
  emptyState: { textAlign: 'center', padding: 40, color: colors.muted, fontSize: 15 },
  card: {
    backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12,
    borderTopWidth: 4, borderTopColor: colors.primary,
  },
  name: { fontSize: 16, fontWeight: 'bold', textAlign: 'right', marginBottom: 4 },
  role: { color: colors.muted, fontSize: 13, textAlign: 'right', marginBottom: 8 },
  badge: { alignSelf: 'flex-end', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20, marginBottom: 8 },
  badgeBlue: { backgroundColor: colors.badgeBlueBg },
  badgeBlueText: { color: colors.badgeBlueText, fontWeight: 'bold', fontSize: 12 },
  badgeGreen: { backgroundColor: colors.badgeGreenBg },
  badgeGreenText: { color: colors.badgeGreenText, fontWeight: 'bold', fontSize: 12 },
  detailTable: { marginVertical: 8 },
  detailRow: {
    flexDirection: 'row-reverse', justifyContent: 'space-between',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0f4f8',
  },
  detailLabel: { fontSize: 13, color: colors.text },
  detailValue: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  absentVal: { color: colors.absentText },
  overtimeVal: { color: colors.badgeGreenText },
  totalRow: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, paddingTop: 8, borderTopWidth: 2, borderTopColor: '#e2e8f0',
  },
  totalLabel: { fontSize: 14 },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: colors.primaryDark },
  grandTotalCard: {
    backgroundColor: colors.primaryDark, borderRadius: 12, padding: 20,
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  grandTotalLabel: { color: colors.white, fontSize: 15 },
  grandTotalValue: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
});
