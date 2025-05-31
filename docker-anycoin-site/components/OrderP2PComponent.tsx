"use client";
import React, {useEffect, useState} from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {Table, TableBody, TableCell, TableHead, TableRow} from "@/components/ui/table";
import {OrderP2P, User} from "@prisma/client";
import {
    closeBuyOrderOpen,
    closeSellOrderOpen,
    createBuyOrder,
    createSellOrder,
    openBuyOrder,
    openSellOrder,
    getOpenOrders,
    setCourseValuta,
} from '@/app/actions';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import Link from "next/link";
import axios from 'axios';

interface OrderP2PWithUser extends OrderP2P {
    orderP2PUser1: {
        id: number;
        cardId: string;
        telegram: string;
    };
    orderP2PUser2?: {
        id: number;
        cardId: string;
        telegram: string;
    };
}

interface BankDetail {
    name: string;
    price: string;
    details: string;
    description: string;
}

interface orderBankDetail {
    name: string;
    price: string;
    details: string;
    description: string;
}

interface CourseValuta {
    USD: number;
    EUR: number;
    BEL: number;
    RUS: number;
    BTC: number;
    USTD: number;
    updatedAt: Date;
}

interface Props {
    user: User;
    openOrders: OrderP2P[];
    pendingOrdersCount: number;
    className?: string;
    exchangeRates: CourseValuta | null;
}

interface ExchangeRate {
    Cur_Abbreviation: string;
    Cur_OfficialRate: number;
}

