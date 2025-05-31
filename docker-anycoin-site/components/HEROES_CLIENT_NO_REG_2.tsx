"use client";
import React, { useEffect, useState } from "react";
import {
    Bet as PrismaBet,
    Player,
    PlayerChoice,
    User,
    BetParticipant,
    BetStatus,
} from "@prisma/client";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { unstable_batchedUpdates } from "react-dom";


import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

const fetcher = (url: string, options?: RequestInit) =>
    fetch(url, options).then((res) => res.json());

interface Bet extends PrismaBet {
    player1: Player;
    player2: Player;
    participants: BetParticipant[];
    maxBetPlayer1: number;
    maxBetPlayer2: number;
    oddsBetPlayer1: number;
    oddsBetPlayer2: number;
    margin: number;
    overlapPlayer1: number;
    overlapPlayer2: number;
    totalBetPlayer1: number;
    totalBetPlayer2: number;
    totalBetAmount: number;
}

interface Props {
    className?: string;
}

const playerColors = {
    [PlayerChoice.PLAYER1]: "text-blue-400",
    [PlayerChoice.PLAYER2]: "text-red-400",
};

export const HEROES_CLIENT_NO_REG_2: React.FC<Props> = ({ className }) => {
    const {
        data: bets,
        error,
        isLoading,
        mutate,
    } = useSWR<Bet[]>("/api/get-bets", fetcher, {
        refreshInterval: 10000,
        revalidateOnFocus: true,
    });

    useEffect(() => {
        let source = new EventSource("/api/sse");

        source.onmessage = (event) => {
            const data = JSON.parse(event.data);

            unstable_batchedUpdates(() => {
                if (
                    data.type === "create" ||
                    data.type === "update" ||
                    data.type === "delete"
                ) {
                    mutate();
                }
            });
        };

        source.onerror = (err) => {
            console.error("SSE Error:", err);
            source.close();
            setTimeout(() => {
                source = new EventSource("/api/sse");
            }, 5000);
        };

        return () => {
            source.close();
        };
    }, [mutate]);

    if (isLoading) {
        return <div>Загрузка данных...</div>;
    }

    if (error) {
        return <div>Ошибка при загрузке данных: {error.message}</div>;
    }

    if (!bets) {
        return <div>Нет данных</div>;
    }

    return (
        <div>
            {bets.map((bet: Bet) => (
                <div key={bet.id} className="border border-gray-700 mt-1">
                    <Accordion type="single" collapsible>
                        <AccordionItem value={`item-${bet.id}`}>
                            <AccordionTrigger>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            {/* Игрок 1 */}
                                            <TableCell
                                                className={`${playerColors[PlayerChoice.PLAYER1]} text-ellipsis  overflow-hidden whitespace-nowrap w-[22%]`}
                                            >
                                                <div>
                                                    {bet.player1.name}

                                                </div>
                                                <div>{Math.floor(bet.totalBetPlayer1 * 100) / 100}</div>
                                            </TableCell>

                                            {/* Игрок 2 */}
                                            <TableCell
                                                className={`${playerColors[PlayerChoice.PLAYER2]} text-ellipsis  overflow-hidden whitespace-nowrap w-[22%]`}
                                            >
                                                <div>
                                                    {bet.player2.name}

                                                </div>
                                                <div>{Math.floor(bet.totalBetPlayer2 * 100) / 100}</div>
                                            </TableCell>
                                            <TableCell
                                                className={`${playerColors[PlayerChoice.PLAYER2]} text-ellipsis  overflow-hidden whitespace-nowrap w-[22%]`}
                                            >
                                            </TableCell>
                                            <TableCell
                                                className={`${playerColors[PlayerChoice.PLAYER2]} text-ellipsis  overflow-hidden whitespace-nowrap w-[22%]`}
                                            >
                                            </TableCell>
                                            {/* Коэффициент для игрока 1 и 2*/}
                                            <TableCell className="w-20">
                                                <div
                                                    className={`${playerColors[PlayerChoice.PLAYER1]} text-ellipsis overflow-hidden whitespace-nowrap`}
                                                >
                                                    {Math.floor(bet.oddsBetPlayer1 * 100) / 100}
                                                </div>
                                                <div
                                                    className={`${playerColors[PlayerChoice.PLAYER2]} text-ellipsis overflow-hidden whitespace-nowrap`}
                                                >
                                                    {Math.floor(bet.oddsBetPlayer2 * 100) / 100}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="m-4">
                                    <p>
                                        Общая сумма ставок на это событие:
                                        <span className="text-green-400"> {bet.totalBetAmount}</span>
                                    </p>
                                    <p>
                                        Максимальная ставка на{" "}
                                        <span className={playerColors[PlayerChoice.PLAYER1]}>
                                            {bet.player1.name}
                                        </span>
                                        :{" "}
                                        <span className={playerColors[PlayerChoice.PLAYER1]}>
                                            {Math.floor(bet.maxBetPlayer1 * 100) / 100}
                                        </span>
                                    </p>
                                    <p>
                                        Максимальная ставка на{" "}
                                        <span className={playerColors[PlayerChoice.PLAYER2]}>
                                            {bet.player2.name}
                                        </span>
                                        :{" "}
                                        <span className={playerColors[PlayerChoice.PLAYER2]}>
                                            {Math.floor(bet.maxBetPlayer2 * 100) / 100}
                                        </span>
                                    </p>
                                    <p>
                                        Поставлено:{" "}
                                        <span className={playerColors[PlayerChoice.PLAYER1]}>
                                            {bet.player1.name}
                                        </span>
                                        :{" "}
                                        <span className={playerColors[PlayerChoice.PLAYER1]}>
                                            {Math.floor(bet.overlapPlayer1 * 100) / 100} Points
                                        </span>
                                    </p>
                                    <p>
                                        Поставлено:{" "}
                                        <span className={playerColors[PlayerChoice.PLAYER2]}>
                                            {bet.player2.name}
                                        </span>
                                        :{" "}
                                        <span className={playerColors[PlayerChoice.PLAYER2]}>
                                            {Math.floor(bet.overlapPlayer2 * 100) / 100} Points
                                        </span>
                                    </p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            ))}
        </div>
    );
};
