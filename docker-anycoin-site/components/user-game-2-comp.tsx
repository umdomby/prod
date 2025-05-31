"use client"
import React, {useState, useEffect} from 'react';
import {GameUserBet, User, Category, Product, ProductItem, $Enums, WinGameUserBet} from '@prisma/client';
import {Table, TableBody, TableCell, TableRow, TableHead} from "@/components/ui/table";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import Link from "next/link";
import {
    gameUserBetRegistrations,
    gameUserBetStart,
    gameUserBetClosed,
    removeGameUserBetRegistration,
    gameUserBetDelete, gameRatingGameUsers, gameUserStartBet // Import the delete function
} from "@/app/actions";
import GameUserBetStatus = $Enums.GameUserBetStatus;
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button, Input} from "@/components/ui";
import RatingUserEnum = $Enums.RatingUserEnum;

interface Props {
    user: User;
}

interface GameUserBetDataUser {
    userId: number;
    betUser2: number;
    gameUserBetDetails: string;
    userTelegram: string;
}

export const UserGame2Comp: React.FC<Props> = ({user}) => {
    const [gameUserBets, setGameUserBets] = useState<(GameUserBet & {
        gameUser1Bet: User;
        gameUser2Bet: User | null;
        category: Category;
        product: Product;
        productItem: ProductItem;
        gameUserBetDetails: string;
        betUser1: number;
        gameUserBetOpen: boolean;
        statusUserBet: GameUserBetStatus;
        gameUserBetDataUsers2: JSON;
        checkWinUser1: WinGameUserBet | null;
        checkWinUser2: WinGameUserBet | null;
        gameUser1Rating: RatingUserEnum;
        gameUserBetStatus: boolean;
    })[]>([]);
    const [successButton, setSuccessButton] = useState<number | null>(null);
    const [betInputs, setBetInputs] = useState<{ [key: number]: number }>({});
    const [descriptionInputs, setDescriptionInputs] = useState<{ [key: number]: string }>({});
    const [errorMessages, setErrorMessages] = useState<{ [key: number]: string }>({});
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Состояния для победителей
    const [selectedWinUser1, setSelectedWinUser1] = useState<{ [key: number]: WinGameUserBet | null }>({});
    const [selectedWinUser2, setSelectedWinUser2] = useState<{ [key: number]: WinGameUserBet | null }>({});
    const [currentBetId, setCurrentBetId] = useState<number | null>(null);


    useEffect(() => {
        // Fetch initial data
        const fetchData = async () => {
            try {
                const response = await fetch('/api/game-user-get');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setGameUserBets(data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };

        fetchData();

        // Set up SSE
        const eventSource = new EventSource('/api/game-user-sse');
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setGameUserBets(data);
            } catch (error) {
                console.error("Failed to parse SSE data:", error);
            }
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const handleRemoveBet = async (gameUserBetId: number) => {
        try {
            const result = await removeGameUserBetRegistration({
                userId: user.id,
                gameUserBetId: gameUserBetId
            });

            if (result) {
                console.log("Регистрация успешно удалена");
            }
        } catch (error) {
            console.error("Ошибка при удалении регистрации:", error);
        }
    };

    const handleAddBet = async (gameUserBetId: number, betUser1: number) => {
        const betInput = betInputs[gameUserBetId] || betUser1;
        const descriptionInput = descriptionInputs[gameUserBetId] || "";

        if (betInput > user.points) {
            setErrorMessage("У вас недостаточно Points");
            setErrorDialogOpen(true);
            return;
        }
        if (betInput < betUser1) {
            setErrorMessage("Ставка должна быть не меньше, чем у User1");
            setErrorDialogOpen(true);
            return;
        }
        if (descriptionInput.length > 150) {
            setErrorMessage("Описание не должно превышать 150 символов");
            setErrorDialogOpen(true);
            return;
        }

        try {
            const result = await gameUserBetRegistrations({
                userId: user.id,
                betUser2: betInput,
                gameUserBetDetails: descriptionInput,
                gameUserBetId: gameUserBetId,
                userTelegram: user.telegram || "No Telegram"
            });

            if (result) {
                setSuccessButton(gameUserBetId);
                setTimeout(() => {
                    setSuccessButton(null);
                }, 2000);
            }
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("An unknown error occurred");
            }
            setErrorDialogOpen(true);
        }
    };

    const handleStartGame = async (gameUserBetId: number) => {
        if (selectedUser === null) {
            alert("Выберите игрока для начала игры");
            return;
        }

        const selectedBet = gameUserBets.find(bet => bet.id === gameUserBetId);
        if (!selectedBet) {
            alert("Ставка не найдена");
            return;
        }

        // Parse gameUserBetDataUsers2 as an array
        const participants = Array.isArray(selectedBet.gameUserBetDataUsers2)
            ? selectedBet.gameUserBetDataUsers2
            : JSON.parse(selectedBet.gameUserBetDataUsers2 as string);

        const selectedParticipant = participants.find((participant: any) => participant.userId === selectedUser);

        if (!selectedParticipant) {
            alert("Выбранный игрок не найден");
            return;
        }

        try {
            await gameUserBetStart({
                gameUserBetId: gameUserBetId,
                gameUserBet2Id: selectedUser,
                betUser2: selectedParticipant.betUser2
            });

            setDialogOpen(false);
            console.log("Игра успешно начата");
        } catch (error) {
            console.error("Ошибка при запуске игры:", error);
        }
    };

    const handleConfirmResult = async (gameUserBetId: number) => {
        try {
            const selectedWin1 = selectedWinUser1[gameUserBetId] ?? null; // Используйте null вместо undefined
            const selectedWin2 = selectedWinUser2[gameUserBetId] ?? null; // Используйте null вместо undefined

            // Обновляем состояние игры в базе данных
            await gameUserBetClosed({
                gameUserBetId,
                checkWinUser1: selectedWin1,
                checkWinUser2: selectedWin2,
            });

            // Закрываем диалог
            setDialogOpen(false);
        } catch (error) {
            console.error("Ошибка при подтверждении результата игры:", error);
        }
    };

    const handleDeleteBet = async (gameUserBetId: number) => {
        try {
            await gameUserBetDelete(gameUserBetId);
            console.log('Ставка успешно удалена');
        } catch (error) {
            console.error('Ошибка при удалении ставки:', error);
        }
    };

    function isGameUserBetDataUser(obj: any): obj is GameUserBetDataUser {
        return typeof obj === 'object' &&
            obj !== null &&
            'userId' in obj &&
            'betUser2' in obj &&
            'gameUserBetDetails' in obj &&
            'userTelegram' in obj;
    }


    const handleCreateBet = async (bet: GameUserBet) => {
        if (bet.statusUserBet === "START" && bet.gameUserBetOpen) {
            try {
                if (bet.gameUserBet2Id === null) {
                    throw new Error("Идентификатор второго пользователя не найден");
                }

                const newBet = await gameUserStartBet(
                    bet.id,
                    bet.gameUserBet1Id, // Используйте gameUserBet1Id вместо gameUser1Bet.id
                    bet.gameUserBet2Id, // Убедитесь, что у вас есть gameUserBet2Id
                    bet.categoryId, // Убедитесь, что у вас есть categoryId
                    bet.productId, // Убедитесь, что у вас есть productId
                    bet.productItemId // Убедитесь, что у вас есть productItemId
                );
                console.log("Ставка успешно создана:", newBet);
            } catch (error) {
                if (error instanceof Error && error.message === "Ставка уже запущена") {
                    setErrorMessage("Ставка уже запущена");
                } else {
                    setErrorMessage("Ставка уже запущена");
                }
                setErrorDialogOpen(true);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>Points: {user?.points}</div>
                <Link className="text-blue-500" href="/user-game-create-2">Create game</Link>
            </div>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableHead className="text-center overflow-hidden whitespace-nowrap w-[10%]">Set</TableHead>
                        <TableHead className="text-center overflow-hidden whitespace-nowrap w-[10%]">Bet</TableHead>
                        <TableHead className="text-center overflow-hidden whitespace-nowrap w-[10%]">Name</TableHead>
                        <TableHead className="text-center overflow-hidden whitespace-nowrap w-[10%]">Map</TableHead>
                        <TableHead className="text-center overflow-hidden whitespace-nowrap w-[10%]">Size</TableHead>
                        <TableHead className="text-center overflow-hidden whitespace-nowrap w-[10%]">Timer</TableHead>
                        <TableHead className="text-center overflow-hidden whitespace-nowrap w-[10%]">State</TableHead>
                        <TableHead
                            className="text-center overflow-hidden whitespace-nowrap w-[10%]">Telegram</TableHead>
                    </TableRow>
                </TableBody>
            </Table>
            {gameUserBets.map((bet) => (
                <div key={bet.id} className="border border-gray-700 mt-1">
                    <Accordion type="single" collapsible>
                        <AccordionItem value={`item-${bet.id}`}>
                            <AccordionTrigger className={user.id === bet.gameUser1Bet.id ? 'text-red-500' : ''}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell
                                                className="text-center overflow-hidden whitespace-nowrap w-[10%]">{bet.betUser1}</TableCell>
                                            <TableCell
                                                className="text-center overflow-hidden whitespace-nowrap w-[10%]">{bet.gameUserBetOpen ? "Open" : "Closed"}</TableCell>
                                            <TableCell
                                                className="text-center overflow-hidden whitespace-nowrap w-[10%]">{bet.gameUser1Bet.fullName}</TableCell>
                                            <TableCell
                                                className="text-center overflow-hidden whitespace-nowrap w-[10%]">{bet.category.name}</TableCell>
                                            <TableCell
                                                className="text-center overflow-hidden whitespace-nowrap w-[10%]">{bet.product.name}</TableCell>
                                            <TableCell
                                                className="text-center overflow-hidden whitespace-nowrap w-[10%]">{bet.productItem.name}</TableCell>
                                            <TableCell
                                                className="text-center overflow-hidden whitespace-nowrap w-[10%]">{bet.statusUserBet}</TableCell>
                                            <TableCell
                                                className="text-center overflow-hidden whitespace-nowrap w-[10%]">
                                                {bet.gameUser1Bet.telegram ? (
                                                    <Link
                                                        className="text-center text-blue-500 hover:text-green-300 font-bold"
                                                        href={bet.gameUser1Bet.telegram.replace(/^@/, 'https://t.me/')}
                                                        target="_blank"
                                                    >
                                                        {bet.gameUser1Bet.telegram}
                                                    </Link>
                                                ) : (
                                                    "No Telegram"
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="p-4">
                                    <div className="mb-2"><span
                                        className="text-green-500">Description: </span> {bet.gameUserBetDetails}</div>
                                    {bet.statusUserBet === "OPEN" && (
                                        <div>
                                            <ul>
                                                {Array.isArray(bet.gameUserBetDataUsers2) && bet.gameUserBetDataUsers2.map((participant, index) => {
                                                    const isValidParticipant = (participant: any): participant is GameUserBetDataUser => {
                                                        return typeof participant === 'object' &&
                                                            participant !== null &&
                                                            'userId' in participant &&
                                                            'betUser2' in participant &&
                                                            'gameUserBetDetails' in participant &&
                                                            'userTelegram' in participant;
                                                    };

                                                    if (isValidParticipant(participant)) {
                                                        return (
                                                            <li key={index}
                                                                className="flex justify-between items-center">

                                                                <span>
                                                                    Bet: {participant.betUser2}{" "}
                                                                    {participant.userTelegram ? (
                                                                        <Link
                                                                            className="text-blue-500 hover:text-green-300 font-bold"
                                                                            href={participant.userTelegram.replace(/^@/, 'https://t.me/')}
                                                                            target="_blank"
                                                                        >
                                                                            {participant.userTelegram}
                                                                        </Link>
                                                                    ) : (
                                                                        <span className="text-gray-500">Скрыто</span>
                                                                    )}{" "}
                                                                    Details: {participant.gameUserBetDetails}
                                                                </span>

                                                                {participant.userId === user.id && (
                                                                    <Button
                                                                        onClick={() => handleRemoveBet(bet.id)}
                                                                        className="text-red-500 hover:text-blue-300 bg-grey-500 hover:bg-grey-500 font-bold h-5"
                                                                    >
                                                                        Удалить
                                                                    </Button>
                                                                )}

                                                                {user.id === bet.gameUser1Bet.id && (
                                                                    <Button
                                                                        onClick={() => setSelectedUser(participant.userId)}
                                                                        className={`ml-2 ${selectedUser === participant.userId ? 'bg-green-500' : 'bg-gray-500'} h-5`}
                                                                    >
                                                                        Выбрать
                                                                    </Button>
                                                                )}
                                                            </li>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </ul>
                                            <div>
                                                {user.id === bet.gameUser1Bet.id ? (
                                                    <div className="flex flex-col">
                                                        <div className="text-gray-500">Вы создатель этого события</div>
                                                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    disabled={selectedUser === null}
                                                                    className="mt-2 bg-blue-500 text-white"
                                                                >
                                                                    START
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogTitle>Confirm Game Start</DialogTitle>
                                                                <DialogDescription>
                                                                </DialogDescription>
                                                                <div className="p-4">
                                                                    <h2 className="text-lg font-bold">Подтвердите запуск
                                                                        игры</h2>
                                                                    {(Array.isArray(bet.gameUserBetDataUsers2) &&
                                                                        (bet.gameUserBetDataUsers2 as any[])
                                                                            .filter(isGameUserBetDataUser)
                                                                            .find((participant) => participant.userId === selectedUser)?.userTelegram) ?? "No Telegram"}
                                                                    <div>
                                                                        <Button
                                                                            onClick={() => handleStartGame(bet.id)}
                                                                            className="mt-4 bg-green-500 text-white"
                                                                        >
                                                                            Подтвердить
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Button
                                                            onClick={() => handleDeleteBet(bet.id)}
                                                            className="mt-2 bg-red-500 text-white"
                                                        >
                                                            Удалить событие
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    // Check if the user is already registered
                                                    !(Array.isArray(bet.gameUserBetDataUsers2) &&
                                                        (bet.gameUserBetDataUsers2 as any[]).some((participant) => isGameUserBetDataUser(participant) && participant.userId === user.id)) && (
                                                        <div className="flex flex-col">
                                                            <Input
                                                                type="number"
                                                                value={betInputs[bet.id] || bet.betUser1}
                                                                onChange={(e) => {
                                                                    const value = Number(e.target.value);
                                                                    setBetInputs((prev) => ({
                                                                        ...prev,
                                                                        [bet.id]: value
                                                                    }));

                                                                    if (value > user.points) {
                                                                        setErrorMessages((prev) => ({
                                                                            ...prev,
                                                                            [bet.id]: "У вас недостаточно Points"
                                                                        }));
                                                                    } else if (value < bet.betUser1) {
                                                                        setErrorMessages((prev) => ({
                                                                            ...prev,
                                                                            [bet.id]: `Минимальное значение: ${bet.betUser1}`
                                                                        }));
                                                                    } else {
                                                                        setErrorMessages((prev) => ({
                                                                            ...prev,
                                                                            [bet.id]: ""
                                                                        }));
                                                                    }
                                                                }}
                                                                placeholder="Your Bet"
                                                                className="mb-2 p-2 border"
                                                            />
                                                            {errorMessages[bet.id] &&
                                                                <div
                                                                    className="text-red-500">{errorMessages[bet.id]}</div>}
                                                            <Input
                                                                type="text"
                                                                value={descriptionInputs[bet.id] || ""}
                                                                onChange={(e) => setDescriptionInputs((prev) => ({
                                                                    ...prev,
                                                                    [bet.id]: e.target.value
                                                                }))}
                                                                placeholder="Description (max 150 chars)"
                                                                className="mb-2 p-2 border"
                                                            />

                                                            <Button
                                                                onClick={() => handleAddBet(bet.id, bet.betUser1)}
                                                                className={`p-2 text-white transition-colors duration-300 ${
                                                                    successButton === bet.id ? 'bg-green-500' : 'bg-blue-500'
                                                                }`}
                                                            >
                                                                {successButton === bet.id ? 'Added!' : 'Add to Game'}
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {bet.statusUserBet === "START" && (
                                        <div>
                                            {bet.gameUserBetOpen && user.id === bet.gameUser1Bet.id &&
                                                <Button onClick={() => handleCreateBet(bet)}
                                                        disabled={(bet.gameUserBetStatus === true && (user.role === 'ADMIN' || user.role === 'USER_BET'))}
                                                        className="bg-blue-500 text-white h-6">
                                                    Create Bet
                                                </Button>
                                            }

                                            <div>
                                                {bet.gameUser1Bet.telegram ? (
                                                    <div>
                                                        <Link
                                                            className="text-blue-500 hover:text-green-300 font-bold"
                                                            href={bet.gameUser1Bet.telegram.replace(/^@/, 'https://t.me/')}
                                                            target="_blank"
                                                        >
                                                            {bet.gameUser1Bet.telegram}
                                                        </Link>
                                                        {" "} Bet: {bet.betUser1}
                                                        {" "} Twitch: {bet.betUser1}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">Скрыто</span>
                                                )}
                                            </div>
                                            <div>
                                                {bet.gameUser2Bet?.telegram ? (
                                                    <div>
                                                        <Link
                                                            className="text-blue-500 hover:text-green-300 font-bold"
                                                            href={bet.gameUser2Bet.telegram.replace(/^@/, 'https://t.me/')}
                                                            target="_blank"
                                                        >
                                                            {bet.gameUser2Bet.telegram}
                                                        </Link>
                                                        {" "} Bet: {bet.betUser2}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">Скрыто</span>
                                                )}
                                            </div>
                                            {user.id === bet.gameUser1Bet.id && (
                                                <div>
                                                    <div>
                                                        <Button
                                                            onClick={() => setSelectedWinUser1(prev => ({
                                                                ...prev,
                                                                [bet.id]: WinGameUserBet.LOSS
                                                            }))}
                                                            className={`${selectedWinUser1[bet.id] === WinGameUserBet.LOSS ? 'bg-red-500' : bet.checkWinUser1 === WinGameUserBet.LOSS ? 'bg-red-500' : 'bg-gray-500'} mr-2 h-6`}
                                                            disabled={selectedWinUser2[bet.id] === WinGameUserBet.DRAW}
                                                        >
                                                            Проиграл
                                                        </Button>
                                                        <Button
                                                            onClick={() => setSelectedWinUser1(prev => ({
                                                                ...prev,
                                                                [bet.id]: WinGameUserBet.WIN
                                                            }))}
                                                            className={`${selectedWinUser1[bet.id] === WinGameUserBet.WIN ? 'bg-green-500' : bet.checkWinUser1 === WinGameUserBet.WIN ? 'bg-red-500' : 'bg-gray-500'} mr-2 h-6`}
                                                            disabled={selectedWinUser2[bet.id] === WinGameUserBet.DRAW}
                                                        >
                                                            Выиграл
                                                        </Button>
                                                        <Button
                                                            onClick={() => setSelectedWinUser1(prev => ({
                                                                ...prev,
                                                                [bet.id]: WinGameUserBet.DRAW
                                                            }))}
                                                            className={`${selectedWinUser1[bet.id] === WinGameUserBet.DRAW ? 'bg-yellow-500' : bet.checkWinUser1 === WinGameUserBet.DRAW ? 'bg-yellow-500' : 'bg-gray-500'} mr-2 h-6`}
                                                        >
                                                            Ничья
                                                        </Button>
                                                    </div>
                                                    <div>
                                                        {bet.checkWinUser2 === null ? (
                                                            <span
                                                                className="text-gray-500">Противник не проголосовал </span>
                                                        ) : (
                                                            <span
                                                                className="text-gray-500">Противник проголосовал: {bet.checkWinUser2}</span>
                                                        )}
                                                    </div>
                                                    <Dialog open={dialogOpen && currentBetId === bet.id}
                                                            onOpenChange={setDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                className="mt-2 bg-blue-500 text-white"
                                                                disabled={!selectedWinUser1[bet.id]} // Кнопка активна только если выбран вариант
                                                                onClick={() => setCurrentBetId(bet.id)}
                                                            >
                                                                Подтвердить результат
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>Подтверждение результата</DialogTitle>
                                                            <DialogDescription>
                                                                Вы уверены, что хотите подтвердить результат игры
                                                                как {selectedWinUser1[bet.id]}?
                                                            </DialogDescription>
                                                            <div className="p-4">
                                                                <Button
                                                                    onClick={() => handleConfirmResult(bet.id)}
                                                                    className="mt-4 bg-green-500 text-white"
                                                                >
                                                                    Подтвердить
                                                                </Button>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            )}

                                            {bet.gameUser2Bet && user.id === bet.gameUser2Bet.id && (
                                                <div>
                                                    <div>
                                                        <Button
                                                            onClick={() => setSelectedWinUser2(prev => ({
                                                                ...prev,
                                                                [bet.id]: WinGameUserBet.LOSS
                                                            }))}
                                                            className={`${selectedWinUser2[bet.id] === WinGameUserBet.LOSS ? 'bg-red-500' : bet.checkWinUser2 === WinGameUserBet.LOSS ? 'bg-red-500' : 'bg-gray-500'} mr-2 h-6`}
                                                            disabled={selectedWinUser1[bet.id] === WinGameUserBet.DRAW}
                                                        >
                                                            Проиграл
                                                        </Button>
                                                        <Button
                                                            onClick={() => setSelectedWinUser2(prev => ({
                                                                ...prev,
                                                                [bet.id]: WinGameUserBet.WIN
                                                            }))}
                                                            className={`${selectedWinUser2[bet.id] === WinGameUserBet.WIN ? 'bg-green-500' : bet.checkWinUser2 === WinGameUserBet.WIN ? 'bg-green-500' : 'bg-gray-500'} mr-2 h-6`}
                                                            disabled={selectedWinUser1[bet.id] === WinGameUserBet.DRAW}
                                                        >
                                                            Выиграл
                                                        </Button>
                                                        <Button
                                                            onClick={() => setSelectedWinUser2(prev => ({
                                                                ...prev,
                                                                [bet.id]: WinGameUserBet.DRAW
                                                            }))}
                                                            className={`${selectedWinUser2[bet.id] === WinGameUserBet.DRAW ? 'bg-yellow-500' : bet.checkWinUser2 === WinGameUserBet.DRAW ? 'bg-yellow-500' : 'bg-gray-500'} mr-2 h-6`}
                                                        >
                                                            Ничья
                                                        </Button>
                                                    </div>
                                                    <div>
                                                        {bet.checkWinUser1 === null ? (
                                                            <span
                                                                className="text-gray-500">Противник не проголосовал</span>
                                                        ) : (
                                                            <span
                                                                className="text-gray-500">Противник проголосовал: {bet.checkWinUser1}</span>
                                                        )}
                                                    </div>
                                                    <Dialog open={dialogOpen && currentBetId === bet.id}
                                                            onOpenChange={setDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                className="mt-2 bg-blue-500 text-white"
                                                                disabled={!selectedWinUser2[bet.id]} // Кнопка активна только если выбран вариант
                                                                onClick={() => setCurrentBetId(bet.id)}
                                                            >
                                                                Подтвердить результат
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>Подтверждение результата</DialogTitle>
                                                            <DialogDescription>
                                                                Вы уверены, что хотите подтвердить результат игры
                                                                как {selectedWinUser2[bet.id]}?
                                                            </DialogDescription>
                                                            <div className="p-4">
                                                                <Button
                                                                    onClick={() => handleConfirmResult(bet.id)}
                                                                    className="mt-4 bg-green-500 text-white"
                                                                >
                                                                    Подтвердить
                                                                </Button>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div>Старт: {new Date(bet.createdAt).toLocaleString()}</div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            ))}
            <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <DialogContent>
                    <DialogTitle></DialogTitle>
                    <DialogDescription>{errorMessage}</DialogDescription>
                </DialogContent>
            </Dialog>
        </div>
    );
};