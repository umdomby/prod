"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BetParticipantCLOSED3 {
    id: number;
    betCLOSED3Id: number;
    userId: number;
    amount: number;
    odds: number;
    profit: number;
    player: string;
    isWinner: boolean;
    createdAt: Date;
    margin: number;
    isCovered: string;
    overlap: number;
    return: number;
}

interface BetCLOSED3 {
    id: number;
    participantsCLOSED3: BetParticipantCLOSED3[];
    player1: { id: number; name: string };
    player2: { id: number; name: string };
    totalBetPlayer1: number;
    totalBetPlayer2: number;
    oddsBetPlayer1: number;
    oddsBetPlayer2: number;
    createdAt: Date;
    margin: number | null;
    winnerId: number | null;
    updatedAt: Date;
    globalDataBetFund: number;
}

interface Props {
    user: any;
    closedBets: BetCLOSED3[];
    currentPage: number;
    totalPages: number;
    playerId: number;
}

export const User_Data_3: React.FC<Props> = ({ user, closedBets, currentPage, totalPages, playerId }) => {
    const totalProfitLoss = closedBets.reduce((total, bet) => {
        const userBets = bet.participantsCLOSED3.filter((p) => p.userId === user.id);
        return total + userBets.reduce((sum, p) => sum + (p.isWinner ? p.profit : (p.return - p.amount)), 0);
    }, 0);

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <p className={totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                        Общая прибыль/потеря: {Math.floor(totalProfitLoss * 100) / 100}
                    </p>
                </div>
            </div>

            {closedBets.map((bet) => {
                const userBets = bet.participantsCLOSED3.filter((p: BetParticipantCLOSED3) => p.userId === user.id);

                if (userBets.length === 0) return null;

                return (
                    <div key={bet.id} className="border border-gray-700 mt-1">
                        <Accordion type="single" collapsible>
                            <AccordionItem value={`item-${bet.id}`}>
                                <AccordionTrigger>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="text-ellipsis overflow-hidden whitespace-nowrap w-[20%]">
                                                    <div className={bet.winnerId === bet.player1.id ? 'text-green-500' : bet.winnerId === bet.player2.id ? 'text-red-500' : 'text-white'}>
                                                        {bet.player1.name}
                                                    </div>
                                                    <div>
                                                        <span className={userBets.filter((p) => p.player === 'PLAYER1').reduce((sum, p) => sum + (p.isWinner ? p.profit : (p.return - p.amount)), 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                                            {Math.floor(userBets.filter((p) => p.player === 'PLAYER1').reduce((sum, p) => sum + (p.isWinner ? p.profit : (p.return - p.amount)), 0) * 100) / 100}
                                                        </span>
                                                    </div>
                                                    <div>{Math.floor(bet.totalBetPlayer1 * 100) / 100}</div>
                                                </TableCell>
                                                <TableCell className="text-ellipsis overflow-hidden whitespace-nowrap w-[20%]">
                                                    <div className={bet.winnerId === bet.player2.id ? 'text-green-500' : bet.winnerId === bet.player1.id ? 'text-red-500' : 'text-white'}>
                                                        {bet.player2.name}
                                                    </div>
                                                    <div>
                                                        <span className={userBets.filter((p) => p.player === 'PLAYER2').reduce((sum, p) => sum + (p.isWinner ? p.profit : (p.return - p.amount)), 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                                            {Math.floor(userBets.filter((p) => p.player === 'PLAYER2').reduce((sum, p) => sum + (p.isWinner ? p.profit : (p.return - p.amount)), 0) * 100) / 100}
                                                        </span>
                                                    </div>
                                                    <div>{Math.floor(bet.totalBetPlayer2 * 100) / 100}</div>
                                                </TableCell>
                                                <TableCell className="text-ellipsis overflow-hidden whitespace-nowrap w-[20%]"></TableCell>
                                                <TableCell className="text-ellipsis overflow-hidden whitespace-nowrap w-[20%]"></TableCell>
                                                <TableCell className="w-[15%]">
                                                    <div>{Math.floor(bet.oddsBetPlayer1 * 100) / 100}</div>
                                                    <div>{Math.floor(bet.oddsBetPlayer2 * 100) / 100}</div>
                                                    <div>Fund: {Math.floor(bet.globalDataBetFund * 100) / 100}</div>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="m-1 p-4 rounded-lg">
                                        <h4 className="text-md font-semibold mb-2">Дата и время закрытия ставок: {new Date(bet.updatedAt).toLocaleString()}</h4>
                                    </div>

                                    {userBets.map((participant) => {
                                        return (
                                            <div key={participant.id} className="border border-gray-200 p-1 mb-1 rounded-md">
                                                <p>
                                                    Ставка: <strong>{participant.amount}</strong> на{' '}
                                                    <strong>
                                                        {participant.player === 'PLAYER1' ? bet.player1.name : bet.player2.name}
                                                    </strong>
                                                    {','} Коэффициент: <span>{Math.floor(participant.odds * 100) / 100}</span>
                                                    {','} Прибыль: <span>{Math.floor(participant.profit * 100) / 100}</span>
                                                    {','} Маржа: <span>{participant.margin !== null ? Math.floor(participant.margin * 100) / 100 : '0.00'}</span>
                                                    {','} {new Date(participant.createdAt).toLocaleString()}
                                                </p>
                                                <p>
                                                    {bet.winnerId === null ? (
                                                        <span className="text-blue-500">Ничья</span>
                                                    ) : participant.isWinner ? (
                                                        <span className="text-green-500">Ставка выиграла</span>
                                                    ) : (
                                                        <span className="text-red-500">Ставка проиграла</span>
                                                    )}
                                                </p>
                                                <p>
                                                    {participant.isWinner ? (
                                                        <span className="text-green-500">
                                                            Возврат: {Math.floor(participant.return * 100) / 100} Points
                                                        </span>
                                                    ) : (
                                                        <span className={Math.floor((participant.return - participant.amount) * 100) / 100 === 0 ? 'text-purple-500' : 'text-red-500'}>
                                                            Потеря: {Math.floor((participant.return - participant.amount) * 100) / 100} Points
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                );
            })}

            <div className="pagination-buttons flex justify-center mt-6">
                {

                }
                {totalPages !== 1 && currentPage > 1 && (
                    <Link href={`/users-a-3/${playerId}?page=${currentPage - 1}`}>
                        <Button className="btn btn-primary mx-2 w-[100px] h-7">
                            Previous
                        </Button>
                    </Link>
                )}

                <span className="mx-3 text-lg font-semibold">
                    Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                    <Link href={`/users-a-3/${playerId}?page=${currentPage + 1}`}>
                        <Button className="btn btn-primary mx-2 w-[100px] h-7">
                            Next
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
};