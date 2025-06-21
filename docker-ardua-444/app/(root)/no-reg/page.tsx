import {NoVideoCallApp} from "@/components/no_reg/NoVideoCallApp";


export default async function NoRegPage({
                                            searchParams
                                        }: {
    searchParams: Promise<{ roomId?: string }>;
}) {
    const { roomId = "" } = await searchParams;

    if (!roomId) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-600">ID комнаты не указан</p>
            </div>
        );
    }

    return <NoVideoCallApp initialRoomId={roomId} />;
}