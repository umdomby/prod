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
import React, { useState, useEffect } from 'react';
import { Category, Product, ProductItem, User, Player } from '@prisma/client';
import { gameUserBetCreate } from "@/app/actions";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import Link from "next/link";

const createBetSchema = z.object({
    initBetPlayer1: z.number().min(30, "Ставка должна быть не менее 30"),
    categoryId: z.number(),
    productId: z.number(),
    productItemId: z.number(),
    gameUserBetDetails: z.string().min(1, "Описание не может быть пустым").max(150, "Описание не может превышать 150 символов"),
    gameUserBetOpen: z.boolean(),
});

interface Props {
    user: User;
    categories: Category[];
    products: Product[];
    productItems: ProductItem[];
    player: Player;
}

export const UserGame2CreateComp: React.FC<Props> = ({ user, categories, products, productItems, player }) => {
    const form = useForm<z.infer<typeof createBetSchema>>({
        resolver: zodResolver(createBetSchema),
        defaultValues: {
            initBetPlayer1: 30,
            categoryId: categories[0]?.id || 0,
            productId: products[0]?.id || 0,
            productItemId: productItems[0]?.id || 0,
            gameUserBetDetails: '',
            gameUserBetOpen: false,
        },
    });

    const [createBetError, setCreateBetError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const subscription = form.watch((value) => {
            const initBetPlayer1 = value.initBetPlayer1 ?? 0; // Используем 0, если значение undefined
            if (initBetPlayer1 > user.points) {
                setCreateBetError("Вы не можете поставить больше Points, чем у вас есть.");
            } else if (initBetPlayer1 < 30) {
                setCreateBetError("Ставка должна быть не менее 30.");
            } else {
                setCreateBetError(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [form, user.points]);

    const onSubmit = async (values: z.infer<typeof createBetSchema>) => {
        try {
            await gameUserBetCreate({
                ...values,
                userId: user.id,
            });
            form.reset();
            setIsDialogOpen(true);
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
                setIsErrorDialogOpen(true);
            } else {
                setErrorMessage("Произошла неизвестная ошибка");
                setIsErrorDialogOpen(true);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>Points: {user?.points}</div>
                <Link className="text-blue-500" href="/user-game-2">Open games</Link>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="initBetPlayer1"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Ставка</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Сумма ставки"
                                        type="number"
                                        {...field}
                                        value={field.value === undefined ? '' : field.value}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || (Number.isInteger(Number(value)) && !/^0/.test(value))) {
                                                field.onChange(value === '' ? '' : Number(value));
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gameUserBetDetails"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Описание события (максимум 150 символов)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Описание события"
                                        {...field}
                                        maxLength={150} // Ограничение на уровне HTML
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Map</FormLabel>
                                <FormControl>
                                    <select {...field} value={field.value || 0}
                                            onChange={(e) => field.onChange(Number(e.target.value))}>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="productId"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Size</FormLabel>
                                <FormControl>
                                    <select {...field} value={field.value || 0}
                                            onChange={(e) => field.onChange(Number(e.target.value))}>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>{product.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="productItemId"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Product Item</FormLabel>
                                <FormControl>
                                    <select {...field} value={field.value || 0}
                                            onChange={(e) => field.onChange(Number(e.target.value))}>
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
                        name="gameUserBetOpen"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Создать событие для ставок. {user.role !== "ADMIN" && user.role !== "USER_BET" && <span> Обратитесь к администратору, чтобы создавать ставки</span>}</FormLabel>
                                <FormControl>
                                    <input
                                        className="ml-3"
                                        type="checkbox"
                                        checked={field.value} // Используем только checked
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={user.role !== "ADMIN" && user.role !== "USER_BET"}
                                        name={field.name}
                                        ref={field.ref}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={!form.watch('gameUserBetDetails') || !!createBetError}>Create
                        Bet</Button>

                    {createBetError && <p style={{color: 'red'}}>{createBetError}</p>}
                </form>
            </Form>


            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Игра успешно создана!</DialogTitle>
                        <DialogDescription>
                            Переходите: <Link className="text-blue-500 text-xl" href="/user-game-2">поиск игрока</Link>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ошибка</DialogTitle>
                        <DialogDescription>
                            {errorMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <Button onClick={() => setIsErrorDialogOpen(false)}>Закрыть</Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};
