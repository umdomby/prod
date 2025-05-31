"use server";
import { prisma } from '@/prisma/prisma-client';
import { getUserSession } from '@/components/lib/get-user-session';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Loading from "@/app/(root)/loading";
import { clientCreateBet3 } from "@/app/actions";
import { Container } from '@/components/container';
import { CreateBetForm3 } from "@/components/create-bet-form-3";

async function fetchData() {
    const session = await getUserSession();

    if (!session) {
        redirect('/');
    }

    try {
        const [user, categories, products, productItems, players, turnirBet, openBets] = await prisma.$transaction([
            prisma.user.findUnique({ where: { id: parseInt(session.id) } }),
            prisma.category.findMany(),
            prisma.product.findMany(),
            prisma.productItem.findMany(),
            prisma.player.findMany({ where: { userId: parseInt(session.id) } }),
            prisma.turnirBet.findMany(), // Добавлено для получения TurnirBet
            prisma.bet3.findMany({ where: { status: 'OPEN' } }) // Получение открытых ставок
        ]);
        return { user, categories, products, productItems, players, turnirBet, openBets };
    } catch (error) {
        console.error("Error fetching data:", error);
        return { user: null, categories: [], products: [], productItems: [], players: [], turnirBet: [], openBets: [] };
    }
}

export default async function CreateBetPage() {
    const { user, categories, products, productItems, players, turnirBet, openBets } = await fetchData();

    if (!user || user.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <Container className="flex flex-col my-10 w-[96%]">
            <Suspense fallback={<Loading />}>
                <CreateBetForm3
                    user={user}
                    categories={categories}
                    products={products}
                    productItems={productItems}
                    players={players}
                    turnirBet={turnirBet} // Передача turnirBets в компонент
                    openBets={openBets} // Передача открытых ставок в компонент
                    createBet3={clientCreateBet3}
                />
            </Suspense>
        </Container>
    );
}