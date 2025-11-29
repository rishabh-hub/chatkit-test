import { randomUUID } from "crypto";
import { User } from "./types";
import bcrypt from "bcryptjs";

const users = new Map<string, User>();

// Use synchronous initialization to avoid race conditions
const hashedPassword = bcrypt.hashSync("password", 10);

users.set("test@gmail.com", {
  createdAt: new Date().toLocaleString(),
  email: "test@gmail.com",
  id: randomUUID(),
  name: "Test User",
  passwordHash: hashedPassword,
});

console.log("✅ Test user created: test@gmail.com / password");

export const db = {
  async findUserbyEmail(email: string) {
    return users.get(email) || null;
  },

  async createUser(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    const hashed = await bcrypt.hash(password, 10);
    const user: User = {
      email: email,
      passwordHash: hashed,
      name: name,
      id: randomUUID(),
      createdAt: new Date().toLocaleString(),
    };
    users.set(email, user);
    console.log("✅ User created:", email);
    return user;
  },

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async getUserById(id: string): Promise<Omit<User, "passwordHash"> | null> {
    for (const user of users.values()) {
      if (user.id === id) {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    }
    return null;
  },
};
