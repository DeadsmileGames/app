import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, radius, type } from '../theme/tokens';
import { resolveAssetUrl } from '../utils/resolveAsset';
import { useSettings } from '../context/SettingsContext';

export function GameCard({ game, index = 0, horizontal = false }) {
  const router = useRouter();
  const { settings, accent } = useSettings();

  const imageSource =
    game.coverImage ||
    game.cover_image ||
    game.heroImage ||
    game.image ||
    null;

  const imageUrl = resolveAssetUrl(imageSource);

  return (
    <Animated.View
      entering={settings.animations ? FadeInDown.delay(Math.min(index, 8) * 45).duration(380) : undefined}
      style={horizontal ? s.wrapH : s.wrap}
    >
      <Pressable
        onPress={() => router.push(`/game/${game.slug}`)}
        style={({ pressed }) => [s.card, pressed && s.pressed]}
      >
        <View style={s.media}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={220}

            />
          ) : (
            <View style={s.placeholder} />
          )}
          <View style={s.badge}>
            <Text style={s.badgeText}>{game.status || 'GAME'}</Text>
          </View>
        </View>

        <View style={s.body}>
          <Text numberOfLines={2} style={s.title}>
            {game.title}
          </Text>
          <Text numberOfLines={2} style={s.desc}>
            {game.shortDescription || game.short_description || 'Deadsmile Games'}
          </Text>
          {Array.isArray(game.platforms) && game.platforms.length > 0 && (
            <Text numberOfLines={1} style={s.meta}>
              {game.platforms.join(' · ')}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  wrapH: {
    width: '100%',
  },
  card: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  media: {
    aspectRatio: 0.78,
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    position: 'relative',
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
  },
  badge: {
    position: 'absolute',
    left: 10,
    top: 10,
    borderRadius: radius.full,
    backgroundColor: 'rgba(9,9,9,.78)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: type.bodyBold,
    color: colors.onSurface,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  body: {
    padding: 15,
    gap: 7,
  },
  title: {
    fontFamily: type.displayMedium,
    color: colors.onSurface,
    fontSize: 21,
    letterSpacing: -0.8,
    lineHeight: 22,
  },
  desc: {
    fontFamily: type.body,
    color: colors.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
  },
  meta: {
    fontFamily: type.bodyBold,
    color: colors.primary,
    fontSize: 10,
    marginTop: 3,
  },
});
