'use client';

import { Button } from '@/components/ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { signIn } from 'next-auth/react';
import React from 'react';
import { LoginForm } from './forms/login-form';
import { RegisterForm } from './forms/register-form';
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";

interface Props {
    open: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ open, onClose }) => {
    const [type, setType] = React.useState<'login' | 'register'>('login');

    const onSwitchType = () => {
        setType(type === 'login' ? 'register' : 'login');
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[450px] bg-secondary p-10">
                <VisuallyHidden>
                    <DialogTitle></DialogTitle>
                </VisuallyHidden>
                <div className="text-center">
                    Регистрация и вход одной кнопкой
                </div>
                <Button
                        variant="secondary"
                        onClick={() =>
                            signIn('google', {
                                callbackUrl: '/',
                                redirect: true,
                            })
                        }
                        type="button"
                        className="gap-2 h-12 p-2 flex-1">
                        <img
                            className="w-6 h-6"
                            src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                        />
                        Google
                    </Button>
                    <div className="text-center">
                        VPN = NO BONUS
                    </div>
                    {type === 'login' ? (
                        <LoginForm onClose={handleClose}/>
                    ) : (
                        <RegisterForm onClose={handleClose}/>
                    )}
                    <hr/>
                    {/*<div className="flex gap-2">*/}

                    {/*    <Button*/}
                    {/*      variant="secondary"*/}
                    {/*      onClick={() =>*/}
                    {/*        signIn('github', {*/}
                    {/*          callbackUrl: '/',*/}
                    {/*          redirect: true,*/}
                    {/*        })*/}
                    {/*      }*/}
                    {/*      type="button"*/}
                    {/*      className="gap-2 h-12 p-2 flex-1">*/}
                    {/*      <img className="w-6 h-6" src="https://github.githubassets.com/favicons/favicon.svg" />*/}
                    {/*      GitHub*/}
                    {/*    </Button>*/}

                    {/*</div>*/}
                    <Button variant="outline" onClick={onSwitchType} type="button" className="h-12">
                        {type !== 'login' ? 'Войти' : 'Регистрация'}
                    </Button>
            </DialogContent>
        </Dialog>
);
};
