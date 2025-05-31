"use client";
import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteBetWinnLoseClosed3 } from "@/app/actions"; // Импортируем функцию удаления

interface BetCLOSED3 {
    id: number;
    player1: { id: number; name: string };
    player2: { id: number; name: string };
    player3: { id: number; name: string };
    totalBetPlayer1: number;
    totalBetPlayer2: number;
    totalBetPlayer3: number;
    oddsBetPlayer1: number;
    oddsBetPlayer2: number;
    oddsBetPlayer3: number;
    createdAt: Date;
    margin: number | null;
    winnerId: number | null;
}

interface User {
    role: string;
}

interface Props {
    closedBets: BetCLOSED3[];
    currentPage: number;
    totalPages: number;
    user: User;
}

export const USERS_ALL_CLOSED_3_A: React.FC<Props> = ({ user, closedBets, currentPage, totalPages }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showResultDialog, setShowResultDialog] = useState(false);
    const [selectedBetId, setSelectedBetId] = useState<number | null>(null);
    const [resultMessage, setResultMessage] = useState('');

    const handleDelete = async () => {
        if (selectedBetId !== null && user?.role === 'ADMIN') {
            try {
                await deleteBetWinnLoseClosed3(selectedBetId);
                setResultMessage('Ставка успешно удалена');
            } catch (error) {
                setResultMessage('Ошибка при удалении ставки');
            } finally {
                setShowResultDialog(true);
                setShowConfirmDialog(false);
                setTimeout(() => setShowResultDialog(false), 3000);
            }
        }
    };

    const openConfirmDialog = (betId: number) => {
        setSelectedBetId(betId);
        setShowConfirmDialog(true);
    };

    return (
        <div>
            {closedBets.map((bet) => {
                const formattedDate = new Date(bet.createdAt).toLocaleDateString();
                const isDraw = bet.winnerId === null;
                const isPlayer1Winner = bet.winnerId === bet.player1.id;
                const isPlayer2Winner = bet.winnerId === bet.player2.id;

                const player1Class = isDraw ? 'text-green-500' : (isPlayer1Winner ? 'text-green-500' : 'text-red-500');
                const player2Class = isDraw ? 'text-green-500' : (isPlayer2Winner ? 'text-green-500' : 'text-red-500');
                const player3Class = isDraw ? 'text-green-500' : (!isPlayer1Winner && !isPlayer2Winner ? 'text-green-500' : 'text-red-500');

                return (
                    <div key={bet.id} className="border border-gray-700 mt-1">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className={`text-center overflow-hidden whitespace-nowrap w-[15%] ${player1Class}`}>
                                        <div>{bet.player1.name}</div>
                                    </TableCell>
                                    <TableCell className={`text-center overflow-hidden whitespace-nowrap w-[15%] ${player2Class}`}>
                                        <div>{bet.player2.name}</div>
                                    </TableCell>
                                    <TableCell className={`text-center overflow-hidden whitespace-nowrap w-[15%] ${player3Class}`}>
                                        <div>{bet.player3.name}</div>
                                    </TableCell>
                                    <TableCell className={`text-center overflow-hidden whitespace-nowrap w-[10%] ${player1Class}`}>
                                        <div>{Math.floor(bet.totalBetPlayer1 * 100) / 100}</div>
                                    </TableCell>
                                    <TableCell className={`text-center overflow-hidden whitespace-nowrap w-[10%] ${player2Class}`}>
                                        <div>{Math.floor(bet.totalBetPlayer2 * 100) / 100}</div>
                                    </TableCell>
                                    <TableCell className={`text-center overflow-hidden whitespace-nowrap w-[10%] ${player3Class}`}>
                                        <div>{Math.floor(bet.totalBetPlayer3 * 100) / 100}</div>
                                    </TableCell>
                                    <TableCell className="text-right overflow-hidden whitespace-nowrap w-[15%]">
                                        <div>{formattedDate}</div>
                                    </TableCell>
                                    {user?.role === 'ADMIN' && (
                                        <TableCell className="text-right overflow-hidden whitespace-nowrap w-[15%]">
                                            <Button onClick={() => openConfirmDialog(bet.id)} className="btn btn-danger h-5">
                                                Удалить
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                );
            })}

            <div className="pagination-buttons flex justify-center mt-6">
                <Link href={`/bet-winn-lose-closed-3?page=${currentPage - 1}`}>
                    <Button className="btn btn-primary mx-2 w-[100px] h-7" disabled={currentPage === 1}>
                        Previous
                    </Button>
                </Link>
                <span className="mx-3 text-lg font-semibold">
                    Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                    <Link href={`/bet-winn-lose-closed-3?page=${currentPage + 1}`}>
                        <Button className="btn btn-primary mx-2 w-[100px] h-7">
                            Next
                        </Button>
                    </Link>
                )}
            </div>

            {/* Диалоговое окно подтверждения удаления */}
            {showConfirmDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <div className="p-4 rounded">
                        <p>Вы уверены, что хотите удалить эту ставку?</p>
                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setShowConfirmDialog(false)} className="mr-2">
                                Отмена
                            </Button>
                            <Button onClick={handleDelete} className="btn btn-danger">
                                Удалить
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Диалоговое окно результата */}
            {showResultDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <div className="p-4 rounded">
                        <p>{resultMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};