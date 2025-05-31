"use server";
import { prisma } from '@/prisma/prisma-client';
import { getUserSession } from "@/components/lib/get-user-session";
import { redirect } from "next/navigation";
import AdminControlForm from "@/components/adminControlForm";
import {Container} from "@/components/container";


export default async function AdminControlPage() {
    const session = await getUserSession();

    if (!session) {
        return redirect('/');
    }

    // Получаем пользователя и проверяем, является ли он администратором
    const user = await prisma.user.findFirst({
        where: { id: Number(session.id), role: 'ADMIN' }
    });

    if (!user) {
        return redirect('/');
    }

    // Получаем текущие значения из HeroesControl
    const heroesControl = await prisma.heroesControl.findUnique({
        where: { id: 1 }
    });

    return (
        <Container className="flex flex-col my-10">
            <AdminControlForm initialValues={{
                globalStop: heroesControl?.globalStop || false,
                stopP2P: heroesControl?.stopP2P || false,
                stopTransferPoints: heroesControl?.stopTransferPoints || false,
                stopGameUserCreate: heroesControl?.stopGameUserCreate || false
            }} />
        </Container>
    );
}