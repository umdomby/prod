import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
    const { email } = await req.json();

    try {
        console.log("11111111111111111")
        console.log(email)
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
        }

        // Генерация токена для сброса пароля
        const resetToken = Math.random().toString(36).substr(2);

        // Сохранение токена в базе данных
        await prisma.user.update({
            where: { email },
            data: { resetToken },
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
            from: `"Heroes3" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Сброс пароля123',
            text: `Перейдите по ссылке для сброса пароля: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Инструкции по сбросу пароля отправлены' });
    } catch (error) {
        console.error('Ошибка при сбросе пароля:', error);
        return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
    }
}
