'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, {useEffect, useState} from 'react';
import {Category, Product, ProductItem, User, Player, TurnirBet, Bet4} from '@prisma/client';
import {clientCreateBet4, editBet4} from "@/app/actions"; // Assuming you have a separate action for 4 players

const createBetSchema4 = z.object({
    player1Id: z.coerce.number().int(),
    player2Id: z.coerce.number().int(),
    player3Id: z.coerce.number().int(),
    player4Id: z.coerce.number().int(),
    initBetPlayer1: z.number().int().min(10, { message: 'Минимальная ставка на игрока 1: 10 баллов' }),
    initBetPlayer2: z.number().int().min(10, { message: 'Минимальная ставка на игрока 2: 10 баллов' }),
    initBetPlayer3: z.number().int().min(10, { message: 'Минимальная ставка на игрока 3: 10 баллов' }),
    initBetPlayer4: z.number().int().min(10, { message: 'Минимальная ставка на игрока 4: 10 баллов' }),
    categoryId: z.coerce.number().int().nullable().optional(),
    productId: z.coerce.number().int().nullable().optional(),
    productItemId: z.coerce.number().int().nullable().optional(),
    turnirBetId: z.coerce.number().int().nullable().optional(),
    description: z.string().optional(),
});

interface Props {
    user: User;
    categories: Category[];
    products: Product[];
    productItems: ProductItem[];
    players: Player[];
    createBet: typeof clientCreateBet4;
    turnirBet: TurnirBet[]; // Добавлено свойство для TurnirBet
    openBets: Bet4[]; // Добавлено свойство для открытых ставок
}

