'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import React, { useState } from 'react';
import { LoginForm } from '@/components/modals/auth-modal/forms/login-form';
import { RegisterForm } from '@/components/modals/auth-modal/forms/register-form';
import { Container } from '@/components/container';

export const RegisterPage: React.FC = () => {
    const [type, setType] = useState<'login' | 'register'>('register');

    const onSwitchType = () => {
        setType(type === 'login' ? 'register' : 'login');
    };

    return (
        <Container className="flex flex-col my-10 items-center justify-center min-h-screen">
            <div className="w-[350px] bg-secondary p-10 rounded-lg shadow-lg">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Профиль</h2>
                    <p className="text-sm text-muted-foreground">
                        Пожалуйста, войдите или зарегистрируйтесь, чтобы продолжить.
                    </p>
                </div>
                {type === 'login' ? (
                    <LoginForm onClose={() => {}} />
                ) : (
                    <RegisterForm onClose={() => {}} />
                )}

                <hr className="my-6" />
                <div className="flex gap-2">
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
                </div>

                <Button
                    variant="outline"
                    onClick={onSwitchType}
                    type="button"
                    className="h-12 w-full mt-4"
                >
                    {type !== 'login' ? 'Войти' : 'Регистрация'}
                </Button>
            </div>
        </Container>
    );
};