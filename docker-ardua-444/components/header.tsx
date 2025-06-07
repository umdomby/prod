'use client';

import { cn } from '@/components/lib/utils';
import React, { useState } from 'react';
import Link from 'next/link';
import { ProfileButton } from './profile-button';
import { AuthModal } from './modals';
import { ModeToggle } from '@/components/buttonTheme';
import { Button, Input } from '@/components/ui';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useServo } from '@/components/ServoContext';

interface Props {
    className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
    const [openAuthModal, setOpenAuthModal] = useState(false);
    const {
        servo1MinAngle,
        servo1MaxAngle,
        servo2MinAngle,
        servo2MaxAngle,
        setServo1MinAngle,
        setServo1MaxAngle,
        setServo2MinAngle,
        setServo2MaxAngle,
    } = useServo();

    // Локальное состояние для полей ввода
    const [servo1MinInput, setServo1MinInput] = useState<string>(servo1MinAngle.toString());
    const [servo1MaxInput, setServo1MaxInput] = useState<string>(servo1MaxAngle.toString());
    const [servo2MinInput, setServo2MinInput] = useState<string>(servo2MinAngle.toString());
    const [servo2MaxInput, setServo2MaxInput] = useState<string>(servo2MaxAngle.toString());

    // Проверка валидности значений
    const isServo1MinValid = () => {
        const value = Number(servo1MinInput);
        return !isNaN(value) && value >= 0 && value <= Number(servo1MaxInput) && value <= 180;
    };

    const isServo1MaxValid = () => {
        const value = Number(servo1MaxInput);
        return !isNaN(value) && value >= Number(servo1MinInput) && value <= 180;
    };

    const isServo2MinValid = () => {
        const value = Number(servo2MinInput);
        return !isNaN(value) && value >= 0 && value <= Number(servo2MaxInput) && value <= 180;
    };

    const isServo2MaxValid = () => {
        const value = Number(servo2MaxInput);
        return !isNaN(value) && value >= Number(servo2MinInput) && value <= 180;
    };

    // Обработчики изменения
    const handleServo1MinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setServo1MinInput(value);
        console.log('Servo1 Min Input:', value); // Отладка
    };

    const handleServo1MaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setServo1MaxInput(value);
        console.log('Servo1 Max Input:', value); // Отладка
    };

    const handleServo2MinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setServo2MinInput(value);
        console.log('Servo2 Min Input:', value); // Отладка
    };

    const handleServo2MaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setServo2MaxInput(value);
        console.log('Servo2 Max Input:', value); // Отладка
    };

    // Обработчики потери фокуса
    const handleServo1MinBlur = () => {
        const value = Number(servo1MinInput);
        if (isServo1MinValid()) {
            setServo1MinAngle(value);
        } else {
            setServo1MinInput(servo1MinAngle.toString()); // Восстанавливаем предыдущее значение
        }
    };

    const handleServo1MaxBlur = () => {
        const value = Number(servo1MaxInput);
        if (isServo1MaxValid()) {
            setServo1MaxAngle(value);
        } else {
            setServo1MaxInput(servo1MaxAngle.toString()); // Восстанавливаем предыдущее значение
        }
    };

    const handleServo2MinBlur = () => {
        const value = Number(servo2MinInput);
        if (isServo2MinValid()) {
            setServo2MinAngle(value);
        } else {
            setServo2MinInput(servo2MinAngle.toString()); // Восстанавливаем предыдущее значение
        }
    };

    const handleServo2MaxBlur = () => {
        const value = Number(servo2MaxInput);
        if (isServo2MaxValid()) {
            setServo2MaxAngle(value);
        } else {
            setServo2MaxInput(servo2MaxAngle.toString()); // Восстанавливаем предыдущее значение
        }
    };

    return (
        <div className={cn('relative', className)}>
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        style={{
                            position: 'absolute',
                            right: '10%',
                            top: '16px',
                            zIndex: 50,
                            transform: 'translateX(-10%)',
                            backgroundColor: 'hsl(0, 0%, 100%)',
                            color: 'hsl(20, 14.3%, 4.1%)',
                            border: '1px solid hsl(20, 5.9%, 90%)',
                            borderRadius: '8px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s ease',
                        }}
                        className="hover:bg-gray-100 hover:shadow-md"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-[280px] sm:w-[300px] bg-background">
                    <SheetHeader className="text-right">
                        <SheetTitle className="text-foreground">
                            <Link href="/" className="flex items-center gap-3 p-4">
                                <h1 className="text-2xl font-black">
                                    Ardu<span className="text-primary">A</span>
                                </h1>
                            </Link>
                        </SheetTitle>
                        <SheetDescription className="sr-only">Навигационное меню</SheetDescription>
                    </SheetHeader>

                    <SheetFooter className="mt-auto border-t border-border/40 pt-4">
                        <div className="flex flex-col w-full space-y-4">
                            <div className="flex items-center justify-between w-full">
                                <Link href="/">Home</Link>
                                <ModeToggle />
                                <div className="flex items-center gap-2">
                                    <AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
                                    <ProfileButton onClickSignIn={() => setOpenAuthModal(true)} />
                                </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">Servo 1 Min:</span>
                                    <Input
                                        type="number"
                                        value={servo1MinInput}
                                        onChange={handleServo1MinChange}
                                        onBlur={handleServo1MinBlur}
                                        placeholder="Min"
                                        className={cn(
                                            'w-16 bg-transparent h-8 text-xs',
                                            !isServo1MinValid() && servo1MinInput !== '' && 'border-red-500 focus:ring-red-500'
                                        )}
                                        min={0}
                                        max={180}
                                        step="1"
                                    />
                                    <span className="text-sm font-medium text-foreground">Max:</span>
                                    <Input
                                        type="number"
                                        value={servo1MaxInput}
                                        onChange={handleServo1MaxChange}
                                        onBlur={handleServo1MaxBlur}
                                        placeholder="Max"
                                        className={cn(
                                            'w-16 bg-transparent h-8 text-xs',
                                            !isServo1MaxValid() && servo1MaxInput !== '' && 'border-red-500 focus:ring-red-500'
                                        )}
                                        min={0}
                                        max={180}
                                        step="1"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">Servo 2 Min:</span>
                                    <Input
                                        type="number"
                                        value={servo2MinInput}
                                        onChange={handleServo2MinChange}
                                        onBlur={handleServo2MinBlur}
                                        placeholder="Min"
                                        className={cn(
                                            'w-16 bg-transparent h-8 text-xs',
                                            !isServo2MinValid() && servo2MinInput !== '' && 'border-red-500 focus:ring-red-500'
                                        )}
                                        min={0}
                                        max={180}
                                        step="1"
                                    />
                                    <span className="text-sm font-medium text-foreground">Max:</span>
                                    <Input
                                        type="number"
                                        value={servo2MaxInput}
                                        onChange={handleServo2MaxChange}
                                        onBlur={handleServo2MaxBlur}
                                        placeholder="Max"
                                        className={cn(
                                            'w-16 bg-transparent h-8 text-xs',
                                            !isServo2MaxValid() && servo2MaxInput !== '' && 'border-red-500 focus:ring-red-500'
                                        )}
                                        min={0}
                                        max={180}
                                        step="1"
                                    />
                                </div>
                            </div>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
};