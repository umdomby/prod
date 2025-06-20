"use server"

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getDeviceByRoomId, joinRoomViaProxy } from '@/app/actions'
import Loading from "@/app/(root)/loading";
import {NoRegWebRTC} from "@/components/no_reg/NoRegWebRTC";

export default async function NoRegPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
    const roomId = Array.isArray(searchParams.roomId) ? searchParams.roomId[0] : searchParams.roomId
    const proxyRoomId = Array.isArray(searchParams.proxyRoomId) ? searchParams.proxyRoomId[0] : searchParams.proxyRoomId

    console.log(`[NoRegPage] Получены параметры: roomId=${roomId}, proxyRoomId=${proxyRoomId}`)

    if (!roomId && !proxyRoomId) {
        console.error('[NoRegPage] roomId или proxyRoomId отсутствует, редирект на /not-found')
        redirect('/not-found')
    }

    // Проверка комнаты или прокси-комнаты
    let device = null
    if (proxyRoomId) {
        try {
            const response = await joinRoomViaProxy(proxyRoomId.replace(/-/g, ''))
            if ('error' in response) {
                console.error(`[NoRegPage] Ошибка прокси-доступа: ${response.error}`)
                redirect('/not-found')
            }
            device = await getDeviceByRoomId(response.roomId)
        } catch (err) {
            console.error(`[NoRegPage] Ошибка проверки прокси: ${err}`)
            redirect('/not-found')
        }
    } else if (roomId) {
        device = await getDeviceByRoomId(roomId)
    }

    if (!device) {
        console.error(`[NoRegPage] Устройство не найдено для ${proxyRoomId ? `proxyRoomId: ${proxyRoomId}` : `roomId: ${roomId}`}, редирект на /not-found`)
        redirect('/not-found')
    }

    console.log(`[NoRegPage] Устройство найдено: ${proxyRoomId || roomId}, idDevice: ${device.idDevice}`)

    return (
        <main className="min-h-screen flex flex-col items-center p-4">
            <Suspense fallback={<Loading />}>
                <NoRegWebRTC />
            </Suspense>
        </main>
    )
}
