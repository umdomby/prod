"use server";
import { Container } from '@/components/container';
import { prisma } from '@/prisma/prisma-client';
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import { getUserSession } from "@/components/lib/get-user-session";
import TelegramNotification from '@/components/TelegramNotification';
import BanedNotification from "@/components/BanedNotification";
import Link from "next/link";
import { User } from "@prisma/client";
import GlobalDataComponent from "@/components/globalData";
import {SheetChat} from "@/components/SheetChat";
import {HEROES_CLIENT_2_USERS} from "@/components/HEROES_CLIENT_2_USERS";
import {PointsUser} from "@/components/PointsUser";



const FixedLink = () => (
    <div className="fixed bottom-4 right-4 p-4 shadow-lg rounded-lg z-50">
        <p className="text-md text-blue-500 font-bold">
            <Link className="text-blue-500 hover:text-green-300 font-bold text-xl" href={'https://t.me/navatar85'}
                  target="_blank">@navatar85</Link>
        </p>
    </div>
);

interface PointsUserProps {
    user: User;
}




export default async function UserGameBet2Page() {
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
                    <PointsUser user={user} />
                    <SheetChat user={user}/>
                </>

            )}
            {user && user.role !== 'BANED' && (
                <>
                    {isTelegramEmpty && (
                        <TelegramNotification initialTelegram={user.telegram || ''} />
                    )}
                    <FixedLink />
                    <Suspense fallback={<Loading />}>
                        <GlobalDataComponent/>
                        <HEROES_CLIENT_2_USERS user={user} />
                    </Suspense>
                </>
            )}
            {user && user.role === 'BANED' && (
                <Suspense fallback={<Loading />}>
                    <BanedNotification />
                    <GlobalDataComponent/>
                    {/*<HEROES_CLIENT_NO_REG_2 />*/}
                </Suspense>
            )}
            {!user && (
                <Suspense fallback={<Loading/>}>
                    <FixedLink/>
                    <GlobalDataComponent/>
                    {/*<HEROES_CLIENT_NO_REG_2/>*/}
                </Suspense>
            )}
        </Container>
    );
}
