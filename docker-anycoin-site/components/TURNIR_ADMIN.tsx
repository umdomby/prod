"use client";
import React, { useState } from 'react';
import { createTurnir, updateTurnir, deleteTurnir } from '@/app/actions';
import { Button, Input } from "@/components/ui";

interface Turnir {
    id: number;
    titleTurnir: string;
    textTurnirTurnir: string;
    startPointsTurnir: number;
    statusTurnir: string; // Assuming StatusTurnir is a string enum
    TurnirBool: boolean;
}

interface User {
    id: number;
    fullName: string;
    role: string;
}

interface Props {
    className?: string;
    user: User;
    turnirs: Turnir[];
}

export const TURNIR_ADMIN: React.FC<Props> = ({ className, user, turnirs: initialTurnirs }) => {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [startPoints, setStartPoints] = useState(0);
    const [turnirs, setTurnirs] = useState<Turnir[]>(initialTurnirs);
    const [editTurnir, setEditTurnir] = useState<Partial<Turnir> | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const handleCreate = async () => {
        try {
            const newTurnir = await createTurnir({
                titleTurnir: title,
                textTurnirTurnir: text,
                startPointsTurnir: startPoints
            });
            setTurnirs([...turnirs, newTurnir]);
            setTitle('');
            setText('');
            setStartPoints(0);
            showNotification('Турнир успешно создан');
        } catch (error) {
            console.error('Ошибка при создании турнира:', error);
            showNotification('Не удалось создать турнир');
        }
    };

    const handleUpdate = async () => {
        if (!editTurnir || !editTurnir.id) return;

        try {
            const updatedTurnir = await updateTurnir(editTurnir.id, editTurnir);
            setTurnirs(turnirs.map(t => (t.id === editTurnir.id ? updatedTurnir : t)));
            setEditTurnir(null);
            showNotification('Турнир успешно обновлен');
        } catch (error) {
            console.error('Ошибка при обновлении турнира:', error);
            showNotification('Не удалось обновить турнир');
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = window.confirm('Вы уверены, что хотите удалить этот турнир?');
        if (!confirmed) return;

        try {
            await deleteTurnir(id);
            setTurnirs(turnirs.filter(t => t.id !== id));
            showNotification('Турнир успешно удален');
        } catch (error) {
            console.error('Ошибка при удалении турнира:', error);
            showNotification('Не удалось удалить турнир');
        }
    };

    const isCreateDisabled = !title || !text;

    return (
        <div className={className}>
            {notification && (
                <div className="fixed top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-3 rounded shadow-lg">
                    {notification}
                </div>
            )}
            <h2>Создать турнир</h2>
            <div><Input type="text" placeholder="Название турнира" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Input type="text" placeholder="Описание турнира" value={text} onChange={(e) => setText(e.target.value)} /></div>
            <div><Input type="number" placeholder="Начальные очки" value={startPoints} onChange={(e) => setStartPoints(Number(e.target.value))} /></div>
            <div><Button onClick={handleCreate} disabled={isCreateDisabled}>Создать</Button></div>

            <h2>Существующие турниры</h2>
            {turnirs.length === 0 ? (
                <p>Турниры отсутствуют</p>
            ) : (
                <div className="my-5">
                    {turnirs.map(turnir => (
                        <div className="my-5" key={turnir.id}>
                            <div>
                                <Input
                                    type="text"
                                    value={editTurnir?.id === turnir.id ? editTurnir.titleTurnir : turnir.titleTurnir}
                                    onChange={(e) => setEditTurnir({ ...turnir, titleTurnir: e.target.value })}
                                />
                            </div>
                            <div>
                                <Input
                                    type="text"
                                    value={editTurnir?.id === turnir.id ? editTurnir.textTurnirTurnir : turnir.textTurnirTurnir}
                                    onChange={(e) => setEditTurnir({ ...turnir, textTurnirTurnir: e.target.value })}
                                />
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    value={editTurnir?.id === turnir.id ? editTurnir.startPointsTurnir : turnir.startPointsTurnir}
                                    onChange={(e) => setEditTurnir({ ...turnir, startPointsTurnir: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <select
                                    value={editTurnir?.id === turnir.id ? editTurnir.statusTurnir : turnir.statusTurnir}
                                    onChange={(e) => setEditTurnir({ ...turnir, statusTurnir: e.target.value })}
                                >
                                    <option value="REGISTRATION">REGISTRATION</option>
                                    <option value="REGISTRATION_OFF">REGISTRATION_OFF</option>
                                    <option value="START">START</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={editTurnir?.id === turnir.id ? editTurnir.TurnirBool : turnir.TurnirBool}
                                        onChange={(e) => setEditTurnir({ ...turnir, TurnirBool: e.target.checked })}
                                    />
                                    TurnirBool
                                </label>
                            </div>
                            <div>
                                <Button onClick={handleUpdate}>Сохранить</Button>
                                <Button onClick={() => handleDelete(turnir.id)}>Удалить</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};