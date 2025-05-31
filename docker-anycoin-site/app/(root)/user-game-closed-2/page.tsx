// index.tsx
"use server";

import { prisma } from '@/prisma/prisma-client';
import React from "react";
import { getUserSession } from "@/components/lib/get-user-session";
import { Container } from '@/components/container';
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserGame2Closed } from "@/components/user-game-2-closed";

export default async function UserGameClosed2Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const resolvedSearchParams = await searchParams; // Await the searchParams if it's a Promise

    const session = await getUserSession();

    if (!session) {
        return redirect('/');
    }

    const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

    if (!user) {
        return redirect('/');
    }
    const player = await prisma.player.findFirst({ where: { userId: Number(session?.id) } });

    if (!player) {
        return (
            <div className="text-center">
                <p className="text-green-500">Вы не зарегистрированы как игрок</p>
                <p>
                    1. Заполните: Настройки Telegram
                </p>
                <p>
                    2. Зарегистрируйтесь как игрок
                </p>
                <p>
                    <Link href="/profile" className="text-blue-500">Profile</Link>
                </p>
            </div>
        );
    }

    const page = parseInt(resolvedSearchParams.page ?? '1', 10);
    const betsPerPage = 100;
    const skip = (page - 1) * betsPerPage;

    const gameUserBetsData = await prisma.gameUserBet.findMany({
        where: {
            statusUserBet: {
                in: ['CLOSED'],
            },
        },
        include: {
            gameUser1Bet: true,
            gameUser2Bet: true,
            category: true,
            product: true,
            productItem: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
        skip: skip,
        take: betsPerPage,
    });

    const totalBets = await prisma.gameUserBet.count({
        where: {
            statusUserBet: {
                in: ['CLOSED'],
            },
        },
    });

    const totalPages = Math.ceil(totalBets / betsPerPage);

    return (
        <Container className="flex flex-col my-10 w-[96%]">
            <UserGame2Closed
                gameUserBetsData={gameUserBetsData}
                user={user}
                currentPage={page}
                totalPages={totalPages}
            />
        </Container>
    );
}