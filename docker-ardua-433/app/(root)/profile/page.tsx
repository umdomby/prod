// app/(root)/profile/index.tsx
import { prisma } from '@/prisma/prisma-client';
import { ProfileForm } from '@/components/profile-form';
import { getUserSession } from '@/components/lib/get-user-session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'; // <-- Добавьте эту строку

export default async function ProfilePage() {
  const session = await getUserSession();

  if (!session) {
    return redirect('/');
  }

  const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

  if (!user) {
    return redirect('/');
  }

  return <ProfileForm data={user} />;
}