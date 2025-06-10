'use client';

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { registerUser } from '@/app/actions';
import { TFormRegisterValues, formRegisterSchema } from './schemas';
import { FormInput } from '@/components/form/form-input';
import { Button } from '@/components/ui';
import { signIn } from 'next-auth/react'; // Импортируем signIn
import { useRouter } from 'next/navigation'; // Импортируем useRouter для редиректа

interface Props {
  onClose?: VoidFunction;
  onClickLogin?: VoidFunction;
}

export const RegisterForm: React.FC<Props> = ({ onClose, onClickLogin }) => {
  const form = useForm<TFormRegisterValues>({
    resolver: zodResolver(formRegisterSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const router = useRouter(); // Для управления маршрутами

  const onSubmit = async (data: TFormRegisterValues) => {
    console.log('Form data:', data); // Логирование входных данных
    try {
      // Регистрируем пользователя
      await registerUser({
        email: data.email,
        fullName: data.fullName,
        password: data.password,
      });

      // Выполняем вход через credentials после успешной регистрации
      const resp = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false, // Отключаем автоматический редирект, чтобы обработать вручную
      });

      if (!resp?.ok) {
        throw new Error('Ошибка входа после регистрации');
      }

      toast.success('Регистрация и вход успешны! 🎉', {
        icon: '✅',
      });

      // Закрываем модальное окно
      onClose?.();

      // Редиректим на главную страницу
      router.push('/');
    } catch (error) {
      console.error('Registration or login error:', error);
      toast.error('Ошибка при регистрации или входе. Возможно, пользователь уже существует.', {
        icon: '❌',
      });
    }
  };

  return (
      <FormProvider {...form}>
        <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput name="email" label="E-Mail" required />
          <FormInput name="fullName" label="Полное имя" required />
          <FormInput name="password" label="Пароль" type="password" required />
          <FormInput name="confirmPassword" label="Подтвердите пароль" type="password" required />

          <Button loading={form.formState.isSubmitting} className="h-12 text-base" type="submit">
            Зарегистрироваться
          </Button>
        </form>
      </FormProvider>
  );
};