// /components/OrderP2PPending.tsx

"use client"
import React, { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { OrderP2P, User, BuySell, OrderP2PStatus, Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from 'next/navigation';

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
    closeOrders: OrderP2P[];
    className?: string;
    user: User;
    currentPage: number;
    totalPages: number;
}

export const OrderP2PClosed: React.FC<Props> = ({ user, closeOrders, className, currentPage, totalPages }) => {
    const [orders, setcloseOrders] = useState<OrderP2PWithUser[]>(closeOrders as OrderP2PWithUser[]);
    const router = useRouter();

    useEffect(() => {
        setcloseOrders(closeOrders as OrderP2PWithUser[]);
    }, [closeOrders]);
    

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

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            router.push(`/order-p2p-closed?page=${currentPage + 1}`);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            router.push(`/order-p2p-closed?page=${currentPage - 1}`);
        }
    };

    return (
        <div className={className}>
            Points: {Math.floor(user.points * 100) / 100}
            <div className="flex justify-between items-center m-7">
                <h1>Closed / Return</h1>
                <Link href="/order-p2p">
                    <span className="text-blue-500 hover:underline">
                        P2P
                    </span>
                </Link>
                <Link href="/order-p2p-pending">
                        <span className="text-blue-500 hover:underline">
                            P2P PENDING
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
                        <TableCell className="w-[15%] text-center">Date Closed</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Accordion className="border border-gray-300 mt-4" type="multiple">
                {orders.map((order) => (
                    <AccordionItem key={order.id} value={order.id.toString()}>
                        <AccordionTrigger>
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
                                                {new Date(order.updatedAt).toLocaleString()}
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
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <div className="pagination-buttons flex justify-center mt-6">
                <Button className="btn btn-primary mx-2 w-[100px] h-7"
                    onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Previous
                </Button>
                <span className="mx-3 text-lg font-semibold">
                    Page {currentPage} of {totalPages}
                </span>
                <Button className="btn btn-primary mx-2 w-[100px] h-7"
                    onClick={handleNextPage} disabled={currentPage >= totalPages}>
                    Next
                </Button>
            </div>
        </div>
    );
};