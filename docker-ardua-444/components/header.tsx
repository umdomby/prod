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
import { Menu, X } from 'lucide-react'; // Добавляем иконку X для кнопки закрытия
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

    const [servo1MinInput, setServo1MinInput] = useState<string>(servo1MinAngle.toString());
    const [servo1MaxInput, setServo1MaxInput] = useState<string>(servo1MaxAngle.toString());
    const [servo2MinInput, setServo2MinInput] = useState<string>(servo2MinAngle.toString());
    const [servo2MaxInput, setServo2MaxInput] = useState<string>(servo2MaxAngle.toString());

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

    const handleServo1MinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setServo1MinInput(input);
        const value = Number(input);
        if (!isNaN(value) && value >= 0 && value <= servo1MaxAngle) {
            setServo1MinAngle(value);
            localStorage.setItem('servo1MinAngle', value.toString());
        }
    };

    const handleServo1MaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setServo1MaxInput(input);
        const value = Number(input);
        if (!isNaN(value) && value >= servo1MinAngle && value <= 180) {
            setServo1MaxAngle(value);
            localStorage.setItem('servo1MaxAngle', value.toString());
        }
    };

    const handleServo2MinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setServo2MinInput(input);
        const value = Number(input);
        if (!isNaN(value) && value >= 0 && value <= servo2MaxAngle) {
            setServo2MinAngle(value);
            localStorage.setItem('servo2MinAngle', value.toString());
        }
    };

    const handleServo2MaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setServo2MaxInput(input);
        const value = Number(input);
        if (!isNaN(value) && value >= servo2MinAngle && value <= 180) {
            setServo2MaxAngle(value);
            localStorage.setItem('servo2MaxAngle', value.toString());
        }
    };

    const handleServo1MinBlur = () => {
        if (!isServo1MinValid()) {
            setServo1MinInput(servo1MinAngle.toString());
        }
    };

    const handleServo1MaxBlur = () => {
        if (!isServo1MaxValid()) {
            setServo1MaxInput(servo1MaxAngle.toString());
        }
    };

    const handleServo2MinBlur = () => {
        if (!isServo2MinValid()) {
            setServo2MinInput(servo2MinAngle.toString());
        }
    };

    const handleServo2MaxBlur = () => {
        if (!isServo2MaxValid()) {
            setServo2MaxInput(servo2MaxAngle.toString());
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
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-foreground">
                                <Link href="/" className="flex items-center gap-3 p-4">
                                    <h1 className="text-2xl font-black">
                                        Ardu<span className="text-primary">A</span>
                                    </h1>
                                </Link>
                            </SheetTitle>
                        </div>
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

                            {/*<div className="flex flex-col space-y-2">*/}
                            {/*    <div className="flex items-center gap-2">*/}
                            {/*        <span className="text-sm font-medium text-foreground">Servo 1 Min:</span>*/}
                            {/*        <Input*/}
                            {/*            type="number"*/}
                            {/*            value={servo1MinInput}*/}
                            {/*            onChange={handleServo1MinChange}*/}
                            {/*            onBlur={handleServo1MinBlur}*/}
                            {/*            placeholder="Min"*/}
                            {/*            className={cn(*/}
                            {/*                'w-16 bg-transparent h-8 text-xs',*/}
                            {/*                !isServo1MinValid() && servo1MinInput !== '' && 'border-red-500 focus:ring-red-500'*/}
                            {/*            )}*/}
                            {/*            min={0}*/}
                            {/*            max={180}*/}
                            {/*            step="1"*/}
                            {/*        />*/}
                            {/*        <span className="text-sm font-medium text-foreground">Max:</span>*/}
                            {/*        <Input*/}
                            {/*            type="number"*/}
                            {/*            value={servo1MaxInput}*/}
                            {/*            onChange={handleServo1MaxChange}*/}
                            {/*            onBlur={handleServo1MaxBlur}*/}
                            {/*            placeholder="Max"*/}
                            {/*            className={cn(*/}
                            {/*                'w-16 bg-transparent h-8 text-xs',*/}
                            {/*                !isServo1MaxValid() && servo1MaxInput !== '' && 'border-red-500 focus:ring-red-500'*/}
                            {/*            )}*/}
                            {/*            min={0}*/}
                            {/*            max={180}*/}
                            {/*            step="1"*/}
                            {/*        />*/}
                            {/*    </div>*/}
                            {/*    <div className="flex items-center gap-2">*/}
                            {/*        <span className="text-sm font-medium text-foreground">Servo 2 Min:</span>*/}
                            {/*        <Input*/}
                            {/*            type="number"*/}
                            {/*            value={servo2MinInput}*/}
                            {/*            onChange={handleServo2MinChange}*/}
                            {/*            onBlur={handleServo2MinBlur}*/}
                            {/*            placeholder="Min"*/}
                            {/*            className={cn(*/}
                            {/*                'w-16 bg-transparent h-8 text-xs',*/}
                            {/*                !isServo2MinValid() && servo2MinInput !== '' && 'border-red-500 focus:ring-red-500'*/}
                            {/*            )}*/}
                            {/*            min={0}*/}
                            {/*            max={180}*/}
                            {/*            step="1"*/}
                            {/*        />*/}
                            {/*        <span className="text-sm font-medium text-foreground">Max:</span>*/}
                            {/*        <Input*/}
                            {/*            type="number"*/}
                            {/*            value={servo2MaxInput}*/}
                            {/*            onChange={handleServo2MaxChange}*/}
                            {/*            onBlur={handleServo2MaxBlur}*/}
                            {/*            placeholder="Max"*/}
                            {/*            className={cn(*/}
                            {/*                'w-16 bg-transparent h-8 text-xs',*/}
                            {/*                !isServo2MaxValid() && servo2MaxInput !== '' && 'border-red-500 focus:ring-red-500'*/}
                            {/*            )}*/}
                            {/*            min={0}*/}
                            {/*            max={180}*/}
                            {/*            step="1"*/}
                            {/*        />*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </div>
                    </SheetFooter>

                    <SheetClose asChild>
                        <Button
                            variant="ghost"
                            className="mt-5 w-[60%] text-foreground bg-gray-800 hover:bg-gray-400 mx-auto block"
                            aria-label="Закрыть меню"
                        >
                            Close
                        </Button>
                    </SheetClose>
                </SheetContent>
            </Sheet>
        </div>
    );
};