import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleProvider = require('next-auth/providers/google').default;
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}

providers.push(CredentialsProvider({
  name: 'credentials',
  credentials: {},
  async authorize() {
    return null;
  },
}));

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user.email) return false;
        const existingUser = await db.user.findUnique({ where: { email: user.email.toLowerCase() } });
        if (existingUser) {
          if (!existingUser.googleId && account?.providerAccountId) {
            await db.user.update({ where: { id: existingUser.id }, data: { googleId: account.providerAccountId } });
          }
          if (existingUser.isBanned) return false;
          return true;
        }
        const welcomeBonusSetting = await db.setting.findUnique({ where: { key: 'welcome_bonus' } });
        const welcomeBonus = welcomeBonusSetting ? parseFloat(welcomeBonusSetting.value) : 100;
        const explorerRole = await db.role.findUnique({ where: { name: 'Explorer' } });
        const referralCode = 'NEXORA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        await db.user.create({
          data: {
            email: user.email.toLowerCase(),
            name: user.name || 'User',
            avatar: user.image || null,
            googleId: account?.providerAccountId || null,
            password: null,
            referralCode,
            roleId: explorerRole?.id || 'explorer',
            nxrBalance: welcomeBonus,
          },
        });
        const newUser = await db.user.findUnique({ where: { email: user.email.toLowerCase() } });
        if (newUser) {
          await db.notification.create({
            data: { userId: newUser.id, title: 'Welcome to Nexora!', message: `You've received ${welcomeBonus} NXR as welcome bonus!`, type: 'system' },
          });
        }
        return true;
      } catch (error) {
        console.error('Google sign-in error:', error);
        return false;
      }
    },
    async jwt({ token, account }) {
      if (account) { token.googleId = account.providerAccountId; }
      return token;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const dbUser = await db.user.findUnique({ where: { email: session.user.email.toLowerCase() }, include: { role: true } });
          if (dbUser) { session.user.id = dbUser.id; session.user.roleId = dbUser.roleId; session.user.isAdmin = dbUser.isAdmin; }
        } catch {}
      }
      return session;
    },
  },
  pages: { signIn: '/' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
