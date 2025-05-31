"use client";
import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface Users {
    telegram: string | null; // Allow telegram to be null
    fullName: string;
    email: string;
    id: number;
}

interface BetParticipantCLOSED {
    id: number;
    betCLOSEDId: number;
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
    user: Users; // Change this from Users[] to Users
}

interface BetCLOSED {
    id: number;
    participantsCLOSED: BetParticipantCLOSED[];
    player1: { name: string };
    player2: { name: string };
    totalBetPlayer1: number;
    totalBetPlayer2: number;
    oddsBetPlayer1: number;
    oddsBetPlayer2: number;
    createdAt: Date;
    margin: number | null;
    winnerId: number | null;
    updatedAt: Date;
}

interface Props {
    user: any;
    closedBets: BetCLOSED[];
}

export const HEROES_CLIENT_CLOSED_2_A: React.FC<Props> = ({ user, closedBets }) => {
    // Подсчитываем общую прибыль/потерю
    const totalProfitLoss = closedBets.reduce((total, bet) => {
        //const userBets = bet.participantsCLOSED.filter((p) => p.userId === user.id);
        return total + bet.participantsCLOSED.reduce((sum, p) => sum + (p.isWinner ? p.profit : (p.return - p.amount)), 0);
    }, 0);

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <p>Ваши баллы: {Math.floor(user.points * 100) / 100}</p>
                    <p className={totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                        Общая прибыль/потеря: {Math.floor(totalProfitLoss * 100) / 100}
                    </p>
                </div>
            </div>

            {closedBets.map((bet) => {

                return (
                    <div key={bet.id} className="border border-gray-700 mt-1">
                        <Accordion type="single" collapsible>
                            <AccordionItem value={`item-${bet.id}`}>
                                <AccordionTrigger>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="text-ellipsis overflow-hidden whitespace-nowrap w-[25%]">
                                                    <div>{bet.player1.name}</div>
                                                    <div>{Math.floor(bet.totalBetPlayer1 * 100) / 100}</div>
                                                </TableCell>
                                                <TableCell className="text-ellipsis overflow-hidden whitespace-nowrap w-[25%]">
                                                    <div>{bet.player2.name}</div>
                                                    <div>{Math.floor(bet.totalBetPlayer2 * 100) / 100}</div>
                                                </TableCell>
                                                <TableCell className="w-[15%]">
                                                    <div>{Math.floor(bet.oddsBetPlayer1 * 100) / 100}</div>
                                                    <div>{Math.floor(bet.oddsBetPlayer2 * 100) / 100}</div>
                                                </TableCell>
                                                <TableCell className="text-ellipsis overflow-hidden whitespace-nowrap w-[40%]">
                                                    <div>
                                                        <span>{bet.player1.name}</span> :{' '}
                                                        <span
                                                            className={
                                                                bet.participantsCLOSED
                                                                    .filter((p) => p.player === 'PLAYER1')
                                                                    .reduce((sum, p) => sum + (p.isWinner ? p.profit : (p.return - p.amount)), 0) >= 0
                                                                    ? 'text-green-500'
                                                                    : 'text-red-500'
                                                            }
                                                        >
                                                            {Math.floor(bet.participantsCLOSED
                                                                .filter((p) => p.player === 'PLAYER1')
                                                                .reduce((sum, p) => sum + (p.isWinner ? p.profit : (p.return - p.amount)), 0) * 100) / 100}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span>{bet.player2.name}</span> :{' '}
                                                        <span
                                                            className={
                                                                bet.participantsCLOSED
                                                                    .filter((p) => p.player === 'PLAYER2')
                                                                    .reduce((sum, p) => sum + (p.isWinner ? p.profit : (p.return - p.amount)), 0) >= 0
                                                                    ? 'text-green-500'
                                                                    : 'text-red-500'
                                                            }
                                                        >
                                                            {Math.floor(bet.participantsCLOSED
                                                                .filter((p) => p.player === 'PLAYER2')
                                                                .reduce((sum, p) => sum + (p.isWinner ? p.profit : (p.return - p.amount)), 0) * 100) / 100}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="m-1 p-4 rounded-lg">
                                        <h4 className="text-md font-semibold mb-2">Дата и время закрытия
                                            ставок: {new Date(bet.updatedAt).toLocaleString()}</h4>
                                        <p>
                                            {/* Победитель: <strong>{winnerName}</strong> */}
                                        </p>
                                    </div>

                                    {bet.participantsCLOSED.length > 0 && (
                                        <div className="m-1 p-4 rounded-lg">
                                        <h4 className="text-md font-semibold mb-2">Ваши ставки на этот матч:</h4>
                                            {bet.participantsCLOSED.map((participant) => {
                                                const profitToCover =
                                                    participant.amount * (participant.odds - 1);
                                                const overlapPercentage =
                                                    participant.overlap > 0
                                                        ? Math.floor((participant.overlap / profitToCover) * 10000) / 100
                                                        : 0;

                                                return (
                                                    <div key={participant.id} className="border border-gray-200 p-1 mb-1 rounded-md">
                                                        <p>
                                                            Ставка: <span className="text-blue-500">
                                                                    {participant.user.telegram ? (
                                                                        <>
                                                                            <Link
                                                                                className="text-blue-500 hover:text-green-300 font-bold"
                                                                                href={`https://t.me/${participant.user.telegram.replace(/^@/, '')}`}
                                                                                target="_blank"
                                                                            >
                                                                                {participant.user.telegram},
                                                                            </Link>
                                                                        </>
                                                                    ) : (
                                                                        <span>No Telegram</span> // Or any other placeholder text you prefer
                                                                    )}
                                                            <Link className="text-blue-500 cursor-pointer hover:text-green-500" href={`/users-a-2/${participant.user.id}`}>
                                                                            <span> {participant.user.email}, </span>
                                                                            <span> {participant.user.fullName}, </span>
                                                                            <span> id: {participant.user.id} </span>
                                                            </Link>
                                                        </span> , <strong>{participant.amount}</strong> на{' '}
                                                            <strong>
                                                                {participant.player === 'PLAYER1' ? bet.player1.name : bet.player2.name}
                                                            </strong>
                                                            {','} Коэффициент: <span>{Math.floor(participant.odds * 100) / 100}</span>
                                                            {','} Прибыль: <span>{Math.floor(participant.profit * 100) / 100}</span>
                                                            {','} Маржа: <span>{participant.margin !== null ? Math.floor(participant.margin * 100) / 100 : '0.00'}</span>
                                                            {','} {new Date(participant.createdAt).toLocaleString()}
                                                        </p>
                                                        <p>
                                                            {participant.isWinner ? (
                                                                <span className="text-green-500">Ставка выиграла</span>
                                                            ) : (
                                                                <span className="text-red-500">Ставка проиграла</span>
                                                            )}
                                                        </p>
                                                        {participant.isCovered ? (
                                                            <p>
                                                                <span
                                                                    className={
                                                                        overlapPercentage === 0
                                                                            ? 'text-purple-500'
                                                                            : overlapPercentage === 100
                                                                                ? 'text-green-500'
                                                                                : 'text-yellow-500'
                                                                    }
                                                                >
                                                                    Ваша ставка была перекрыта на {Math.floor(participant.overlap * 100) / 100} Points (
                                                                    {overlapPercentage}%)
                                                                </span>
                                                                <br/>
                                                                {participant.isWinner ? (
                                                                    <span className="text-green-500">
                                                                        Возврат: {Math.floor(participant.return * 100) / 100} Points
                                                                    </span>
                                                                ) : (
                                                                    <span
                                                                        className={
                                                                            Math.floor((participant.return - participant.amount) * 100) / 100 === 0
                                                                                ? 'text-purple-500'
                                                                                : 'text-red-500'
                                                                        }
                                                                    >
                                                                        Потеря: {Math.floor((participant.return - participant.amount) * 100) / 100} Points
                                                                    </span>
                                                                )}
                                                            </p>
                                                        ) : (
                                                            <p>
                                                                <span className="text-yellow-500">
                                                                    Ваша ставка не была перекрыта (0 Points, 0%)
                                                                </span>
                                                                <br/>
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                );
            })}
        </div>
    );
};