"use client";
import React, {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription,
} from "@/components/ui/sheet";
import {User} from "@prisma/client";
import {chatUsers, chatUsersGet, chatUsersDelete} from "@/app/actions";
import Link from "next/link";

interface Message {
    id: number;
    userEmail: string;
    userTelegram?: string | null;
    chatText: string;
}

interface PointsUserProps {
    user: User;
}

const linkify = (text: string) => {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return text.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-green-300">${url}</a>`;
    });
};

export const SheetChat: React.FC<PointsUserProps> = ({user}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (isOpen) {
            async function fetchMessages() {
                try {
                    const fetchedMessages = await chatUsersGet();
                    console.log('Fetched Messages:', fetchedMessages);
                    setMessages(fetchedMessages);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }

            fetchMessages();
            intervalId = setInterval(fetchMessages, 5000);
        }
        return () => clearInterval(intervalId);
    }, [isOpen]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === "") return;

        try {
            await chatUsers(user.id, newMessage);
            setNewMessage("");

            const updatedMessages = await chatUsersGet();
            setMessages(updatedMessages);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        try {
            if (!messageId) {
                console.error('Invalid message ID');
                return;
            }
            await chatUsersDelete(messageId);
            const updatedMessages = await chatUsersGet();
            setMessages(updatedMessages);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div
            className="absolute top-0 flex justify-center items-center ml-20 py-2 z-50 transform -translate-y-7 mx-auto max-w-xs">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger className='h-5' asChild>
                    <Button variant="outline">Chat {user.fullName}</Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col h-full" aria-describedby="chat-description">
                    <SheetHeader>
                        <SheetTitle></SheetTitle>
                        <SheetDescription>
                        </SheetDescription>
                    </SheetHeader>
                    <SheetFooter className="flex items-center p-4 border-b">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="flex-grow mr-2"
                        />
                        <Button onClick={handleSendMessage}>Send</Button>
                    </SheetFooter>
                    <div className="flex-grow p-4 overflow-y-auto flex flex-col">
                        {messages.map((msg) => (
                            <div key={msg.id} className="flex justify-between items-center">
                                <div className="text-green-300">
                                    <strong>
                                        {msg.userTelegram ?
                                            <Link
                                                className="text-blue-500 hover:text-green-300 font-bold"
                                                href={msg.userTelegram.replace(/^@/, 'https://t.me/')}
                                                target="_blank"
                                            >
                                                {msg.userTelegram}
                                            </Link> : msg.userEmail.split('@')[0]}:
                                    </strong> <span dangerouslySetInnerHTML={{__html: linkify(msg.chatText)}}/>
                                </div>
                                {user.role === "ADMIN" && (
                                    <Button variant="ghost" className="h-5" onClick={() => handleDeleteMessage(msg.id)}>
                                        Delete
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};