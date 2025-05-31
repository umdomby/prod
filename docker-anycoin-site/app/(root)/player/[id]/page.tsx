import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';

import React, {Suspense} from "react";
import Loading from "@/app/(root)/loading";
import {Player_Data} from "@/components/Player_Data";

export const dynamic = 'force-dynamic'

export default async function PlayerPage({
                                             params,
                                         }: {
    params: Promise<{ id: string }>;
}) {
    // Wait for params to resolve
    const { id } = await params;

    // Convert id to a number
    const playerId = parseInt(id, 10);

    const playerData = await prisma.player.findFirst({
        where: { id: playerId }
    });

    return (
        <Container className="w-[96%]">
            <Suspense fallback={<Loading />}>
                {playerData ? (
                    <Player_Data playerData={playerData} />
                ) : (
                    <div>Данные игрока не найдены</div>
                )}
            </Suspense>
        </Container>
    );
}
