"use server";
import { redirect } from 'next/navigation';
import {getUserSession} from "@/components/lib/get-user-session";
import {prisma} from "@/prisma/prisma-client";
import {AddEditPlayer} from "@/components/addEditPlayer";
import Loading from "@/app/(root)/loading";
import React, {Suspense} from "react";
import {Container} from "@/components/container";


export default async function AddPlayerPage() {
    const session = await getUserSession();

    if (!session) {
        return redirect('/');
    }

    const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

    if (user?.role !== 'ADMIN') {
        return redirect('/');
    }
    const players = await prisma.player.findMany();

    return (
        <Container className="w-[96%]">
            <Suspense fallback={<Loading />}>
                <AddEditPlayer user={user} players={players} />
            </Suspense>
        </Container>
    );
}