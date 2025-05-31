import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';
import { redirect } from 'next/navigation';
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import { getUserSession } from "@/components/lib/get-user-session";
import { checkAndCloseOrderP2PTime } from '@/app/actions';
import {OrderP2PPendingA} from "@/components/OrderP2PPendingA"; // Импортируем функцию

export default async function OrderP2PPendingPage() {
    // Закрываем просроченные сделки перед рендерингом страницы
    await checkAndCloseOrderP2PTime();

    const session = await getUserSession();

    if (!session) {
        return redirect('/');
    }

    const user = await prisma.user.findFirst({
        where: { id: Number(session?.id) },
    });

    if (!user || user.role !== 'ADMIN') {
        return redirect('/');
    }

    // Запрос к базе данных
    const openOrders = await prisma.orderP2P.findMany({
        where: {
            orderP2PStatus: { in: ['PENDING'] }
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
                    // Добавьте другие необходимые поля
                }
            },
            orderP2PUser2: {
                select: {
                    id: true,
                    cardId: true,
                    fullName: true,
                    telegram: true,
                    // Добавьте другие необходимые поля
                }
            }
        }
    });


    return (
        <Container className="w-[100%]">
            <Suspense fallback={<Loading />}>
                <OrderP2PPendingA user={user} openOrders={openOrders} />
            </Suspense>
        </Container>
    );
}
