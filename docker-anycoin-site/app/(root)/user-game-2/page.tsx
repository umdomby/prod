"use server";

import { prisma } from '@/prisma/prisma-client';
import React from "react";
import { getUserSession } from "@/components/lib/get-user-session";
import { UserGame2Comp } from "@/components/user-game-2-comp";
import { Container } from '@/components/container';
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function UserGame2Page() {
    const session = await getUserSession();

    if (!session) {
        redirect('/');
    }

    const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

    if (!user) {
        return redirect('/');
    }
    const player = await prisma.player.findFirst({ where: { userId: Number(session?.id) } });

    if (!player) {
        return (
            <div className="text-center">
                <p className="text-green-500">Вы не зарегистрированы как игрок</p>
                <p>
                    1. Заполните: Настройки Telegram
                </p>
                <p>
                    2. Зарегистрируйтесь как игрок
                </p>
                <p>
                    <Link href="/profile" className="text-blue-500">Profile</Link>
                </p>
            </div>
        );
    }

    return (
        <Container className="flex flex-col my-10 w-[96%]">
            <UserGame2Comp
                user={user}
            />
        </Container>
    );
}