"use server";
import {prisma} from '@/prisma/prisma-client';
import {Container} from "@/components/container";
import {ADMIN_USER} from "@/components/ADMIN_USER";
import {redirect} from "next/navigation";
import {getUserSession} from "@/components/lib/get-user-session";


export default async function AdminUser() {

    const session = await getUserSession();

    if (!session) {
        return redirect('/');
    }

    const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

    if (!user || user.role !== 'ADMIN') {
        return redirect('/');
    }

    const users = await prisma.user.findMany({
        orderBy: {
            points: 'desc', // Sort by points in descending order
        },
    });


    return (
        <Container className="flex flex-col my-10">
            <ADMIN_USER user={user} users={users}/>
        </Container>
    )
}