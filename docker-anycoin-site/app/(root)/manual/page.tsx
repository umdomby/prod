"use server";
import {prisma} from '@/prisma/prisma-client';
import {Container} from "@/components/container";
import {MANUAL} from "@/components/MANUAL";

export default async function Manual() {

    const users = await prisma.user.findMany({
        orderBy: {
            points: 'desc', // Sort by points in descending order
        },
    });

    return (
        <Container className="flex flex-col my-10">
            <MANUAL users={users}/>
        </Container>
    )
}