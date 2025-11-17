export const isValidEmail = (email: string) =>
  /\S+@\S+\.\S+/.test(email);
export const isNonEmpty = (s: string) => s.trim().length > 0;
