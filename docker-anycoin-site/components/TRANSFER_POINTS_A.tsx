"use client";
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHeader,
    TableHead,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {User} from "@prisma/client";
import Link from "next/link";

interface Transfer {
    transferUser1Id: number;
    transferUser2Id: number | null;
    transferPoints: number;
    createdAt: Date;
    transferUser1: {
        cardId: string;
        telegram: string | null;
    };
    transferUser2: {
        cardId: string;
        telegram: string | null;
    } | null;
}

interface Props {
    user: User;
    transferHistory: Transfer[];
    currentPage: number;
    totalPages: number;
    className?: string;
}

export const TRANSFER_POINTS_A: React.FC<Props> = ({user, transferHistory, currentPage, totalPages, className}) => {


    return (
        <div className={`p-4 ${className}`}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-lg font-semibold">Points: {Math.floor(user.points * 100) / 100}</p>
                </div>
            </div>

            <Table className="mt-6">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">Дата</TableHead>
                        <TableHead className="text-center">Тип</TableHead>
                        <TableHead className="text-center">ID карты</TableHead>
                        <TableHead className="text-center">Telegram</TableHead>
                        <TableHead className="text-center">Баллы</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transferHistory.map((transfer, index) => (
                        <TableRow key={index}>
                            <TableCell
                                className="text-center">{new Date(transfer.createdAt).toLocaleString()}</TableCell>
                            <TableCell
                                className="text-center">{transfer.transferUser1Id === user.id ? 'Исходящий' : 'Входящий'}</TableCell>
                            <TableCell className="text-center">
                                {transfer.transferUser1Id === user.id
                                    ? (transfer.transferUser2 ? transfer.transferUser2.cardId : 'N/A')
                                    : transfer.transferUser1.cardId}
                            </TableCell>
                            <TableCell className="text-center">
                                {transfer.transferUser1Id === user.id
                                    ? (transfer.transferUser2 && transfer.transferUser2.telegram
                                        ? <Link
                                            className="text-blue-500 hover:text-green-300 font-bold"
                                            href={transfer.transferUser2.telegram?.replace(/^@/, 'https://t.me/') || '#'}
                                            target="_blank"
                                        >
                                            {transfer.transferUser2.telegram}
                                        </Link>
                                        : 'N/A')
                                    : (transfer.transferUser1.telegram
                                            ? <Link
                                                className="text-blue-500 hover:text-green-300 font-bold"
                                                href={transfer.transferUser1.telegram?.replace(/^@/, 'https://t.me/') || '#'}
                                                target="_blank"
                                            >
                                                {transfer.transferUser1.telegram}
                                            </Link>
                                            : 'N/A'
                                    )
                                }
                            </TableCell>
                            <TableCell
                                className="text-center">{transfer.transferUser1Id === user.id ? `-${transfer.transferPoints}` : `+${transfer.transferPoints}`}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="pagination-buttons flex justify-center mt-6">
                <Link href={`/transfer-points-admin?page=${currentPage - 1}`}>
                    <Button className="btn btn-primary mx-2 w-[100px] h-7" disabled={currentPage === 1}>
                        Previous
                    </Button>
                </Link>
                <span className="mx-3 text-lg font-semibold">
                    Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                    <Link href={`/transfer-points-admin?page=${currentPage + 1}`}>
                        <Button className="btn btn-primary mx-2 w-[100px] h-7">
                            Next
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
};