import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { TopBar } from "../../src/components/TopBar";
import { GameCard } from "../../src/components/GameCard";
import { StateView } from "../../src/components/StateView";
import { useApiData } from "../../src/hooks/useApiData";
import { useAuth } from "../../src/context/AuthContext";
import { colors, radius, type } from "../../src/theme/tokens";
export default function Wishlist() {
    const router = useRouter();
    const { status } = useAuth();
    const q = useApiData(
        status === "authenticated" ? "/wishlist" : null,
        {},
        [],
    );
    const games = Array.isArray(q.data) ? q.data : [];
    return (
        <Screen>
            <TopBar title="Wishlist" />
            <View style={s.head}>
                <Text style={s.title}>Wishlist</Text>
                <Text style={s.copy}>
                    Games you saved.
                </Text>
            </View>
            {status === "loading" ? (
                <StateView loading />
            ) : status !== "authenticated" ? (
                <View style={s.loginCard}>
                    <Text style={s.loginTitle}>
                        Sign in to view your wishlist
                    </Text>
                    <Text style={s.copy}>
                        Your wishlist is synchronized through your Deadsmile Games account.
                    </Text>
                    <Pressable
                        onPress={() => router.push("/login")}
                        style={s.button}
                    >
                        <Text style={s.buttonText}>Sign in</Text>
                    </Pressable>
                </View>
            ) : q.status !== "success" ? (
                <StateView
                    loading={q.status === "loading"}
                    error={q.error}
                    onRetry={q.retry}
                />
            ) : games.length ? (
                <View style={s.grid}>
                    {games.map((g, i) => (
                        <View key={g.id} style={{ width: '100%' }}>
                        <GameCard
                            game={{
                            ...g,
                            coverImage: g.cover_image,
                            shortDescription: g.short_description,
                            }}
                            index={i}
                        />
                        </View>
                    ))}
                    </View>
            ) : (
                <StateView empty="Your wishlist is empty" />
            )}
        </Screen>
    );
}
const s = StyleSheet.create({
    head: { paddingVertical: 24, gap: 5 },
    title: {
        fontFamily: type.display,
        color: colors.onSurface,
        fontSize: 54,
        letterSpacing: -2.5,
        lineHeight: 56,
    },
    copy: {
        fontFamily: type.body,
        color: colors.onSurfaceVariant,
        lineHeight: 22,
        maxWidth: 620,
    },
    grid: {
        width: '100%',
        gap: 12,
    },
    loginCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: 28,
        gap: 12,
        alignItems: "flex-start",
    },
    loginTitle: {
        fontFamily: type.displayMedium,
        color: colors.onSurface,
        fontSize: 26,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: radius.full,
        paddingHorizontal: 22,
        paddingVertical: 13,
    },
    buttonText: { fontFamily: type.bodyBold, color: colors.onPrimary },
});
