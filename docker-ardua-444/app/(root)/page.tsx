"use server"
import { Container } from '@/components/container';
import { getUserSession } from '@/components/lib/get-user-session';
import { prisma } from "@/prisma/prisma-client";
import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Loading from "@/app/(root)/loading";
import WebRTC from "@/components/webrtc";

export default async function Home() {
    const session = await getUserSession();

    if (!session?.id) {
        redirect('/register');
    }

    const user = await prisma.user.findFirst({
        where: {
            id: Number(session.id)
        }
    });

    if (!user) {
        redirect('/register');
    }

    return (
        // <Container className="flex flex-col my-10">
            <Suspense fallback={<Loading />}>
                <WebRTC />
            </Suspense>
        // </Container>
    );
}