"use server";

import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';
import { redirect } from 'next/navigation';
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import { getUserSession } from "@/components/lib/get-user-session";
import Link from "next/link";
import {TRANSFER_POINTS_A} from "@/components/TRANSFER_POINTS_A";

export default async function TransferPointsAdminPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
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

    if (user.telegram === null || user.telegram === undefined || user.telegram === '') {
        return (
            <div className="text-center">
                <p className="text-green-500">Заполните:</p>
                <p>
                    Настройки Telegram
                </p>
                <p>
                    <Link href="/profile" className="text-blue-500">Profile</Link>
                </p>
            </div>
        );
    }

    const page = parseInt(resolvedSearchParams.page ?? '1', 10);
    const transfersPerPage = 100;
    const skip = (page - 1) * transfersPerPage;

    // Fetch transfer history with pagination
    const transferHistory = await prisma.transfer.findMany({
        include: {
            transferUser1: { select: { cardId: true, telegram: true } },
            transferUser2: { select: { cardId: true, telegram: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: transfersPerPage,
    });

    const totalTransfers = await prisma.transfer.count({});

    const totalPages = Math.ceil(totalTransfers / transfersPerPage);

    return (
        <Container className="w-[100%]">
            <Suspense fallback={<Loading />}>
                <TRANSFER_POINTS_A user={user} transferHistory={transferHistory} currentPage={page} totalPages={totalPages} />
            </Suspense>
        </Container>
    );
}