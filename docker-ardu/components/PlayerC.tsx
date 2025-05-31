"use client";
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import KafkaNotifier from '@/components/KafkaNotifier';

interface Player {
    id: number;
    name: string;
    email: string;
    phone: number;
}

export default function PlayerC() {
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/players');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log("11111111")
                const data = await response.json();
                setPlayers(data);
            } catch (error) {
                console.error('Failed to fetch players:', error);
            }
        };

        // Получаем данные сразу при монтировании компонента
        fetchData();

        // Запускаем fetchData каждые 3 секунды
        const intervalId = setInterval(fetchData, 3000);

        // Очищаем интервал при размонтировании компонента
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="text-center">
            <KafkaNotifier />
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-bold">ID</TableCell>
                        <TableCell className="font-bold">Name</TableCell>
                        <TableCell className="font-bold">Email</TableCell>
                        <TableCell className="font-bold">Phone</TableCell>
                    </TableRow>
                    {players.map((player) => (
                        <TableRow key={player.id}>
                            <TableCell>{player.id}</TableCell>
                            <TableCell>{player.name}</TableCell>
                            <TableCell>{player.email}</TableCell>
                            <TableCell>{player.phone}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}