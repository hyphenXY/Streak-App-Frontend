import * as SecureStore from "expo-secure-store";

/**
 * Optional: persist access token if you want a faster startup.
 * Note: If your backend issues refresh-token as an HttpOnly cookie,
 * you don't strictly need to persist access token; you can call /auth/refresh on app start.
 */

export async function setItem(key: string, value: string) {
  return SecureStore.setItemAsync(key, value);
}

export async function getItem(key: string) {
  return SecureStore.getItemAsync(key);
}

export async function removeItem(key: string) {
  return SecureStore.deleteItemAsync(key);
}
