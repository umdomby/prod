"use client";

import React, { useState } from 'react';
import { transferPointsToFund, withdrawPointsFromFund } from "@/app/actions";
import { Button, Input, Card, CardHeader, CardBody, CardFooter, Typography } from '@/components/ui';

interface Props {
    user: { id: number; points: number };
    betFund: number;
}

export const BET_FOUND_A: React.FC<Props> = ({ user, betFund }) => {
    const [currentBetFund, setCurrentBetFund] = useState<number>(betFund);
    const [userPoints, setUserPoints] = useState<number>(user.points);
    const [amount, setAmount] = useState<string>(''); // Use string to handle empty input
    const [error, setError] = useState<string | null>(null);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { // Allow only numeric input
            setAmount(value);
        }
    };

    const handleTransferToFund = async () => {
        const numericAmount = Number(amount);
        if (numericAmount > userPoints) {
            setError('Недостаточно баллов для перевода в фонд');
            return;
        }

        try {
            await transferPointsToFund(numericAmount);
            setError(null);
            setUserPoints(userPoints - numericAmount);
            setCurrentBetFund(currentBetFund + numericAmount);
            setAmount(''); // Reset input
        } catch (err) {
            setError('Ошибка при переводе баллов в фонд');
        }
    };

    const handleWithdrawFromFund = async () => {
        const numericAmount = Number(amount);
        if (numericAmount > currentBetFund) {
            setError('Недостаточно баллов в фонде для снятия');
            return;
        }

        try {
            await withdrawPointsFromFund(numericAmount);
            setError(null);
            setUserPoints(userPoints + numericAmount);
            setCurrentBetFund(currentBetFund - numericAmount);
            setAmount(''); // Reset input
        } catch (err) {
            setError('Ошибка при снятии баллов из фонда');
        }
    };

    const isTransferDisabled = !amount || Number(amount) <= 0 || Number(amount) > userPoints;
    const isWithdrawDisabled = !amount || Number(amount) <= 0 || Number(amount) > currentBetFund;

    return (
        <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
                <Typography variant="h5" className="text-center">Управление фондом ставок</Typography>
            </CardHeader>
            <CardBody>
                <Typography variant="body1">Текущий фонд ставок: {currentBetFund}</Typography>
                <Typography variant="body1">Ваши баллы: {userPoints}</Typography>
                <Input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Введите количество баллов"
                    className="mt-4"
                />
                {error && <Typography variant="body2" className="text-red-500 mt-2">{error}</Typography>}
            </CardBody>
            <CardFooter className="flex justify-between">
                <Button onClick={handleTransferToFund} variant="secondary" disabled={isTransferDisabled}>
                    Перевести в фонд
                </Button>
                <Button onClick={handleWithdrawFromFund} variant="secondary" disabled={isWithdrawDisabled}>
                    Снять из фонда
                </Button>
            </CardFooter>
        </Card>
    );
};