export const OrderP2PComponent: React.FC<Props> = ({
                                                       user,
                                                       openOrders,
                                                       pendingOrdersCount,
                                                       className,
                                                       exchangeRates
                                                   }) => {
    const [orders, setOpenOrders] = useState<OrderP2PWithUser[]>(openOrders as OrderP2PWithUser[]);
    const [buyOrderSuccess, setBuyOrderSuccess] = useState<boolean>(false);
    const [sellOrderSuccess, setSellOrderSuccess] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [buyPoints, setBuyPoints] = useState<number>(0);
    const [sellPoints, setSellPoints] = useState<number>(0);
    const [buyPointsError, setBuyPointsError] = useState<string | null>(null);
    const [sellPointsError, setSellPointsError] = useState<string | null>(null);
    const [selectedBankDetailsForBuy, setSelectedBankDetailsForBuy] = useState<orderBankDetail[]>([]);
    const [selectedBankDetailsForSell, setSelectedBankDetailsForSell] = useState<orderBankDetail[]>([]);
    const [allowPartialBuy, setAllowPartialBuy] = useState<boolean>(false);
    const [allowPartialSell, setAllowPartialSell] = useState<boolean>(false);
    const [selectedBankDetailsForInteraction, setSelectedBankDetailsForInteraction] = useState<any[]>([]);
    const [selectedBuyOption, setSelectedBuyOption] = useState<string>('');
    const [selectedSellOption, setSelectedSellOption] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [calculatedValues, setCalculatedValues] = useState<{ [key: number]: number | null }>({});
    const [selectedBankDetails, setSelectedBankDetails] = useState<{ [key: number]: string }>({});
    const [currentPendingCount, setCurrentPendingCount] = useState<number>(pendingOrdersCount);
    const [dealSuccessMessage, setDealSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        setOpenOrders(openOrders as OrderP2PWithUser[]);
    }, [openOrders]);

    useEffect(() => {
        const connectToSSE = () => {
            const eventSource = new EventSource(`/api/order-p2p?userId=${user.id}`);

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setOpenOrders(data.openOrders as OrderP2PWithUser[]);
                    setCurrentPendingCount(data.pendingOrdersCount);
                } catch (error) {
                    console.error('Error parsing SSE data:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE error:', error);
                eventSource.close();
                // Attempt to reconnect after a delay
                setTimeout(connectToSSE, 5000);
            };

            return eventSource;
        };

        const eventSource = connectToSSE();

        return () => {
            eventSource.close();
        };
    }, [user.id]);

    const handleSelectBankDetailForBuy = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        setSelectedBuyOption(selectedValue);

        if (Array.isArray(user.bankDetails)) {
            const detail = user.bankDetails.find((d: any) => d.name === selectedValue);
            if (isBankDetail(detail)) {
                const orderDetail: orderBankDetail = {
                    name: detail.name,
                    price: detail.price,
                    details: detail.details,
                    description: detail.description,
                };
                setSelectedBankDetailsForBuy((prevDetails) => {
                    if (prevDetails.some((d) => d.name === orderDetail.name)) {
                        return prevDetails.filter((d) => d.name !== orderDetail.name);
                    } else {
                        return [...prevDetails, orderDetail];
                    }
                });
            }
        }
        setSelectedBuyOption('');
    };

    const handleSelectBankDetailForSell = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        setSelectedSellOption(selectedValue);

        if (Array.isArray(user.bankDetails)) {
            const detail = user.bankDetails.find((d: any) => d.name === selectedValue);
            if (isBankDetail(detail)) {
                const orderDetail: orderBankDetail = {
                    name: detail.name,
                    price: detail.price,
                    details: detail.details,
                    description: detail.description,
                };
                setSelectedBankDetailsForSell((prevDetails) => {
                    if (prevDetails.some((d) => d.name === orderDetail.name)) {
                        return prevDetails.filter((d) => d.name !== orderDetail.name);
                    } else {
                        return [...prevDetails, orderDetail];
                    }
                });
            }
        }
        setSelectedSellOption('');
    };

    const handlePriceChangeForBuy = (index: number, value: string) => {
        setSelectedBankDetailsForBuy((prevDetails) => {
            const newDetails = [...prevDetails];

            if (value === '') {
                newDetails[index].price = '';
                return newDetails;
            }

            if (value.startsWith(',') || value.startsWith('.')) {
                value = '0,' + value.slice(1);
            }

            if (value.startsWith('0') && value.length > 1 && value[1] !== ',') {
                value = '0,' + value.slice(1);
            }

            const parts = value.split(',');
            if (parts[0].length > 6 || parseInt(parts[0]) > 100000) {
                parts[0] = parts[0].slice(0, 6);
                if (parseInt(parts[0]) > 100000) {
                    parts[0] = '100000';
                }
            }
            if (parts[1] && parts[1].length > 10) {
                parts[1] = parts[1].slice(0, 10);
            }
            value = parts.join(',');

            const floatValue = parseFloat(value.replace(',', '.'));
            if (!isNaN(floatValue)) {
                newDetails[index].price = value;
            }
            return newDetails;
        });
    };

    const handlePriceChangeForSell = (index: number, value: string) => {
        setSelectedBankDetailsForSell((prevDetails) => {
            const newDetails = [...prevDetails];

            if (value === '') {
                newDetails[index].price = '';
                return newDetails;
            }

            if (value.startsWith(',') || value.startsWith('.')) {
                value = '0,' + value.slice(1);
            }

            if (value.startsWith('0') && value.length > 1 && value[1] !== ',') {
                value = '0,' + value.slice(1);
            }

            const parts = value.split(',');
            if (parts[0].length > 6 || parseInt(parts[0]) > 100000) {
                parts[0] = parts[0].slice(0, 6);
                if (parseInt(parts[0]) > 100000) {
                    parts[0] = '100000';
                }
            }
            if (parts[1] && parts[1].length > 10) {
                parts[1] = parts[1].slice(0, 10);
            }
            value = parts.join(',');

            const floatValue = parseFloat(value.replace(',', '.'));
            if (!isNaN(floatValue)) {
                newDetails[index].price = value;
            }
            return newDetails;
        });
    };

    const handleCreateBuyOrder = async () => {
        if (buyPoints > 100000) {
            alert('Вы не можете купить более 100,000 points');
            return;
        }
        try {
            const result = await createBuyOrder(buyPoints, selectedBankDetailsForBuy, allowPartialBuy);
            if (result.success) {
                setBuyOrderSuccess(true);
                setSelectedBankDetailsForBuy([]);
                setTimeout(() => setBuyOrderSuccess(false), 3000);
            } else {
                if (result.message) {
                    setErrorMessage(result.message);
                } else {
                    setErrorMessage('Неизвестная ошибка');
                }
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch (error) {
            console.error('Ошибка при создании заявки на покупку:', error);
            alert('Не удалось создать заявку на покупку');
        }
    };

    const handleCreateSellOrder = async () => {
        if (sellPoints > user.points) {
            alert('Вы не можете продать больше, чем у вас есть points');
            return;
        }
        try {
            await createSellOrder(sellPoints, selectedBankDetailsForSell, allowPartialSell);
            setSellOrderSuccess(true);
            setSelectedBankDetailsForSell([]);
            setTimeout(() => setSellOrderSuccess(false), 3000);
        } catch (error) {
            console.error('Ошибка при создании заявки на продажу:', error);
            alert('Не удалось создать заявку на продажу');
        }
    };

    const handleConcludeDealBuy = async (order: OrderP2P) => {
        if (order.orderP2PUser1Id === user.id) {
            alert('Вы не можете заключать сделку с самим собой');
            return;
        }
        try {
            const bankDetails = selectedBankDetails[order.id];
            const price = calculatedValues[order.id];
            const points = order.orderP2PPoints;

            if (price !== undefined && price !== null) {
                await openBuyOrder(order.id, user.id, bankDetails, price, points);
                setDealSuccessMessage('Сделка успешно заключена, перейдите в раздел: P2P PENDING');
                setTimeout(() => setDealSuccessMessage(null), 3000);
            } else {
                alert('Пожалуйста, выберите действительные банковские реквизиты и цену');
            }
        } catch (error) {
            console.error('Ошибка при заключении сделки:', error);
            alert('Не удалось заключить сделку');
        }
    };

    const handleConcludeDealSell = async (order: OrderP2P) => {
        if (order.orderP2PUser1Id === user.id) {
            alert('Вы не можете заключать сделку с самим собой');
            return;
        }
        try {
            const bankDetails = selectedBankDetails[order.id];
            const price = calculatedValues[order.id];

            if (price !== undefined && price !== null) {
                await openSellOrder(order.id, user.id, bankDetails, price);
                setDealSuccessMessage('Сделка успешно заключена, перейдите в раздел: P2P PENDING');
                setTimeout(() => setDealSuccessMessage(null), 3000);
            } else {
                alert('Пожалуйста, выберите действительные банковские реквизиты и цену');
            }
        } catch (error) {
            console.error('Ошибка при заключении сделки:', error);
            alert('Не удалось заключить сделку');
        }
    };

    const isCreateOrderDisabled = (points: number) => {
        return points < 30;
    };

    const handleBuyPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const sanitizedValue = value.replace(/[^0-9]/g, '');

        if (sanitizedValue === '') {
            setBuyPoints(0);
            setBuyPointsError('Минимальное количество для покупки - 30');
            return;
        }

        const points = Number(sanitizedValue);
        setBuyPoints(points);

        if (points < 30) {
            setBuyPointsError('Минимальное количество для покупки - 30');
        } else if (points > 100000) {
            setBuyPointsError('Максимальное количество для покупки - 100,000');
            setBuyPoints(100000);
        } else {
            setBuyPointsError(null);
        }
    };

    const handleSellPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const sanitizedValue = value.replace(/[^0-9]/g, '');

        if (sanitizedValue === '') {
            setSellPoints(0);
            setSellPointsError('Минимальное количество для продажи - 30');
            return;
        }

        const points = Number(sanitizedValue);

        if (points > user.points) {
            setSellPoints(user.points);
            setSellPointsError('Вы не можете продать больше, чем у вас есть points');
        } else if (points < 30) {
            setSellPoints(points);
            setSellPointsError('Минимальное количество для продажи - 30');
        } else {
            setSellPoints(points);
            setSellPointsError(null);
        }
    };

    const handleBuyPointsBlur = () => {
        if (buyPoints < 30) {
            setBuyPointsError('Минимальное количество для покупки - 30');
        } else {
            setBuyPointsError(null);
        }
    };

    const handleSellPointsBlur = () => {
        if (sellPoints > user.points) {
            setSellPoints(user.points);
            setSellPointsError('Вы не можете продать больше, чем у вас есть points');
        } else if (sellPoints < 30) {
            setSellPointsError('Минимальное количество для продажи - 30');
        } else {
            setSellPointsError(null);
        }
    };

    const handleRemoveBankDetailForBuy = (index: number) => {
        setSelectedBankDetailsForBuy((prevDetails) => {
            const newDetails = [...prevDetails];
            newDetails.splice(index, 1);
            return newDetails;
        });
    };

    const handleRemoveBankDetailForSell = (index: number) => {
        setSelectedBankDetailsForSell((prevDetails) => {
            const newDetails = [...prevDetails];
            newDetails.splice(index, 1);
            return newDetails;
        });
    };

    const handleAddAllBankDetailsForBuy = () => {
        if (Array.isArray(user.bankDetails)) {
            const allDetails = user.bankDetails.map((detail: any) => ({
                name: detail.name,
                price: detail.price,
                details: detail.details,
                description: detail.description,
            }));
            setSelectedBankDetailsForBuy(allDetails);
        } else {
            alert('Нет доступных банковских реквизитов для добавления.');
        }
    };

    const handleRemoveAllBankDetailsForBuy = () => {
        setSelectedBankDetailsForBuy([]);
    };

    const handleAddAllBankDetailsForSell = () => {
        if (Array.isArray(user.bankDetails)) {
            const allDetails = user.bankDetails.map((detail: any) => ({
                name: detail.name,
                price: detail.price,
                details: detail.details,
                description: detail.description,
            }));
            setSelectedBankDetailsForSell(allDetails);
        } else {
            alert('Нет доступных банковских реквизитов для добавления.');
        }
    };

    const handleRemoveAllBankDetailsForSell = () => {
        setSelectedBankDetailsForSell([]);
    };

    const isBankDetail = (detail: any): detail is BankDetail => {
        return detail && typeof detail.name === 'string' && typeof detail.details === 'string';
    };

    const handleCloseBuyOrder = async (order: OrderP2P) => {
        if (order.orderP2PUser1Id !== user.id) {
            alert('Вы не можете закрыть чужую сделку');
            return;
        }

        const confirmClose = window.confirm('Вы уверены, что хотите закрыть свою сделку покупки?');
        if (!confirmClose) {
            return;
        }

        try {
            const success = await closeBuyOrderOpen(order.id);
            if (success) {
                setSuccessMessage('Сделка покупки успешно закрыта');
                setTimeout(() => setSuccessMessage(null), 2000);
            }
        } catch (error) {
            console.error('Ошибка при закрытии сделки покупки:', error);
        }
    };

    const handleCloseSellOrder = async (order: OrderP2P) => {
        if (order.orderP2PUser1Id !== user.id) {
            alert('Вы не можете закрыть чужую сделку');
            return;
        }

        const confirmClose = window.confirm('Вы уверены, что хотите закрыть свою сделку продажи?');
        if (!confirmClose) {
            return;
        }

        try {
            const success = await closeSellOrderOpen(order.id);
            if (success) {
                setSuccessMessage('Сделка продажи успешно закрыта');
                setTimeout(() => setSuccessMessage(null), 2000);
            }
        } catch (error) {
            console.error('Ошибка при закрытии сделки продажи:', error);
        }
    };

    const handleSelectBankDetailForInteraction = (selectedValue: string, order: OrderP2P) => {
        setSelectedBankDetails((prev) => ({...prev, [order.id]: selectedValue}));
        if (!selectedValue) {
            setCalculatedValues((prev) => ({...prev, [order.id]: null}));
            return;
        }
        const detail = JSON.parse(selectedValue);
        if (detail && typeof detail.price === 'string') {
            const price = parseFloat(detail.price.replace(',', '.'));
            if (!isNaN(price) && order.orderP2PPoints !== null && order.orderP2PPoints !== undefined) {
                setCalculatedValues((prev) => ({...prev, [order.id]: order.orderP2PPoints! * price}));
            } else {
                setCalculatedValues((prev) => ({...prev, [order.id]: null}));
            }
        } else {
            setCalculatedValues((prev) => ({...prev, [order.id]: null}));
        }
    };

    const getAutoCloseTime = (updatedAt: Date) => {
        const autoCloseDate = new Date(updatedAt);
        autoCloseDate.setHours(autoCloseDate.getHours() + 1);
        return autoCloseDate.toLocaleString();
    };

    // New function to check if any price is 0 or NaN
    const hasInvalidPriceBuy = () => {
        return selectedBankDetailsForBuy.some(detail => {
            const price = parseFloat(detail.price.replace(',', '.'));
            return isNaN(price) || price === 0;
        });
    };

    const hasInvalidPriceSell = () => {
        return selectedBankDetailsForSell.some(detail => {
            const price = parseFloat(detail.price.replace(',', '.'));
            return isNaN(price) || price === 0;
        });
    };

    const [currentRates, setCurrentRates] = useState(exchangeRates);

    const fetchCurrentRates = async () => {
        try {
            const response = await axios.get('https://www.nbrb.by/api/exrates/rates?periodicity=0');
            const rates: ExchangeRate[] = response.data;

            const usdToBynRate = rates.find((rate: ExchangeRate) => rate.Cur_Abbreviation === 'USD')?.Cur_OfficialRate || 1;
            const eurToBynRate = rates.find((rate: ExchangeRate) => rate.Cur_Abbreviation === 'EUR')?.Cur_OfficialRate || 0;
            const rubToBynRate = rates.find((rate: ExchangeRate) => rate.Cur_Abbreviation === 'RUB')?.Cur_OfficialRate || 0;

            const usdRate = usdToBynRate;
            const eurRate = eurToBynRate / usdToBynRate;
            const rubRate = rubToBynRate / usdToBynRate;
            const belRate = 1 / usdToBynRate;

            const btcRate = await fetchBitcoinRate();

            setCurrentRates({
                USD: Math.floor(usdRate * 100) / 100,
                EUR: Math.floor(eurRate * 100) / 100,
                RUS: Math.floor(rubRate * 100) / 100,
                BEL: Math.floor(belRate * 100) / 100,
                BTC: btcRate,
                USTD: Math.floor(usdToBynRate * 100) / 100,
                updatedAt: new Date(),
            });

            // Обновление курсов в базе данных
            await setCourseValuta({
                usdRate,
                eurRate,
                rubRate,
                belRate,
                btcRate,
                usdtRate: usdToBynRate,
            });

        } catch (error) {
            console.error('Ошибка при обновлении курсов валют:', error);
        }
    };

    const fetchBitcoinRate = async () => {
        try {
            const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
                params: {
                    ids: 'bitcoin',
                    vs_currencies: 'usd',
                },
            });
            return response.data.bitcoin.usd;
        } catch (error) {
            console.error('Ошибка при получении курса биткойна:', error);
            return 0;
        }
    };

    return (
        <div className={className}>
            {successMessage && (
                <div className="relative">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 p-2 mb-4 rounded mt-4">
                        {successMessage}
                    </div>
                </div>
            )}

            {dealSuccessMessage && (
                <div className="relative">
                    <div
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 p-2 mb-4 rounded mt-4 bg-green-500 text-white">
                        {dealSuccessMessage}
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="relative">
                    <div
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 p-2 mb-4 rounded mt-4 bg-red-500 text-white">
                        {errorMessage}
                    </div>
                </div>
            )}
            <div>Points: {Math.floor(user.points * 100) / 100}</div>
            <div className="text-center"> {exchangeRates && (
                <div className="marquee">
                    <div className="text-green-500">1 USD</div>
                    <div>
                        <div>
                            <div className="text-gray-400">
                                {currentRates ? new Date(currentRates.updatedAt).toLocaleString() : 'Курсы не загружены'}
                                <button onClick={fetchCurrentRates}
                                        className="ml-2 bg-blue-500 text-white rounded h-6 px-2">
                                    обновить курсы
                                </button>
                            </div>
                            <div>
                                {currentRates ? (
                                    <>
                                        <span className="text-green-500">USD: {currentRates.USD} </span>
                                        <span className="text-fuchsia-500">EUR: {currentRates.EUR} </span>
                                        <span className="text-amber-500">BEL: {currentRates.BEL} </span>
                                        <span className="text-yellow-500">RUS: {currentRates.RUS} </span>
                                        <span className="text-emerald-500">BTC: {currentRates.BTC} </span>
                                        <span className="text-blue-500">USTD: {currentRates.USTD} </span>
                                    </>
                                ) : (
                                    <span>Курсы не загружены</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            )}</div>

            <div className="flex justify-between items-center m-7">
                <h1>P2P</h1>
                <div>
                    <Link href="/order-p2p-pending">
                        <span className="text-blue-500 hover:underline">
                            P2P PENDING : {currentPendingCount}
                        </span>
                    </Link>
                </div>
                <div>
                    <Link href="/order-p2p-closed">
                        <span className="text-blue-500 hover:underline">
                            P2P Closed
                        </span>
                    </Link>
                </div>
            </div>

            <div className={`flex-container ${className}`}>
                <div className="buy-section mr-1 ml-1">
                    <h2 className="text-xl font-bold mb-2 text-amber-500">Купить Points (min 30)</h2>
                    <Input
                        type="text"
                        value={buyPoints}
                        onChange={handleBuyPointsChange}
                        onBlur={handleBuyPointsBlur}
                        placeholder="Сколько хотите купить"
                        className="mb-2"
                    />
                    {buyPointsError && <p className="text-red-500">{buyPointsError}</p>}
                    <div className="flex items-center space-x-2 mb-2">
                        <select
                            value={selectedBuyOption}
                            onChange={handleSelectBankDetailForBuy}
                            className="flex-grow w-[50%] p-2 border rounded"
                        >
                            <option value="">Выберите реквизиты банка</option>
                            {Array.isArray(user.bankDetails) && user.bankDetails.map((detail, index) => {
                                if (isBankDetail(detail)) {
                                    return (
                                        <option key={index} value={detail.name}>
                                            {detail.name} - {detail.details} - {detail.price}
                                        </option>
                                    );
                                }
                                return null;
                            })}
                        </select>
                        <Button onClick={handleAddAllBankDetailsForBuy} className="whitespace-nowrap">
                            Добавить все
                        </Button>
                        <Button onClick={handleRemoveAllBankDetailsForBuy} className="whitespace-nowrap">
                            Удалить все
                        </Button>
                    </div>
                    {selectedBankDetailsForBuy.map((detail, index) => (
                        <div key={index} className="mt-1 border border-gray-300 rounded p-2">
                            <div className="flex items-center mt-1 w-full">
                                <span className="flex-shrink-0">1 Point =</span>
                                <Input
                                    type="text"
                                    value={detail.price.toString().replace('.', ',') || detail.price}
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        value = value.replace('.', ',');
                                        const regex = /^\d*[,]?\d*$/;
                                        if (regex.test(value)) {
                                            handlePriceChangeForBuy(index, value);
                                        }
                                    }}
                                    className="h-7 ml-2"
                                />
                                <Button
                                    onClick={() => handleRemoveBankDetailForBuy(index)}
                                    className="ml-2"
                                >
                                    Удалить
                                </Button>
                            </div>
                            <div className="flex items-center w-full">
                                <span className="flex-grow mt-1">{detail.name}</span>
                            </div>
                            <div className="flex items-center w-full">
                                <span className="flex-grow mt-1">{detail.details}</span>
                            </div>
                            <div className="flex items-center w-full">
                                <div className="flex-grow mt-1">
                                    За <span className="text-amber-500">{buyPoints} points</span>
                                    <span> нужно </span>
                                    <span
                                        className="text-green-600">{Number((parseFloat(detail.price.replace(',', '.')) * buyPoints).toFixed(10))} {detail.name}</span>
                                </div>

                            </div>
                        </div>

                    ))}
                    <Button
                        onClick={handleCreateBuyOrder}
                        className={`w-full ${buyOrderSuccess ? 'button-success' : ''}`}
                        disabled={selectedBankDetailsForBuy.length === 0 || isCreateOrderDisabled(buyPoints) || hasInvalidPriceBuy()}
                    >
                        {buyOrderSuccess ? 'Заявка создана!' : 'Создать заявку'}
                    </Button>
                </div>
                <div className="sell-section mr-1 ml-1">
                    <h2 className="text-xl font-bold mb-2 text-amber-500">Продать Points (min 30)</h2>
                    <Input
                        type="text"
                        value={sellPoints}
                        onChange={handleSellPointsChange}
                        onBlur={handleSellPointsBlur}
                        placeholder="Сколько хотите продать"
                        className="mb-2"
                    />
                    {sellPointsError && <p className="text-red-500">{sellPointsError}</p>}
                    <div className="flex items-center space-x-2 mb-2">
                        <select
                            value={selectedSellOption}
                            onChange={handleSelectBankDetailForSell}
                            className="flex-grow w-[50%] p-2 border rounded"
                        >
                            <option value="">Выберите реквизиты банка</option>
                            {Array.isArray(user.bankDetails) && user.bankDetails.map((detail, index) => {
                                if (isBankDetail(detail)) {
                                    return (
                                        <option key={index} value={detail.name}>
                                            {detail.name} - {detail.details} - {detail.price}
                                        </option>
                                    );
                                }
                                return null;
                            })}
                        </select>
                        <Button onClick={handleAddAllBankDetailsForSell} className="whitespace-nowrap">
                            Добавить все
                        </Button>
                        <Button onClick={handleRemoveAllBankDetailsForSell} className="whitespace-nowrap">
                            Удалить все
                        </Button>
                    </div>
                    {selectedBankDetailsForSell.map((detail, index) => (
                        <div key={index} className="mt-1 border border-gray-300 rounded p-2">
                            <div className="flex items-center mt-1 w-full">
                                <span className="flex-shrink-0">1 Point =</span>
                                <Input
                                    type="text"
                                    value={detail.price.toString().replace('.', ',') || detail.price}
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        value = value.replace('.', ',');
                                        const regex = /^\d*[,]?\d*$/;
                                        if (regex.test(value)) {
                                            handlePriceChangeForSell(index, value);
                                        }
                                    }}
                                    className="h-7 ml-2"
                                />
                                <Button
                                    onClick={() => handleRemoveBankDetailForSell(index)}
                                    className="ml-2"
                                >
                                    Удалить
                                </Button>
                            </div>
                            <div className="flex items-center w-full">
                                <span className="flex-grow mt-1">{detail.name}</span>
                            </div>
                            <div className="flex items-center w-full">
                                <span className="flex-grow mt-1">{detail.details}</span>
                            </div>
                            <div className="flex items-center w-full">
                                <div className="flex-grow mt-1">
                                    За <span className="text-amber-500">{sellPoints} points</span>
                                    <span> нужно </span>
                                    <span
                                        className="text-green-600">{Number((parseFloat(detail.price.replace(',', '.')) * sellPoints).toFixed(10))} {detail.name}</span>
                                </div>

                            </div>
                        </div>

                    ))}
                    <Button
                        onClick={handleCreateSellOrder}
                        className={`w-full ${sellOrderSuccess ? 'button-success' : ''}`}
                        disabled={selectedBankDetailsForSell.length === 0 || isCreateOrderDisabled(sellPoints) || hasInvalidPriceSell()}
                    >
                        {sellOrderSuccess ? 'Заявка создана!' : 'Создать заявку'}
                    </Button>
                </div>
            </div>
            <Table className="mt-5">
                <TableBody>
                    <TableRow>
                        <TableCell className="w-[20%] text-center">Telegram</TableCell>
                        <TableCell className="w-[15%] text-center">BUY/SELL</TableCell>
                        <TableCell className="w-[10%] text-center">Points</TableCell>
                        <TableCell className="w-[15%] text-center">State</TableCell>
                        <TableCell className="w-[15%] text-center">Date</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Accordion className="border border-gray-300 mt-1" type="multiple">
                {orders.map((order) => (
                    <AccordionItem
                        key={order.id}
                        value={order.id.toString()}
                        className="text-green-500"
                    >
                        <AccordionTrigger className={user.id === order.orderP2PUser1.id ? 'text-amber-500' : ''}>
                            <Table>
                                <TableBody>
                                    <TableRow className="no-hover-bg">
                                        <TableCell
                                            className="w-[20%] text-center "><Link
                                            className="ml-3 text-blue-500 hover:text-green-300 font-bold"
                                            href={order.orderP2PUser1.telegram.replace(/^@/, 'https://t.me/')}
                                            target="_blank">{order.orderP2PUser1.telegram}</Link></TableCell>

                                        <TableCell
                                            className="w-[15%] text-center">{order.orderP2PBuySell === 'BUY' ? 'Покупает' : 'Продаёт'} </TableCell>
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
                        <AccordionContent className="border-b border-gray-200">
                            <div className="font-bold ml-1"> CardID {order.orderP2PUser1.cardId}</div>
                            <div className="font-bold ml-1 text-amber-500"> Points: {order.orderP2PPoints} </div>
                            <Table>
                                <TableBody>
                                    <TableRow className="no-hover-bg">
                                        <TableCell>
                                            {Array.isArray(order.orderBankDetails) && order.orderBankDetails.length > 0 ? (
                                                order.orderBankDetails.map((detail, index) => {
                                                    if (detail && typeof detail === 'object' && 'name' in detail && 'price' in detail && 'details' in detail && 'description' in detail) {
                                                        const bankDetail: orderBankDetail = {
                                                            name: typeof detail.name === 'string' ? detail.name : '',
                                                            price: typeof detail.price === 'string' ? detail.price : '',
                                                            details: typeof detail.details === 'string' ? detail.details : '',
                                                            description: typeof detail.description === 'string' ? detail.description : '',
                                                        };
                                                        return (
                                                            <div key={index} className="flex flex-wrap py-1 border border-blue-200 m-2">
                                                                <div className="px-2 w-full md:w-1/2">
                                                                    <div>
                                                                        <strong className="text-amber-500"> 1 </strong> points
                                                                        = <strong
                                                                        className="text-amber-500">{bankDetail.price}</strong> {bankDetail.name}
                                                                    </div>
                                                                    <div>
                                                                        <strong
                                                                            className="text-amber-500">{order.orderP2PPoints}</strong> points
                                                                        = <strong
                                                                        className="text-amber-500">{parseFloat((order.orderP2PPoints * parseFloat(bankDetail.price.replace(',', '.'))).toFixed(10))}</strong> {bankDetail.name}
                                                                    </div>
                                                                </div>
                                                                {order.orderP2PUser1Id === user.id &&
                                                                    <div className="px-2 w-full md:w-1/2">
                                                                        <div>
                                                                            {bankDetail.details}
                                                                        </div>
                                                                        <div>
                                                                            {bankDetail.description}
                                                                        </div>
                                                                    </div>
                                                                }
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })
                                            ) : (
                                                <div>Нет доступных банковских реквизитов</div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <select
                                value={selectedBankDetails[order.id] || ''}
                                onChange={(e) => handleSelectBankDetailForInteraction(e.target.value, order)}
                                className="mb-2"
                            >
                                <option value="">Выберите реквизиты банка для сделки</option>
                                {Array.isArray(order.orderBankDetails) && order.orderBankDetails.length > 0 ? (
                                    order.orderBankDetails.map((detail, index) => {
                                        if (detail && typeof detail === 'object' && 'price' in detail && 'name' in detail && 'details' in detail) {
                                            const price = typeof detail.price === 'string' ? detail.price : '';
                                            const name = typeof detail.name === 'string' ? detail.name : '';

                                            return (
                                                <option key={index} value={JSON.stringify(detail)}>

                                                    {Number((order.orderP2PPoints * parseFloat(price.replace(',', '.'))).toFixed(10))} - {name}
                                                </option>
                                            );
                                        }
                                        return null;
                                    })
                                ) : (
                                    <option disabled>Нет доступных банковских реквизитов</option>
                                )}
                            </select>
                            {calculatedValues[order.id] !== undefined && calculatedValues[order.id] !== null && (
                                <span className="ml-3 h-6 text-lg font-semibold">
        Итоговая сумма: <strong className="text-amber-500">
            {calculatedValues[order.id]?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 })}
        </strong>
    </span>
                            )}
                            <div className="text-center">
                                {order.orderP2PBuySell === 'BUY' && order.orderP2PUser1Id === user.id && (
                                    <Button className="ml-3 h-6" onClick={() => handleCloseBuyOrder(order)}>
                                        Закрыть сделку покупки
                                    </Button>
                                )}
                                {order.orderP2PBuySell === 'SELL' && order.orderP2PUser1Id === user.id && (
                                    <Button className="ml-3 h-6" onClick={() => handleCloseSellOrder(order)}>
                                        Закрыть сделку продажи
                                    </Button>
                                )}
                                {order.orderP2PBuySell === 'BUY' && order.orderP2PUser1Id !== user.id && (
                                    <Button
                                        className="ml-3 h-6"
                                        onClick={() => handleConcludeDealBuy(order)}
                                        disabled={calculatedValues[order.id] === undefined || calculatedValues[order.id] === null}
                                    >
                                        Заключить сделку -{order.orderP2PPoints} Points
                                    </Button>
                                )}
                                {order.orderP2PBuySell === 'SELL' && order.orderP2PUser1Id !== user.id && (
                                    <Button className="ml-3 h-6"
                                            onClick={() => handleConcludeDealSell(order)}
                                            disabled={calculatedValues[order.id] === undefined || calculatedValues[order.id] === null}
                                    >
                                        Заключить сделку
                                    </Button>
                                )}
                                <div className="text-center">
                                    <p>  {order.orderP2PUser1Id !== 1 && order.orderP2PUser1Id !== 2 &&
                                        <span>Автозакрытие сделки начнется: {getAutoCloseTime(order.updatedAt)}, (обновить) +1 час</span>}</p>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};