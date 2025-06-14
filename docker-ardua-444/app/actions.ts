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


const deviceIdSchema = z.string().length(16, 'ID устройства должен содержать ровно 16 символов (без тире)').regex(/^[A-Z0-9]+$/, 'ID должен содержать только заглавные латинские буквы и цифры');

// Получение списка устройств пользователя
export async function getDevices() {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const devices = await prisma.devices.findMany({
    where: { userId: parseInt(session.id) },
    include: { settings: true },
    orderBy: { createdAt: 'asc' },
  });

  return devices.map(device => ({
    idDevice: device.idDevice,
    autoReconnect: device.autoReconnect,
    autoConnect: device.autoConnect,
    closedDel: device.closedDel,
    settings: device.settings[0] || null,
  }));
}

// Добавление нового устройства
export async function addDevice(idDevice: string, autoConnect: boolean = false, autoReconnect: boolean = false, closedDel: boolean = false) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedIdDevice = deviceIdSchema.safeParse(idDevice);
  if (!parsedIdDevice.success) {
    throw new Error(parsedIdDevice.error.errors[0].message);
  }

  const userId = parseInt(session.id);

  // Проверяем существование устройства по idDevice
  const existingDevice = await prisma.devices.findUnique({
    where: { idDevice: parsedIdDevice.data },
  });

  if (existingDevice) {
    throw new Error('Устройство с таким ID уже существует');
  }

  const deviceCount = await prisma.devices.count({
    where: { userId },
  });

  const newDevice = await prisma.devices.create({
    data: {
      userId,
      idDevice: parsedIdDevice.data,
      autoReconnect,
      autoConnect,
      closedDel,
      diviceName: 'ArduA',
    },
  });

  // Создаем настройки с начальными значениями для всех полей
  await prisma.settings.create({
    data: {
      devicesId: newDevice.id,
      servo1MinAngle: 0,
      servo1MaxAngle: 180,
      servo2MinAngle: 0,
      servo2MaxAngle: 180,
      b1: false,
      b2: false,
      servoView: true,
    },
  });

  revalidatePath('/');
  return newDevice;
}

// Удаление устройства
export async function deleteDevice(idDevice: string) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedIdDevice = deviceIdSchema.safeParse(idDevice);
  if (!parsedIdDevice.success) {
    throw new Error(parsedIdDevice.error.errors[0].message);
  }

  const userId = parseInt(session.id);

  const device = await prisma.devices.findUnique({
    where: { idDevice: parsedIdDevice.data },
  });

  if (!device || device.userId !== userId) {
    throw new Error('Устройство не найдено или доступ запрещен');
  }

  await prisma.settings.deleteMany({
    where: { devicesId: device.id },
  });

  await prisma.devices.delete({
    where: { idDevice: parsedIdDevice.data },
  });

  revalidatePath('/');
}

// Обновление настроек устройства
export async function updateDeviceSettings(idDevice: string, settings: { autoReconnect?: boolean, autoConnect?: boolean, closedDel?: boolean }) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedIdDevice = deviceIdSchema.safeParse(idDevice);
  if (!parsedIdDevice.success) {
    throw new Error(parsedIdDevice.error.errors[0].message);
  }

  const userId = parseInt(session.id);

  const device = await prisma.devices.findUnique({
    where: { idDevice: parsedIdDevice.data },
  });

  if (!device || device.userId !== userId) {
    throw new Error('Устройство не найдено или доступ запрещен');
  }

  await prisma.devices.update({
    where: { idDevice: parsedIdDevice.data },
    data: {
      autoReconnect: settings.autoReconnect ?? device.autoReconnect,
      autoConnect: settings.autoConnect ?? device.autoConnect,
      closedDel: settings.closedDel ?? device.closedDel,
    },
  });

  revalidatePath('/');
}

