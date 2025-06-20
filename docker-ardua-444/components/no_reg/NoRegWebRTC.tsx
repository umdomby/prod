"use client";
import { useEffect, useRef } from 'react';

interface NoRegWebRTCProps {
    idDevice: string;
}

export default function NoRegWebRTC({ idDevice }: NoRegWebRTCProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        const startWebRTC = async () => {
            try {
                peerConnectionRef.current = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                });

                const ws = new WebSocket(process.env.WEBSOCKET_URL_WSAR || 'wss://ardua.site:444/wsar');

                ws.onopen = () => {
                    ws.send(JSON.stringify({ ty: 'clt', ct: 'browser' }));
                    ws.send(JSON.stringify({ ty: 'idn', de: idDevice }));
                    ws.send(JSON.stringify({ co: 'WEBRTC_OFFER', de: idDevice }));
                };

                ws.onmessage = async (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.ty === 'webrtc' && data.sdp) {
                            if (data.sdp.type === 'offer') {
                                await peerConnectionRef.current?.setRemoteDescription(
                                    new RTCSessionDescription(data.sdp)
                                );

                                const answer = await peerConnectionRef.current?.createAnswer();
                                await peerConnectionRef.current?.setLocalDescription(answer);

                                ws.send(JSON.stringify({
                                    co: 'WEBRTC_ANSWER',
                                    sdp: peerConnectionRef.current?.localDescription,
                                    de: idDevice,
                                }));
                            } else if (data.sdp.type === 'answer') {
                                await peerConnectionRef.current?.setRemoteDescription(
                                    new RTCSessionDescription(data.sdp)
                                );
                            }
                        } else if (data.ty === 'ice' && data.candidate) {
                            await peerConnectionRef.current?.addIceCandidate(
                                new RTCIceCandidate(data.candidate)
                            );
                        }
                    } catch (error) {
                        console.error('Ошибка обработки WebRTC сообщения:', error);
                    }
                };

                peerConnectionRef.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        ws.send(JSON.stringify({
                            co: 'WEBRTC_ICE',
                            candidate: event.candidate,
                            de: idDevice,
                        }));
                    }
                };

                peerConnectionRef.current.ontrack = (event) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = event.streams[0];
                        videoRef.current.play().catch((e) => console.error('Ошибка воспроизведения:', e));
                    }
                };

                return () => {
                    ws.close();
                    peerConnectionRef.current?.close();
                };
            } catch (error) {
                console.error('Ошибка инициализации WebRTC:', error);
            }
        };

        startWebRTC();

        return () => {
            peerConnectionRef.current?.close();
        };
    }, [idDevice]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg shadow-lg"
            />
        </div>
    );
}