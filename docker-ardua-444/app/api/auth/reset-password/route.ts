import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email обязателен' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
        }

        if (user.resetTokenExpires && new Date(user.resetTokenExpires) < new Date()) {
            return NextResponse.json({ message: 'Токен сброса пароля истек' }, { status: 400 });
        }

        // При сохранении токена
        const resetToken = randomUUID();
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 час

        await prisma.user.update({
            where: { email },
            data: { resetToken, resetTokenExpires },
        });

        // Настройка и отправка письма
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"ArduA" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Сброс пароля',
            text: `Перейдите по ссылке для сброса пароля: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`,
            html: `
        <h2>Сброс пароля</h2>
        <p>Чтобы сбросить пароль, перейдите по следующей ссылке:</p>
        <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}">Сбросить пароль</a>
        <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Инструкции по сбросу пароля отправлены' });
    } catch (error) {
        console.error('Ошибка при сбросе пароля:', error);
        return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
    }
}