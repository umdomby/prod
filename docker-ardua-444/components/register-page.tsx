'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import React, { useState } from 'react';
import { LoginForm } from '@/components/modals/auth-modal/forms/login-form';
import { RegisterForm } from '@/components/modals/auth-modal/forms/register-form';
import { Container } from '@/components/container';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/form/form-input';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
    email: z.string().email({ message: 'Введите корректную почту' }),
});

type TResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const RegisterPage: React.FC = () => {
    const [type, setType] = useState<'login' | 'register' | 'reset'>('register');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const router = useRouter();

    const resetForm = useForm<TResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSwitchType = () => {
        setType(type === 'login' ? 'register' : 'login');
    };

    const handleSuccess = () => {
        router.push('/'); // Редиректим на главную страницу
    };

    const onOpenResetModal = () => {
        setIsResetModalOpen(true);
    };

    const onCloseResetModal = () => {
        setIsResetModalOpen(false);
        resetForm.reset();
    };

    const onSubmitReset = async (data: TResetPasswordValues) => {
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Ошибка при отправке запроса');
            }

            toast.success('Инструкции по сбросу пароля отправлены на ваш email', {
                icon: '✅',
            });
            onCloseResetModal();
        } catch (error) {
            console.error('Error [RESET_PASSWORD]', error);
            toast.error('Ошибка при отправке запроса на сброс пароля', {
                icon: '❌',
            });
        }
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
                    <LoginForm onClose={handleSuccess} />
                ) : (
                    <RegisterForm onClose={handleSuccess} onClickLogin={onSwitchType} />
                )}

                <hr className="my-6" />
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() =>
                            signIn('google', {
                                callbackUrl: '/',
                                redirect: false,
                            }).then((result) => {
                                if (result?.ok) {
                                    handleSuccess();
                                }
                            })
                        }
                        type="button"
                        className="gap-2 h-12 p-2 flex-1"
                    >
                        <img
                            className="w-6 h-6"
                            src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                        />
                        Google
                    </Button>
                </div>

                <div className="flex gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={onSwitchType}
                        type="button"
                        className="h-12 flex-1"
                    >
                        {type !== 'login' ? 'Войти' : 'Регистрация'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onOpenResetModal}
                        type="button"
                        className="h-12 flex-1"
                    >
                        Напомнить пароль
                    </Button>
                </div>
            </div>

            {/* Модальное окно для сброса пароля */}
            <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
                <DialogContent className="w-[450px] bg-secondary p-10">
                    <DialogHeader>
                        <DialogTitle>Сброс пароля</DialogTitle>
                        <DialogDescription>
                            Введите ваш email, чтобы получить инструкции по сбросу пароля.
                        </DialogDescription>
                    </DialogHeader>
                    <FormProvider {...resetForm}>
                        <form
                            className="flex flex-col gap-5"
                            onSubmit={resetForm.handleSubmit(onSubmitReset)}
                        >
                            <FormInput name="email" label="E-Mail" required />
                            <Button
                                loading={resetForm.formState.isSubmitting}
                                className="h-12 text-base"
                                type="submit"
                            >
                                Отправить
                            </Button>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>
        </Container>
    );
};