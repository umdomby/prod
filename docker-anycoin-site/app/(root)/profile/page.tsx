"use server";
import { prisma } from '@/prisma/prisma-client';
import { ProfileForm } from '@/components/profile-form';
import { getUserSession } from '@/components/lib/get-user-session';
import { redirect } from 'next/navigation';
import {AuthPage} from "@/components/AuthPage";

export default async function ProfilePage() {
  const session = await getUserSession();

  if (!session) {
    return <AuthPage/>
  }

  const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

  if (!user) {
    return redirect('/');
  }

  return <ProfileForm data={user} />;
}
