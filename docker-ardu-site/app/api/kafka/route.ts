// app/api/kafka/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectKafka, sendMessage } from '@/components/lib/kafkaClient';

export const POST = async (req: NextRequest) => {
    try {
        const { topic, message } = await req.json();
        console.log(`Received request to send message to topic ${topic}: ${message}`);
        await connectKafka();
        await sendMessage(topic, message);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending message to Kafka:', error);
        return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
    }
};