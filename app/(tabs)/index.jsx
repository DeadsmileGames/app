import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

import {
  Play,
  Pause,
  CaretLeft,
  CaretRight,
  ArrowUpRight,
} from "phosphor-react-native";

import { Screen } from "../../src/components/Screen";
import { TopBar } from "../../src/components/TopBar";
import { SectionHeader } from "../../src/components/SectionHeader";
import { GameCard } from "../../src/components/GameCard";
import { NewsCard } from "../../src/components/NewsCard";
import { VideoCard } from "../../src/components/VideoCard";
import { StateView } from "../../src/components/StateView";

import { useApiData } from "../../src/hooks/useApiData";
import { useSettings } from "../../src/context/SettingsContext";

import {
  colors,
  radius,
  type,
} from "../../src/theme/tokens";

import { normalizeList } from "../../src/utils/content";
import { resolveAssetUrl } from "../../src/utils/resolveAsset";

const HERO_DURATION = 6500;

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { settings, accent } = useSettings();

  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const progressRef = useRef(null);

  const gamesQ = useApiData(
    "/games",
    { limit: 8 },
    { items: [] }
  );

  const newsQ = useApiData(
    "/news",
    { limit: 6 },
    []
  );

  const videosQ = useApiData(
    "/videos",
    { limit: 6 },
    []
  );

  const games = gamesQ.data?.items || [];
  const news = normalizeList(newsQ.data);
  const videos = normalizeList(videosQ.data);
  const heroGames = useMemo(() => {
    if (!games.length) {
      return [];
    }

    const featured = games.filter(
      (game) => game?.featured
    );

    const regular = games.filter(
      (game) => !game?.featured
    );

    return [...featured, ...regular];
  }, [games]);

  useEffect(() => {
    if (!heroGames.length) {
      setSlide(0);
      return;
    }

    setSlide(
      (current) =>
        current % heroGames.length
    );
  }, [heroGames.length]);

  useEffect(() => {
    if (
      heroGames.length < 2 ||
      paused
    ) {
      return undefined;
    }

    const timer = setInterval(() => {
      setSlide(
        (current) =>
          (current + 1) %
          heroGames.length
      );
    }, HERO_DURATION);

    return () => {
      clearInterval(timer);
    };
  }, [
    heroGames.length,
    paused,
  ]);

  useEffect(() => {
    if (
      heroGames.length < 2 ||
      paused
    ) {
      setProgress(0);
      return undefined;
    }

    const startedAt = Date.now();

    const updateProgress = () => {
      const elapsed =
        Date.now() - startedAt;

      const value = Math.min(
        (elapsed / HERO_DURATION) * 100,
        100
      );

      setProgress(value);

      if (value < 100) {
        progressRef.current =
          requestAnimationFrame(
            updateProgress
          );
      }
    };

    progressRef.current =
      requestAnimationFrame(
        updateProgress
      );

    return () => {
      if (progressRef.current) {
        cancelAnimationFrame(
          progressRef.current
        );

        progressRef.current = null;
      }
    };
  }, [
    slide,
    heroGames.length,
    paused,
  ]);

  const activeGame =
    heroGames[slide] || null;

  const heroUrl = useMemo(() => {
    if (!activeGame) {
      return null;
    }

    const image =
      activeGame.heroImage ||
      activeGame.hero_image ||
      activeGame.coverImage ||
      activeGame.cover_image ||
      activeGame.image ||
      activeGame.backgroundImage ||
      activeGame.background_image;

    if (!image) {
      return null;
    }

    const resolved = resolveAssetUrl(image);

    if (
      typeof resolved !== "string" ||
      !resolved.trim()
    ) {
      return null;
    }

    return resolved.trim();
  }, [activeGame]);


  const heroLogo = useMemo(() => {
    if (!activeGame?.logo) {
      return null;
    }

    const resolved =
      resolveAssetUrl(activeGame.logo);

    if (
      typeof resolved !== "string" ||
      !resolved.trim()
    ) {
      return null;
    }

    return resolved.trim();
  }, [activeGame]);

  const goNext = () => {
    if (!heroGames.length) {
      return;
    }

    setSlide(
      (current) =>
        (current + 1) %
        heroGames.length
    );

    setProgress(0);
  };

  const goPrevious = () => {
    if (!heroGames.length) {
      return;
    }

    setSlide(
      (current) =>
        (current - 1 +
          heroGames.length) %
        heroGames.length
    );

    setProgress(0);
  };

  const goToSlide = (index) => {
    if (
      index < 0 ||
      index >= heroGames.length
    ) {
      return;
    }

    setSlide(index);
    setProgress(0);
  };

  return (
    <Screen>
      <TopBar />

      {gamesQ.status !== "success" &&
      !activeGame ? (
        <View style={styles.heroLoading}>
          <StateView
            loading={
              gamesQ.status === "loading"
            }
            error={gamesQ.error}
            onRetry={gamesQ.retry}
          />
        </View>
      ) : activeGame ? (
        <Animated.View
          key={
            activeGame.id ||
            activeGame.slug ||
            slide
          }
          entering={
            settings.animations
              ? FadeIn.duration(350)
              : undefined
          }
          style={styles.hero}
        >

          {heroUrl ? (
            <Image
              key={heroUrl}
              source={{
                uri: heroUrl,
              }}
              style={styles.heroImage}
              contentFit="cover"
              contentPosition="center"
              cachePolicy="memory-disk"
              priority="high"
              transition={
                settings.animations
                  ? 300
                  : 0
              }
              accessibilityLabel={
                activeGame.title
                  ? `${activeGame.title} background`
                  : "Game background"
              }
            />
          ) : (
            <View
              style={styles.heroFallback}
            />
          )}


          <View
            pointerEvents="none"
            style={styles.heroOverlay}
          />


          <View style={styles.heroContent}>
            <View style={styles.heroIdentity}>
              {heroLogo ? (
                <Image
                  source={{
                    uri: heroLogo,
                  }}
                  style={styles.heroLogo}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  priority="high"
                />
              ) : null}

              <View
                style={
                  styles.heroTextColumn
                }
              >
                <Text
                  style={[
                    styles.heroTitle,
                    width >= 720 &&
                      styles.heroTitleLarge,
                  ]}
                  numberOfLines={3}
                >
                  {activeGame.title}
                </Text>

                {activeGame.shortDescription ? (
                  <Text
                    style={styles.heroCopy}
                    numberOfLines={3}
                  >
                    {
                      activeGame.shortDescription
                    }
                  </Text>
                ) : null}

                <View
                  style={styles.heroActions}
                >
                  {activeGame.trailerUrl ? (
                    <Pressable
                      onPress={() =>
                        router.push(
                          "/(tabs)/videos"
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.primaryButton,
                        {
                          backgroundColor:
                            accent.primary,
                        },
                        pressed &&
                          styles.buttonPressed,
                      ]}
                    >
                      <Play
                        size={18}
                        color={
                          accent.onPrimary
                        }
                        weight="fill"
                      />

                      <Text
                        style={[
                          styles.primaryButtonText,
                          {
                            color:
                              accent.onPrimary,
                          },
                        ]}
                      >
                        Watch trailer
                      </Text>
                    </Pressable>
                  ) : null}

                  {activeGame.slug ? (
                    <Pressable
                      onPress={() =>
                        router.push(
                          `/game/${activeGame.slug}`
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.secondaryButton,
                        pressed &&
                          styles.buttonPressed,
                      ]}
                    >
                      <Text
                        style={
                          styles.secondaryButtonText
                        }
                      >
                        Explore game
                      </Text>

                      <ArrowUpRight
                        size={17}
                        color={
                          colors.onSurface
                        }
                        weight="bold"
                      />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>
          </View>

          {heroGames.length > 1 ? (
            <View
              style={styles.heroControls}
            >

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  paused
                    ? "Resume slideshow"
                    : "Pause slideshow"
                }
                onPress={() =>
                  setPaused(
                    (value) => !value
                  )
                }
                style={({ pressed }) => [
                  styles.controlButton,
                  pressed &&
                    styles.controlPressed,
                ]}
              >
                {paused ? (
                  <Play
                    size={17}
                    color={
                      colors.onSurface
                    }
                    weight="fill"
                  />
                ) : (
                  <Pause
                    size={17}
                    color={
                      colors.onSurface
                    }
                    weight="fill"
                  />
                )}
              </Pressable>


              <View
                style={styles.pips}
              >
                {heroGames.map(
                  (game, index) => {
                    const active =
                      index === slide;

                    return (
                      <Pressable
                        key={
                          game.id ||
                          game.slug ||
                          index
                        }
                        accessibilityRole="tab"
                        accessibilityLabel={`Slide ${
                          index + 1
                        }`}
                        accessibilityState={{
                          selected:
                            active,
                        }}
                        onPress={() =>
                          goToSlide(index)
                        }
                        style={[
                          styles.pip,
                          active &&
                            styles.pipActive,
                        ]}
                      >
                        <View
                          style={[
                            styles.pipFill,
                            {
                              width: active
                                ? `${progress}%`
                                : "0%",
                              backgroundColor:
                                accent.primary,
                            },
                          ]}
                        />
                      </Pressable>
                    );
                  }
                )}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous game"
                onPress={goPrevious}
                style={({ pressed }) => [
                  styles.controlButton,
                  pressed &&
                    styles.controlPressed,
                ]}
              >
                <CaretLeft
                  size={20}
                  color={
                    colors.onSurface
                  }
                  weight="bold"
                />
              </Pressable>


              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Next game"
                onPress={goNext}
                style={({ pressed }) => [
                  styles.controlButton,
                  pressed &&
                    styles.controlPressed,
                ]}
              >
                <CaretRight
                  size={20}
                  color={
                    colors.onSurface
                  }
                  weight="bold"
                />
              </Pressable>
            </View>
          ) : null}
        </Animated.View>
      ) : (
        <View style={styles.heroEmpty}>
          <Text
            style={styles.heroEmptyTitle}
          >
            No games available yet.
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <SectionHeader
          title="Games"
          href="/(tabs)/games"
        />

        {gamesQ.status !== "success" ? (
          <StateView
            loading={
              gamesQ.status === "loading"
            }
            error={gamesQ.error}
            onRetry={gamesQ.retry}
          />
        ) : games.length ? (
          <View style={styles.gamesList}>
            {games
              .slice(0, 6)
              .map((game, index) => (
                <Animated.View
                  key={
                    game.id ||
                    game.slug ||
                    index
                  }
                  entering={
                    settings.animations
                      ? FadeInDown.delay(
                          index * 55
                        )
                      : undefined
                  }
                  style={styles.gameItem}
                >
                  <GameCard
                    game={{
                      ...game,
                      coverImage:
                        resolveAssetUrl(
                          game.coverImage ||
                            game.heroImage ||
                            game.cover_image
                        ),
                    }}
                    index={index}
                  />
                </Animated.View>
              ))}
          </View>
        ) : (
          <StateView
            empty="No games available"
          />
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Newswire"
          href="/(tabs)/newswire"
        />

        {newsQ.status !== "success" ? (
          <StateView
            loading={
              newsQ.status === "loading"
            }
            error={newsQ.error}
            onRetry={newsQ.retry}
          />
        ) : news.length ? (
          <View style={styles.stack}>
            {news
              .slice(0, 4)
              .map((item, index) => (
                <Animated.View
                  key={
                    item.id ||
                    item.slug ||
                    index
                  }
                  entering={
                    settings.animations
                      ? FadeInDown.delay(
                          index * 55
                        )
                      : undefined
                  }
                >
                  <NewsCard
                    item={item}
                    large={index === 0}
                  />
                </Animated.View>
              ))}
          </View>
        ) : (
          <StateView
            empty="No news yet"
          />
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Videos"
          href="/(tabs)/videos"
        />

        {videosQ.status !== "success" ? (
          <StateView
            loading={
              videosQ.status === "loading"
            }
            error={videosQ.error}
            onRetry={videosQ.retry}
          />
        ) : videos.length ? (
          <View style={styles.stack}>
            {videos
              .slice(0, 4)
              .map((video, index) => (
                <Animated.View
                  key={
                    video.id ||
                    video.slug ||
                    index
                  }
                  entering={
                    settings.animations
                      ? FadeInDown.delay(
                          index * 55
                        )
                      : undefined
                  }
                >
                  <VideoCard
                    item={video}
                  />
                </Animated.View>
              ))}
          </View>
        ) : (
          <StateView
            empty="No videos yet"
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({

  hero: {
    width: "100%",
    minHeight: 570,

    position: "relative",

    overflow: "hidden",

    borderRadius: radius.xl,

    backgroundColor:
      colors.surface,

    justifyContent: "flex-end",
  },

  heroImage: {
    position: "absolute",

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    width: "100%",
    height: "100%",

    zIndex: 0,
  },

  heroFallback: {
    position: "absolute",

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    backgroundColor:
      colors.surfaceContainerHigh,

    zIndex: 0,
  },

  heroOverlay: {
    position: "absolute",

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    backgroundColor:
      "rgba(0, 0, 0, 0.66)",

    zIndex: 1,
  },

  heroContent: {
    flex: 1,

    justifyContent: "flex-end",

    paddingHorizontal: 26,
    paddingTop: 170,
    paddingBottom: 86,

    zIndex: 2,
  },

  heroIdentity: {
    width: "100%",

    flexDirection: "row",

    alignItems: "flex-end",

    gap: 20,
  },

  heroLogo: {
    width: 120,
    height: 120,

    marginBottom: 4,
  },

  heroTextColumn: {
    flex: 1,

    maxWidth: 760,
  },

  heroTitle: {
    fontFamily: type.display,

    color: "#FFFFFF",

    fontSize: 43,

    lineHeight: 41,

    letterSpacing: -2,

    maxWidth: 720,
  },

  heroTitleLarge: {
    fontSize: 62,

    lineHeight: 58,

    letterSpacing: -3,

    maxWidth: 780,
  },

  heroCopy: {
    fontFamily: type.body,

    color: "#E4E4DE",

    fontSize: 14,

    lineHeight: 21,

    marginTop: 12,

    maxWidth: 590,
  },

  heroActions: {
    flexDirection: "row",

    flexWrap: "wrap",

    alignItems: "center",

    gap: 10,

    marginTop: 20,
  },

  primaryButton: {
    minHeight: 48,

    borderRadius: 24,

    paddingHorizontal: 18,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 8,
  },

  primaryButtonText: {
    fontFamily: type.bodyBold,

    fontSize: 14,
  },

  secondaryButton: {
    minHeight: 48,

    borderRadius: 24,

    paddingHorizontal: 18,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 7,

    backgroundColor:
      "rgba(17, 17, 17, 0.88)",

    borderWidth: 1,

    borderColor:
      "rgba(255, 255, 255, 0.16)",
  },

  secondaryButtonText: {
    fontFamily: type.bodyBold,

    color: "#FFFFFF",

    fontSize: 14,
  },

  buttonPressed: {
    opacity: 0.65,
  },

  heroControls: {
    position: "absolute",

    left: 20,
    right: 20,
    bottom: 18,

    height: 44,

    flexDirection: "row",

    alignItems: "center",

    gap: 8,

    zIndex: 3,
  },

  controlButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(17, 17, 17, 0.82)",

    borderWidth: 1,

    borderColor:
      "rgba(255, 255, 255, 0.14)",
  },

  controlPressed: {
    opacity: 0.55,
  },

  pips: {
    flex: 1,

    height: 40,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 5,

    paddingHorizontal: 4,
  },

  pip: {
    flex: 1,

    maxWidth: 52,

    minWidth: 18,

    height: 4,

    borderRadius: 2,

    overflow: "hidden",

    backgroundColor:
      "rgba(255, 255, 255, 0.28)",
  },

  pipActive: {
    backgroundColor:
      "rgba(255, 255, 255, 0.42)",
  },

  pipFill: {
    height: "100%",

    borderRadius: 2,
  },

  heroLoading: {
    width: "100%",

    minHeight: 570,

    borderRadius: radius.xl,

    overflow: "hidden",

    backgroundColor:
      colors.surfaceContainer,

    alignItems: "center",

    justifyContent: "center",
  },

  heroEmpty: {
    width: "100%",

    minHeight: 570,

    borderRadius: radius.xl,

    backgroundColor:
      colors.surfaceContainer,

    alignItems: "flex-start",

    justifyContent: "center",

    padding: 28,
  },

  heroEmptyTitle: {
    fontFamily: type.display,

    color: colors.onSurface,

    fontSize: 36,

    letterSpacing: -1.5,
  },

  section: {
    width: "100%",

    marginTop: 48,
  },

  gamesList: {
    width: "100%",

    gap: 14,
  },

  gameItem: {
    width: "100%",
  },

  stack: {
    width: "100%",

    gap: 12,
  },
});
