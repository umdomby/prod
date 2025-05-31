// server page
"use server";
import { redirect } from 'next/navigation';
import { getUserSession } from "@/components/lib/get-user-session";
import { prisma } from "@/prisma/prisma-client";
import React from "react";
import { Container } from "@/components/container";
import {Player_All} from "@/components/Player_All";

export default async function PlayerStatisticsPage() {

    //const session = await getUserSession();
    // if (!session) {
    //     return redirect('/');
    // }
    //
    // const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });
    //
    // if (user?.role !== 'ADMIN') {
    //     return redirect('/');
    // }


    const playerAll = await prisma.player.findMany({
        orderBy: {
            rateGame: 'desc', // Сортировка по убыванию
        },
    });

    return (
        <Container className="w-[96%]">
            <Player_All playerAll={playerAll}/>
        </Container>
    );
}