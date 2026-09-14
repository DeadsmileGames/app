import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { GearSix, MagnifyingGlass, ArrowsClockwise, Bell } from "phosphor-react-native";
import { colors, radius, type } from "../theme/tokens";
import { useGoBack } from "../hooks/useGoBack";
import { useLive } from "../context/LiveContext";

export function TopBar({ title, back = false }) {
  const goBack = useGoBack("/");
  const { unread } = useLive();

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        {back ? (
          <Pressable onPress={goBack} style={styles.iconBtn} accessibilityLabel="Go back">
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Link href="/notifications" asChild>
          <Pressable style={styles.iconBtn} accessibilityLabel="Notifications">
            <Bell size={20} weight="bold" color={colors.onSurface} />
            {unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{Math.min(unread, 9)}</Text></View>}
          </Pressable>
        </Link>
        <Link href="/search" asChild>
          <Pressable style={styles.iconBtn} accessibilityLabel="Search">
            <MagnifyingGlass size={20} weight="bold" color={colors.onSurface} />
          </Pressable>
        </Link>
        <Link href="/check-updates" asChild>
          <Pressable style={styles.iconBtn} accessibilityLabel="Check for updates">
            <ArrowsClockwise size={20} weight="bold" color={colors.onSurface} />
          </Pressable>
        </Link>
        <Link href="/config" asChild>
          <Pressable style={styles.iconBtn} accessibilityLabel="Settings">
            <GearSix size={20} weight="bold" color={colors.onSurface} />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1, minWidth: 0 },
  actions: { flexDirection: "row", gap: 7 },
  iconBtn: {
    width: 42, height: 42, borderRadius: radius.full, backgroundColor: colors.surfaceContainer,
    alignItems: "center", justifyContent: "center",
  },
  badge: { position: "absolute", top: -2, right: -1, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  badgeText: { color: colors.onPrimary, fontFamily: type.bodyBold, fontSize: 9 },
  backArrow: { color: colors.onSurface, fontSize: 32, lineHeight: 34, fontFamily: type.body },
});
