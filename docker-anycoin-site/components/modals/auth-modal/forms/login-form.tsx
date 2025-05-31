import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { TFormLoginValues, formLoginSchema } from './schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/form/form-input';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import axios from 'axios';

interface Props {
  onClose?: VoidFunction;
}

export const LoginForm: React.FC<Props> = ({ onClose }) => {
  const form = useForm<TFormLoginValues>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: TFormLoginValues) => {
    try {
      const resp = await signIn('credentials', {
        ...data,
        redirect: false,
      });

      if (!resp?.ok) {
        throw Error();
      }

      toast.success('Вы успешно вошли в аккаунт', {
        icon: '✅',
      });

      onClose?.();
    } catch (error) {
      console.error('Error [LOGIN]', error);
      toast.error('Не удалось войти в аккаунт', {
        icon: '❌',
      });
    }
  };

  const handlePasswordReset = async () => {
    const email = form.getValues('email');
    if (!email) {
      toast.error('Пожалуйста, введите ваш E-Mail', {
        icon: '❌',
      });
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', { email });
      toast.success('Инструкции по сбросу пароля отправлены на ваш E-Mail', {
        icon: '📧',
      });
    } catch (error) {
      console.error('Error [RESET PASSWORD]', error);
      toast.error('Не удалось отправить инструкции по сбросу пароля', {
        icon: '❌',
      });
    }
  };

  return (
      <FormProvider {...form}>
        <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput name="email" label="E-Mail" required />
          <FormInput name="password" label="Пароль" type="password" required />

          <Button loading={form.formState.isSubmitting} className="h-12 text-base" type="submit">
            Войти
          </Button>

          <Button type="button" onClick={handlePasswordReset} className="h-12 text-base">
            Забыли пароль?
          </Button>
        </form>
      </FormProvider>
  );
};
