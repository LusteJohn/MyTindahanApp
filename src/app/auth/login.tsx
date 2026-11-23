import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { routes } from '@backend/routes';

/**
 * Login screen for the sari-sari store app.
 *
 * Authenticates against the on-device `users` table through the backend
 * routes (`routes.users.authenticate`). On the first launch the database
 * is created and a default owner account is seeded by `index.tsx`:
 *
 *   username: owner
 *   password: owner123
 */

export default function LoginScreen() {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggedInAs, setLoggedInAs] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      const result = await routes.users.authenticate({ username, password });
      if (result.ok) {
        setLoggedInAs(result.data.name);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.inner}>
          <ThemedView style={styles.hero}>
            <ThemedText type="title" style={styles.title}>
              MyTindahan
            </ThemedText>
            <ThemedText themeColor="textSecondary">Sari-Sari Store</ThemedText>
          </ThemedView>

          {loggedInAs ? (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">Welcome, {loggedInAs}!</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                You are now signed in as the store owner.
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="small" style={styles.label}>
                Username
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.backgroundSelected },
                ]}
                value={username}
                onChangeText={setUsername}
                placeholder="owner"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <ThemedText type="small" style={styles.label}>
                Password
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.backgroundSelected },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                editable={!loading}
                onSubmitEditing={handleLogin}
                returnKeyType="go"
              />

              {error ? (
                <ThemedText type="small" style={styles.error}>
                  {error}
                </ThemedText>
              ) : null}

              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: theme.text },
                  (pressed || loading) && styles.buttonPressed,
                ]}>
                {loading ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <ThemedText
                    type="smallBold"
                    style={{ color: theme.background }}>
                    Log in
                  </ThemedText>
                )}
              </Pressable>

              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.hint}>
                Default owner: <ThemedText type="code">owner</ThemedText> /{' '}
                <ThemedText type="code">owner123</ThemedText>
              </ThemedText>
            </ThemedView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.five,
  },
  title: {
    textAlign: 'center',
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  label: {
    marginTop: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  error: {
    color: '#d32f2f',
    marginTop: Spacing.one,
  },
  button: {
    marginTop: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  hint: {
    marginTop: Spacing.two,
    textAlign: 'center',
  },
});