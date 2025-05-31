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
import {Player} from "@prisma/client";
import Link from "next/link";
import {Button} from "@/components/ui";

interface Props {
    playerAll: Player[];
    className?: string;
}

export const Player_All: React.FC<Props> = ({playerAll}) => {
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
                        <TableHead>Name</TableHead>
                        <TableHead>Games</TableHead>
                        <TableHead>Win</TableHead>
                        <TableHead>Loss</TableHead>
                        <TableHead>%</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {playerAll.map((player, index) => (
                        <TableRow key={player.id}>
                            <TableCell className="text-red-500">
                                <Link className="text-blue-500 cursor-pointer hover:text-green-500" href={`/player/${player.id}`}>
                                    {index + 1}
                                </Link>
                            </TableCell>
                            <TableCell className="text-yellow-500">
                                <Link className="text-blue-500 cursor-pointer hover:text-green-500" href={`/player/${player.id}`}>
                                    {player.name}
                                </Link>
                            </TableCell>
                            <TableCell className="text-green-500">{player.countGame ?? 'N/A'}</TableCell>
                            <TableCell className="text-blue-500">{player.winGame ?? 'N/A'}</TableCell>
                            <TableCell className="text-purple-500">{player.lossGame ?? 'N/A'}</TableCell>
                            <TableCell className="text-pink-500">{player.rateGame !== null && player.rateGame !== undefined ? player.rateGame.toFixed(2) : 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>
    );
};
