"use client"; // Указываем, что компонент клиентский
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
import { updateUserRole } from '@/app/actions';
import {UserRole} from "@prisma/client"; // Импортируем функцию для обновления роли

interface User {
    id: number;
    fullName: string;
    points: number;
    cardId: string;
    email: string;
    telegram: string | null;
    telegramView: boolean;
    createdAt: Date;
    role: UserRole; // Добавляем поле для роли
}

interface Props {
    className?: string;
    users: User[];
    user: User;
}

export const ADMIN_USER: React.FC<Props> = ({ className, user, users }) => {
    const [showCopyMessage, setShowCopyMessage] = useState(false);
    const [copiedUserName, setCopiedUserName] = useState('');

    const handleCopy = (cardId: string, fullName: string) => {
        navigator.clipboard.writeText(cardId);
        setCopiedUserName(fullName);
        setShowCopyMessage(true);
        setTimeout(() => setShowCopyMessage(false), 1000);
    };

    const handleRoleChange = async (userId: number, role: UserRole) => {
        try {
            await updateUserRole(userId, role);
            alert(`Роль пользователя обновлена до ${role}`);
        } catch (error) {
            console.error('Ошибка при обновлении роли:', error);
            alert('Не удалось обновить роль пользователя');
        }
    };

    return (
        <div className={`p-4 ${className}`}>
            <h1 className="text-2xl font-bold text-center mb-6 p-2 rounded-lg">
                USER ADMIN
            </h1>
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">Points</TableHead>
                        <TableHead className="text-center">User</TableHead>
                        <TableHead className="text-center">Email</TableHead>
                        <TableHead className="text-center">Card ID</TableHead>
                        <TableHead className="text-center">Дата создания</TableHead>
                        <TableHead className="text-center">Telegram</TableHead>
                        <TableHead className="text-center">Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user, index) => (
                        <TableRow key={index} className="hover:bg-gray-400">
                            <TableCell className="text-center">{Math.floor(user.points * 100) / 100}</TableCell>
                            <TableCell className="text-center">{user.fullName}</TableCell>
                            <TableCell className="text-center">{user.email}</TableCell>
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
                                {user.telegram ? (
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
                            <TableCell className="text-center">
                                <div className="flex justify-center items-center">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`role-${user.id}`}
                                            checked={user.role === 'USER'}
                                            onChange={() => handleRoleChange(user.id, 'USER')}
                                        />
                                        USER
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`role-${user.id}`}
                                            checked={user.role === 'USER_BET'}
                                            onChange={() => handleRoleChange(user.id, 'USER_BET')}
                                        />
                                        USER_BET
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`role-${user.id}`}
                                            checked={user.role === 'USER_EDIT'}
                                            onChange={() => handleRoleChange(user.id, 'USER_EDIT')}
                                        />
                                        USER_EDIT
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`role-${user.id}`}
                                            checked={user.role === 'ADMIN'}
                                            onChange={() => handleRoleChange(user.id, 'ADMIN')}
                                        />
                                        ADMIN
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`role-${user.id}`}
                                            checked={user.role === 'BANED'}
                                            onChange={() => handleRoleChange(user.id, 'BANED')}
                                        />
                                        BANED
                                    </label>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {showCopyMessage && (
                <div
                    className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-2 rounded shadow-lg">
                    Card ID {copiedUserName} скопирован!
                </div>
            )}
        </div>
    );
};
