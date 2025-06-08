// \\wsl.localhost\Ubuntu-24.04\home\pi\prod\docker-ardua-444\components\profile-button.tsx
import { useSession } from 'next-auth/react';
import React from 'react';
import { Button } from '@/components/ui';
import { CircleUser, User } from 'lucide-react';
import Link from 'next/link';
import { SheetClose } from '@/components/ui/sheet';

interface Props {
    onClickSignIn?: () => void;
    className?: string;
}

export const ProfileButton: React.FC<Props> = ({ className, onClickSignIn }) => {
    const { data: session } = useSession();
    return (
        <div className={className}>
            {!session ? (
                <SheetClose asChild>
                    <Button onClick={onClickSignIn} variant="outline" className="flex items-center gap-1">
                        <User size={16} />
                        Войти
                    </Button>
                </SheetClose>
            ) : (
                <SheetClose asChild>
                    <Link href="/profile">
                        <Button variant="secondary" className="flex items-center gap-2">
                            <CircleUser size={18} />
                            <div className="flex-1">
                                <div>Профиль</div>
                            </div>
                        </Button>
                    </Link>
                </SheetClose>
            )}
        </div>
    );
};