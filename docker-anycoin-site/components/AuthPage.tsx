'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import React from 'react';
import { Container } from "@/components/container";

export const AuthPage = () => {
    return (
        <Container>
            <div>
                <div className="text-center">
                    Регистрация и вход одной кнопкой
                </div>
                <div className="flex justify-center my-4">
                    <Button
                        variant="secondary"
                        onClick={() =>
                            signIn('google', {
                                callbackUrl: '/',
                                redirect: true,
                            })
                        }
                        type="button"
                        className="gap-2 h-12 p-2 flex-1 text-center">
                        <img
                            className="w-6 h-6"
                            src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                        />
                        Google
                    </Button>
                </div>
                <div className="text-center">
                    VPN = NO BONUS
                </div>

                <hr />
            </div>
        </Container>
    );
};