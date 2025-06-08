'use server';
import {prisma} from '@/prisma/prisma-client';
import {getUserSession} from '@/components/lib/get-user-session';
import {Prisma} from '@prisma/client';
import {hashSync} from 'bcrypt';
import * as z from 'zod'
import { revalidatePath } from 'next/cache';


export async function updateUserInfo(body: Prisma.UserUpdateInput) {
  try {
    const currentUser = await getUserSession();

    if (!currentUser) {
      throw new Error('Пользователь не найден');
    }

    const findUser = await prisma.user.findFirst({
      where: {
        id: Number(currentUser.id),
      },
    });

    await prisma.user.update({
      where: {
        id: Number(currentUser.id),
      },
      data: {
        fullName: body.fullName,
        email: body.email,
        password: body.password ? hashSync(body.password as string, 10) : findUser?.password,
      },
    });
  } catch (err) {
    throw err;
  }
}
export async function registerUser(body: Prisma.UserCreateInput) {
  console.log('Input data:', body);
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });
    console.log('Existing user:', user);
    if (user) {
      throw new Error('Пользователь уже существует');
    }
    const newUser = await prisma.user.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        password: hashSync(body.password, 10),
      },
    });
    console.log('Created user:', newUser);
    return { message: 'User created successfully', user: newUser };
  } catch (err) {
    console.error('Error [CREATE_USER]', err);
    throw err;
  }
}


// Схема валидации для ID комнаты
const roomIdSchema = z.string().length(16, 'ID комнаты должен содержать ровно 16 символов (без тире)');

// Получение сохранённых комнат пользователя
export async function getSavedRooms() {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const rooms = await prisma.savedRoom.findMany({
    where: { userId: parseInt(session.id) },
    orderBy: { createdAt: 'asc' },
  });

  return rooms.map((room) => ({
    id: room.roomId,
    isDefault: room.isDefault,
  }));
}

// Сохранение новой комнаты
export async function saveRoom(roomId: string) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedRoomId = roomIdSchema.safeParse(roomId.replace(/-/g, ''));
  if (!parsedRoomId.success) {
    throw new Error(parsedRoomId.error.errors[0].message);
  }

  const userId = parseInt(session.id);

  // Проверяем, не существует ли уже такая комната
  const existingRoom = await prisma.savedRoom.findUnique({
    where: { roomId },
  });

  if (existingRoom) {
    throw new Error('Комната уже сохранена');
  }

  // Проверяем, есть ли другие комнаты
  const roomCount = await prisma.savedRoom.count({
    where: { userId },
  });

  // Создаём новую комнату
  await prisma.savedRoom.create({
    data: {
      roomId,
      userId,
      isDefault: roomCount === 0, // Первая комната — по умолчанию
    },
  });

  revalidatePath('/'); // Обновляем кэш страницы
}

// Удаление комнаты
export async function deleteRoom(roomId: string) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedRoomId = roomIdSchema.safeParse(roomId);
  if (!parsedRoomId.success) {
    throw new Error(parsedRoomId.error.errors[0].message);
  }

  const userId = parseInt(session.id);

  // Удаляем комнату
  const deletedRoom = await prisma.savedRoom.delete({
    where: { roomId, userId },
  });

  // Если удалена комната по умолчанию, устанавливаем другую по умолчанию
  if (deletedRoom.isDefault) {
    const nextRoom = await prisma.savedRoom.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (nextRoom) {
      await prisma.savedRoom.update({
        where: { id: nextRoom.id },
        data: { isDefault: true },
      });
    }
  }

  revalidatePath('/'); // Обновляем кэш страницы
}

// Установка комнаты по умолчанию
export async function setDefaultRoom(roomId: string) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedRoomId = roomIdSchema.safeParse(roomId);
  if (!parsedRoomId.success) {
    throw new Error(parsedRoomId.error.errors[0].message);
  }

  const userId = parseInt(session.id);

  // Сбрасываем isDefault для всех комнат пользователя
  await prisma.savedRoom.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  // Устанавливаем isDefault для выбранной комнаты
  await prisma.savedRoom.update({
    where: { roomId, userId },
    data: { isDefault: true },
  });

  revalidatePath('/'); // Обновляем кэш страницы
}