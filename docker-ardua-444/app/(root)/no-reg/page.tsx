"use server";
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getDeviceByRoomId } from '@/app/actions';
import NoRegWebRTC from '@/components/no_reg/NoRegWebRTC';
import NoRegSocketClient from '@/components/no_reg/NoRegSocketClient';
import Loading from "../loading";

export default async function NoRegPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
    const roomId = Array.isArray(searchParams.roomId) ? searchParams.roomId[0] : searchParams.roomId;

    console.log(`[NoRegPage] Получен roomId: ${roomId}`);

    if (!roomId) {
        console.error('[NoRegPage] roomId отсутствует, редирект на /not-found');
        redirect('/not-found');
    }

    const device = await getDeviceByRoomId(roomId);

    if (!device) {
        console.error(`[NoRegPage] Устройство не найдено для roomId: ${roomId}, редирект на /not-found`);
        redirect('/not-found');
    }

    console.log(`[NoRegPage] Устройство найдено: ${roomId}, idDevice: ${device.idDevice}`);

    return (
        <main className="min-h-screen flex flex-col items-center p-4">
            <Suspense fallback={<Loading />}>
                <NoRegWebRTC idDevice={device.idDevice} />
                <NoRegSocketClient idDevice={device.idDevice} />
            </Suspense>
        </main>
    );
}
