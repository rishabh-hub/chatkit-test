// lib/types.ts

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  passwordHash: string;
}

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
}
