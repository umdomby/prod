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

const roomIdSchema = z.string().length(16, 'ID комнаты должен содержать ровно 16 символов (без тире)');

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
    autoConnect: room.autoConnect, // Добавляем autoConnect
  }));
}

export async function saveRoom(roomId: string, autoConnect: boolean = false) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedRoomId = roomIdSchema.safeParse(roomId.replace(/-/g, ''));
  if (!parsedRoomId.success) {
    throw new Error(parsedRoomId.error.errors[0].message);
  }

  const userId = parseInt(session.id);

  const existingRoom = await prisma.savedRoom.findUnique({
    where: { roomId },
  });

  if (existingRoom) {
    throw new Error('Комната уже сохранена');
  }

  const roomCount = await prisma.savedRoom.count({
    where: { userId },
  });

  await prisma.savedRoom.create({
    data: {
      roomId,
      userId,
      isDefault: roomCount === 0,
      autoConnect, // Сохраняем значение autoConnect
    },
  });

  revalidatePath('/');
}

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

  const deletedRoom = await prisma.savedRoom.delete({
    where: { roomId, userId },
  });

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

  revalidatePath('/');
}

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

  await prisma.savedRoom.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  await prisma.savedRoom.update({
    where: { roomId, userId },
    data: { isDefault: true },
  });

  revalidatePath('/');
}

export async function updateAutoConnect(roomId: string, autoConnect: boolean) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedRoomId = roomIdSchema.safeParse(roomId);
  if (!parsedRoomId.success) {
    throw new Error(parsedRoomId.error.errors[0].message);
  }

  const userId = parseInt(session.id);

  await prisma.savedRoom.update({
    where: { roomId, userId },
    data: { autoConnect },
  });

  revalidatePath('/');
}