"use server";
import { prisma } from '@/prisma/prisma-client';
import { Container } from "@/components/container";
import { getUserSession } from "@/components/lib/get-user-session";
import { redirect } from "next/navigation";
import { TURNIR_ADMIN } from "@/components/TURNIR_ADMIN";

export default async function TurnirAdminPage() {
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

    // Получаем список турниров
    const turnirs = await prisma.turnir.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (turnirs.length === 0) {
        console.log('Турниры отсутствуют');
    }

    return (
        <Container className="flex flex-col my-10">
            <TURNIR_ADMIN user={user} turnirs={turnirs} />
        </Container>
    );
}
