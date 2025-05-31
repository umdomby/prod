"use server";

import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import { USERS_ALL_CLOSED_4 } from "@/components/USERS_ALL_CLOSED_4";
import { getUserSession } from "@/components/lib/get-user-session";
import { redirect } from "next/navigation";
import {USERS_ALL_CLOSED_4_A} from "@/components/USERS_ALL_CLOSED_4_A";
import {USERS_ALL_CLOSED_2} from "@/components/USERS_ALL_CLOSED_2";

export default async function Bet4ClosedPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const session = await getUserSession();

    const resolvedSearchParams = await searchParams; // Await the searchParams if it's a Promise

    const page = parseInt(resolvedSearchParams.page ?? '1', 10);
    const betsPerPage = 100;
    const skip = (page - 1) * betsPerPage;

    // Fetch closed bets with pagination for 4 players
    const closedBets4 = await prisma.betCLOSED4.findMany({
        include: {
            participantsCLOSED4: true,
            player1: true,
            player2: true,
            player3: true,
            player4: true,
            creator: true,
            category: true,
            product: true,
            productItem: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        skip: skip,
        take: betsPerPage,
    });

    const totalBets4 = await prisma.betCLOSED4.count();
    const totalPages4 = Math.ceil(totalBets4 / betsPerPage);


    if (!session) {
        return (
            <Container className="w-[100%]">
                <Suspense fallback={<Loading/>}>
                    <USERS_ALL_CLOSED_4 closedBets={closedBets4} currentPage={page} totalPages={totalPages4}/>
                </Suspense>
            </Container>
        )
    }

    const user = await prisma.user.findFirst({
        where: { id: Number(session?.id) },
    });

    if (!user || user.role === 'BANED') {
        return <USERS_ALL_CLOSED_4 closedBets={closedBets4} currentPage={page} totalPages={totalPages4} />;
    }

    return (
        <Container className="w-[100%]">
            <Suspense fallback={<Loading />}>
                <USERS_ALL_CLOSED_4_A user={user} closedBets={closedBets4} currentPage={page} totalPages={totalPages4} />
            </Suspense>
        </Container>
    );
}