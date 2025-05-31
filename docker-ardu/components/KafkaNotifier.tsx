// components/KafkaNotifier.tsx
"use client";
import React from 'react';

const KafkaNotifier = () => {
    const sendKafkaMessage = async () => {
        try {
            const response = await fetch('/api/kafka', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: 'player-updates',
                    message: 'Player data has been updated',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            console.log('Message sent to Kafka');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div>
            <h2>Kafka Notifier</h2>
            <button onClick={sendKafkaMessage}>Send Kafka Message</button>
        </div>
    );
};

export default KafkaNotifier;
