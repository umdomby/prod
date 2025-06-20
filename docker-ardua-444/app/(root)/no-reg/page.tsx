import NoRegWebRTC from "@/components/no_reg/NoRegWebRTC";
import NoRegSocketClient from "@/components/no_reg/NoRegSocketClient";


export default function NoRegPage({ searchParams }: { searchParams: { roomId?: string } }) {
    const roomId = searchParams.roomId || "";

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
                <NoRegWebRTC roomId={roomId} />
            </div>
            <div className="flex-1 relative">
                <NoRegSocketClient roomId={roomId} />
            </div>
        </div>
    );
}