"use client";
import { useEffect, useState, useRef } from "react";
import { VideoPlayer } from "@/components/webrtc/components/VideoPlayer";
import { joinRoomViaProxy } from "@/app/actions";

interface NoRegWebRTCProps {
    roomId: string;
}

export default function NoRegWebRTC({ roomId }: NoRegWebRTCProps) {
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        async function initialize() {
            try {
                setIsLoading(true);
                const result = await joinRoomViaProxy(roomId.replace(/-/g, ""));
                if ("error" in result) {
                    setError(result.error);
                    setDeviceId(null);
                } else {
                    setDeviceId(result.deviceId);
                    setError(null);
                }
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
        if (!deviceId) return;

        // Инициализация WebSocket для сигнализации
        const ws = new WebSocket(process.env.WEBSOCKET_URL_WSAR || "wss://ardua.site:444/wsar");
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket для WebRTC открыт");
            // Отправляем команду идентификации с deviceId
            ws.send(JSON.stringify({ ty: "clt", ct: "browser" }));
            ws.send(JSON.stringify({ ty: "idn", de: deviceId }));
        };

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Получено WebSocket-сообщение:", data);

                if (data.ty === "sys" && data.st === "con") {
                    console.log("Идентификация успешна");
                    // Инициализируем WebRTC-соединение
                    initializePeerConnection();
                } else if (data.ty === "sdp") {
                    if (data.sdp.type === "offer") {
                        await handleOffer(data.sdp);
                    } else if (data.sdp.type === "answer") {
                        await handleAnswer(data.sdp);
                    }
                } else if (data.ty === "ice") {
                    await handleIceCandidate(data.candidate);
                } else if (data.ty === "err") {
                    setError(`Ошибка WebRTC: ${data.me}`);
                }
            } catch (err) {
                console.error("Ошибка обработки WebSocket-сообщения:", err);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket закрыт");
            cleanup();
        };

        ws.onerror = (err) => {
            console.error("Ошибка WebSocket:", err);
            setError("Ошибка соединения WebSocket");
        };

        return () => {
            cleanup();
        };

        function initializePeerConnection() {
            if (peerConnectionRef.current) return;

            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });
            peerConnectionRef.current = pc;

            // Обработка получения удаленного потока
            pc.ontrack = (event) => {
                console.log("Получен удаленный поток:", event.streams);
                if (event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                }
            };

            // Обработка ICE-кандидатов
            pc.onicecandidate = (event) => {
                if (event.candidate && socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(
                        JSON.stringify({
                            ty: "ice",
                            candidate: event.candidate,
                            de: deviceId,
                        })
                    );
                }
            };

            pc.onconnectionstatechange = () => {
                console.log("Состояние соединения:", pc.connectionState);
                if (pc.connectionState === "failed" || pc.connectionState === "closed") {
                    setError("Соединение WebRTC прервано");
                    cleanup();
                }
            };
        }

        async function handleOffer(offer: RTCSessionDescriptionInit) {
            const pc = peerConnectionRef.current;
            if (!pc) return;

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(
                    JSON.stringify({
                        ty: "sdp",
                        sdp: pc.localDescription,
                        de: deviceId,
                    })
                );
            }
        }

        async function handleAnswer(answer: RTCSessionDescriptionInit) {
            const pc = peerConnectionRef.current;
            if (!pc) return;
            await pc.setRemoteDescription(answer.description());
        }

        async function handleIceCandidate(candidate: RTCIceCandidateInit) {
            const pc = await peerConnectionRef.current;
            if (!pc) return;
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error("Ошибка добавления ICE-кандидата:", err);
            }
        }

        function cleanup() {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            setRemoteStream(null);
        }
    }, [deviceId]);

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
            <VideoPlayer stream={remoteStream} videoRef={videoRef} muted={false} className="w-full h-full" />
        </div>
    )
}