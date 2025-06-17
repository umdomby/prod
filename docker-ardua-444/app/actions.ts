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
type GetSavedRoomsResponse = {
  rooms?: Array<{
    id: string;
    isDefault: boolean;
    autoConnect: boolean;
    deviceId: string | null;
    proxyAccess: Array<{ proxyRoomId: string; name: string | null }>;
  }>;
  proxyRooms?: Array<{
    id: string;
    isDefault: boolean;
    autoConnect: boolean; // Добавляем autoConnect
  }>;
  error?: string;
};
export async function getSavedRooms(): Promise<GetSavedRoomsResponse> {
  const session = await getUserSession();
  console.log('getSavedRooms: session:', session);
  if (!session) {
    console.error('getSavedRooms: Пользователь не аутентифицирован');
    return { error: 'Пользователь не аутентифицирован' };
  }

  const userId = parseInt(session.id);
  try {
    const [rooms, proxyRooms] = await Promise.all([
      prisma.savedRoom.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        include: { proxyAccess: true },
      }),
      prisma.savedProxy.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    console.log('getSavedRooms: Найдено комнат:', rooms.length, 'прокси-комнат:', proxyRooms.length);

    // Проверяем proxyRooms на валидность
    const validProxyRooms = proxyRooms.filter(
        (proxy) => typeof proxy.proxyRoomId === 'string' && proxy.proxyRoomId.length > 0
    );
    if (proxyRooms.length !== validProxyRooms.length) {
      console.warn('getSavedRooms: Обнаружены некорректные прокси-комнаты:', proxyRooms);
    }

    return {
      rooms: rooms.map((room) => ({
        id: room.roomId,
        isDefault: room.isDefault,
        autoConnect: room.autoConnect,
        deviceId: room.devicesId ? room.devicesId.toString() : null,
        proxyAccess: room.proxyAccess.map((pa) => ({
          proxyRoomId: pa.proxyRoomId,
          name: pa.name || null,
        })),
      })),
      proxyRooms: validProxyRooms.map((proxy) => ({
        id: proxy.proxyRoomId,
        isDefault: proxy.isDefault,
        autoConnect: proxy.autoConnect,
      })),
    };
  } catch (err) {
    console.error('getSavedRooms: Ошибка:', err);
    return { error: 'Ошибка загрузки комнат' };
  }
}
export async function saveRoom(roomId: string, autoConnect: boolean = false) {
  console.log('saveRoom: Начало сохранения комнаты:', { roomId, autoConnect });
  const session = await getUserSession();
  if (!session) {
    console.error('saveRoom: Пользователь не аутентифицирован');
    throw new Error('Пользователь не аутентифицирован');
  }

  const parsedRoomId = roomIdSchema.safeParse(roomId.replace(/-/g, ''));
  if (!parsedRoomId.success) {
    console.error('saveRoom: Некорректный roomId:', roomId, parsedRoomId.error);
    throw new Error(parsedRoomId.error.errors[0].message);
  }

  const normalizedRoomId = parsedRoomId.data;
  const userId = parseInt(session.id);

  try {
    // Проверка существования в SavedRoom
    const existingSavedRoom = await prisma.savedRoom.findUnique({
      where: { roomId: normalizedRoomId },
    });

    if (existingSavedRoom) {
      console.warn('saveRoom: Комната уже существует:', normalizedRoomId);
      throw new Error('Комната уже существует в сохраненных комнатах');
    }

    // Проверка существования в ProxyAccess
    const existingProxyAccess = await prisma.proxyAccess.findUnique({
      where: { proxyRoomId: normalizedRoomId },
    });

    if (existingProxyAccess) {
      console.log('saveRoom: Найдена прокси-комната, сохраняем в SavedProxy');
      await saveProxyRoom(normalizedRoomId, userId, autoConnect);
      return { message: 'Комната сохранена как прокси-комната', isProxy: true };
    }

    // Проверяем, есть ли уже дефолтная комната
    const hasDefaultRoom = await prisma.savedRoom.findFirst({
      where: { userId, isDefault: true },
    });
    const hasDefaultProxy = await prisma.savedProxy.findFirst({
      where: { userId, isDefault: true },
    });

    // Сохраняем в SavedRoom, если нет в ProxyAccess
    const roomCount = await prisma.savedRoom.count({
      where: { userId },
    });

    const newRoom = await prisma.savedRoom.create({
      data: {
        roomId: normalizedRoomId,
        userId,
        isDefault: !hasDefaultRoom && !hasDefaultProxy && roomCount === 0,
        autoConnect,
      },
    });

    console.log('saveRoom: Успешно сохранена комната:', newRoom);
    revalidatePath('/');
    return { message: 'Комната сохранена', isProxy: false };
  } catch (err) {
    console.error('saveRoom: Ошибка при сохранении:', err);
    throw err;
  }
}
async function saveProxyRoom(proxyRoomId: string, userId: number, autoConnect: boolean) {
  console.log('saveProxyRoom: Начало сохранения прокси-комнаты:', { proxyRoomId, userId, autoConnect });
  const parsedProxyRoomId = roomIdSchema.safeParse(proxyRoomId);
  if (!parsedProxyRoomId.success) {
    console.error('saveProxyRoom: Некорректный proxyRoomId:', proxyRoomId, parsedProxyRoomId.error);
    throw new Error(parsedProxyRoomId.error.errors[0].message);
  }

  try {
    const existingSavedProxy = await prisma.savedProxy.findFirst({
      where: { proxyRoomId, userId },
    });

    if (existingSavedProxy) {
      console.warn('saveProxyRoom: Прокси-комната уже сохранена:', proxyRoomId);
      throw new Error('Прокси-комната уже сохранена');
    }

    const newProxy = await prisma.savedProxy.create({
      data: {
        proxyRoomId,
        userId,
        isDefault: false,
        autoConnect,
      },
    });

    console.log('saveProxyRoom: Успешно сохранена прокси-комната:', newProxy);
    revalidatePath('/');
  } catch (err) {
    console.error('saveProxyRoom: Ошибка при сохранении:', err);
    throw err;
  }
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

  await prisma.$transaction([
    // Удаляем все прокси-доступы для комнаты
    prisma.proxyAccess.deleteMany({
      where: { roomId },
    }),
    // Удаляем все связанные SavedProxy записи
    prisma.savedProxy.deleteMany({
      where: { proxyRoomId: { in: (await prisma.proxyAccess.findMany({ where: { roomId } })).map(p => p.proxyRoomId) } },
    }),
    // Удаляем саму комнату
    prisma.savedRoom.delete({
      where: { roomId, userId },
    }),
  ]);

  // Если удаленная комната была дефолтной, устанавливаем новую дефолтную
  const deletedRoom = await prisma.savedRoom.findUnique({ where: { roomId } });
  if (deletedRoom?.isDefault) {
    const nextRoom = await prisma.savedRoom.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (nextRoom) {
      await prisma.savedRoom.update({
        where: { id: nextRoom.id },
        data: { isDefault: true },
      });
    } else {
      // Если нет других комнат, проверяем SavedProxy
      const nextProxy = await prisma.savedProxy.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (nextProxy) {
        await prisma.savedProxy.update({
          where: { id: nextProxy.id },
          data: { isDefault: true },
        });
      }
    }
  }

  revalidatePath('/');
}
export async function setDefaultRoom(roomId: string) {
  console.log('setDefaultRoom: Начало установки комнаты по умолчанию:', roomId);
  const session = await getUserSession();
  if (!session) {
    console.error('setDefaultRoom: Пользователь не аутентифицирован');
    throw new Error('Пользователь не аутентифицирован');
  }

  const userId = parseInt(session.id);
  const parsedRoomId = roomIdSchema.safeParse(roomId);
  if (!parsedRoomId.success) {
    console.error('setDefaultRoom: Некорректный roomId:', roomId, parsedRoomId.error);
    throw new Error(parsedRoomId.error.errors[0].message);
  }

  try {
    // Сначала сбрасываем isDefault для всех комнат пользователя
    await prisma.$transaction([
      prisma.savedRoom.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.savedProxy.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
    ]);

    // Пытаемся найти комнату в SavedRoom
    const savedRoom = await prisma.savedRoom.findFirst({
      where: { roomId, userId },
    });

    if (savedRoom) {
      await prisma.savedRoom.update({
        where: { id: savedRoom.id },
        data: { isDefault: true },
      });
      console.log('setDefaultRoom: Установлена дефолтная SavedRoom:', roomId);
      revalidatePath('/');
      return;
    }

    // Если не нашли в SavedRoom, ищем в SavedProxy
    const savedProxy = await prisma.savedProxy.findFirst({
      where: { proxyRoomId: roomId, userId },
    });

    if (savedProxy) {
      await prisma.savedProxy.update({
        where: { id: savedProxy.id },
        data: { isDefault: true },
      });
      console.log('setDefaultRoom: Установлена дефолтная SavedProxy:', roomId);
      revalidatePath('/');
      return;
    }

    // Если не нашли ни там, ни там - ошибка
    throw new Error('Комната не найдена');
  } catch (err) {
    console.error('setDefaultRoom: Ошибка:', err);
    throw err;
  }
}
export async function resetDefaultRoom() {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Пользователь не аутентифицирован');
  }

  const userId = parseInt(session.id);

  await prisma.$transaction([
    prisma.savedRoom.updateMany({
      where: { userId },
      data: { isDefault: false },
    }),
    prisma.savedProxy.updateMany({
      where: { userId },
      data: { isDefault: false },
    }),
  ]);

  revalidatePath('/');
}
export async function updateAutoConnect(roomId: string, autoConnect: boolean) {
  console.log('updateAutoConnect: Начало обновления:', { roomId, autoConnect });
  const session = await getUserSession();
  if (!session) {
    console.error('updateAutoConnect: Пользователь не аутентифицирован');
    throw new Error('Пользователь не аутентифицирован');
  }

  const userId = parseInt(session.id);
  const parsedRoomId = roomIdSchema.safeParse(roomId);
  if (!parsedRoomId.success) {
    console.error('updateAutoConnect: Некорректный roomId:', roomId, parsedRoomId.error);
    throw new Error(parsedRoomId.error.errors[0].message);
  }

  try {
    // Пытаемся обновить в SavedRoom
    const updatedRoom = await prisma.savedRoom.updateMany({
      where: { roomId, userId },
      data: { autoConnect },
    });

    if (updatedRoom.count > 0) {
      console.log('updateAutoConnect: Обновлена SavedRoom:', roomId);
      revalidatePath('/');
      return;
    }

    // Если не нашли в SavedRoom, пробуем в SavedProxy
    const updatedProxy = await prisma.savedProxy.updateMany({
      where: { proxyRoomId: roomId, userId },
      data: { autoConnect },
    });

    if (updatedProxy.count > 0) {
      console.log('updateAutoConnect: Обновлена SavedProxy:', roomId);
      revalidatePath('/');
      return;
    }

    console.warn('updateAutoConnect: Комната не найдена:', roomId);
    throw new Error('Комната не найдена');
  } catch (err) {
    console.error('updateAutoConnect: Ошибка:', err);
    throw err;
  }
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
async function generateUniqueProxyRoomId(): Promise<string> {
  let proxyRoomId = generateUniqueId(16);
  let exists = await prisma.proxyAccess.findUnique({
    where: { proxyRoomId },
  });
  while (exists) {
    proxyRoomId = generateUniqueId(16);
    exists = await prisma.proxyAccess.findUnique({
      where: { proxyRoomId },
    });
  }
  return proxyRoomId;
}
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
function generateUniqueId(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Проверка уникальности (опционально, для надежности)
  // Можно добавить асинхронную проверку в базе
  return result;
}
export async function enableProxyAccess(roomId: string, name?: string) {
  try {
    console.log('enableProxyAccess: Начало для roomId:', roomId, 'с названием:', name);
    const session = await getUserSession();
    if (!session) {
      return { error: 'Пользователь не аутентифицирован' };
    }

    const parsedRoomId = roomIdSchema.safeParse(roomId);
    if (!parsedRoomId.success) {
      return { error: parsedRoomId.error.errors[0].message };
    }

    const userId = parseInt(session.id);
    console.log('enableProxyAccess: userId:', userId);

    const room = await prisma.savedRoom.findUnique({
      where: { roomId, userId },
    });

    if (!room) {
      return { error: 'Комната не найдена или доступ запрещен' };
    }

    const proxyRoomId = await generateUniqueProxyRoomId();
    console.log('enableProxyAccess: Сгенерирован proxyRoomId:', proxyRoomId);

    const proxyAccess = await prisma.proxyAccess.create({
      data: {
        roomId,
        proxyRoomId,
        name: name || null, // Сохраняем название, если указано
        expiresAt: null,
      },
    });

    console.log('enableProxyAccess: Прокси-доступ создан:', proxyAccess);
    revalidatePath('/');
    return { proxyRoomId: proxyAccess.proxyRoomId, name: proxyAccess.name };
  } catch (err) {
    console.error('Ошибка в enableProxyAccess:', err);
    return { error: 'Внутренняя ошибка сервера' };
  }
}
export async function disableProxyAccess(roomId: string) {
  try {
    const session = await getUserSession();
    if (!session) {
      return { error: 'Пользователь не аутентифицирован' };
    }

    const parsedRoomId = roomIdSchema.safeParse(roomId);
    if (!parsedRoomId.success) {
      return { error: parsedRoomId.error.errors[0].message };
    }

    const userId = parseInt(session.id);

    const room = await prisma.savedRoom.findUnique({
      where: { roomId, userId },
    });

    if (!room) {
      return { error: 'Комната не найдена или доступ запрещен' };
    }

    await prisma.$transaction([
      // Удаляем все прокси-доступы для комнаты
      prisma.proxyAccess.deleteMany({
        where: { roomId },
      }),
      // Удаляем все связанные SavedProxy записи
      prisma.savedProxy.deleteMany({
        where: { proxyRoomId: { in: (await prisma.proxyAccess.findMany({ where: { roomId } })).map(p => p.proxyRoomId) } },
      }),
    ]);

    revalidatePath('/');
    return { message: 'Прокси-доступ отключен и связанные прокси-комнаты удалены' };
  } catch (err) {
    console.error('Ошибка в disableProxyAccess:', err);
    return { error: 'Внутренняя ошибка сервера' };
  }
}
export async function joinRoomViaProxy(roomIdProxy: string) {
  const parsedRoomIdProxy = roomIdSchema.safeParse(roomIdProxy);
  if (!parsedRoomIdProxy.success) {
    throw new Error(parsedRoomIdProxy.error.errors[0].message);
  }

  const proxyAccess = await prisma.proxyAccess.findUnique({
    where: { proxyRoomId: roomIdProxy },
    include: { room: { include: { devices: true } } },
  });

  if (!proxyAccess) {
    throw new Error('Прокси-доступ не найден');
  }

  if (proxyAccess.expiresAt && new Date(proxyAccess.expiresAt) < new Date()) {
    throw new Error('Прокси-доступ истек');
  }

  return {
    roomId: proxyAccess.room.roomId,
    deviceId: proxyAccess.room.devices?.idDevice || null,
  };
}
export async function deleteProxyAccess(proxyRoomId: string) {
  console.log('deleteProxyAccess: Начало удаления прокси-доступа:', { proxyRoomId });
  const session = await getUserSession();
  if (!session) {
    console.error('deleteProxyAccess: Пользователь не аутентифицирован');
    throw new Error('Пользователь не аутентифицирован');
  }

  const userId = parseInt(session.id);
  const parsedProxyRoomId = roomIdSchema.safeParse(proxyRoomId);
  if (!parsedProxyRoomId.success) {
    console.error('deleteProxyAccess: Некорректный proxyRoomId:', proxyRoomId, parsedProxyRoomId.error);
    throw new Error(parsedProxyRoomId.error.errors[0].message);
  }

  try {
    // Проверяем существование прокси-доступа
    const existingProxyAccess = await prisma.proxyAccess.findUnique({
      where: { proxyRoomId },
      include: { room: true },
    });

    // Проверяем существование SavedProxy для текущего пользователя
    const existingSavedProxy = await prisma.savedProxy.findFirst({
      where: { proxyRoomId, userId },
    });

    if (!existingProxyAccess && !existingSavedProxy) {
      console.warn('deleteProxyAccess: Прокси-доступ и SavedProxy не найдены:', { proxyRoomId });
      return { message: 'Прокси-доступ или сохранённая прокси-комната не найдены' };
    }

    // Если пользователь является владельцем комнаты (для ProxyAccess)
    const isRoomOwner = existingProxyAccess && existingProxyAccess.room.userId === userId;

    await prisma.$transaction([
      // Удаляем ProxyAccess, если пользователь является владельцем комнаты
      ...(isRoomOwner && existingProxyAccess
          ? [
            prisma.proxyAccess.delete({
              where: { proxyRoomId },
            }),
          ]
          : []),
      // Удаляем SavedProxy для текущего пользователя, если она существует
      ...(existingSavedProxy
          ? [
            prisma.savedProxy.deleteMany({
              where: { proxyRoomId, userId },
            }),
          ]
          : []),
    ]);

    console.log('deleteProxyAccess: Успешно удалены прокси-доступ и/или сохранённая прокси-комната:', { proxyRoomId });
    revalidatePath('/');
    return { message: 'Прокси-доступ и/или сохранённая прокси-комната удалены' };
  } catch (err) {
    console.error('deleteProxyAccess: Ошибка:', err);
    throw err;
  }
}
export async function checkRoom(roomId: string) {
  try {
    const roomIdSchema = z.string().length(16, "ID комнаты должен содержать ровно 16 символов");
    const normalizedRoomId = roomId.replace(/[^A-Z0-9]/gi, "");
    const parsedRoomId = roomIdSchema.safeParse(normalizedRoomId);
    if (!parsedRoomId.success) {
      console.error('checkRoom: Некорректный ID комнаты:', normalizedRoomId, parsedRoomId.error.errors[0].message);
      return { error: parsedRoomId.error.errors[0].message };
    }
    console.log('checkRoom: Проверка комнаты:', normalizedRoomId);
    const savedRoom = await prisma.savedRoom.findUnique({
      where: { roomId: normalizedRoomId },
      include: { devices: true }, // Исправлено: device → devices
    });
    if (savedRoom) {
      console.log('checkRoom: Найдена SavedRoom:', { roomId: savedRoom.roomId, deviceId: savedRoom.devices?.idDevice });
      return {
        found: true,
        isProxy: false,
        targetRoomId: normalizedRoomId,
        deviceId: savedRoom.devices?.idDevice ?? null,
      };
    }
    const proxyAccess = await prisma.proxyAccess.findUnique({
      where: { proxyRoomId: normalizedRoomId },
      include: { room: { include: { devices: true } } }, // Исправлено: device → devices
    });
    if (proxyAccess) {
      console.log('checkRoom: Найден ProxyAccess:', {
        proxyRoomId: proxyAccess.proxyRoomId,
        targetRoomId: proxyAccess.room.roomId,
        deviceId: proxyAccess.room.devices?.idDevice,
      });
      if (proxyAccess.expiresAt && new Date(proxyAccess.expiresAt) < new Date()) {
        console.error('checkRoom: Прокси-доступ истек:', proxyAccess.expiresAt);
        return { error: "Прокси-доступ истек" };
      }
      return {
        found: true,
        isProxy: true,
        targetRoomId: proxyAccess.room.roomId,
        deviceId: proxyAccess.room.devices?.idDevice ?? null,
      };
    }
    console.log('checkRoom: Комната не найдена:', normalizedRoomId);
    return { found: false, error: "Комната не найдена" };
  } catch (err) {
    console.error("checkRoom: Ошибка проверки комнаты:", err);
    return { error: `Ошибка проверки комнаты: ${(err as Error).message}` };
  }
}