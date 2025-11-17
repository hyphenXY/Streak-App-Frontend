import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";
import api from "../../api/api";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await api.post("/auth/forgot", { email });
      Alert.alert("If that email exists, we've sent a reset link.");
    } catch (err: any) {
      Alert.alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" />
      <View style={{ marginTop: 12 }}>
        <Button title={loading ? "Sending..." : "Send reset link"} onPress={submit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 18 },
});
