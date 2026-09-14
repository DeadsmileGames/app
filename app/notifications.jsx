import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, Check, CaretRight } from 'phosphor-react-native';
import { Screen } from '../src/components/Screen';
import { TopBar } from '../src/components/TopBar';
import { useLive } from '../src/context/LiveContext';
import { colors, radius, type } from '../src/theme/tokens';

export default function NotificationInbox() {
  const { notifications, unread, markAllRead, openNotification } = useLive();
  return (
    <Screen>
      <TopBar title="Notifications" back />
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.copy}>{unread ? `${unread} unread update${unread === 1 ? '' : 's'}.` : 'You are all caught up.'}</Text>
        </View>
        {unread > 0 && (
          <Pressable onPress={markAllRead} style={styles.readButton}>
            <Check size={17} weight="bold" color={colors.onSurface} />
            <Text style={styles.readButtonText}>Mark all read</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.list}>
        {notifications.length ? notifications.map((item) => (
          <Pressable key={item.id} onPress={() => openNotification(item)} style={[styles.item, item.unread && styles.itemUnread]}>
            <View style={[styles.icon, item.unread && styles.iconUnread]}>
              <Bell size={20} weight="bold" color={item.unread ? colors.onPrimary : colors.onSurfaceVariant} />
            </View>
            <View style={styles.itemCopy}>
              <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.itemMessage} numberOfLines={3}>{item.message}</Text>
              <Text style={styles.itemDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            {item.url && <CaretRight size={18} weight="bold" color={colors.onSurfaceVariant} />}
          </Pressable>
        )) : (
          <View style={styles.empty}>
            <Bell size={28} weight="bold" color={colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.copy}>New games, Newswire stories and videos will appear here.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: 24, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14 },
  headerCopy: { flex: 1 },
  title: { fontFamily: type.display, color: colors.onSurface, fontSize: 46, lineHeight: 48, letterSpacing: -2 },
  copy: { fontFamily: type.body, color: colors.onSurfaceVariant, fontSize: 13, lineHeight: 20, marginTop: 7 },
  readButton: { minHeight: 42, borderRadius: radius.full, paddingHorizontal: 14, backgroundColor: colors.surfaceContainer, flexDirection: 'row', alignItems: 'center', gap: 7 },
  readButtonText: { fontFamily: type.bodyBold, color: colors.onSurface, fontSize: 11 },
  list: { gap: 8 },
  item: { minHeight: 104, padding: 15, borderRadius: radius.lg, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: 'transparent' },
  itemUnread: { borderColor: colors.primary, backgroundColor: colors.surfaceContainer },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainerHigh },
  iconUnread: { backgroundColor: colors.primary },
  itemCopy: { flex: 1, gap: 3 },
  itemTitle: { fontFamily: type.displayMedium, color: colors.onSurface, fontSize: 16 },
  itemMessage: { fontFamily: type.body, color: colors.onSurfaceVariant, fontSize: 12, lineHeight: 17 },
  itemDate: { fontFamily: type.bodyBold, color: colors.outline, fontSize: 9, marginTop: 3 },
  empty: { padding: 34, borderRadius: radius.xl, backgroundColor: colors.surface, alignItems: 'center', gap: 8 },
  emptyTitle: { fontFamily: type.displayMedium, color: colors.onSurface, fontSize: 20 },
});
