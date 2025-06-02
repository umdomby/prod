import NextAuth from 'next-auth';
import { authOptions } from '@/components/constants/auth-options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
