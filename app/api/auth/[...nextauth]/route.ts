import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        console.log('AUTH_DEBUG:', {
          hasCredentials: !!credentials,
          hasEmail: !!credentials?.email,
          hasPassword: !!credentials?.password,
          adminEmailSet: !!process.env.ADMIN_EMAIL,
          adminHashSet: !!process.env.ADMIN_PASSWORD_HASH,
          adminHashLen: process.env.ADMIN_PASSWORD_HASH?.length,
          emailMatch: credentials?.email === process.env.ADMIN_EMAIL,
          secretSet: !!process.env.NEXTAUTH_SECRET,
        })

        if (!credentials?.email || !credentials?.password) return null

        const adminEmail = process.env.ADMIN_EMAIL
        const adminHash  = process.env.ADMIN_PASSWORD_HASH

        if (!adminEmail || !adminHash) return null
        if (credentials.email !== adminEmail) return null

        const valid = await bcrypt.compare(credentials.password, adminHash)
        console.log('AUTH_DEBUG bcrypt result:', valid)
        if (!valid) return null

        return { id: '1', email: adminEmail, name: 'César Anaya' }
      },
    }),
  ],
  pages:   { signIn: '/login' },
  secret:  process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 días
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
