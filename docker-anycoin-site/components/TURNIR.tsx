"use client";

import React, { useState, useEffect } from 'react';
import { playerTurnirAdd, playerTurnirDelete, playerTurnirAdminUpdate, playerTurnirAdminDelete, updateGetDataTurnirPage } from '@/app/actions';
import { Button, Input } from "@/components/ui";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHeader,
    TableHead,
} from "@/components/ui/table";

interface User {
    id: number;
    fullName: string;
    role: string;
    points: number;
}

interface Turnir {
    id: number;
    titleTurnir: string;
    startPointsTurnir: number;
    textTurnirTurnir: string;
}

interface TurnirPlayer {
    id: number;
    userId: number;
    turnirId: number;
    startPointsPlayer: number;
    checkPointsPlayer: number | null;
    orderP2PUser: User;
    createdAt: Date;
}

interface Props {
    className?: string;
    user: User;
    turnirs: Turnir[];
    turnirPlayers: { turnirId: number; players: TurnirPlayer[] }[];
}

export const TURNIR: React.FC<Props> = ({ className, user, turnirs: initialTurnirs, turnirPlayers: initialTurnirPlayers }) => {
    const [turnirs, setTurnirs] = useState<Turnir[]>(initialTurnirs);
    const [turnirPlayers, setTurnirPlayers] = useState<{ turnirId: number; players: TurnirPlayer[] }[]>(initialTurnirPlayers);
    const [selectedTurnir, setSelectedTurnir] = useState<number | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [editPlayer, setEditPlayer] = useState<{ id: number; newPoints: number; newTurnirId: number } | null>(null);

    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
    };

    const handleAddPlayer = async () => {
        if (!selectedTurnir) return;

        try {
            const response = await playerTurnirAdd(user.id, selectedTurnir);
            showMessage(response.message);
            await fetchData(); // Обновляем данные после добавления игрока
        } catch (error) {
            console.error('Ошибка при добавлении игрока:', error);
            showMessage('Не удалось добавить игрока');
        }
    };

    const handleDeletePlayer = async () => {
        if (!selectedTurnir) return;

        try {
            const response = await playerTurnirDelete(user.id, selectedTurnir);
            showMessage(response.message);
            await fetchData(); // Обновляем данные после удаления игрока
        } catch (error) {
            console.error('Ошибка при удалении игрока:', error);
            showMessage('Не удалось удалить игрока');
        }
    };

    const handleAdminUpdatePlayer = async () => {
        if (!editPlayer) return;

        try {
            const response = await playerTurnirAdminUpdate(editPlayer.id, editPlayer.newPoints, editPlayer.newTurnirId);
            showMessage(response.message);
            setEditPlayer(null); // Сбрасываем состояние редактирования после сохранения
            await fetchData(); // Обновляем данные после обновления игрока
        } catch (error) {
            console.error('Ошибка при обновлении игрока:', error);
            showMessage('Не удалось обновить игрока');
        }
    };

    const handleAdminDeletePlayer = async (playerId: number) => {
        try {
            const response = await playerTurnirAdminDelete(playerId);
            showMessage(response.message);
            await fetchData(); // Обновляем данные после удаления игрока
        } catch (error) {
            console.error('Ошибка при удалении игрока администратором:', error);
            showMessage('Не удалось удалить игрока');
        }
    };

    const fetchData = async () => {
        try {
            const data = await updateGetDataTurnirPage();
            setTurnirs(data.turnirs);
            setTurnirPlayers(data.turnirPlayers);
        } catch (error) {
            console.error('Ошибка при обновлении данных:', error);
        }
    };

    useEffect(() => {
        if (selectedTurnir !== null) {
            fetchData();
        }
    }, [selectedTurnir]);

    const playersForSelectedTurnir = selectedTurnir
        ? turnirPlayers.find(tp => tp.turnirId === selectedTurnir)?.players || []
        : [];

    const isUserInTurnir = playersForSelectedTurnir.some(player => player.userId === user.id);

    // Получаем название выбранного турнира
    const selectedTurnirTitle = turnirs.find(turnir => turnir.id === selectedTurnir)?.titleTurnir || '';
    const selectedTurnirText = turnirs.find(turnir => turnir.id === selectedTurnir)?.textTurnirTurnir || '';
    const selectedTurnirPoints = turnirs.find(turnir => turnir.id === selectedTurnir)?.startPointsTurnir|| 0;

    return (
        <div className={className}>
            <div><span className="text-amber-500">Points</span> <span className="text-red-500">{Math.floor(user.points * 100) / 100}</span>
            </div>
            <h2 className="mb-5">Турниры. При регистрации <span className="text-amber-500">points</span> не списываются.
            </h2>
            <select onChange={(e) => setSelectedTurnir(Number(e.target.value))}>
                <option value="">Выберите турнир</option>
                {turnirs.map(turnir => (
                    <option key={turnir.id} value={turnir.id}>
                        {turnir.titleTurnir}, points: {turnir.startPointsTurnir}
                    </option>
                ))}
            </select>
            <Button className="mx-3 h-7" onClick={handleAddPlayer} disabled={!selectedTurnir || isUserInTurnir}>
                В турнир
            </Button>
            <Button className="h-7" onClick={handleDeletePlayer} disabled={!selectedTurnir || !isUserInTurnir}>
                Удалить себя из турнира
            </Button>

            {message && (
                <div
                    className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50"
                >
                    {message}
                </div>
            )}

            {isUserInTurnir && (
                <div className="text-green-500 mt-2">
                    Вы уже зарегистрированы в этом турнире.
                </div>
            )}


            <div><span className="text-green-500">{selectedTurnirText}</span></div>
            <div>Для регистрации {selectedTurnirPoints} points</div>
            <div className="text-center"><h2>Игроки в турнире: <span className="text-amber-500"><strong>{selectedTurnirTitle}</strong></span></h2></div>

            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[25%]">Name</TableHead>
                        <TableHead className="w-[20%]">Наличие взноса</TableHead>
                        <TableHead className="w-[25%]">Дата регистрации</TableHead>
                        {user.role === 'ADMIN' && <TableHead>Действия</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {playersForSelectedTurnir.map(player => (
                        <TableRow key={player.id}>
                            <TableCell>{player.orderP2PUser.fullName}</TableCell>
                            <TableCell>
                                <span className={`inline-block w-4 h-4 rounded-full ${player.checkPointsPlayer ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </TableCell>
                            <TableCell>{new Date(player.createdAt).toLocaleString()}</TableCell>
                            {user.role === 'ADMIN' && (
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={editPlayer?.id === player.id ? editPlayer.newPoints : player.startPointsPlayer}
                                        onChange={(e) => setEditPlayer({
                                            id: player.id,
                                            newPoints: Number(e.target.value),
                                            newTurnirId: player.turnirId
                                        })}
                                    />
                                    <Button onClick={handleAdminUpdatePlayer}
                                            disabled={!editPlayer || editPlayer.id !== player.id}>
                                        Сохранить
                                    </Button>
                                    <Button onClick={() => handleAdminDeletePlayer(player.id)}>Удалить</Button>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};