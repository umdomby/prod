"use server";
import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';
import { redirect } from 'next/navigation';
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import { getUserSession } from "@/components/lib/get-user-session";
import { BET_FOUND_A } from "@/components/BET_FOUND_A";

export default async function BetFoundPage() {
    const session = await getUserSession();

    if (!session) {
        return redirect('/');
    }

    const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

    if (!user || user.role !== 'ADMIN') {
        return redirect('/');
    }

    const globalData = await prisma.globalData.findUnique({
        where: { id: 1 },
    });

    return (
        <Container className="w-[100%]">
            <Suspense fallback={<Loading />}>
                <BET_FOUND_A user={user} betFund={globalData?.betFund || 0} />
            </Suspense>
        </Container>
    );
}