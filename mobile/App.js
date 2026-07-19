import { useState } from 'react';
import { I18nManager, ScrollView, StatusBar, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Workers from './src/components/Workers';
import Attendance from './src/components/Attendance';
import Payroll from './src/components/Payroll';
import { colors } from './src/theme';

const TABS = [
  { id: 'workers', label: '👷 کارگران' },
  { id: 'attendance', label: '📋 حضور و غیاب' },
  { id: 'payroll', label: '💰 محاسبه حقوق' },
];

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default function App() {
  const [tab, setTab] = useState('workers');
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.app}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>سیستم حضور و حقوق کارگران</Text>
          <View style={styles.monthNav}>
            <TouchableOpacity style={styles.monthNavBtn} onPress={prevMonth}>
              <Text style={styles.monthNavBtnText}>◀ قبلی</Text>
            </TouchableOpacity>
            <Text style={styles.monthDisplay}>{month}/{year}</Text>
            <TouchableOpacity style={styles.monthNavBtn} onPress={nextMonth}>
              <Text style={styles.monthNavBtnText}>بعدی ▶</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabs}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
              onPress={() => setTab(t.id)}
            >
              <Text style={[styles.tabBtnText, tab === t.id && styles.tabBtnTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {tab === 'workers' && <Workers />}
          {tab === 'attendance' && <Attendance year={year} month={month} />}
          {tab === 'payroll' && <Payroll year={year} month={month} />}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.primaryDark,
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    gap: 12,
  },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: 'bold', textAlign: 'right' },
  monthNav: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  monthNavBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  monthNavBtnText: { color: colors.white, fontSize: 13 },
  monthDisplay: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  tabs: { flexDirection: 'row-reverse', gap: 8, padding: 16, paddingBottom: 8 },
  tabBtn: {
    flex: 1, paddingVertical: 12, borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.white, borderRadius: 10, alignItems: 'center',
  },
  tabBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  tabBtnText: { color: colors.mutedDark, fontSize: 13 },
  tabBtnTextActive: { color: colors.white, fontWeight: 'bold' },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingTop: 8 },
});
