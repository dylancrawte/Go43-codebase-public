import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

export default function DevTestScreen() {
  const [tapCount, setTapCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");

  const runMockCheck = () => {
    setStatus("running");
    // Replace this with real checks when wiring feature-specific dev tests.
    setTimeout(() => {
      setStatus("passed");
    }, 500);
  };

  const reset = () => {
    setTapCount(0);
    setStatus("idle");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dev Test Screen</Text>
        <Text style={styles.subtitle}>
          Boilerplate area for local feature checks and quick diagnostics.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <Pressable style={styles.button} onPress={() => setTapCount((count: number) => count + 1)}>
            <Text style={styles.buttonText}>Increment Tap Count</Text>
          </Pressable>
          <Text style={styles.value}>Tap count: {tapCount}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mock Test Runner</Text>
          <Pressable style={styles.button} onPress={runMockCheck}>
            <Text style={styles.buttonText}>Run Mock Check</Text>
          </Pressable>
          <Text style={styles.value}>Status: {status}</Text>
        </View>

        <Pressable style={[styles.button, styles.resetButton]} onPress={reset}>
          <Text style={styles.buttonText}>Reset</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b0d10",
  },
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    color: "#f4f6f8",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#a8b3c1",
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    color: "#f4f6f8",
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  value: {
    color: "#c7d2df",
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: "#4b5563",
  },
});
