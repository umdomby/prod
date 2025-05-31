// server.ts
import { startConsumer } from './components/lib/kafkaConsumer';

async function startServer() {
    await startConsumer();
    console.log('Kafka consumer started');
}

startServer().catch(console.error);