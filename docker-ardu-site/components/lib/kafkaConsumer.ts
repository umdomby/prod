// components/lib/kafkaConsumer.ts
import { connectKafka, receiveMessages } from './kafkaClient';

export async function startConsumer() {
    await connectKafka();
    await receiveMessages('player-updates');
}