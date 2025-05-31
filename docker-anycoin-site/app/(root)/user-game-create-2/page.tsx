"use server";
import { prisma } from '@/prisma/prisma-client';
import { getUserSession } from '@/components/lib/get-user-session';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react';
import Loading from "@/app/(root)/loading";
import { Container } from '@/components/container';
import { UserGame2CreateComp } from "@/components/user-game-2-create-comp";
import { Player } from '@prisma/client';
import Link from "next/link"; // Ensure this import is correct

async function fetchData() {
    const session = await getUserSession();

    if (!session) {
        redirect('/');
    }

    try {
        const [user, categories, products, productItems, players] = await prisma.$transaction([
            prisma.user.findUnique({ where: { id: parseInt(session.id) } }),
            prisma.category.findMany(),
            prisma.product.findMany(),
            prisma.productItem.findMany(),
            prisma.player.findMany(),
        ]);

        // Find the player associated with the user
        const player = players.find((p: Player) => p.userId === user?.id);
        return { user, categories, products, productItems, player };

    } catch (error) {
        console.error("Error fetching data:", error);
        return { user: null, categories: [], products: [], productItems: [], player: null };
    }
}

export default async function UserGamePage() {
    const { user, categories, products, productItems, player } = await fetchData();

    if (!user) {
        redirect('/');
    }

    if (!player) {
        return <div className="text-center">
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
        </div>;
    }

    const heroesControl = await prisma.heroesControl.findFirst();
    if (heroesControl && heroesControl.stopGameUserCreate) {
        return (
            <div className="text-center text-red-500">
                <h1><strong>Game Player2 временно остановлен. Извините за неудобства.</strong></h1>
            </div>
        );
    }

    return (
        <Container className="flex flex-col my-10 w-[96%]">
            <Suspense fallback={<Loading />}>
                <UserGame2CreateComp
                    user={user}
                    categories={categories}
                    products={products}
                    productItems={productItems}
                    player={player} // Pass the single player
                />
            </Suspense>
        </Container>
    );
}
