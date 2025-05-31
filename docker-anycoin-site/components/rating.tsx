"use client";
import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHeader,
    TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {UserRole} from "@prisma/client";

interface User {
    id: number;
    fullName: string;
    points: number;
    cardId: string;
    email: string;
    telegram: string | null;
    telegramView: boolean;
    createdAt: Date;
    role: UserRole;
}

interface Props {
    className?: string;
    users: User[];
    currentPage: number;
    totalPages: number;
}

export const Rating: React.FC<Props> = ({ className, users, currentPage, totalPages }) => {
    const [showCopyMessage, setShowCopyMessage] = useState(false);
    const [copiedUserName, setCopiedUserName] = useState('');

    const handleCopy = (cardId: string, fullName: string) => {
        navigator.clipboard.writeText(cardId);
        setCopiedUserName(fullName);
        setShowCopyMessage(true);
        setTimeout(() => setShowCopyMessage(false), 1000);
    };

    return (
        <div className={`p-4 ${className}`}>
            <h1 className="text-2xl font-bold text-center mb-2 p-2 rounded-lg">
                Rating
            </h1>

            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">#</TableHead>
                        <TableHead className="text-center">Points</TableHead>
                        <TableHead className="text-center">User</TableHead>
                        <TableHead className="text-center">Email</TableHead>
                        <TableHead className="text-center">Card ID</TableHead>
                        <TableHead className="text-center">Дата создания</TableHead>
                        <TableHead className="text-center">Telegram</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user, index) => (
                        <TableRow key={user.id} className="hover:bg-gray-400">
                            <TableCell className="text-center">{(currentPage - 1) * 100 + index + 1}</TableCell>
                            <TableCell className="text-center">{Math.floor(user.points * 100) / 100}</TableCell>
                            <TableCell className="text-center">{user.fullName}</TableCell>
                            <TableCell className="text-center">{user.email.slice(0, 5)}...</TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center items-center">
                                    <span className="mr-2">{user.cardId}</span>
                                    <Button
                                        onClick={() => handleCopy(user.cardId, user.fullName)}
                                        className="bg-blue-500 text-white px-2 py-1 rounded h-5"
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">{user.createdAt.toLocaleDateString()}</TableCell>
                            <TableCell className="text-center">
                                {user.telegramView && user.telegram ? (
                                    <Link
                                        className="text-blue-500 hover:text-green-300 font-bold"
                                        href={user.telegram.replace(/^@/, 'https://t.me/')}
                                        target="_blank"
                                    >
                                        {user.telegram}
                                    </Link>
                                ) : (
                                    <span className="text-gray-500">Скрыто</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {showCopyMessage && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-2 rounded shadow-lg">
                    Card ID {copiedUserName} скопирован!
                </div>
            )}
        </div>
    );
};