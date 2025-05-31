import dotenv from 'dotenv';
import { Kafka, Producer, Consumer } from 'kafkajs';
import axios from 'axios';  // Для проверки доступности брокера

dotenv.config();

// Функция для проверки доступности Kafka
async function isKafkaAvailable(kafkaUrl: string): Promise<boolean> {
    try {
        const response = await axios.get(`http://${kafkaUrl}/v3/clusters`);
        return response.status === 200;
    } catch (error: unknown) {
        // Проверяем, что error является экземпляром Error
        if (error instanceof Error) {
            console.error(`Ошибка подключения к Kafka по адресу ${kafkaUrl}:`, error.message);
        } else {
            console.error(`Неизвестная ошибка при подключении к Kafka по адресу ${kafkaUrl}`);
        }
        return false;
    }
}

// Получаем URL из переменной окружения или используем localhost:9092 по умолчанию
const kafkaUrl = process.env.KAFKA_URL ?? "localhost:9092";

// Проверяем доступность Kafka
async function getKafkaBroker(): Promise<string> {
    const availableKafkaUrl = await isKafkaAvailable(kafkaUrl) ? kafkaUrl : "localhost:9092";
    if (availableKafkaUrl === "localhost:9092") {
        console.log(`Kafka по адресу ${kafkaUrl} не доступна. Используем значение по умолчанию: localhost:9092`);
    } else {
        console.log(`Kafka доступна по адресу: ${availableKafkaUrl}`);
    }
    return availableKafkaUrl;
}

// Инициализация Kafka с проверенным URL
let producer: Producer;
let consumer: Consumer;

async function createKafkaClient() {
    const availableKafkaUrl = await getKafkaBroker();

    const kafka = new Kafka({
        clientId: 'my-app',
        brokers: [availableKafkaUrl],
    });

    // Проверка, был ли продюсер уже создан, если нет, создаем его
    if (!producer) {
        producer = kafka.producer();
    }

    // Проверка, был ли консюмер уже создан, если нет, создаем его
    if (!consumer) {
        consumer = kafka.consumer({ groupId: 'test-group' });
    }

    return { producer, consumer };
}

// Функция для подключения к Kafka
export async function connectKafka(): Promise<void> {
    const { producer, consumer } = await createKafkaClient();
    try {
        await producer.connect(); // Подключаем продюсера
        await consumer.connect(); // Подключаем консюмера
        console.log('Kafka подключена');
    } catch (error) {
        if (error instanceof Error) {
            console.error('Ошибка подключения к Kafka:', error.message);
        } else {
            console.error('Неизвестная ошибка при подключении к Kafka');
        }
    }
}

// Функция для отправки сообщений
export async function sendMessage(topic: string, message: string): Promise<void> {
    const { producer } = await createKafkaClient();

    // Пытаемся подключить продюсера, если он не был подключен
    try {
        await producer.connect();
        console.log(`Sending message to topic ${topic}: ${message}`);

        await producer.send({
            topic,
            messages: [{ value: message }],
        });
        console.log(`Message sent successfully to topic ${topic}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error sending message to Kafka:`, error.message);
        } else {
            console.error('Неизвестная ошибка при отправке сообщения в Kafka');
        }
    }
}

// Функция для получения сообщений
export async function receiveMessages(topic: string): Promise<void> {
    const { consumer } = await createKafkaClient();
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const value = message.value ? message.value.toString() : null;
            console.log(`Received message from topic ${topic}: ${value}`);
        },
    });
}