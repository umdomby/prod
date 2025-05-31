'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Container} from "@/components/container";
import {User} from "@prisma/client";
import Link from "next/link";
import {Button} from "@/components/ui";

interface Props {
    userAll: User[];
    className?: string;
}

export const Player_All_3: React.FC<Props> = ({userAll}) => {
    return (
        <Container>
            <Link href="/tournament">
                <Button className="m-5 h-5">ТУРНИРЫ HEROES HUB</Button>
            </Link>
            <Table>
                <TableCaption>List of Players</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Telegram</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Points</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {userAll.map((user, index) => (
                        <TableRow key={user.id}>
                            <TableCell className="text-red-500">
                                <Link className="text-blue-500 cursor-pointer hover:text-green-500" href={`/users-a-3/${user.id}`}>
                                    {index + 1}
                                </Link>
                            </TableCell>
                            <TableCell className="text-yellow-500">
                                <Link className="text-blue-500 cursor-pointer hover:text-green-500" href={`/users-a-3/${user.id}`}>
                                    {user.id}
                                </Link>
                            </TableCell>
                            <TableCell className="text-yellow-500">
                                <Link className="text-blue-500 cursor-pointer hover:text-green-500" href={`/users-a-3/${user.id}`}>
                                    {user.fullName}
                                </Link>
                            </TableCell>
                            <TableCell className="text-yellow-500">
                                <Link className="text-blue-500 cursor-pointer hover:text-green-500" href={`/users-a-3/${user.id}`}>
                                    {user.telegram}
                                </Link>
                            </TableCell>
                            <TableCell className="text-yellow-500">
                                <Link className="text-blue-500 cursor-pointer hover:text-green-500" href={`/users-a-3/${user.id}`}>
                                    {user.email}
                                </Link>
                            </TableCell>
                            <TableCell className="text-yellow-500">
                                <Link className="text-blue-500 cursor-pointer hover:text-green-500" href={`/users-a-3/${user.id}`}>
                                    {user.points}
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>
    );
};
