import { use } from "react";

import NoRegSocketClient from "@/components/no_reg/NoRegSocketClient";
import UseNoRegWebRTC from "@/components/no_reg/useNoRegWebRTC";


export default function NoRegPage({ searchParams }: { searchParams: Promise<{ roomId?: string }> }) {
    const { roomId = "" } = use(searchParams);

    if (!roomId) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-600">ID комнаты не указан</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 relative">
                <UseNoRegWebRTC roomId={roomId} />
            </div>
            <div className="flex-1 relative">
                <NoRegSocketClient roomId={roomId} />
            </div>
        </div>
    );
}