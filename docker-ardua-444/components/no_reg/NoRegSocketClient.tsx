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
                console.log("Проверка прокси-доступа для roomId:", roomId);
                const result = await joinRoomViaProxy(roomId.replace(/-/g, ""));
                if ("error" in result) {
                    console.error("Ошибка прокси-доступа:", result.error);
                    setError(result.error);
                    setDeviceId(null);
                    return;
                }

                if (!result.deviceId) {
                    console.warn("Устройство не привязано к комнате:", result.roomId);
                    setError("Устройство не привязано к комнате");
                    setDeviceId(null);
                    return;
                }

                console.log("Устройство найдено:", result.deviceId);
                setDeviceId(result.deviceId);
                setError(null);

                // Загружаем настройки устройства
                const settings = await getDeviceSettings(result.deviceId);
                console.log("Настройки устройства загружены:", settings);
            } catch (err) {
                console.error("Ошибка инициализации:", err);
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
            // Отключаем WebSocket при размонтировании
            if (disconnectWebSocketRef.current.disconnectWebSocket) {
                console.log("Отключение WebSocket при размонтировании");
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
                roomId={roomId} // Передаем roomId для прокси-команд
                onDisconnectWebSocket={disconnectWebSocketRef.current}
            />
        </div>
    );
}