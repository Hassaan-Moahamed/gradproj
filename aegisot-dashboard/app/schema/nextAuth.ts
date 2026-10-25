import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Role } from "@/lib/permissions";

/** مستخدمين تجريبيين — هيتبدلوا بـ Laravel بعدين. كلمة السر للكل: aegis123 */
const MOCK_USERS: Record<
  string,
  { id: string; name: string; role: Role; password: string }
> = {
  admin: { id: "u-1", name: "Admin User", role: "admin", password: "aegis123" },
  operator: { id: "u-2", name: "Operator User", role: "operator", password: "aegis123" },
  engineer: { id: "u-3", name: "Engineer User", role: "engineer", password: "aegis123" },
  maintenance: { id: "u-4", name: "Maintenance User", role: "maintenance", password: "aegis123" },
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = MOCK_USERS[credentials?.username ?? ""];
        if (!user || user.password !== credentials?.password) return null;
        return { id: user.id, name: user.name, role: user.role };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};