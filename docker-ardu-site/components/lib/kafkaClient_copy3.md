import dotenv from 'dotenv';
dotenv.config();

import { Kafka, Producer, Consumer, Partitioners } from 'kafkajs';

const kafkaUrl = process.env.KAFKA_URL ?? "localhost:9092"; // Значение по умолчанию

// Создаем экземпляр Kafka
const kafka = new Kafka({
clientId: 'my-app',
brokers: [kafkaUrl]
});

// Создаем продюсера с LegacyPartitioner
export const producer: Producer = kafka.producer({
createPartitioner: Partitioners.LegacyPartitioner
});

// Создаем консюмера
export const consumer: Consumer = kafka.consumer({ groupId: 'test-group' });

// Функция для подключения к Kafka
export async function connectKafka(): Promise<void> {
await producer.connect(); // Подключаем продюсера
await consumer.connect(); // Подключаем консюмера
}

// Функция для отправки сообщений
export async function sendMessage(topic: string, message: string): Promise<void> {
console.log(`Sending message to topic ${topic}: ${message}`);
await producer.send({
topic,
messages: [{ value: message }],
});
}

// Функция для получения сообщений
export async function receiveMessages(topic: string): Promise<void> {
await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const value = message.value ? message.value.toString() : null;
            console.log(`Received message from topic ${topic}: ${value}`);
        },
    });
}
