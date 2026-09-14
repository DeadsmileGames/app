import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ArrowClockwise, CheckCircle, CloudArrowDown, DeviceMobile, WarningCircle } from 'phosphor-react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Screen } from '../src/components/Screen';
import { TopBar } from '../src/components/TopBar';
import { colors, radius, type } from '../src/theme/tokens';

export default function CheckUpdates() {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Looking for the latest secure update.');
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const runtimeVersion = String(Updates.runtimeVersion || appVersion);

  const checkForUpdates = useCallback(async () => {
    setStatus('checking');
    setMessage('Looking for the latest secure update.');
    if (!Updates.isEnabled) {
      setStatus('development');
      setMessage('Updates are checked in installed production builds.');
      return;
    }
    try {
      const update = await Updates.checkForUpdateAsync();
      setStatus(update.isAvailable ? 'available' : 'current');
      setMessage(update.isAvailable ? 'A new update is ready to download.' : 'This device is running the latest available version.');
    } catch {
      setStatus('error');
      setMessage('We could not check for updates. Your installed version is still available offline.');
    }
  }, []);

  useEffect(() => { checkForUpdates(); }, [checkForUpdates]);

  async function installUpdate() {
    setStatus('downloading');
    setMessage('Downloading and verifying the update.');
    try {
      await Updates.fetchUpdateAsync();
      setStatus('restarting');
      setMessage('Update installed. Restarting Deadsmile Games.');
      await Updates.reloadAsync();
    } catch {
      setStatus('error');
      setMessage('The update could not be installed. You can retry when the connection is stable.');
    }
  }

  const busy = ['checking', 'downloading', 'restarting'].includes(status);
  const Icon = status === 'current' ? CheckCircle : status === 'error' ? WarningCircle : status === 'available' ? CloudArrowDown : ArrowClockwise;

  return (
    <Screen refreshControl={<RefreshControl refreshing={status === 'checking'} onRefresh={checkForUpdates} tintColor={colors.primary} />}>
      <TopBar title="Updates" back />
      <View style={styles.head}>
        <Text style={styles.title}>App updates</Text>
        <Text style={styles.lead}>Keep the catalog, account and notification systems current.</Text>
      </View>

      <View style={styles.hero}>
        <View style={[styles.statusIcon, status === 'current' && styles.statusIconSuccess, status === 'error' && styles.statusIconError]}>
          {busy ? <ActivityIndicator color={colors.onPrimary} /> : <Icon size={28} weight="bold" color={colors.onPrimary} />}
        </View>
        <Text style={styles.statusTitle}>{status === 'available' ? 'Update available' : status === 'current' ? 'Up to date' : status === 'error' ? 'Check unavailable' : status === 'development' ? 'Development build' : status === 'downloading' ? 'Downloading update' : status === 'restarting' ? 'Restarting app' : 'Checking updates'}</Text>
        <Text style={styles.message}>{message}</Text>
        {status === 'available' && (
          <Pressable onPress={installUpdate} style={styles.primaryButton}>
            <CloudArrowDown size={20} weight="bold" color={colors.onPrimary} />
            <Text style={styles.primaryButtonText}>Download and install</Text>
          </Pressable>
        )}
        {['current', 'error', 'development'].includes(status) && (
          <Pressable onPress={checkForUpdates} style={styles.secondaryButton}>
            <ArrowClockwise size={18} weight="bold" color={colors.onSurface} />
            <Text style={styles.secondaryButtonText}>Check again</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.detailIcon}><DeviceMobile size={20} weight="bold" color={colors.onSurfaceVariant} /></View>
        <View style={styles.detailCopy}>
          <Text style={styles.detailLabel}>Installed version</Text>
          <Text style={styles.detailValue}>Deadsmile Games {appVersion}</Text>
        </View>
        <Text style={styles.runtime}>Runtime {runtimeVersion}</Text>
      </View>
      <Text style={styles.note}>Updates are delivered through the Expo Updates channel configured for this build.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingVertical: 24, maxWidth: 720 },
  title: { fontFamily: type.display, color: colors.onSurface, fontSize: 48, lineHeight: 49, letterSpacing: -2.2 },
  lead: { fontFamily: type.body, color: colors.onSurfaceVariant, fontSize: 14, lineHeight: 22, marginTop: 9 },
  hero: { minHeight: 350, padding: 28, borderRadius: radius.xl, backgroundColor: colors.surface, alignItems: 'flex-start', justifyContent: 'flex-end' },
  statusIcon: { width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, marginBottom: 24 },
  statusIconSuccess: { backgroundColor: colors.success },
  statusIconError: { backgroundColor: colors.error },
  statusTitle: { fontFamily: type.display, color: colors.onSurface, fontSize: 31, lineHeight: 33, letterSpacing: -1.25 },
  message: { fontFamily: type.body, color: colors.onSurfaceVariant, fontSize: 13, lineHeight: 20, maxWidth: 560, marginTop: 8 },
  primaryButton: { minHeight: 50, borderRadius: radius.full, paddingHorizontal: 19, marginTop: 22, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 9 },
  primaryButtonText: { fontFamily: type.bodyBold, color: colors.onPrimary, fontSize: 13 },
  secondaryButton: { minHeight: 48, borderRadius: radius.full, paddingHorizontal: 18, marginTop: 22, backgroundColor: colors.surfaceContainerHigh, flexDirection: 'row', alignItems: 'center', gap: 9 },
  secondaryButtonText: { fontFamily: type.bodyBold, color: colors.onSurface, fontSize: 12 },
  details: { marginTop: 12, padding: 16, borderRadius: radius.lg, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainerHigh },
  detailCopy: { flex: 1 },
  detailLabel: { fontFamily: type.body, color: colors.onSurfaceVariant, fontSize: 10 },
  detailValue: { fontFamily: type.displayMedium, color: colors.onSurface, fontSize: 14, marginTop: 2 },
  runtime: { fontFamily: type.bodyBold, color: colors.onSurfaceVariant, fontSize: 9 },
  note: { fontFamily: type.body, color: colors.outline, fontSize: 10, lineHeight: 16, padding: 16 },
});
