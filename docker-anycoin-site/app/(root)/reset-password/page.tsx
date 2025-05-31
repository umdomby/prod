"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { FormInput } from '@/components/form/form-input';

// Define the type for your form values
type FormValues = {
    password: string;
};

const ResetPassword: React.FC = () => {
    // Use the type with useForm
    const methods = useForm<FormValues>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleResetPassword: SubmitHandler<FormValues> = async (data) => {
        try {
            await axios.post('/api/auth/update-password', { token, password: data.password });
            toast.success('Пароль успешно обновлён', {
                icon: '✅',
            });
            router.push('/');
        } catch (error) {
            console.error('Error [UPDATE PASSWORD]', error);
            toast.error('Не удалось обновить пароль', {
                icon: '❌',
            });
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleResetPassword)} className="flex flex-col items-center">
                <h1>Сброс пароля</h1>
                <FormInput
                    name="password"
                    label="Новый пароль"
                    type="password"
                    required
                />
                <Button type="submit" className="h-12 text-base">
                    Обновить пароль
                </Button>
            </form>
        </FormProvider>
    );
};

export default ResetPassword;
