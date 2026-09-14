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

export default function Login() {
  const router = useRouter();
  const { login, verifyTwoFactor } = useAuth();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) {
      return;
    }

    setError("");

    if (mode === "2fa") {
      const verificationCode = token
        .replace(/\D/g, "")
        .slice(0, 6);

      if (verificationCode.length < 6) {
        setError("Enter the six-digit verification code.");
        return;
      }

      setBusy(true);

      try {
        await verifyTwoFactor(verificationCode);
        router.replace("/config");
      } catch (e) {
        setError(
          e?.message || "Unable to verify the code."
        );
      } finally {
        setBusy(false);
      }

      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }

    setBusy(true);

    try {
      const result = await login(
        normalizedEmail,
        password
      );

      if (result?.requiresTwoFactor) {
        setToken("");
        setMode("2fa");
        return;
      }

      router.replace("/config");
    } catch (e) {
      setError(
        e?.message || "Unable to sign in."
      );
    } finally {
      setBusy(false);
    }
  }

  function switchToLogin() {
    if (busy) {
      return;
    }

    setMode("login");
    setError("");
    setToken("");
  }

  return (
    <Screen>
      <TopBar
        title={
          mode === "2fa"
            ? "Two-step verification"
            : "Sign in"
        }
        back
      />

      <View style={styles.card}>
        {mode === "2fa" ? (
          <>
            <Text style={styles.title}>
              Verify it's you.
            </Text>

            <Text style={styles.copy}>
              Enter the six-digit code from your
              authenticator app.
            </Text>

            <TextInput
              value={token}
              onChangeText={setToken}
              placeholder="000000"
              placeholderTextColor={
                colors.onSurfaceVariant
              }
              style={[styles.input, styles.code]}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              editable={!busy}
              autoCorrect={false}
            />

            {error ? (
              <Text style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={submit}
              disabled={
                busy ||
                token.replace(/\D/g, "").length < 6
              }
              style={[
                styles.button,
                (busy ||
                  token.replace(/\D/g, "").length < 6) && {
                  opacity: 0.5,
                },
              ]}
            >
              <Text style={styles.buttonText}>
                {busy
                  ? "Verifying…"
                  : "Verify code"}
              </Text>
            </Pressable>

            <Pressable
              onPress={switchToLogin}
              disabled={busy}
              style={styles.secondary}
            >
              <Text style={styles.secondaryText}>
                Back to sign in
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              Welcome back.
            </Text>

            <Text style={styles.copy}>
              Use the same account as the Deadsmile Games
              website.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>
                Email
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                placeholder="you@example.com"
                placeholderTextColor={
                  colors.onSurfaceVariant
                }
                style={styles.input}
                editable={!busy}
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Password
              </Text>

              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                placeholder="••••••••"
                placeholderTextColor={
                  colors.onSurfaceVariant
                }
                style={styles.input}
                editable={!busy}
                returnKeyType="go"
                onSubmitEditing={submit}
              />
            </View>

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
                  ? "Signing in…"
                  : "Sign in"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push("/register")
              }
              disabled={busy}
              style={styles.secondary}
            >
              <Text style={styles.secondaryText}>
                Create an account
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 540,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 26,
    gap: 15,
    marginTop: 12,
  },

  title: {
    fontFamily: type.display,
    color: colors.onSurface,
    fontSize: 42,
    letterSpacing: -1.9,
  },

  copy: {
    fontFamily: type.body,
    color: colors.onSurfaceVariant,
    lineHeight: 21,
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

  code: {
    fontFamily: type.display,
    fontSize: 28,
    letterSpacing: 8,
    textAlign: "center",
  },

  error: {
    fontFamily: type.body,
    color: colors.error,
    lineHeight: 20,
  },

  button: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    fontFamily: type.bodyBold,
    color: colors.onPrimary,
  },

  secondary: {
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    fontFamily: type.bodyBold,
    color: colors.onSurface,
  },
});
