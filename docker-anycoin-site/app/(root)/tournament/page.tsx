// server page
"use server";
import { redirect } from 'next/navigation';
import { getUserSession } from "@/components/lib/get-user-session";
import { prisma } from "@/prisma/prisma-client";
import React from "react";
import { Container } from "@/components/container";
import { TOURNAMENT } from "@/components/TOURNAMENT";

export default async function PlayerStatisticsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const session = await getUserSession();
    const user = session ? await prisma.user.findFirst({ where: { id: Number(session.id) } }) : null;

    // Получаем данные, которые не зависят от пагинации
    const turnirs = await prisma.turnirBet.findMany();
    const categories = await prisma.category.findMany();
    const players = await prisma.player.findMany();

    return (
        <Container className="w-[96%]">
            <TOURNAMENT
                user={user} // This can be null if the user is not logged in
                turnirs={turnirs}
                categories={categories}
                players={players}
            />
        </Container>
    );
}