// Обновление настроек сервоприводов
export async function updateServoSettings(
    idDevice: string,
    settings: {
      servo1MinAngle?: number;
      servo1MaxAngle?: number;
      servo2MinAngle?: number;
      servo2MaxAngle?: number;
      b1?: boolean;
      b2?: boolean;
      servoView?: boolean;
    }
) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedIdDevice = deviceIdSchema.safeParse(idDevice);
  if (!parsedIdDevice.success) {
    throw new Error(parsedIdDevice.error.errors[0].message);
  }

  const userId = parseInt(session.id);

  const device = await prisma.devices.findUnique({
    where: { idDevice: parsedIdDevice.data },
  });

  if (!device || device.userId !== userId) {
    throw new Error('Устройство не найдено или доступ запрещен');
  }

  const updateData: any = {};
  if (settings.servo1MinAngle !== undefined) updateData.servo1MinAngle = settings.servo1MinAngle;
  if (settings.servo1MaxAngle !== undefined) updateData.servo1MaxAngle = settings.servo1MaxAngle;
  if (settings.servo2MinAngle !== undefined) updateData.servo2MinAngle = settings.servo2MinAngle;
  if (settings.servo2MaxAngle !== undefined) updateData.servo2MaxAngle = settings.servo2MaxAngle;
  if (settings.b1 !== undefined) updateData.b1 = settings.b1;
  if (settings.b2 !== undefined) updateData.b2 = settings.b2;
  if (settings.servoView !== undefined) updateData.servoView = settings.servoView;

  if (Object.keys(updateData).length === 0) {
    console.log('Нет данных для обновления в Settings');
    return;
  }

  await prisma.settings.upsert({
    where: { devicesId: device.id },
    update: updateData,
    create: {
      devicesId: device.id,
      servo1MinAngle: settings.servo1MinAngle ?? 0,
      servo1MaxAngle: settings.servo1MaxAngle ?? 180,
      servo2MinAngle: settings.servo2MinAngle ?? 0,
      servo2MaxAngle: settings.servo2MaxAngle ?? 180,
      b1: settings.b1 ?? false,
      b2: settings.b2 ?? false,
      servoView: settings.servoView ?? true,
    },
  });

  revalidatePath('/');
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
    autoConnect: room.autoConnect,
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
      autoConnect,
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
    console.error(`Некорректный ID комнаты: ${roomId}, ошибка: ${parsedRoomId.error.errors[0].message}`);
    return;
  }

  const userId = parseInt(session.id);

  const existingRoom = await prisma.savedRoom.findUnique({
    where: { roomId, userId },
  });

  if (!existingRoom) {
    console.error(`Комната с ID ${roomId} не найдена для пользователя ${userId}`);
    return;
  }

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
    console.error(`Некорректный ID комнаты для autoConnect: ${roomId}, ошибка: ${parsedRoomId.error.errors[0].message}`);
    return;
  }

  const userId = parseInt(session.id);

  const existingRoom = await prisma.savedRoom.findUnique({
    where: { roomId, userId },
  });

  if (!existingRoom) {
    console.error(`Комната с ID ${roomId} не найдена для обновления autoConnect для пользователя ${userId}`);
    return;
  }

  await prisma.savedRoom.update({
    where: { roomId, userId },
    data: { autoConnect },
  });

  revalidatePath('/');
}

export async function sendDeviceSettingsToESP(idDevice: string) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedIdDevice = deviceIdSchema.safeParse(idDevice);
  if (!parsedIdDevice.success) {
    throw new Error(parsedIdDevice.error.errors[0].message);
  }

  const userId = parseInt(session.id);

  const device = await prisma.devices.findUnique({
    where: { idDevice: parsedIdDevice.data },
    include: { settings: true },
  });

  if (!device || device.userId !== userId) {
    throw new Error('Устройство не найдено или доступ запрещен');
  }

  // Проверяем, есть ли настройки
  const deviceSettings = device.settings[0]; // Берем первый объект настроек
  if (!deviceSettings) {
    throw new Error('Настройки устройства не найдены');
  }

  return {
    servo1MinAngle: deviceSettings.servo1MinAngle ?? 0, // Используем значение по умолчанию, если null
    servo1MaxAngle: deviceSettings.servo1MaxAngle ?? 180,
    servo2MinAngle: deviceSettings.servo2MinAngle ?? 0,
    servo2MaxAngle: deviceSettings.servo2MaxAngle ?? 180,
    b1: deviceSettings.b1,
    b2: deviceSettings.b2,
    servoView: deviceSettings.servoView,
  };
}

// Привязка устройства к комнате
export async function bindDeviceToRoom(roomId: string, deviceId: string | null) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedRoomId = roomIdSchema.safeParse(roomId);
  if (!parsedRoomId.success) {
    throw new Error(parsedRoomId.error.errors[0].message);
  }

  const userId = parseInt(session.id);

  const room = await prisma.savedRoom.findUnique({
    where: { roomId, userId },
  });

  if (!room) {
    throw new Error('Комната не найдена');
  }

  let device = null;
  if (deviceId) {
    const parsedDeviceId = deviceIdSchema.safeParse(deviceId);
    if (!parsedDeviceId.success) {
      throw new Error(parsedDeviceId.error.errors[0].message);
    }

    device = await prisma.devices.findUnique({
      where: { idDevice: parsedDeviceId.data },
    });

    if (!device || device.userId !== userId) {
      throw new Error('Устройство не найдено или доступ запрещен');
    }
  }

  await prisma.savedRoom.update({
    where: { roomId, userId },
    data: {
      devicesId: device ? device.id : null,
    },
  });

  revalidatePath('/');
}

// Получение комнаты с привязанным устройством
export async function getSavedRoomWithDevice(roomId: string) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedRoomId = roomIdSchema.safeParse(roomId);
  if (!parsedRoomId.success) {
    throw new Error(parsedRoomId.error.errors[0].message);
  }

  const userId = parseInt(session.id);

  const room = await prisma.savedRoom.findUnique({
    where: { roomId, userId },
    include: { devices: true },
  });

  if (!room) {
    throw new Error('Комната не найдена');
  }

  return {
    id: room.roomId,
    isDefault: room.isDefault,
    autoConnect: room.autoConnect,
    deviceId: room.devices ? room.devices.idDevice : null,
  };
}

export async function getRoomById(roomId: string) {
  try {
    const room = await prisma.savedRoom.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        name: true,
        devicesId: true,
        autoConnect: true,
        createdAt: true,
      },
    });

    if (!room) {
      throw new Error(`Комната с ID ${roomId} не найдена`);
    }

    return {
      success: true,
      data: room,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}