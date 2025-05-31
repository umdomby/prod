"use server";

import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import { getUserSession } from "@/components/lib/get-user-session";
import TelegramNotification from '@/components/TelegramNotification';
import Link from "next/link";
import { User } from "@prisma/client";
import GlobalDataComponent from "@/components/globalData";
import { HEROES_CLIENT_CLOSED_2 } from "@/components/HEROES_CLIENT_CLOSED_2";
import { HEROES_CLIENT_CLOSED_3 } from "@/components/HEROES_CLIENT_CLOSED_3";
import { HEROES_CLIENT_CLOSED_4 } from "@/components/HEROES_CLIENT_CLOSED_4";
import { redirect } from "next/navigation";
import {PointsUser} from "@/components/PointsUser";

const FixedLink = () => (
    <div className="fixed bottom-4 right-4 p-4 shadow-lg rounded-lg z-50">
        <p className="text-md text-blue-500 font-bold">
            <Link className="text-blue-500 hover:text-green-300 font-bold text-xl" href={'https://t.me/navatar85'}
                  target="_blank">@navatar85</Link>
        </p>
    </div>
);

interface PointsUserProps {
    user: User;
}

export default async function Home({ searchParams }: { searchParams: Promise<{ page2?: string, page3?: string, page4?: string }> }) {
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

    const isTelegramEmpty = user && (!user.telegram || user.telegram.trim() === '');

    const page2 = parseInt(resolvedSearchParams.page2 ?? '1', 10);
    const page3 = parseInt(resolvedSearchParams.page3 ?? '1', 10);
    const page4 = parseInt(resolvedSearchParams.page4 ?? '1', 10);
    const betsPerPage = 5;

    // Получаем закрытые ставки с пагинацией для 2 игроков
    const closedBets = await prisma.betCLOSED.findMany({
        where: {
            participantsCLOSED: {
                some: {
                    userId: user.id
                }
            }
        },
        include: {
            participantsCLOSED: true,
            player1: true,
            player2: true,
        },
        orderBy: {
            updatedAt: 'desc'
        },
        skip: (page2 - 1) * betsPerPage,
        take: betsPerPage,
    });

    const totalBets2 = await prisma.betCLOSED.count({
        where: {
            participantsCLOSED: {
                some: {
                    userId: user.id
                }
            }
        }
    });

    const totalPages2 = Math.ceil(totalBets2 / betsPerPage);

    // Получаем закрытые ставки с пагинацией для 3 игроков
    const closedBets3 = await prisma.betCLOSED3.findMany({
        where: {
            participantsCLOSED3: {
                some: {
                    userId: user.id
                }
            }
        },
        include: {
            participantsCLOSED3: true,
            player1: true,
            player2: true,
            player3: true,
        },
        orderBy: {
            updatedAt: 'desc'
        },
        skip: (page3 - 1) * betsPerPage,
        take: betsPerPage,
    });

    const totalBets3 = await prisma.betCLOSED3.count({
        where: {
            participantsCLOSED3: {
                some: {
                    userId: user.id
                }
            }
        }
    });

    const totalPages3 = Math.ceil(totalBets3 / betsPerPage);

    // Получаем закрытые ставки с пагинацией для 4 игроков
    const closedBets4 = await prisma.betCLOSED4.findMany({
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
        skip: (page4 - 1) * betsPerPage,
        take: betsPerPage,
    });

    const totalBets4 = await prisma.betCLOSED4.count({
        where: {
            participantsCLOSED4: {
                some: {
                    userId: user.id
                }
            }
        }
    });

    const totalPages4 = Math.ceil(totalBets4 / betsPerPage);

    return (
        <Container className="w-[100%] relative">
            {user && (
                <PointsUser user={user} />
            )}
            {user && (
                <>
                    {isTelegramEmpty && (
                        <TelegramNotification initialTelegram={user.telegram || ''} />
                    )}
                    <FixedLink />
                    <Suspense fallback={<Loading />}>
                        <GlobalDataComponent />
                        <br />
                        2 players
                        <HEROES_CLIENT_CLOSED_2 user={user} closedBets={closedBets} currentPage={page2} totalPages={totalPages2} />
                        <br />
                        3 players
                        <HEROES_CLIENT_CLOSED_3 user={user} closedBets={closedBets3} currentPage={page3} totalPages={totalPages3} />
                        <br />
                        4 players
                        <HEROES_CLIENT_CLOSED_4 user={user} closedBets={closedBets4} currentPage={page4} totalPages={totalPages4} />
                    </Suspense>
                </>
            )}
        </Container>
    );
}