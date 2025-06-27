'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/form/form-input';
import { Button } from '@/components/ui';
import { Container } from '@/components/container';
import { Title } from '@/components/title';
import toast from 'react-hot-toast';
import React, { useState } from 'react';

const resetPasswordSchema = z
    .object({
        password: z.string().min(4, { message: 'Пароль должен содержать минимум 4 символа' }),
        confirmPassword: z.string().min(4, { message: 'Пароль должен содержать минимум 4 символа' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Пароли не совпадают',
        path: ['confirmPassword'],
    });

type TResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: TResetPasswordValues) => {
        if (!token) {
            toast.error('Токен сброса пароля отсутствует', { icon: '❌' });
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password: data.password }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Ошибка при обновлении пароля');
            }

            toast.success('Пароль успешно обновлён', { icon: '✅' });
            router.push('/'); // Перенаправляем на главную страницу
        } catch (error) {
            console.error('Error [UPDATE_PASSWORD]', error);
            toast.error('Ошибка при обновлении пароля', { icon: '❌' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="flex flex-col my-10 items-center justify-center min-h-screen">
            <div className="w-[350px] bg-secondary p-10 rounded-lg shadow-lg">
                <Title text="Сброс пароля" size="md" className="font-bold mb-6" />
                <FormProvider {...form}>
                    <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormInput name="password" label="Новый пароль" type="password" required />
                        <FormInput
                            name="confirmPassword"
                            label="Подтвердите пароль"
                            type="password"
                            required
                        />
                        <Button loading={isSubmitting} className="h-12 text-base" type="submit">
                            Сохранить
                        </Button>
                    </form>
                </FormProvider>
            </div>
        </Container>
    );
}