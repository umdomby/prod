"use server"
import { Container } from '@/components/container';
import { getUserSession } from '@/components/lib/get-user-session';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react';
import Loading from "@/app/(root)/loading";
import {prisma} from "@/prisma/prisma-client";
import SocketClient from "@/components/control/SocketClient";
import WebRTC from  "@/components/webrtc";


export default async function Home() {
    // const session = await getUserSession();

    // if (!session?.id) {
    //     return (
    //         <Container className="flex flex-col my-10">
    //             <Suspense fallback={<Loading />}>
    //                 123
    //             </Suspense>
    //         </Container>
    //     );
    // }

    // const user = await prisma.user.findFirst({
    //     where: {
    //         id: Number(session.id)
    //     }
    // });

    // if (!user) {
    //     return (
    //         <Container className="flex flex-col my-10">
    //             <Suspense fallback={<Loading />}>
    //                 123
    //             </Suspense>
    //         </Container>
    //     );
    // }

    return (
        // <Container className="flex flex-col my-10">
            <Suspense fallback={<Loading />}>
                {/*<SocketClient/>*/}
                <WebRTC/>
            </Suspense>
        // </Container>
    );
}