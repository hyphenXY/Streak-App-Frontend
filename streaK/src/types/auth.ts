export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
