import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { getWorkers, saveWorkers } from '../store';
import { colors } from '../theme';

const defaultForm = {
  name: '',
  role: '',
  type: 'daily',
  dailyWage: '',
  monthlySalary: '',
  overtimeRate: '',
};

function fmt(n) {
  return Number(n || 0).toLocaleString('fa-IR');
}

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    getWorkers().then(setWorkers);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!form.name.trim()) {
      Alert.alert('خطا', 'نام کارگر را وارد کنید');
      return;
    }
    const updated = editId
      ? workers.map(w => (w.id === editId ? { ...w, ...form, id: editId } : w))
      : [...workers, { ...form, id: Date.now().toString() }];
    await saveWorkers(updated);
    setWorkers(updated);
    setForm(defaultForm);
    setEditId(null);
    setShowForm(false);
  }

  function remove(id) {
    Alert.alert('حذف کارگر', 'حذف شود؟', [
      { text: 'انصراف', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          const updated = workers.filter(w => w.id !== id);
          await saveWorkers(updated);
          setWorkers(updated);
        },
      },
    ]);
  }

  function startEdit(w) {
    setForm({
      name: w.name,
      role: w.role || '',
      type: w.type,
      dailyWage: w.dailyWage != null ? String(w.dailyWage) : '',
      monthlySalary: w.monthlySalary != null ? String(w.monthlySalary) : '',
      overtimeRate: w.overtimeRate != null ? String(w.overtimeRate) : '',
    });
    setEditId(w.id);
    setShowForm(true);
  }

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>لیست کارگران</Text>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => { setForm(defaultForm); setEditId(null); setShowForm(true); }}
        >
          <Text style={styles.btnPrimaryText}>+ افزودن کارگر</Text>
        </TouchableOpacity>
      </View>

      {workers.length === 0 ? (
        <Text style={styles.emptyState}>هیچ کارگری ثبت نشده است</Text>
      ) : (
        workers.map(w => (
          <View key={w.id} style={styles.card}>
            <Text style={styles.workerName}>{w.name}</Text>
            {!!w.role && <Text style={styles.workerRole}>{w.role}</Text>}
            <View style={[styles.badge, styles.badgeBlue]}>
              <Text style={styles.badgeBlueText}>{w.type === 'daily' ? 'روزمزد' : 'ماهیانه ثابت'}</Text>
            </View>
            <Text style={styles.workerWage}>
              {w.type === 'daily'
                ? `دستمزد روزانه: ${fmt(w.dailyWage)} تومان`
                : `حقوق ماهانه: ${fmt(w.monthlySalary)} تومان`}
            </Text>
            {Number(w.overtimeRate) > 0 && (
              <Text style={styles.workerOvertime}>اضافه‌کاری: {fmt(w.overtimeRate)} ت/ساعت</Text>
            )}
            <View style={styles.workerActions}>
              <TouchableOpacity style={styles.btnEdit} onPress={() => startEdit(w)}>
                <Text style={styles.btnEditText}>ویرایش</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDelete} onPress={() => remove(w.id)}>
                <Text style={styles.btnDeleteText}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.formTitle}>{editId ? 'ویرایش کارگر' : 'افزودن کارگر جدید'}</Text>

              <Text style={styles.label}>نام و نام خانوادگی</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={t => setForm(f => ({ ...f, name: t }))}
                placeholder="مثال: علی محمدی"
              />

              <Text style={styles.label}>سمت / شغل</Text>
              <TextInput
                style={styles.input}
                value={form.role}
                onChangeText={t => setForm(f => ({ ...f, role: t }))}
                placeholder="مثال: نگهبان، کارگر ساده"
              />

              <Text style={styles.label}>نوع قرارداد</Text>
              <View style={styles.toggleGroup}>
                <TouchableOpacity
                  style={[styles.toggleBtn, form.type === 'daily' && styles.toggleActivePresent]}
                  onPress={() => setForm(f => ({ ...f, type: 'daily' }))}
                >
                  <Text style={form.type === 'daily' ? styles.toggleActiveText : styles.toggleText}>روزمزد</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, form.type === 'fixed' && styles.toggleActivePresent]}
                  onPress={() => setForm(f => ({ ...f, type: 'fixed' }))}
                >
                  <Text style={form.type === 'fixed' ? styles.toggleActiveText : styles.toggleText}>ماهیانه ثابت</Text>
                </TouchableOpacity>
              </View>

              {form.type === 'daily' ? (
                <>
                  <Text style={styles.label}>دستمزد روزانه (تومان)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={form.dailyWage}
                    onChangeText={t => setForm(f => ({ ...f, dailyWage: t }))}
                    placeholder="0"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>حقوق ماهانه (تومان)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={form.monthlySalary}
                    onChangeText={t => setForm(f => ({ ...f, monthlySalary: t }))}
                    placeholder="0"
                  />
                </>
              )}

              <Text style={styles.label}>نرخ اضافه‌کاری (تومان/ساعت)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={form.overtimeRate}
                onChangeText={t => setForm(f => ({ ...f, overtimeRate: t }))}
                placeholder="0"
              />

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.btnPrimary} onPress={save}>
                  <Text style={styles.btnPrimaryText}>{editId ? 'ذخیره تغییرات' : 'افزودن'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={() => { setShowForm(false); setEditId(null); }}
                >
                  <Text style={styles.btnSecondaryText}>انصراف</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionTitle: { fontSize: 18, color: colors.primaryDark, fontWeight: 'bold', textAlign: 'right' },
  emptyState: { textAlign: 'center', padding: 40, color: colors.muted, fontSize: 15 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderTopWidth: 4,
    borderTopColor: colors.primary,
  },
  workerName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, textAlign: 'right' },
  workerRole: { color: colors.muted, fontSize: 13, marginBottom: 8, textAlign: 'right' },
  workerWage: { fontSize: 14, color: colors.primary, marginVertical: 4, textAlign: 'right' },
  workerOvertime: { fontSize: 13, color: colors.muted, textAlign: 'right' },
  badge: { alignSelf: 'flex-end', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20, marginBottom: 8 },
  badgeBlue: { backgroundColor: colors.badgeBlueBg },
  badgeBlueText: { color: colors.badgeBlueText, fontWeight: 'bold', fontSize: 12 },
  workerActions: { flexDirection: 'row-reverse', gap: 8, marginTop: 12 },
  btnEdit: { flex: 1, backgroundColor: colors.badgeBlueBg, padding: 8, borderRadius: 7, alignItems: 'center' },
  btnEditText: { color: colors.badgeBlueText, fontSize: 13, fontWeight: '600' },
  btnDelete: { flex: 1, backgroundColor: colors.absentBg, padding: 8, borderRadius: 7, alignItems: 'center' },
  btnDeleteText: { color: colors.absentText, fontSize: 13, fontWeight: '600' },
  btnPrimary: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center' },
  btnPrimaryText: { color: colors.white, fontWeight: 'bold', fontSize: 14 },
  btnSecondary: { backgroundColor: '#e2e8f0', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center' },
  btnSecondaryText: { color: colors.mutedDark, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: colors.white, borderRadius: 14, padding: 20, maxHeight: '85%' },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 16, textAlign: 'right' },
  label: { fontSize: 13, color: colors.mutedDark, marginBottom: 6, textAlign: 'right' },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 14,
    textAlign: 'right',
  },
  toggleGroup: { flexDirection: 'row-reverse', borderRadius: 7, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.border, marginBottom: 14, alignSelf: 'flex-end' },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.white },
  toggleActivePresent: { backgroundColor: colors.primary },
  toggleText: { color: colors.mutedDark, fontSize: 13 },
  toggleActiveText: { color: colors.white, fontWeight: 'bold', fontSize: 13 },
  formActions: { flexDirection: 'row-reverse', gap: 10, marginTop: 4 },
});
