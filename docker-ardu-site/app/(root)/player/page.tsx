// app/(root)/player/index.tsx
"use server";

import PlayerC from "@/components/PlayerC";
import { connectKafka, sendMessage } from "@/components/lib/kafkaClient";

export default async function PlayerPage() {
    // Подключаемся к Kafka и отправляем сообщение
    await connectKafka();
    await sendMessage('player-updates', 'Player page has been rendered');

    return (
        <div className="text-center">
            <PlayerC />
        </div>
    );
}