export const CreateBetForm4: React.FC<Props> = ({ user, categories, products, productItems, players, turnirBet, createBet, openBets }) => {
    const form = useForm<z.infer<typeof createBetSchema4>>({
        resolver: zodResolver(createBetSchema4),
        defaultValues: {
            player1Id: players[0]?.id,
            player2Id: players[1]?.id,
            player3Id: players[2]?.id,
            player4Id: players[3]?.id,
            initBetPlayer1: 100,
            initBetPlayer2: 100,
            initBetPlayer3: 100,
            initBetPlayer4: 100,
            categoryId: undefined, // Установлено значение по умолчанию на undefined
            productId: undefined,  // Установлено значение по умолчанию на undefined
            productItemId: undefined, // Установлено значение по умолчанию на undefined
            turnirBetId: undefined, // Установлено значение по умолчанию на undefined
            description: 'online',
        },
    });

    const [createBetError, setCreateBetError] = useState<string | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);

    const [openBetsState, setOpenBets] = useState<Bet4[]>(openBets);
    const [tempChanges, setTempChanges] = useState<{ [key: number]: Partial<Bet4> }>({});

    useEffect(() => {
        // Инициализируем tempChanges с текущими значениями из openBets
        const initialChanges = openBets.reduce((acc, bet) => {
            acc[bet.id] = {
                turnirBetId: bet.turnirBetId,
                categoryId: bet.categoryId,
                productId: bet.productId,
                productItemId: bet.productItemId,
            };
            return acc;
        }, {} as { [key: number]: Partial<Bet4> });

        setTempChanges(initialChanges);
    }, [openBets]);

    const handleSelectChange = (betId: number, field: string, value: any) => {
        setTempChanges(prev => ({
            ...prev,
            [betId]: {
                ...prev[betId],
                [field]: value,
            },
        }));
    };

    const handleSave = async (betId: number) => {
        const changes = tempChanges[betId];
        if (changes) {
            try {
                await editBet4(betId, changes);
                setOpenBets(prevBets => prevBets.map(bet => bet.id === betId ? { ...bet, ...changes } : bet));
                setTempChanges(prev => {
                    const { [betId]: _, ...rest } = prev;
                    return rest;
                });
            } catch (error) {
                console.error("Error saving bet:", error);
            }
        }
    };

    const onSubmit = async (values: z.infer<typeof createBetSchema4>) => {
        const { initBetPlayer1, initBetPlayer2, initBetPlayer3, initBetPlayer4 } = values;

        if (initBetPlayer1 < 100 || initBetPlayer2 < 100 || initBetPlayer3 < 100 || initBetPlayer4 < 100) {
            setCreateBetError('Минимальная ставка на каждого игрока: 100 баллов');
            return;
        }

        const totalBetAmount = initBetPlayer1 + initBetPlayer2 + initBetPlayer3 + initBetPlayer4;
        if (totalBetAmount > 20000) {
            setCreateBetError('Максимальная сумма ставок на всех игроков: 20000 баллов');
            return;
        }

        const totalBets = initBetPlayer1 + initBetPlayer2 + initBetPlayer3 + initBetPlayer4;
        const oddsBetPlayer1 = totalBets / initBetPlayer1;
        const oddsBetPlayer2 = totalBets / initBetPlayer2;
        const oddsBetPlayer3 = totalBets / initBetPlayer3;
        const oddsBetPlayer4 = totalBets / initBetPlayer4;

        const betData = {
            ...values,
            status: 'OPEN',
            oddsBetPlayer1,
            oddsBetPlayer2,
            oddsBetPlayer3,
            oddsBetPlayer4,
            creatorId: user.id,
            totalBetPlayer1: initBetPlayer1,
            totalBetPlayer2: initBetPlayer2,
            totalBetPlayer3: initBetPlayer3,
            totalBetPlayer4: initBetPlayer4,
        };

        try {
            await createBet(betData);
            form.reset();
            setCreateBetError(null);
            setShowSuccessDialog(true);
            setTimeout(() => setShowSuccessDialog(false), 3000);
        } catch (error) {
            if (error instanceof Error) {
                setCreateBetError(error.message);
            } else {
                setCreateBetError("Произошла неизвестная ошибка");
            }
        }
    };

    return (
        <div>
            <div>Ваши баллы: {user?.points}</div>
            <div style={{color: 'blue', marginBottom: '10px'}}>
                Распределить 20000 баллов между четырьмя игроками. Баллы не списываются с вашего баланса.
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Player 1 Selection */}
                    <FormField
                        control={form.control}
                        name="player1Id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Player 1</FormLabel>
                                <FormControl>
                                    <select {...field} value={field.value ?? ""}>
                                        {players.map((player) => (
                                            <option key={player.id} value={player.id}>{player.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Player 2 Selection */}
                    <FormField
                        control={form.control}
                        name="player2Id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Player 2</FormLabel>
                                <FormControl>
                                    <select {...field} value={field.value ?? ""}>
                                        {players.map((player) => (
                                            <option key={player.id} value={player.id}>{player.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Player 3 Selection */}
                    <FormField
                        control={form.control}
                        name="player3Id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Player 3</FormLabel>
                                <FormControl>
                                    <select {...field} value={field.value ?? ""}>
                                        {players.map((player) => (
                                            <option key={player.id} value={player.id}>{player.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Player 4 Selection */}
                    <FormField
                        control={form.control}
                        name="player4Id"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Player 4</FormLabel>
                                <FormControl>
                                    <select {...field} value={field.value ?? ""}>
                                        {players.map((player) => (
                                            <option key={player.id} value={player.id}>{player.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Bet on Player 1 */}
                    <FormField
                        control={form.control}
                        name="initBetPlayer1"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Ставка на Player 1</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Сумма ставки"
                                        type="number"
                                        {...field}
                                        value={field.value === undefined ? '' : field.value}
                                        onChange={(e) => {
                                            const value = e.target.valueAsNumber;
                                            if (Number.isInteger(value)) {
                                                field.onChange(value);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Bet on Player 2 */}
                    <FormField
                        control={form.control}
                        name="initBetPlayer2"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Ставка на Player 2</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Сумма ставки"
                                        type="number"
                                        {...field}
                                        value={field.value === undefined ? '' : field.value}
                                        onChange={(e) => {
                                            const value = e.target.valueAsNumber;
                                            if (Number.isInteger(value)) {
                                                field.onChange(value);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Bet on Player 3 */}
                    <FormField
                        control={form.control}
                        name="initBetPlayer3"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Ставка на Player 3</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Сумма ставки"
                                        type="number"
                                        {...field}
                                        value={field.value === undefined ? '' : field.value}
                                        onChange={(e) => {
                                            const value = e.target.valueAsNumber;
                                            if (Number.isInteger(value)) {
                                                field.onChange(value);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Bet on Player 4 */}
                    <FormField
                        control={form.control}
                        name="initBetPlayer4"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Ставка на Player 4</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Сумма ставки"
                                        type="number"
                                        {...field}
                                        value={field.value === undefined ? '' : field.value}
                                        onChange={(e) => {
                                            const value = e.target.valueAsNumber;
                                            if (Number.isInteger(value)) {
                                                field.onChange(value);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Category Selection */}
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Map</FormLabel>
                                <FormControl>
                                    <select {...field} value={field.value ?? ""}>
                                        <option value="">None</option>
                                        {/* Опция для выбора null */}
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Product Selection */}
                    <FormField
                        control={form.control}
                        name="productId"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Size</FormLabel>
                                <FormControl>
                                    <select {...field} value={field.value ?? ""}>
                                        <option value="">None</option>
                                        {/* Опция для выбора null */}
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>{product.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Product Item Selection */}
                    <FormField
                        control={form.control}
                        name="productItemId"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Product Item</FormLabel>
                                <FormControl>
                                    <select {...field} value={field.value ?? ""}>
                                        <option value="">None</option>
                                        {/* Опция для выбора null */}
                                        {productItems.map((productItem) => (
                                            <option key={productItem.id}
                                                    value={productItem.id}>{productItem.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="turnirBetId"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Turnir Bet</FormLabel>
                                <FormControl>
                                    <select {...field} value={field.value ?? ""}>
                                        <option value="">None</option>
                                        {/* Опция для выбора null */}
                                        {turnirBet.map((turnirBet) => (
                                            <option key={turnirBet.id} value={turnirBet.id}>{turnirBet.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Description Field */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Описание"
                                        type="text"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Submit Button */}
                    <Button type="submit">Create Bet</Button>

                    {/* Error Message */}
                    {createBetError && <p style={{color: 'red'}}>{createBetError}</p>}
                </form>
            </Form>

            {/* Диалоговое окно успешного создания ставки */}
            {showSuccessDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <div className=" p-4 rounded shadow-lg">
                        <p>Ставка успешно создана!</p>
                    </div>
                </div>
            )}


            <div>
                <h2>Открытые ставки</h2>
                {openBetsState.map(bet => (
                    <div key={bet.id} className="bet-item mb-4 p-4 border rounded">
                        <div className="flex flex-col space-y-2">
                            <span>Ставка ID: {bet.id}</span>
                            <select
                                className="p-2 border rounded"
                                value={tempChanges[bet.id]?.turnirBetId ?? bet.turnirBetId ?? ""}
                                onChange={(e) => handleSelectChange(bet.id, 'turnirBetId', e.target.value)}
                            >
                                <option value="">None</option>
                                {turnirBet.map(tb => (
                                    <option key={tb.id} value={tb.id}>{tb.name}</option>
                                ))}
                            </select>
                            <select
                                className="p-2 border rounded"
                                value={tempChanges[bet.id]?.categoryId ?? bet.categoryId ?? ""}
                                onChange={(e) => handleSelectChange(bet.id, 'categoryId', e.target.value)}
                            >
                                <option value="">None</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <select
                                className="p-2 border rounded"
                                value={tempChanges[bet.id]?.productId ?? bet.productId ?? ""}
                                onChange={(e) => handleSelectChange(bet.id, 'productId', e.target.value)}
                            >
                                <option value="">None</option>
                                {products.map(prod => (
                                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                                ))}
                            </select>
                            <select
                                className="p-2 border rounded"
                                value={tempChanges[bet.id]?.productItemId ?? bet.productItemId ?? ""}
                                onChange={(e) => handleSelectChange(bet.id, 'productItemId', e.target.value)}
                            >
                                <option value="">None</option>
                                {productItems.map(pi => (
                                    <option key={pi.id} value={pi.id}>{pi.name}</option>
                                ))}
                            </select>
                            <Button
                                className="mt-2"
                                onClick={() => handleSave(bet.id)}
                            >
                                Сохранить
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};