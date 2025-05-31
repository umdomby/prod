"use client"
import React, { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {OrderP2P, User, BuySell, OrderP2PStatus, Prisma} from "@prisma/client";
import { Button } from "@/components/ui/button";

import {
    confirmBuyOrderUser2,
    confirmBuyOrderCreator,
    confirmSellOrderUser2,
    confirmSellOrderCreator,
} from '@/app/actions';
import Link from "next/link";

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
    orderBankDetails: Prisma.JsonValue;
}

interface Props {
    openOrders: OrderP2P[];
    className?: string;
    user: User;
}

export const OrderP2PPendingA: React.FC<Props> = ({ user, openOrders, className }) => {
    const [orders, setOpenOrders] = useState<OrderP2PWithUser[]>(openOrders as OrderP2PWithUser[]);

    useEffect(() => {
        setOpenOrders(openOrders as OrderP2PWithUser[]);
    }, [openOrders]);

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
            <Accordion className="border border-gray-300 mt-4" type="multiple">
                {orders.map((order) => (
                    <AccordionItem key={order.id} value={order.id.toString()}>
                        <AccordionTrigger className={order.orderP2PStatus === "PENDING" ? 'bg-gray-400' : undefined}>
                            <Table>
                                <TableBody>
                                    <TableRow className="no-hover-bg">
                                        <TableCell className="w-1/4">
                                            <p>
                                                {order.orderP2PUser1.cardId}
                                            </p>
                                        </TableCell>
                                        <TableCell
                                            className="w-1/4">{order.orderP2PBuySell === 'BUY' ? 'Покупает' : 'Продаёт'} {order.orderP2PPoints} Points</TableCell>
                                        <TableCell className="w-1/4">
                                            {order.orderP2PStatus === "CLOSED" && <p>Сделка завершена</p>}
                                            {order.orderP2PStatus === "RETURN" && <p>Сделка не состоялась</p>}
                                        </TableCell>
                                        <TableCell className="w-1/4">
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
                                        <p>Points: {order.orderP2PPoints}</p>
                                        <p>Price: {order.orderP2PPrice}</p>
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
                                        {order.orderBankDetails && Array.isArray(order.orderBankDetails) ? (
                                            order.orderBankDetails.map((detail, index) => {
                                                if (isOrderBankDetail(detail)) {
                                                    return (
                                                        <div key={index} className="mb-2">
                                                            <h3 className="font-bold">{order.orderP2PPrice} {detail.name}</h3>
                                                            <p>Price one Point = {detail.price}</p>
                                                            <p>Details: {detail.details}</p>
                                                            <p>Description: {detail.description}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })
                                        ) : (
                                            <p>Нет доступных банковских реквизитов</p>
                                        )}
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
                                        <p>Points: {order.orderP2PPoints}</p>
                                        <p>Price: {order.orderP2PPrice}</p>

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
