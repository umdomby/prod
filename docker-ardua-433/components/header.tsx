'use client';

import { cn } from '@/components/lib/utils';
import React from 'react';
import Link from 'next/link';
import { ProfileButton } from './profile-button';
import { AuthModal } from './modals';
import { ModeToggle } from "@/components/buttonTheme";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from 'lucide-react';

interface Props {
    className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
    const [openAuthModal, setOpenAuthModal] = React.useState(false);

    return (
        <div className={cn("relative", className)}>
            {/* Кнопка Sheet с абсолютным позиционированием и явными стилями */}
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

                <SheetContent
                    side="right"
                    className="w-[280px] sm:w-[300px] bg-background"
                >
                    <SheetHeader className="text-right">
                        <SheetTitle className="text-foreground">
                            <Link href="/" className="flex items-center gap-3 p-4">
                                <h1 className="text-2xl font-black">
                                    Ardu<span className="text-primary">A</span>
                                </h1>
                            </Link>
                        </SheetTitle>
                        <SheetDescription className="sr-only">
                            Навигационное меню
                        </SheetDescription>
                    </SheetHeader>

                    <SheetFooter className="mt-auto border-t border-border/40 pt-4">
                        <div className="flex items-center justify-between w-full">
                            <Link href="/">Home</Link>
                            <ModeToggle/>
                            <div className="flex items-center gap-2">
                                <AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)}/>
                                <ProfileButton onClickSignIn={() => setOpenAuthModal(true)}/>
                            </div>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
};