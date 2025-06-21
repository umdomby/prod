"use server"
import { Container } from '@/components/container';
import { getUserSession } from '@/components/lib/get-user-session';
import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Loading from "@/app/(root)/loading";
import WebRTC from "@/components/webrtc";

export default async function Home({
                                       searchParams
                                   }: {
    searchParams: Promise<{ roomId?: string | string[] }>
}) {
    const params = await searchParams;
    const session = await getUserSession();

    const roomId = Array.isArray(params.roomId)
        ? params.roomId[0]
        : params.roomId;

    if (!session?.id) {
        if (roomId) {
            redirect(`/no-reg?roomId=${roomId}`);
        }
        redirect('/register');
    }

    return (
        <Suspense fallback={<Loading />}>
            <WebRTC />
        </Suspense>
    );
}