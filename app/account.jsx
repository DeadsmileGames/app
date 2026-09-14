import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { UserCircle, ArrowSquareOut, SignOut, ShieldCheck } from "phosphor-react-native";
import { TopBar } from "../src/components/TopBar";
import { Screen } from "../src/components/Screen";
import { StateView } from "../src/components/StateView";
import { useAuth } from "../src/context/AuthContext";
import { SITE_URL } from "../src/services/api";
import { colors, radius, type } from "../src/theme/tokens";

export default function Account() {
  const router = useRouter();
  const { user, status, logout } = useAuth();

  async function leave() {
    await logout();
    router.replace("/config");
  }

  return (
    <Screen>
      <TopBar title="Account" back />
      {status === "loading" ? <StateView loading /> : status === "authenticated" ? (
        <>
          <View style={styles.profile}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{String(user?.username || user?.email || "D").slice(0,1).toUpperCase()}</Text></View>
            <Text style={styles.name}>@{user?.username || "player"}</Text>
            <Text style={styles.email}>{user?.email || ""}</Text>
            {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
            <View style={styles.chips}>
              <Text style={styles.chip}>{user?.role || "user"}</Text>
              {user?.location ? <Text style={styles.chip}>{user.location}</Text> : null}
            </View>
          </View>
          <Text style={styles.section}>ACCOUNT</Text>
          <Pressable style={styles.row} onPress={() => Linking.openURL(`${SITE_URL}/account`)}>
            <UserCircle size={20} color={colors.onSurface} weight="bold" />
            <View style={styles.copy}><Text style={styles.rowTitle}>Manage profile</Text><Text style={styles.rowDescription}>Edit account information on the website.</Text></View>
            <ArrowSquareOut size={17} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable style={styles.row} onPress={() => Linking.openURL(`${SITE_URL}/account`)}>
            <ShieldCheck size={20} color={colors.onSurface} weight="bold" />
            <View style={styles.copy}><Text style={styles.rowTitle}>Security</Text><Text style={styles.rowDescription}>Password and two-step verification.</Text></View>
            <ArrowSquareOut size={17} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable style={[styles.row, styles.danger]} onPress={leave}>
            <SignOut size={20} color="#FF8D8D" weight="bold" />
            <View style={styles.copy}><Text style={[styles.rowTitle, { color: "#FF9A9A" }]}>Sign out</Text><Text style={styles.rowDescription}>End the current session.</Text></View>
          </Pressable>
        </>
      ) : (
        <View style={styles.guest}>
          <Text style={styles.name}>No account signed in.</Text>
          <Text style={styles.bio}>Sign in to sync your wishlist and account with the Deadsmile Games website.</Text>
          <Pressable style={styles.button} onPress={() => router.replace("/login")}><Text style={styles.buttonText}>Sign in</Text></Pressable>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.xl, padding: 28, marginTop: 12 },
  avatar: { width: 76, height: 76, borderRadius: 26, backgroundColor: colors.primaryContainer, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  avatarText: { fontFamily: type.display, color: colors.primary, fontSize: 32 },
  name: { fontFamily: type.display, color: colors.onSurface, fontSize: 28, letterSpacing: -1 },
  email: { fontFamily: type.body, color: colors.onSurfaceVariant, marginTop: 3 },
  bio: { fontFamily: type.body, color: colors.onSurfaceVariant, lineHeight: 21, textAlign: "center", marginTop: 12, maxWidth: 560 },
  chips: { flexDirection: "row", gap: 8, marginTop: 14 },
  chip: { fontFamily: type.bodyBold, color: colors.primary, backgroundColor: colors.primaryContainer, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 12, fontSize: 10 },
  section: { fontFamily: type.bodyBold, color: colors.onSurfaceVariant, fontSize: 10, letterSpacing: 1.5, marginTop: 26, marginBottom: 8 },
  row: { minHeight: 66, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: 16, gap: 12, flexDirection: "row", alignItems: "center", marginBottom: 7 },
  copy: { flex: 1 },
  rowTitle: { fontFamily: type.displayMedium, color: colors.onSurface, fontSize: 14 },
  rowDescription: { fontFamily: type.body, color: colors.onSurfaceVariant, fontSize: 11, marginTop: 3 },
  danger: { backgroundColor: "rgba(255,80,80,.06)" },
  guest: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 26, gap: 12, marginTop: 12 },
  button: { alignSelf: "flex-start", backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 22, paddingVertical: 13, marginTop: 5 },
  buttonText: { fontFamily: type.bodyBold, color: colors.onPrimary },
});
