import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { hashSync } from 'bcrypt';

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ message: 'Токен и пароль обязательны' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: { resetToken: token },
        });

        if (!user) {
            return NextResponse.json({ message: 'Неверный или истекший токен' }, { status: 404 });
        }

        const hashedPassword = hashSync(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, resetToken: null },
        });

        return NextResponse.json({ message: 'Пароль успешно обновлён' });
    } catch (error) {
        console.error('Ошибка при обновлении пароля:', error);
        return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
    }
}