import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { getWorkers, getAttendance, saveAttendance, getAttendanceKey, daysInMonth } from '../store';
import { colors } from '../theme';

export default function Attendance({ year, month }) {
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const load = useCallback(() => {
    Promise.all([getWorkers(), getAttendance()]).then(([w, a]) => {
      setWorkers(w);
      setAttendance(a);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const days = daysInMonth(year, month);

  async function setRecord(workerId, field, value) {
    const key = getAttendanceKey(year, month, selectedDay, workerId);
    const updated = {
      ...attendance,
      [key]: { ...(attendance[key] || { status: 'absent', overtime: 0 }), [field]: value },
    };
    await saveAttendance(updated);
    setAttendance(updated);
  }

  function getRecord(workerId) {
    const key = getAttendanceKey(year, month, selectedDay, workerId);
    return attendance[key] || { status: 'absent', overtime: 0 };
  }

  async function markAllPresent() {
    const updated = { ...attendance };
    workers.forEach(w => {
      const key = getAttendanceKey(year, month, selectedDay, w.id);
      updated[key] = { ...(updated[key] || {}), status: 'present', overtime: updated[key]?.overtime || 0 };
    });
    await saveAttendance(updated);
    setAttendance(updated);
  }

  if (workers.length === 0) {
    return <Text style={styles.emptyState}>ابتدا کارگران را در بخش «کارگران» ثبت کنید</Text>;
  }

  const dayArray = Array.from({ length: days }, (_, i) => i + 1);

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>حضور و غیاب — {month}/{year}</Text>
      </View>

      <View style={styles.dayPicker}>
        <ScrollView horizontal inverted showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayPickerContent}>
          {dayArray.map(d => {
            const anyPresent = workers.some(w => {
              const key = getAttendanceKey(year, month, d, w.id);
              return attendance[key]?.status === 'present';
            });
            const selected = d === selectedDay;
            return (
              <TouchableOpacity
                key={d}
                style={[
                  styles.dayBtn,
                  selected && styles.dayBtnSelected,
                  !selected && anyPresent && styles.dayBtnHasData,
                ]}
                onPress={() => setSelectedDay(d)}
              >
                <Text style={selected ? styles.dayBtnTextSelected : styles.dayBtnText}>{d}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayHeaderTitle}>روز {selectedDay} ماه {month}</Text>
          <TouchableOpacity style={styles.btnSecondarySm} onPress={markAllPresent}>
            <Text style={styles.btnSecondarySmText}>✓ همه حاضر</Text>
          </TouchableOpacity>
        </View>

        {workers.map(w => {
          const rec = getRecord(w.id);
          const present = rec.status === 'present';
          return (
            <View key={w.id} style={[styles.row, present ? styles.rowPresent : styles.rowAbsent]}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{w.name}</Text>
                {!!w.role && <Text style={styles.rowRole}>{w.role}</Text>}
              </View>
              <View style={styles.toggleGroup}>
                <TouchableOpacity
                  style={[styles.toggleBtn, present && styles.toggleActivePresent]}
                  onPress={() => setRecord(w.id, 'status', 'present')}
                >
                  <Text style={present ? styles.toggleActiveText : styles.toggleText}>حاضر</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, !present && styles.toggleActiveAbsent]}
                  onPress={() => setRecord(w.id, 'status', 'absent')}
                >
                  <Text style={!present ? styles.toggleActiveText : styles.toggleText}>غایب</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.overtimeInput}
                keyboardType="numeric"
                value={rec.overtime ? String(rec.overtime) : ''}
                placeholder="0"
                onChangeText={t => setRecord(w.id, 'overtime', t)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, color: colors.primaryDark, fontWeight: 'bold', textAlign: 'right' },
  emptyState: { textAlign: 'center', padding: 40, color: colors.muted, fontSize: 15 },
  dayPicker: { backgroundColor: colors.white, borderRadius: 12, padding: 10, marginBottom: 16 },
  dayPickerContent: { flexDirection: 'row-reverse', gap: 6, paddingHorizontal: 4 },
  dayBtn: {
    width: 38, height: 38, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 8, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },
  dayBtnSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayBtnHasData: { borderColor: colors.present },
  dayBtnText: { color: colors.mutedDark, fontSize: 14 },
  dayBtnTextSelected: { color: colors.white, fontWeight: 'bold', fontSize: 14 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16 },
  dayHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  dayHeaderTitle: { color: colors.primaryDark, fontSize: 15, fontWeight: 'bold' },
  btnSecondarySm: { backgroundColor: '#e2e8f0', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  btnSecondarySmText: { color: colors.mutedDark, fontSize: 13 },
  row: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f0f4f8', gap: 8,
  },
  rowPresent: { backgroundColor: colors.presentBg },
  rowAbsent: { backgroundColor: colors.absentBg },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  rowRole: { fontSize: 12, color: colors.muted, textAlign: 'right' },
  toggleGroup: { flexDirection: 'row-reverse', borderRadius: 7, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.border },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.white },
  toggleActivePresent: { backgroundColor: colors.present },
  toggleActiveAbsent: { backgroundColor: colors.absent },
  toggleText: { color: colors.mutedDark, fontSize: 12 },
  toggleActiveText: { color: colors.white, fontWeight: 'bold', fontSize: 12 },
  overtimeInput: {
    width: 60, paddingVertical: 6, paddingHorizontal: 6, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 7, fontSize: 13, textAlign: 'center',
  },
});
