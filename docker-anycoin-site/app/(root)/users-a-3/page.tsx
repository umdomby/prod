// server page
"use server";
import { redirect } from 'next/navigation';
import { getUserSession } from "@/components/lib/get-user-session";
import { prisma } from "@/prisma/prisma-client";
import React from "react";
import { Container } from "@/components/container";
import {Player_All_3} from "@/components/Player_All_3";

export default async function PlayerStatisticsPage() {

    const session = await getUserSession();
    if (!session) {
        return redirect('/');
    }

    const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

    if (user?.role !== 'ADMIN') {
        return redirect('/');
    }


    const playerAll = await prisma.user.findMany({
        orderBy: {
            points: 'desc',
        },
    });

    return (
        <Container className="w-[96%]">
            <Player_All_3 userAll={playerAll}/>
        </Container>
    );
}