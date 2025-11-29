// lib/auth-client.ts (CLIENT ONLY)

/**
 * CLIENT-SIDE AUTH UTILITIES
 * These can be used in Client Components
 */

export async function login(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Login failed");
  }

  return res.json();
}

export async function logout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch("/api/auth/me");

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.user;
}
