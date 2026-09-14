import { Linking, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { GearSix, UserCircle, Palette, ShieldCheck, ArrowSquareOut, ArrowCounterClockwise, SignOut, Wrench } from "phosphor-react-native";
import { Screen } from "../src/components/Screen";
import { TopBar } from "../src/components/TopBar";
import { StateView } from "../src/components/StateView";
import { useAuth } from "../src/context/AuthContext";
import { useSettings } from "../src/context/SettingsContext";
import { SITE_URL } from "../src/services/api";
import { colors, radius, type } from "../src/theme/tokens";

function Row({ icon: Icon, title, description, right, onPress, danger = false }) {
  const content = (
    <>
      <View style={[styles.rowIcon, danger && { backgroundColor: "rgba(255,80,80,.12)" }]}>
        <Icon size={19} weight="bold" color={danger ? "#FF8D8D" : colors.onSurface} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, danger && { color: "#FF9A9A" }]}>{title}</Text>
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
      {right}
    </>
  );
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: .7 }]}>{content}</Pressable> : <View style={styles.row}>{content}</View>;
}

export default function Config() {
  const router = useRouter();
  const { user, status, logout } = useAuth();
  const { settings, update, reset, accent } = useSettings();

  async function signOut() {
    await logout();
    router.replace("/config");
  }

  return (
    <Screen>
      <TopBar title="Config" back />

      <View style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Config</Text>
          <Text style={styles.lead}>Account, appearance and app preferences in one place.</Text>
        </View>
      </View>

      {status === "loading" ? <StateView loading /> : (
        <>
          <Text style={styles.sectionLabel}>Account</Text>
          {status === "authenticated" ? (
            <>
              <View style={styles.accountCard}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{String(user?.username || user?.email || "D").slice(0,1).toUpperCase()}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.accountName}>@{user?.username || "player"}</Text>
                  <Text style={styles.accountEmail}>{user?.email || ""}</Text>
                </View>
                <View style={styles.role}><Text style={styles.roleText}>{user?.role || "user"}</Text></View>
              </View>
              <Row icon={UserCircle} title="Account details" description="Profile and account information" onPress={() => router.push("/account")} />
              <Row icon={ShieldCheck} title="Security" description="Manage security on the Deadsmile Games website" onPress={() => Linking.openURL(`${SITE_URL}/account`)} right={<ArrowSquareOut size={17} color={colors.onSurfaceVariant} />} />
              <Row icon={SignOut} title="Sign out" description="End this device session" onPress={signOut} danger />
            </>
          ) : (
            <Row icon={UserCircle} title="Sign in" description="Sync wishlist and account with Deadsmile Games" onPress={() => router.push("/login")} />
          )}

          {user?.role === "admin" || user?.role === "administrator" ? (
            <>
              <Text style={styles.sectionLabel}>Studio tools</Text>
              <Row icon={Wrench} title="Publish a game" description="Create or update game content" onPress={() => router.push("/admin/game")} />
              <Row icon={Wrench} title="Publish a newsletter" description="Publish a Newswire story" onPress={() => router.push("/admin/newsletter")} />
              <Row icon={Wrench} title="Publish a video" description="Add media to the catalog" onPress={() => router.push("/admin/video")} />
            </>
          ) : null}

          <Text style={styles.sectionLabel}>Personalization</Text>
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View><Text style={styles.panelTitle}>Accent</Text><Text style={styles.panelDescription}>Choose the app highlight color.</Text></View>
              <View style={styles.swatches}>
                {[
                  ["yellow", "#FFCF02"], ["red", "#FF4D4D"], ["white", "#F4F4F1"]
                ].map(([key, color]) => (
                  <Pressable key={key} onPress={() => update({ accent: key })} style={[styles.swatch, { backgroundColor: color }, settings.accent === key && styles.swatchSelected]} accessibilityLabel={`${key} accent`} />
                ))}
              </View>
            </View>
            <View style={styles.divider} />
            <Row icon={Palette} title="Compact layout" description="Reduce spacing across content lists" right={<Switch value={settings.compact} onValueChange={(value) => update({ compact: value })} trackColor={{ false: colors.surfaceContainerHighest, true: accent.primary }} thumbColor={settings.compact ? accent.onPrimary : colors.onSurfaceVariant} />} />
            <Row icon={Palette} title="Animations" description="Use entrance and interaction animations" right={<Switch value={settings.animations} onValueChange={(value) => update({ animations: value })} trackColor={{ false: colors.surfaceContainerHighest, true: accent.primary }} thumbColor={settings.animations ? accent.onPrimary : colors.onSurfaceVariant} />} />
            <Row icon={Palette} title="Content density" description="Choose a tighter or more relaxed feed" right={
              <View style={styles.density}>
                {["compact", "comfortable"].map((key) => <Pressable key={key} onPress={() => update({ contentDensity: key })} style={[styles.densityButton, settings.contentDensity === key && { backgroundColor: accent.container }]}><Text style={[styles.densityText, settings.contentDensity === key && { color: accent.primary }]}>{key}</Text></Pressable>)}
              </View>
            } />
            <Pressable onPress={reset} style={styles.reset}><ArrowCounterClockwise size={17} color={colors.onSurfaceVariant} /><Text style={styles.resetText}>Reset personalization</Text></Pressable>
          </View>

          <Text style={styles.sectionLabel}>About</Text>
          <Row icon={ArrowSquareOut} title="Open Deadsmile Games website" description="Access the full web experience" onPress={() => Linking.openURL(SITE_URL)} right={<ArrowSquareOut size={17} color={colors.onSurfaceVariant} />} />
          <Row icon={ShieldCheck} title="Privacy & terms" description="Read the website policies" onPress={() => Linking.openURL(`${SITE_URL}/privacy`)} right={<ArrowSquareOut size={17} color={colors.onSurfaceVariant} />} />
          <Text style={styles.version}>Version 1.1.0</Text>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", gap: 15, alignItems: "center", paddingVertical: 22, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  heroIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.surfaceContainer, alignItems: "center", justifyContent: "center" },
  eyebrow: { fontFamily: type.bodyBold, color: colors.onSurfaceVariant, fontSize: 9, letterSpacing: 1.8, marginBottom: 3 },
  title: { fontFamily: type.display, color: colors.onSurface, fontSize: 38, letterSpacing: -1.6 },
  lead: { fontFamily: type.body, color: colors.onSurfaceVariant, lineHeight: 20, marginTop: 4 },
  sectionLabel: { fontFamily: type.bodyBold, color: colors.onSurfaceVariant, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 28, marginBottom: 9 },
  accountCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primaryContainer, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: type.display, color: colors.primary, fontSize: 20 },
  accountName: { fontFamily: type.displayMedium, color: colors.onSurface, fontSize: 18 },
  accountEmail: { fontFamily: type.body, color: colors.onSurfaceVariant, fontSize: 12, marginTop: 2 },
  role: { backgroundColor: colors.surfaceContainerHigh, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 10 },
  roleText: { fontFamily: type.bodyBold, color: colors.onSurfaceVariant, fontSize: 10 },
  row: { minHeight: 66, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 7 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceContainerHigh, alignItems: "center", justifyContent: "center" },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: type.displayMedium, color: colors.onSurface, fontSize: 14 },
  rowDescription: { fontFamily: type.body, color: colors.onSurfaceVariant, fontSize: 11, lineHeight: 16, marginTop: 2 },
  panel: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16 },
  panelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 2 },
  panelTitle: { fontFamily: type.displayMedium, color: colors.onSurface, fontSize: 15 },
  panelDescription: { fontFamily: type.body, color: colors.onSurfaceVariant, fontSize: 11, marginTop: 2 },
  swatches: { flexDirection: "row", gap: 8 },
  swatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "transparent" },
  swatchSelected: { borderColor: colors.onSurface },
  divider: { height: 1, backgroundColor: colors.outlineVariant, marginVertical: 12 },
  density: { flexDirection: "row", backgroundColor: colors.surfaceContainerHigh, borderRadius: 12, padding: 3 },
  densityButton: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 9 },
  densityText: { fontFamily: type.bodyBold, color: colors.onSurfaceVariant, fontSize: 9 },
  reset: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 14 },
  resetText: { fontFamily: type.bodyBold, color: colors.onSurfaceVariant, fontSize: 11 },
  version: { fontFamily: type.body, color: colors.outline, textAlign: "center", fontSize: 10, paddingVertical: 28 },
});
