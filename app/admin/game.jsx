import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcon } from '../../src/components/MaterialIcon';
import { Screen } from '../../src/components/Screen';
import { TopBar } from '../../src/components/TopBar';
import { colors, radius, type } from '../../src/theme/tokens';
import { api } from '../../src/services/api';

export default function AdminGame() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    status: 'announced',
    releaseDate: '',
    heroImage: '',
    coverImage: '',
    trailerUrl: '',
    featured: false,
    purchaseUrl: '',
    itchGameId: '',
    downloadUrl: '',
    genres: '',
    platforms: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const payload = {
        ...form,
        releaseDate: form.releaseDate || null,
        trailerUrl: form.trailerUrl || null,
        purchaseUrl: form.purchaseUrl || null,
        itchGameId: form.itchGameId ? Number(form.itchGameId) : null,
        downloadUrl: form.downloadUrl || null,
        genres: form.genres.split(',').map((s) => s.trim()).filter(Boolean),
        platforms: form.platforms.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await api.post('/admin/game', payload);
      setSaved(true);
      setTimeout(() => router.back(), 1500);
    } catch (err) {
      setError(err?.message || 'Unable to publish.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <TopBar title="Publish Game" back />
      <View style={styles.container}>
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={form.title} onChangeText={setField('title')} placeholder="Game title" placeholderTextColor={colors.onSurfaceVariant} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Slug</Text>
          <TextInput style={styles.input} value={form.slug} onChangeText={setField('slug')} placeholder="game-slug" placeholderTextColor={colors.onSurfaceVariant} autoCapitalize="none" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Short description</Text>
          <TextInput style={[styles.input, styles.textarea]} multiline numberOfLines={3} value={form.shortDescription} onChangeText={setField('shortDescription')} placeholder="Brief description" placeholderTextColor={colors.onSurfaceVariant} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textarea]} multiline numberOfLines={6} value={form.description} onChangeText={setField('description')} placeholder="Full description" placeholderTextColor={colors.onSurfaceVariant} />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.selectWrapper}>
              <TextInput style={styles.input} value={form.status} onChangeText={setField('status')} placeholder="announced" placeholderTextColor={colors.onSurfaceVariant} />
            </View>
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Release date</Text>
            <TextInput style={styles.input} value={form.releaseDate} onChangeText={setField('releaseDate')} placeholder="YYYY-MM-DD" placeholderTextColor={colors.onSurfaceVariant} />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Hero image URL</Text>
          <TextInput style={styles.input} value={form.heroImage} onChangeText={setField('heroImage')} placeholder="https://..." placeholderTextColor={colors.onSurfaceVariant} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Cover image URL</Text>
          <TextInput style={styles.input} value={form.coverImage} onChangeText={setField('coverImage')} placeholder="https://..." placeholderTextColor={colors.onSurfaceVariant} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Trailer URL</Text>
          <TextInput style={styles.input} value={form.trailerUrl} onChangeText={setField('trailerUrl')} placeholder="https://..." placeholderTextColor={colors.onSurfaceVariant} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Purchase URL</Text>
          <TextInput style={styles.input} value={form.purchaseUrl} onChangeText={setField('purchaseUrl')} placeholder="https://creator.itch.io/game/purchase" placeholderTextColor={colors.onSurfaceVariant} autoCapitalize="none" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>itch.io game ID</Text>
          <TextInput style={styles.input} value={form.itchGameId} onChangeText={setField('itchGameId')} placeholder="4520313" placeholderTextColor={colors.onSurfaceVariant} keyboardType="numeric" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Download URL</Text>
          <TextInput style={styles.input} value={form.downloadUrl} onChangeText={setField('downloadUrl')} placeholder="https://..." placeholderTextColor={colors.onSurfaceVariant} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Genres (comma separated)</Text>
          <TextInput style={styles.input} value={form.genres} onChangeText={setField('genres')} placeholder="Action, Adventure, RPG" placeholderTextColor={colors.onSurfaceVariant} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Platforms (comma separated)</Text>
          <TextInput style={styles.input} value={form.platforms} onChangeText={setField('platforms')} placeholder="PC, PlayStation, Xbox" placeholderTextColor={colors.onSurfaceVariant} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Feature on homepage</Text>
          <Switch
            value={form.featured}
            onValueChange={setField('featured')}
            trackColor={{ false: colors.surfaceContainerHigh, true: colors.primary }}
            thumbColor={form.featured ? colors.onPrimary : colors.onSurfaceVariant}
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        {saved && <Text style={styles.success}>Published successfully!</Text>}

        <Pressable style={[styles.button, saving && styles.buttonDisabled]} onPress={submit} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Publishing…' : 'Publish'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  field: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  label: {
    fontFamily: type.bodyBold,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.md,
    padding: 14,
    color: colors.onSurface,
    fontFamily: type.body,
    fontSize: 15,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  error: { fontFamily: type.body, color: colors.error, marginBottom: 8 },
  success: { fontFamily: type.body, color: colors.success, marginBottom: 8 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    fontFamily: type.bodyBold,
    color: colors.onPrimary,
    fontSize: 16,
  },
});
