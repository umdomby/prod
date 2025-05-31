// Ref: https://next-auth.js.org/getting-started/typescript#module-augmentation

import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
import type { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name: string;
      image: string;
      cardId: string; // Добавляем cardId
    };
  }

  interface User extends DefaultUser {
    id: number;
    role: UserRole;
    cardId: string; // Добавляем cardId
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    cardId: string; // Добавляем cardId
  }
}
