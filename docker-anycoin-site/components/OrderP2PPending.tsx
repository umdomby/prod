// /components/OrderP2PPending.tsx
"use client"
import React, { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { OrderP2P, User, BuySell, OrderP2PStatus, Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
    confirmBuyOrderUser2,
    confirmBuyOrderCreator,
    confirmSellOrderUser2,
    confirmSellOrderCreator,
} from '@/app/actions';
import Link from "next/link";
import useSWR from "swr";

interface OrderBankDetail {
    name: string;
    price: string;
    details: string;
    description: string;
}

interface OrderP2PWithUser extends OrderP2P {
    orderP2PUser1: {
        id: number;
        cardId: string;
        fullName: string;
        telegram: string;
    };
    orderP2PUser2?: {
        id: number;
        cardId: string;
        fullName: string;
        telegram: string;
    };
    id: number;
    orderP2PPrice: number;
    orderP2PPoints: number;
    orderP2PCheckUser1: boolean;
    orderP2PCheckUser2: boolean;
    orderP2PBuySell: BuySell;
    orderP2PUser1Id: number;
    orderP2PUser2Id: number;
    createdAt: Date;
    updatedAt: Date;
    orderP2PStatus: OrderP2PStatus;
    orderBankPay: Prisma.JsonValue;
}

interface Props {
    openOrders: OrderP2P[];
    className?: string;
    user: User;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const OrderP2PPending: React.FC<Props> = ({ user, openOrders: initialOpenOrders, className }) => {
    const [orders, setOrders] = useState<OrderP2PWithUser[]>(initialOpenOrders as OrderP2PWithUser[]);

    // Используем SWR для периодического обновления данных
    const { data: swrOrders, error } = useSWR<OrderP2PWithUser[]>(`/api/order-p2p-pending-swr?userId=${user.id}`, fetcher, {
        refreshInterval: 5000, // Опционально: периодическое обновление
        revalidateOnFocus: true, // Обновление при фокусе на вкладке
    });

    // Обновляем состояние, когда SWR получает новые данные
    useEffect(() => {
        if (swrOrders) {
            setOrders(swrOrders);
        }
    }, [swrOrders]);

    // Используем SSE для получения обновлений в реальном времени
    useEffect(() => {
        const eventSource = new EventSource(`/api/order-p2p-pending?userId=${user.id}`);

        eventSource.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data.error) {
                    console.error('SSE Error:', data.error);
                    return;
                }

                setOrders(data.openOrders as OrderP2PWithUser[]);
            } catch (error) {
                console.error('Error parsing SSE data:', error);
            }
        };

        eventSource.onerror = (event: Event) => {
            console.error('SSE connection error:', event);
            // Попробуйте повторно подключиться через некоторое время
            setTimeout(() => {
                const newEventSource = new EventSource(`/api/order-p2p-pending?userId=${user.id}`);
                newEventSource.onmessage = eventSource.onmessage;
                newEventSource.onerror = eventSource.onerror;
            }, 2000);
        };

        return () => {
            eventSource.close();
        };
    }, [user.id]);

    if (error) return <div>Failed to load</div>;
    if (!orders) return <div>Loading...</div>;


    function isOrderBankDetail(detail: any): detail is OrderBankDetail {
        return (
            detail &&
            typeof detail === 'object' &&
            typeof detail.name === 'string' &&
            typeof detail.price === 'string' &&
            typeof detail.details === 'string' &&
            typeof detail.description === 'string'
        );
    }

    const handleConfirm = async (order: OrderP2PWithUser, isCreator: boolean) => {
        if (order.orderP2PBuySell === 'BUY') {
            if (isCreator) {
                await confirmBuyOrderCreator(order.id);
            } else {
                await confirmBuyOrderUser2(order.id);
            }
        } else {
            if (isCreator) {
                await confirmSellOrderCreator(order.id);
            } else {
                await confirmSellOrderUser2(order.id);
            }
        }
    };

    // Функция для вычисления времени авто-закрытия
    const getAutoCloseTime = (updatedAt: Date) => {
        const autoCloseDate = new Date(updatedAt);
        autoCloseDate.setHours(autoCloseDate.getHours() + 1);
        //autoCloseDate.setMinutes(autoCloseDate.getMinutes() + 1); // Add 5 minutes (300 seconds)
        return autoCloseDate.toLocaleString();
    };

    return (
        <div className={className}>
            Points: {Math.floor(user.points * 100) / 100}
            <div className="flex justify-between items-center m-7">
                <h1>Open Orders</h1>
                <Link href="/order-p2p">
                    <span className="text-blue-500 hover:underline">
                        P2P
                    </span>
                </Link>
                <Link href="/order-p2p-closed">
                        <span className="text-blue-500 hover:underline">
                            P2P Closed
                        </span>
                </Link>
            </div>
            <Table>
                <TableBody>
                    <TableRow className="no-hover-bg">
                        <TableCell className="w-[20%] text-center">Telegram</TableCell>
                        <TableCell className="w-[15%] text-center">BUY/SELL</TableCell>
                        <TableCell className="w-[10%] text-center">Points</TableCell>
                        <TableCell className="w-[15%] text-center">State</TableCell>
                        <TableCell className="w-[15%] text-center">Date</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Accordion className="border border-gray-300 mt-4" type="multiple">
                {orders.map((order) => (
                    <AccordionItem key={order.id} value={order.id.toString()}>
                        <AccordionTrigger className="text-amber-500">
                            <Table>
                                <TableBody>
                                    <TableRow className="no-hover-bg">
                                        <TableCell
                                            className="w-[20%] text-center "><Link className="ml-3 text-blue-500 hover:text-green-300 font-bold"
                                                                                   href={order.orderP2PUser1.telegram.replace(/^@/, 'https://t.me/')}
                                                                                   target="_blank">{order.orderP2PUser1.telegram}</Link></TableCell>

                                        <TableCell className="w-[15%] text-center">{order.orderP2PBuySell === 'BUY' ? 'Покупает' : 'Продаёт'} </TableCell>
                                        <TableCell className="w-[10%] text-center">{order.orderP2PPoints} </TableCell>
                                        <TableCell className="w-[15%] text-center">
                                            <p>
                                                {order.orderP2PStatus}
                                            </p>
                                        </TableCell>
                                        <TableCell className="w-[15%] text-center">
                                            <p>
                                                {new Date(order.createdAt).toLocaleString()}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </AccordionTrigger>
                        <AccordionContent className="border-b border-gray-200 mt-3">
                            <div className="overflow-x-auto">
                                <div className="flex justify-center space-x-4 min-w-[800px]">
                                    <div className="flex flex-col items-center border p-4" style={{flex: '0 0 23%'}}>
                                        <p>User 1: {order.orderP2PUser1.fullName}</p>
                                        <p>Telegram: <Link className="text-blue-500 hover:text-green-300 font-bold"
                                                           href={order.orderP2PUser1.telegram.replace(/^@/, 'https://t.me/')}
                                                           target="_blank">{order.orderP2PUser1.telegram}</Link></p>
                                        <p>Card ID: {order.orderP2PUser1.cardId}</p>
                                        <p>Points: - {order.orderP2PPoints}</p>
                                        <p>Price: + {order.orderP2PPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 })}</p>
                                        {order.orderP2PBuySell === 'SELL' &&
                                            <Button
                                                onClick={() => handleConfirm(order, true)}
                                                disabled={order.orderP2PUser1Id !== user.id || order.orderP2PCheckUser1 || !order.orderP2PCheckUser2}
                                            >
                                                Перевести Points
                                            </Button>
                                        }

                                        {order.orderP2PBuySell === 'BUY' &&
                                            <Button
                                                onClick={() => handleConfirm(order, true)}
                                                disabled={order.orderP2PUser1Id !== user.id || order.orderP2PCheckUser1 || order.orderP2PCheckUser2}
                                            >
                                                Подтвердить оплату
                                            </Button>
                                        }
                                    </div>

                                    <div className="flex flex-col items-center border p-4" style={{flex: '0 0 45%'}}>
                                        {order.orderBankPay && typeof order.orderBankPay === 'string' ? (
                                            (() => {
                                                try {
                                                    const detail = JSON.parse(order.orderBankPay);
                                                    if (isOrderBankDetail(detail)) {
                                                        return (
                                                            <div className="mb-2">
                                                                <strong className="font-bold text-green-500">{order.orderP2PPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 })} {detail.name}</strong>
                                                                <p>Price one Point = {parseFloat(detail.price.replace(',', '.')).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 })}</p>
                                                                <p className="text-green-500"><strong>{detail.details}</strong>  </p>
                                                                <p>{detail.description}</p>
                                                            </div>
                                                        );
                                                    }
                                                } catch (error) {
                                                    console.error('Error parsing orderBankPay:', error);
                                                }
                                                return <p>Invalid bank details format</p>;
                                            })()
                                        ) : (
                                            <p>Нет доступных банковских реквизитов</p>
                                        )}
                                        <p>  {order.orderP2PUser1Id !== 1 && order.orderP2PUser1Id !== 2 && <span>Автозакрытие сделки начнется: {getAutoCloseTime(order.updatedAt)}, (обновить) +1 час</span>}</p>
                                        <p>User1: {order.orderP2PUser1.fullName} - {order.orderP2PCheckUser1 ? "Да" : "Нет"}</p>
                                        <p>User2: {order.orderP2PUser2 ? `${order.orderP2PUser2.fullName} - ${order.orderP2PCheckUser2 ? "Да" : "Нет"}` : "Ожидание"}</p>
                                    </div>

                                    <div className="flex flex-col items-center border p-4" style={{flex: '0 0 23%'}}>
                                        <p>User 2: {order.orderP2PUser2?.fullName}</p>
                                        <p>
                                            Telegram: {order.orderP2PUser2?.telegram ? (
                                            <Link className="text-blue-500 hover:text-green-300 font-bold"
                                                  href={order.orderP2PUser2.telegram.replace(/^@/, 'https://t.me/')}
                                                  target="_blank"
                                            >
                                                {order.orderP2PUser2.telegram}
                                            </Link>
                                        ) : (
                                            'No Telegram'
                                        )}
                                        </p>
                                        <p>Card ID: {order.orderP2PUser2?.cardId || 'Ожидание'}</p>
                                        <p>Points: + {order.orderP2PPoints}</p>
                                        <p>Price: - {order.orderP2PPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 })}</p>

                                        {order.orderP2PBuySell === 'SELL' &&
                                            <Button
                                                onClick={() => handleConfirm(order, false)}
                                                disabled={order.orderP2PUser2Id !== user.id || order.orderP2PCheckUser1 || order.orderP2PCheckUser2}
                                            >
                                                Подтвердить оплату
                                            </Button>
                                        }

                                        {order.orderP2PBuySell === 'BUY' &&
                                            <Button
                                                onClick={() => handleConfirm(order, false)}
                                                disabled={order.orderP2PUser2Id !== user.id || !order.orderP2PCheckUser1 || order.orderP2PCheckUser2}
                                            >
                                                Перевести Points
                                            </Button>
                                        }
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};
