import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { initializeBackend } from "@backend/seed";

import LoginScreen from "./auth/login";

/**
 * App entry screen.
 *
 * On mobile this initializes the on-device SQLite database if it does not
 * exist yet and seeds the default store-owner account, then renders the
 * login screen (`app/auth/login.tsx`).
 */
export default function Index() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await initializeBackend();
        if (!cancelled) setStatus("ready");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setStatus("error");
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Preparing your store...
        </ThemedText>
      </ThemedView>
    );
  }

  if (status === "error") {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="smallBold">Failed to start the app</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {error}
        </ThemedText>
      </ThemedView>
    );
  }

  return <LoginScreen />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  hint: {
    marginTop: 4,
  },
});
