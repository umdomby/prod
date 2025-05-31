import { prisma } from '@/prisma/prisma-client';
import { Rating } from '@/components/rating';
import { Container } from "@/components/container";
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import Link from "next/link";
import {Button} from "@/components/ui";
export const dynamic = 'force-dynamic'

export default async function RatingPage({
                                             searchParams,
                                         }: {
    searchParams: Promise<{ page?: string | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page ?? '1', 10);
    const usersPerPage = 100;
    const skip = (page - 1) * usersPerPage;

    const users = await prisma.user.findMany({
        where: {
            role: {
                not: 'ADMIN', // Исключаем пользователей с ролью "ADMIN"
            },
        },
        orderBy: {
            points: 'desc',
        },
        skip: skip,
        take: usersPerPage,
    });

    const totalUsers = await prisma.user.count();
    const totalPages = Math.ceil(totalUsers / usersPerPage);

    return (
        <Container className="flex flex-col my-10">
            <Suspense fallback={<Loading />}>
                <Rating users={users} currentPage={page} totalPages={totalPages} />
                <div className="pagination-buttons flex justify-center mt-6">
                    <Link href={`/rating?page=${page - 1}`}>
                        <Button
                            className="btn btn-primary mx-2 w-[100px] h-7"
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                    </Link>
                    <span className="mx-3 text-lg font-semibold">
                        Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                        <Link href={`/rating?page=${page + 1}`}>
                            <Button className="btn btn-primary mx-2 w-[100px] h-7">
                                Next
                            </Button>
                        </Link>
                    )}
                </div>
            </Suspense>
        </Container>
    );
}
