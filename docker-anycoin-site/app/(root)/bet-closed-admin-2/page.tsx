"use server";
import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';
import { redirect } from 'next/navigation';
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import { getUserSession } from "@/components/lib/get-user-session";
import {HEROES_CLIENT_CLOSED_2_A} from "@/components/HEROES_CLIENT_CLOSED_2_A";

export default async function BetClosedPage() {
    const session = await getUserSession();

    if (!session) {
        return redirect('/');
    }

    const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

    if (!user || user.role !== 'ADMIN') {
        return redirect('/');
    }

    // Получаем все закрытые ставки, в которых участвовал пользователь
    const closedBets = await prisma.betCLOSED.findMany({
        include: {
            participantsCLOSED: {
                include: {
                    user: true, // Add a comma here
                }, // Получаем всех участников, чтобы отобразить выигранные и проигранные ставки
            },
            player1: true,
            player2: true,
            creator: true,
            category: true,
            product: true,
            productItem: true,
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return (
        <Container className="w-[100%]">
            <Suspense fallback={<Loading />}>
                <HEROES_CLIENT_CLOSED_2_A user={user} closedBets={closedBets} />
            </Suspense>
        </Container>
    );
}
