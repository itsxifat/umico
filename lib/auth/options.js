import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from '../db.js';
import User from '../models/User.js';
import { ROLES } from '../permissions.js';

/**
 * NextAuth configuration.
 *
 * Providers:
 *   - credentials (email + password; requires emailVerified)
 *   - google      (optional; auto-creates account on first login)
 *
 * Session strategy: JWT. Token carries role, permissions, tokenVersion,
 * status so middleware can do cheap role checks without a DB hit.
 */
export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await dbConnect();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        }).select('+passwordHash');

        if (!user || !user.passwordHash) return null;
        if (!user.emailVerified) {
          throw new Error('Please verify your email first.');
        }
        if (user.status === 'banned') {
          throw new Error('This account has been banned.');
        }
        if (user.status === 'suspended') {
          throw new Error('This account is suspended.');
        }
        if (user.status === 'timeout' && user.timeoutUntil > new Date()) {
          throw new Error('This account is temporarily locked.');
        }

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar || null,
          role: user.role,
          permissions: user.permissions || [],
          status: user.status,
          tokenVersion: user.tokenVersion,
        };
      },
    }),

    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;

      await dbConnect();
      let dbUser = await User.findOne({ email: user.email.toLowerCase() });

      if (!dbUser) {
        dbUser = await User.create({
          name: user.name || user.email.split('@')[0],
          email: user.email.toLowerCase(),
          avatar: user.image || '',
          googleId: account.providerAccountId,
          emailVerified: true,
          role: isBootstrapSuperadmin(user.email) ? ROLES.SUPER_ADMIN : ROLES.CUSTOMER,
        });
      } else {
        if (!dbUser.googleId) dbUser.googleId = account.providerAccountId;
        if (!dbUser.emailVerified) dbUser.emailVerified = true;
        dbUser.lastLoginAt = new Date();
        await dbUser.save();
      }

      if (dbUser.status === 'banned') return false;
      if (dbUser.status === 'timeout' && dbUser.timeoutUntil > new Date()) return false;

      return true;
    },

    async jwt({ token, user, trigger }) {
      // First sign-in
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.status = user.status;
        token.tokenVersion = user.tokenVersion ?? 0;
      }

      // For Google logins we only get user the first time. Refresh from DB.
      if (!token.role && token.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email.toLowerCase() });
        if (dbUser) {
          token.uid = dbUser._id.toString();
          token.role = dbUser.role;
          token.permissions = dbUser.permissions || [];
          token.status = dbUser.status;
          token.tokenVersion = dbUser.tokenVersion || 0;
        }
      }

      // On explicit refresh triggers, re-read from DB (e.g. role changed by admin)
      if (trigger === 'update' && token.uid) {
        await dbConnect();
        const dbUser = await User.findById(token.uid);
        if (dbUser) {
          token.role = dbUser.role;
          token.permissions = dbUser.permissions || [];
          token.status = dbUser.status;
          token.tokenVersion = dbUser.tokenVersion || 0;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user) session.user = {};
      session.user.id = token.uid;
      session.user.role = token.role;
      session.user.permissions = token.permissions || [];
      session.user.status = token.status;
      session.user.tokenVersion = token.tokenVersion;
      return session;
    },
  },
};

function isBootstrapSuperadmin(email) {
  const target = process.env.BOOTSTRAP_SUPERADMIN_EMAIL;
  if (!target) return false;
  return target.toLowerCase() === String(email || '').toLowerCase();
}
