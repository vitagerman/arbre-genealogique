// app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// ─── CONFIGURATION NEXTAUTH ───────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        await connectDB();

        // ─── Chercher l'utilisateur en base ───────────────────────────────────
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("Aucun compte trouvé avec cet email");
        }

        // ─── Vérifier le mot de passe ─────────────────────────────────────────
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect");
        }

        // ─── Retourner l'utilisateur (sans le mot de passe) ───────────────────
        return {
          id: user._id.toString(),
          name: user.name,
          surname: user.surname,
          email: user.email,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],

  // ─── CALLBACKS ──────────────────────────────────────────────────────────────
  // Les callbacks permettent de personnaliser le token et la session

  callbacks: {
    async jwt({ token, user }) {
      // Au moment du login, on ajoute les infos dans le token
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
        token.surname = (user as any).surname;
      }
      return token;
    },

    async session({ session, token }) {
      // On transfère les infos du token vers la session
      if (token) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.surname = token.surname as string;
      }
      return session;
    },
  },

  // ─── PAGES PERSONNALISÉES ────────────────────────────────────────────────────

  pages: {
    signIn: "/login",        // redirige vers votre page de login
    error: "/login",         // redirige vers login en cas d'erreur
  },

  // ─── SESSION ─────────────────────────────────────────────────────────────────

  session: {
    strategy: "jwt",         // stockage du token en cookie (pas en DB)
    maxAge: 24 * 60 * 60,    // session expire après 24h
  },

  // ─── SECRET ──────────────────────────────────────────────────────────────────

  secret: process.env.NEXTAUTH_SECRET,
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };