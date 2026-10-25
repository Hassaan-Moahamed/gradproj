import { authOptions } from "@/app/schema/nextAuth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };