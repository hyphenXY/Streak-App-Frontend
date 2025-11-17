import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";
import useAuth from "../../hooks/useAuth";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>Email: {user?.email}</Text>
      <View style={{ marginTop: 12 }}>
        <Button title="Logout" onPress={() => logout()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
});
