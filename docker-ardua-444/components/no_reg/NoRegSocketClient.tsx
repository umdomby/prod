"use client";
import { useEffect, useState, useRef } from "react";
import SocketClient from "@/components/control/SocketClient";
import { joinRoomViaProxy, getDeviceSettings } from "@/app/actions";

interface NoRegSocketClientProps {
  roomId: string;
}

export default function NoRegSocketClient({ roomId }: NoRegSocketClientProps) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const disconnectWebSocketRef = useRef<{ disconnectWebSocket?: () => Promise<void> }>({});

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        const result = await joinRoomViaProxy(roomId.replace(/-/g, ""));
        if ("error" in result) {
          setError(result.error);
          setDeviceId(null);
          return;
        }

        if (!result.deviceId) {
          setError("Устройство не привязано к комнате");
          setDeviceId(null);
          return;
        }

        setDeviceId(result.deviceId);
        setError(null);

        // Загружаем настройки устройства
        const settings = await getDeviceSettings(result.deviceId);
        console.log("Настройки устройства загружены:", settings);
      } catch (err) {
        setError("Ошибка при подключении к комнате");
        setDeviceId(null);
      } finally {
        setIsLoading(false);
      }
    }
    if (roomId) {
      initialize();
    }
  }, [roomId]);

  useEffect(() => {
    return () => {
      // Вызываем отключение WebSocket при размонтировании
      if (disconnectWebSocketRef.current.disconnectWebSocket) {
        disconnectWebSocketRef.current.disconnectWebSocket();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  if (error || !deviceId) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-600">{error || "Устройство не найдено"}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <SocketClient
        selectedDeviceId={deviceId}
        onDisconnectWebSocket={disconnectWebSocketRef.current}
      />
    </div>
  );
}