"use server"
import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';
import { redirect } from 'next/navigation';
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import { getUserSession } from "@/components/lib/get-user-session";
import {OrderP2PClosed} from "@/components/OrderP2PClosed";
import Link from "next/link";



export default async function OrderP2PClosedPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const resolvedSearchParams = await searchParams; // Await the searchParams if it's a Promise

    const session = await getUserSession();

    if (!session) {
        return redirect('/');
    }

    const user = await prisma.user.findFirst({
        where: { id: Number(session?.id) },
    });

    if (!user) {
        return redirect('/');
    }

    if (user.role === 'BANED') {
        return redirect('/');
    }

    if (user.telegram === null || user.telegram === undefined || user.telegram === '') {
        return (
            <div className="text-center">
                <p className="text-green-500">Заполните:</p>
                <p>
                    1. Настройки Telegram
                </p>
                <p>
                    2. Один или несколько: Реквизиты банков
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

    const closeOrders = await prisma.orderP2P.findMany({
        where: {
            OR: [
                {
                    orderP2PUser1: { id: user.id },
                    orderP2PStatus: { in: ['CLOSED', 'RETURN'] }
                },
                {
                    orderP2PUser2: { id: user.id },
                    orderP2PStatus: { in: ['CLOSED', 'RETURN'] }
                }
            ]
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            orderP2PUser1: {
                select: {
                    id: true,
                    cardId: true,
                    fullName: true,
                    telegram: true,
                }
            },
            orderP2PUser2: {
                select: {
                    id: true,
                    cardId: true,
                    fullName: true,
                    telegram: true,
                }
            }
        },
        skip: skip,
        take: betsPerPage,
    });

    const totalOrders = await prisma.orderP2P.count({
        where: {
            OR: [
                {
                    orderP2PUser1: { id: user.id },
                    orderP2PStatus: { in: ['CLOSED', 'RETURN'] }
                },
                {
                    orderP2PUser2: { id: user.id },
                    orderP2PStatus: { in: ['CLOSED', 'RETURN'] }
                }
            ]
        }
    });

    const totalPages = Math.ceil(totalOrders / betsPerPage);

    return (
        <Container className="w-[100%]">
            <Suspense fallback={<Loading />}>
                <OrderP2PClosed user={user} closeOrders={closeOrders} currentPage={page} totalPages={totalPages} />
            </Suspense>
        </Container>
    );
}