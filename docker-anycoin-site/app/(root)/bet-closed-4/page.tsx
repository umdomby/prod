"use server";

import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';
import { redirect } from 'next/navigation';
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import { getUserSession } from "@/components/lib/get-user-session";
import { HEROES_CLIENT_CLOSED_4 } from "@/components/HEROES_CLIENT_CLOSED_4";

export default async function BetClosedPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const resolvedSearchParams = await searchParams; // Await the searchParams if it's a Promise

    const session = await getUserSession();

    if (!session) {
        return redirect('/');
    }

    const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

    if (!user) {
        return redirect('/');
    }

    if (user.role === 'BANED') {
        return redirect('/');
    }

    const page = parseInt(resolvedSearchParams.page ?? '1', 10);
    const betsPerPage = 5;
    const skip = (page - 1) * betsPerPage;

    // Fetch closed bets with pagination
    const closedBets = await prisma.betCLOSED4.findMany({
        where: {
            participantsCLOSED4: {
                some: {
                    userId: user.id
                }
            }
        },
        include: {
            participantsCLOSED4: true,
            player1: true,
            player2: true,
            player3: true,
            player4: true,
        },
        orderBy: {
            updatedAt: 'desc'
        },
        skip: skip,
        take: betsPerPage,
    });

    const totalBets = await prisma.betCLOSED4.count({
        where: {
            participantsCLOSED4: {
                some: {
                    userId: user.id
                }
            }
        }
    });

    const totalPages = Math.ceil(totalBets / betsPerPage);

    return (
        <Container className="w-[100%]">
            <Suspense fallback={<Loading />}>
                <HEROES_CLIENT_CLOSED_4 user={user} closedBets={closedBets} currentPage={page} totalPages={totalPages} />
            </Suspense>
        </Container>
    );
}
