// /app/((root))/order-p2p-pending/index.tsx
"use server"
import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';
import { redirect } from 'next/navigation';
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import { getUserSession } from "@/components/lib/get-user-session";
import { OrderP2PPending } from "@/components/OrderP2PPending";
import {checkAndCloseOrderP2PTime} from "@/app/actions";
import Link from "next/link";


export default async function OrderP2PPendingPage() {
    await checkAndCloseOrderP2PTime();
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

    // Закрываем просроченные сделки перед рендерингом страницы
    await checkAndCloseOrderP2PTime();

    const openOrders = await prisma.orderP2P.findMany({
        where: {
            OR: [
                {
                    orderP2PUser1: { id: user.id },
                    orderP2PStatus: { in: ['PENDING'] }
                },
                {
                    orderP2PUser2: { id: user.id },
                    orderP2PStatus: { in: ['PENDING'] }
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
        }
    });

    return (
        <Container className="w-[100%]">
            <Suspense fallback={<Loading />}>
                <OrderP2PPending user={user} openOrders={openOrders} />
            </Suspense>
        </Container>
    );
}



