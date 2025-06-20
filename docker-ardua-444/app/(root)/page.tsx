"use server"
import { Container } from '@/components/container';
import { getUserSession } from '@/components/lib/get-user-session';
import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Loading from "@/app/(root)/loading";
import WebRTC from "@/components/webrtc";

export default async function Home({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
    console.log('[Home] Запрос на главную страницу, searchParams:', searchParams);

    const session = await getUserSession();
    console.log('[Home] Сессия:', session);

    const roomId = Array.isArray(searchParams.roomId) ? searchParams.roomId[0] : searchParams.roomId;

    if (!session?.id) {
        console.log('[Home] Нет сессии, редирект на /register');
        if (roomId) {
            console.log('[Home] Обнаружен roomId, редирект на /no-reg');
            redirect(`/no-reg?roomId=${roomId}`);
        }
        redirect('/register');
    }

    console.log('[Home] Пользователь авторизован, доступ к WebRTC и WebSocket разрешен');

    return (
        <Suspense fallback={<Loading />}>
            <WebRTC />
        </Suspense>
    );
}