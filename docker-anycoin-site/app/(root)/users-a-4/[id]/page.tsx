import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';
import React, {Suspense} from "react";
import Loading from "@/app/(root)/loading";
import {getUserSession} from "@/components/lib/get-user-session";
import {redirect} from "next/navigation";
import {User_Data_4} from "@/components/User_Data_4";


export const dynamic = 'force-dynamic'

export default async function PlayerPage({
                                             params,
                                             searchParams,
                                         }: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page?: string }>;
}) {

    const session = await getUserSession();

    if (!session) {
        return redirect('/');
    }

    const userA = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

    if (userA?.role !== 'ADMIN') {
        return redirect('/');
    }
    const resolvedSearchParams = await searchParams; // Await the searchParams if it's a Promise
    // Wait for params to resolve
    const { id } = await params;

    // Convert id to a number
    const playerId = parseInt(id, 10);


    const user = await prisma.user.findFirst({ where: { id: Number(playerId) } });

    if (!user) {
        // Handle the case where the user is not found
        return (
            <Container className="w-[100%]">
                <p>User not found</p>
            </Container>
        );
    }

    const page = parseInt(resolvedSearchParams.page ?? '1', 10);
    const betsPerPage = 50;
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
                <User_Data_4 user={user} closedBets={closedBets} currentPage={page} totalPages={totalPages} playerId={playerId}/>
            </Suspense>
        </Container>
    );
}
