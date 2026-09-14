import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "../src/components/Screen";
import { TopBar } from "../src/components/TopBar";
import { useAuth } from "../src/context/AuthContext";
import { colors, radius, type } from "../src/theme/tokens";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  async function submit() {
    if (busy) {
      return;
    }

    setError("");

    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();

    if (username.length < 3) {
      setError(
        "Username must contain at least 3 characters."
      );
      return;
    }

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      await register({
        username,
        email,
        password: form.password,
      });

      router.replace("/config");
    } catch (e) {
      setError(
        e?.message ||
          "Unable to create your account."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <TopBar title="Create account" back />

      <View style={styles.card}>
        <Text style={styles.title}>
          Join the studio.
        </Text>

        <Text style={styles.copy}>
          One account for your wishlist and the
          Deadsmile Games experience.
        </Text>

        {[
          [
            "username",
            "Username",
            "Choose a username",
          ],
          [
            "email",
            "Email",
            "you@example.com",
          ],
          [
            "password",
            "Password",
            "At least 8 characters",
          ],
          [
            "confirm",
            "Confirm password",
            "Repeat your password",
          ],
        ].map(([key, label, placeholder]) => (
          <View key={key} style={styles.field}>
            <Text style={styles.label}>
              {label}
            </Text>

            <TextInput
              value={form[key]}
              onChangeText={set(key)}
              placeholder={placeholder}
              placeholderTextColor={
                colors.onSurfaceVariant
              }
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={
                key === "email"
                  ? "email-address"
                  : "default"
              }
              secureTextEntry={
                key === "password" ||
                key === "confirm"
              }
              autoComplete={
                key === "email"
                  ? "email"
                  : key === "username"
                    ? "username"
                    : "new-password"
              }
              textContentType={
                key === "email"
                  ? "emailAddress"
                  : key === "username"
                    ? "username"
                    : "newPassword"
              }
              editable={!busy}
            />
          </View>
        ))}

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          onPress={submit}
          disabled={busy}
          style={[
            styles.button,
            busy && { opacity: 0.55 },
          ]}
        >
          <Text style={styles.buttonText}>
            {busy
              ? "Creating…"
              : "Create account"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/login")}
          disabled={busy}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            Already have an account? Sign in
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 560,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 24,
    gap: 15,
    marginTop: 12,
  },

  title: {
    fontFamily: type.display,
    color: colors.onSurface,
    fontSize: 40,
    letterSpacing: -1.8,
  },

  copy: {
    fontFamily: type.body,
    color: colors.onSurfaceVariant,
    lineHeight: 21,
    marginBottom: 4,
  },

  field: {
    gap: 7,
  },

  label: {
    fontFamily: type.bodyBold,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },

  input: {
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 16,
    color: colors.onSurface,
    fontFamily: type.body,
    fontSize: 15,
  },

  error: {
    color: colors.error,
    fontFamily: type.body,
    lineHeight: 20,
  },

  button: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  buttonText: {
    fontFamily: type.bodyBold,
    color: colors.onPrimary,
  },

  link: {
    alignItems: "center",
    paddingVertical: 8,
  },

  linkText: {
    fontFamily: type.bodyMedium,
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
});
