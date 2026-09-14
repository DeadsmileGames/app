import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { TopBar } from "../../src/components/TopBar";
import { GameCard } from "../../src/components/GameCard";
import { StateView } from "../../src/components/StateView";
import { useApiData } from "../../src/hooks/useApiData";
import { colors, type } from "../../src/theme/tokens";
import { resolveAssetUrl } from "../../src/utils/resolveAsset";

export default function Games() {
  const q = useApiData("/games", { limit: 40 }, { items: [] });
  const games = q.data?.items || [];

  return (
    <Screen>
      <TopBar title="Games" />

      <View style={styles.head}>
        <Text style={styles.title}>Games</Text>

        <Text style={styles.copy}>
          Explore every Deadsmile Games title, from announcement to release.
        </Text>
      </View>

      {q.status !== "success" ? (
        <StateView
          loading={q.status === "loading"}
          error={q.error}
          onRetry={q.retry}
        />
      ) : games.length ? (
        <View style={styles.list}>
          {games.map((game, index) => (
            <View
              key={game.id || game.slug || index}
              style={styles.cardWrapper}
            >
              <GameCard
                game={{
                  ...game,
                  coverImage: resolveAssetUrl(
                    game.coverImage ||
                      game.heroImage ||
                      game.cover_image
                  ),
                }}
                index={index}
              />
            </View>
          ))}
        </View>
      ) : (
        <StateView empty="No games available" />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    paddingVertical: 22,
    maxWidth: 720,
  },

  eyebrow: {
    fontFamily: type.bodyBold,
    color: colors.primary,
    fontSize: 10,
    letterSpacing: 1.6,
    marginBottom: 5,
  },

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
    marginTop: 10,
  },

  list: {
    width: "100%",
    gap: 14,
  },

  cardWrapper: {
    width: "100%",
  },
});
