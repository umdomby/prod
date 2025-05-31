// server page
"use server";
import { redirect } from 'next/navigation';
import { getUserSession } from "@/components/lib/get-user-session";
import { prisma } from "@/prisma/prisma-client";
import React from "react";
import { Container } from "@/components/container";
import TurnirBetManager from "@/components/turnirBetManager";


export default async function AdminTurnirBetPage() {
    const session = await getUserSession();

    if (!session) {
        return redirect('/');
    }

    const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

    if (user?.role !== 'ADMIN') {
        return redirect('/');
    }

    // Получаем список турниров, отсортированных по id в порядке возрастания
    const turnirBets = await prisma.turnirBet.findMany({
        orderBy: {
            id: 'asc', // Сортировка по возрастанию id
        },
    });

    return (
        <Container className="w-[96%]">
            <TurnirBetManager turnirBets={turnirBets} />
        </Container>
    );
}