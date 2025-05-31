import dotenv from 'dotenv';
dotenv.config();

import { Kafka, Producer, Consumer, Partitioners, logLevel } from 'kafkajs';

const kafkaUrl = process.env.KAFKA_URL ?? "kafka:9093"; // Значение по умолчанию

// Создаем экземпляр Kafka с логированием
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [kafkaUrl],
    connectionTimeout: 10000,
    retry: {
        retries: 5,
    },
    logLevel: logLevel.DEBUG, // Включаем логирование
});

// Создаем продюсера с LegacyPartitioner
export const producer: Producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
});

// Создаем консюмера
export const consumer: Consumer = kafka.consumer({ groupId: 'test-group' });

// Функция для подключения к Kafka
export async function connectKafka(): Promise<void> {
    try {
        await producer.connect(); // Подключаем продюсера
        console.log('Producer connected successfully');
        await consumer.connect(); // Подключаем консюмера
        console.log('Consumer connected successfully');
    } catch (error) {
        console.error('Failed to connect to Kafka:', error);
    }
}

// Функция для отправки сообщений
export async function sendMessage(topic: string, message: string): Promise<void> {
    console.log(`Sending message to topic ${topic}: ${message}`);
    try {
        await producer.send({
            topic,
            messages: [{ value: message }],
        });
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Failed to send message:', error);
    }
}

// Функция для получения сообщений
export async function receiveMessages(topic: string): Promise<void> {
    try {
        await consumer.subscribe({ topic, fromBeginning: true });
        console.log(`Subscribed to topic ${topic}`);

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const value = message.value ? message.value.toString() : null;
                console.log(`Received message from topic ${topic}: ${value}`);
            },
        });
    } catch (error) {
        console.error('Failed to receive messages:', error);
    }
}