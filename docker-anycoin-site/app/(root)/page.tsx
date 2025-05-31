"use server";
import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import { getUserSession } from "@/components/lib/get-user-session";
import TelegramNotification from '@/components/TelegramNotification';
import BanedNotification from "@/components/BanedNotification";
import Link from "next/link";
import { HEROES_CLIENT_2 } from "@/components/HEROES_CLIENT_2";
import { HEROES_CLIENT_NO_REG_2 } from "@/components/HEROES_CLIENT_NO_REG_2";
import { HEROES_CLIENT_3 } from "@/components/HEROES_CLIENT_3";
import { HEROES_CLIENT_NO_REG_3 } from "@/components/HEROES_CLIENT_NO_REG_3";
import { HEROES_CLIENT_4 } from "@/components/HEROES_CLIENT_4";
import { HEROES_CLIENT_NO_REG_4 } from "@/components/HEROES_CLIENT_NO_REG_4";
import GlobalDataComponent from "@/components/globalData";
import {SheetChat} from "@/components/SheetChat";
import {PointsUser} from "@/components/PointsUser";

const FixedLink = () => (
    <div className="fixed bottom-4 right-4 shadow-lg rounded-lg z-50">
            <Link className="text-blue-500 hover:text-green-300 font-bold text-xl" href={'https://t.me/navatar85'}
                  target="_blank">@</Link>
    </div>
);

export default async function Home() {
    const session = await getUserSession();
    let user = null;

    if (session) {
        user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });
    }

    const isTelegramEmpty = user && (!user.telegram || user.telegram.trim() === '');

    return (
        <Container className="w-[100%] relative">
            {user && (
                <>
                    <PointsUser user={user}/> <SheetChat user={user}/>
                </>

            )}
            {user && user.role !== 'BANED' && (
                <>
                    {isTelegramEmpty && (
                        <TelegramNotification initialTelegram={user.telegram || ''}/>
                    )}
                    <FixedLink/>
                    <Suspense fallback={<Loading/>}>
                        <GlobalDataComponent/>
                        <HEROES_CLIENT_2 user={user} />
                        <HEROES_CLIENT_3 user={user} />
                        <HEROES_CLIENT_4 user={user} />
                    </Suspense>
                </>
            )}
            {user && user.role === 'BANED' && (
                <Suspense fallback={<Loading />}>
                    <BanedNotification />
                    <GlobalDataComponent/>
                    <HEROES_CLIENT_NO_REG_2 />
                    <HEROES_CLIENT_NO_REG_3 />
                    <HEROES_CLIENT_NO_REG_4 />
                </Suspense>
            )}
            {!user && (
                <Suspense fallback={<Loading/>}>
                    <FixedLink/>
                    <GlobalDataComponent/>
                    <HEROES_CLIENT_NO_REG_2/>
                    <HEROES_CLIENT_NO_REG_3/>
                    <HEROES_CLIENT_NO_REG_4/>
                </Suspense>
            )}
        </Container>
    );
}
