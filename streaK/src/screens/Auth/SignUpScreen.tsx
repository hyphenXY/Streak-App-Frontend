import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";
import useAuth from "../../hooks/useAuth";
import { isValidEmail, isNonEmpty } from "../../utils/validators";

export default function SignupScreen({ navigation }: any) {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!isValidEmail(email)) return Alert.alert("Invalid email");
    if (!isNonEmpty(password)) return Alert.alert("Password required");

    try {
      setLoading(true);
      await signup(email, password);
    } catch (err: any) {
      Alert.alert(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" />
      <Input label="Password" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <View style={{ marginTop: 12 }}>
        <Button title={loading ? "Creating account..." : "Sign up"} onPress={onSignup} />
      </View>
      <View style={styles.row}>
        <Text>Already have an account?</Text>
        <Text style={styles.link} onPress={() => navigation.navigate("Login")}> Sign in</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 18 },
  row: { flexDirection: "row", marginTop: 16 },
  link: { color: "#2563EB", marginLeft: 6 },
});
