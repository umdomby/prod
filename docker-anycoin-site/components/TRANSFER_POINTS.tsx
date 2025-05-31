"use client";
import React, {useState} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHeader,
    TableHead,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {User} from "@prisma/client";
import {getEmailByCardId, transferPoints} from "@/app/actions";
import Link from "next/link";
import toast from "react-hot-toast";

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

export const TRANSFER_POINTS: React.FC<Props> = ({user, transferHistory, currentPage, totalPages, className}) => {
    const [cardId, setCardId] = useState('');
    const [points, setPoints] = useState(50);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleTransfer = async () => {
        if (cardId === user.cardId) {
            setErrorMessage('Вы не можете передать баллы самому себе.');
            return;
        } else {
            setErrorMessage('');
        }

        if (points < 30 || points > user.points) {
            alert('Недопустимое количество баллов');
            return;
        }

        const {email, error} = await getEmailByCardId(cardId);

        if (email) {
            setRecipientEmail(email);
            setShowDialog(true);
        } else {
            alert(error || 'Пользователь не найден');
        }
    };

    const confirmTransfer = async () => {
        const result = await transferPoints(cardId, points);

        if (result) {
            setSuccessMessage('Баллы успешно переданы');
            setShowDialog(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } else {
            alert('Передача не удалась');
        }
    };

    const handleCopyCardId = () => {
        navigator.clipboard.writeText(user.cardId);
        toast.success('Card ID скопирован в буфер обмена');
    };

    return (
        <div className={`p-4 ${className}`}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-lg font-semibold">Points: {Math.floor(user.points * 100) / 100}</p>
                </div>
            </div>
            <div className="flex mb-3">
                <span className="mr-2">Card ID</span>
                <label className="block text-sm font-medium text-green-500">
                    <strong>{user.cardId}</strong>
                </label>
                <Button
                    onClick={handleCopyCardId}
                    className="ml-2 bg-blue-500 text-white px-2 py-1 rounded h-5"
                >
                    Copy
                </Button>
            </div>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleTransfer();
            }} className="space-y-4">
                <Input
                    type="text"
                    placeholder="ID карты получателя"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    required
                    className="w-full"
                />
                <Input
                    type="text"
                    value={points}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Удаляем все символы, кроме цифр
                        const sanitizedValue = value.replace(/[^0-9]/g, '');
                        // Удаляем ведущие нули
                        const cleanedValue = sanitizedValue.replace(/^0+(?=\d)/, '');
                        setPoints(cleanedValue === '' ? 0 : Number(cleanedValue));
                    }}
                    onBlur={() => {
                        if (points < 30) {
                            setErrorMessage('Минимальное количество баллов для передачи - 30');
                        } else {
                            setErrorMessage('');
                        }
                    }}
                    placeholder="Количество баллов"
                    required
                    className="w-full"
                />
                <Button type="submit" className="w-full bg-blue-500 text-white">Передать баллы</Button>
            </form>

            {errorMessage && (
                <p className="text-red-500 mt-2">{errorMessage}</p>
            )}

            {showDialog && (
                <div className="dialog mt-4 p-4 border rounded shadow-lg">
                    <p>Email получателя: {recipientEmail}</p>
                    <Button onClick={() => navigator.clipboard.writeText(recipientEmail)} className="mr-2">Копировать
                        Email</Button>
                    <Button onClick={confirmTransfer} className="bg-green-500 text-white">Подтвердить передачу</Button>
                </div>
            )}

            {successMessage && (
                <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
                    {successMessage}
                </div>
            )}

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
                <Link href={`/transfer-points?page=${currentPage - 1}`}>
                    <Button className="btn btn-primary mx-2 w-[100px] h-7" disabled={currentPage === 1}>
                        Previous
                    </Button>
                </Link>
                <span className="mx-3 text-lg font-semibold">
                    Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                    <Link href={`/transfer-points?page=${currentPage + 1}`}>
                        <Button className="btn btn-primary mx-2 w-[100px] h-7">
                            Next
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
};