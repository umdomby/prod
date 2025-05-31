"use client";
import React, { useState } from 'react';
import { Input, Button } from '@/components/ui';
import { updateUserInfoTelegram } from '@/app/actions';
import toast from 'react-hot-toast';
import Link from "next/link";

interface TelegramNotificationProps {
    initialTelegram: string;
}

const TelegramNotification: React.FC<TelegramNotificationProps> = ({ initialTelegram }) => {
    const [telegram, setTelegram] = useState<string>(initialTelegram);

    const handleUpdateTelegram = async () => {
        try {
            await updateUserInfoTelegram(telegram, false);
            toast.success('Telegram данные обновлены');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Ошибка при обновлении Telegram данных');
            }
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleUpdateTelegram();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 p-4 shadow-lg rounded-lg z-50">
            <p className="text-sm font-medium mb-2">
                Пожалуйста, заполните поле Telegram <Link href="/profile" className="text-blue-500">профиль</Link>.
            </p>
            <Input
                type="text"
                value={telegram}
                onChange={(e) => {
                    let value = e.target.value;
                    if (!value.startsWith('@')) {
                        value = '@' + value.replace(/^@+/, '');
                    }
                    setTelegram(value);
                }}
                onKeyDown={handleKeyDown} // Add this line
                className="mb-2 p-2 border border-gray-300 rounded"
            />
            <Button onClick={handleUpdateTelegram} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                Обновить Telegram
            </Button>
        </div>
    );
};

export default TelegramNotification;
