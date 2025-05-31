'use client';

import React, {useEffect, useState} from 'react';
import { addEditPlayer, deletePlayer } from '@/app/actions';
import { Player, User } from "@prisma/client";
import { Input, Button } from "@/components/ui";
import {
    Table,
    TableBody,
    TableCell, TableHead, TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Props {
    user: User;
    players: Player[];
    className?: string;
}

export const AddEditPlayer: React.FC<Props> = ({ user, players, className }) => {
    const [player, setPlayer] = React.useState<Player[]>(players);
    const [playerName, setPlayerName] = useState('');
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
    const [confirmName, setConfirmName] = useState('');
    const [playerTwitch, setPlayerTwitch] = useState('');

    useEffect(() => {
        setPlayer(players);
    }, [players]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!playerName.trim() || !playerTwitch.trim()) {
            setMessage('Имя игрока и Twitch URL не могут быть пустыми');
            setMessageType('error');
            return;
        }
        try {
            const response = await addEditPlayer(selectedPlayerId, playerName, playerTwitch);
            setMessage(response.message);
            setMessageType(response.success ? 'success' : 'error');
            if (response.success) {
                // Reset form fields
                setPlayerName('');
                setPlayerTwitch('');
                setSelectedPlayerId(null);
            }
        } catch (error) {
            console.error('Не удалось сохранить игрока:', error);
            setMessage('Не удалось сохранить игрока');
            setMessageType('error');
        }
    };

    const handleEditClick = (player: Player) => {
        setPlayerName(player.name);
        setPlayerTwitch(player.twitch ?? ''); // Provide a default empty string if twitch is null
        setSelectedPlayerId(player.id);
    };

    const handleDeleteClick = (player: Player) => {
        setPlayerToDelete(player);
        setIsDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (playerToDelete && confirmName === playerToDelete.name) {
            try {
                await deletePlayer(playerToDelete.id);
                setMessage('Игрок успешно удален');
                setMessageType('success');
                setIsDialogOpen(false);
                setConfirmName('');
            } catch (error) {
                console.error('Не удалось удалить игрока:', error);
                setMessage('Не удалось удалить игрока');
                setMessageType('error');
            }
        } else {
            setMessage('Имя не совпадает');
            setMessageType('error');
        }
    };

    return (
        <div className={className}>
            <h1 className="text-3xl font-bold mb-4">Manage Players</h1>
            <form onSubmit={handleSubmit} className="mb-6">
                <Input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter player name"
                    required
                    className="mb-4"
                />
                <Input
                    type="text"
                    value={playerTwitch}
                    onChange={(e) => setPlayerTwitch(e.target.value)}
                    placeholder="Enter Twitch URL"
                    required
                    className="mb-4"
                />
                <Button type="submit" className="bg-blue-500 text-white">
                    {selectedPlayerId ? 'Edit Player' : 'Add Player'}
                </Button>
                {message && (
                    <p className={`mt-2 ${messageType === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                        {message}
                    </p>
                )}
            </form>

            <h2 className="text-2xl font-semibold mb-2">Existing Players</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Player Name</TableHead>
                        <TableHead>Twitch URL</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {player.map((player) => (
                        <TableRow key={player.id}>
                            <TableCell>{player.name}</TableCell>
                            <TableCell>{player.twitch}</TableCell>
                            <TableCell>
                                <Button onClick={() => handleEditClick(player)} className="bg-green-500 text-white">
                                    Edit
                                </Button>
                                <Button onClick={() => handleDeleteClick(player)} className="bg-red-500 text-white ml-2">
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Подтвердите удаление</DialogTitle>
                    </DialogHeader>
                    <p>Введите имя игрока для подтверждения удаления:</p>
                    <Input
                        type="text"
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                        placeholder="Введите имя игрока"
                        className="mb-4"
                    />
                    <DialogFooter>
                        <Button onClick={() => setIsDialogOpen(false)} className="bg-gray-500 text-white">
                            Отмена
                        </Button>
                        <Button onClick={handleDeleteConfirm} className="bg-red-500 text-white">
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
