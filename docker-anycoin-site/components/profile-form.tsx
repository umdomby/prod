"use client";
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {TFormRegisterValues, formRegisterSchema} from './modals/auth-modal/forms/schemas';
import {User} from '@prisma/client';
import toast from 'react-hot-toast';
import {signOut} from 'next-auth/react';
import {Container} from './container';
import {Title} from './title';
import {FormInput} from './form';
import {Button, Input} from '@/components/ui';
import {
    referralGet,
    updateUserInfo,
    addBankDetails,
    deleteBankDetail,
    updateBankDetails,
    updateUserInfoTelegram, registrationPlayer, isUserPlayer, updateTwitch, updatePlayerName
} from '@/app/actions';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

interface Props {
    data: User;
}

export const ProfileForm: React.FC<Props> = ({data}) => {
    const form = useForm({
        resolver: zodResolver(formRegisterSchema),
        defaultValues: {
            fullName: data.fullName,
            email: data.email,
            password: '',
            confirmPassword: '',
        },
    });

    const [referrals, setReferrals] = useState<any[]>([]);
    const [bankDetails, setBankDetails] = useState<any[]>(Array.isArray(data.bankDetails) ? data.bankDetails : []);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [newBankDetail, setNewBankDetail] = useState({ name: '', details: '', description: '', price: '' });
    const [editedDetail, setEditedDetail] = useState({ name: '', details: '', description: '', price: '' });
    const [telegram, setTelegram] = useState<string>(data.telegram || '');
    const [telegramView, setTelegramView] = useState<boolean>(data.telegramView || false);
    const [twitch, setTwitch] = useState<string>(''); // Устанавливаем значение по умолчанию
    const [twitchError, setTwitchError] = useState<string | null>(null);
    const [isPlayer, setIsPlayer] = useState<boolean>(false);
    const [playerName, setPlayerName] = useState<string>('');

    useEffect(() => {
        const fetchReferrals = async () => {
            try {
                const referralData = await referralGet();
                setReferrals(referralData);
            } catch (error) {
                console.error('Error fetching referral data:', error);
            }
        };

        fetchReferrals();
    }, []);

    useEffect(() => {
        const checkIfUserIsPlayer = async () => {
            try {
                const result = await isUserPlayer();
                setIsPlayer(result.isPlayer);
                setTwitch(result.twitch || 'twitch.tv/heroes3_site');
                setPlayerName(result.playerName);
            } catch (error) {
                console.error('Ошибка при проверке статуса игрока:', error);
            }
        };
        checkIfUserIsPlayer();
    }, []);

    const handleUpdateTelegram = async () => {
        try {
            await updateUserInfoTelegram(telegram, telegramView);
            toast.success('Telegram данные обновлены');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Ошибка при обновлении Telegram данных');
            }
        }
    };

    const onSubmit = async (data: TFormRegisterValues) => {
        try {
            await updateUserInfo({
                fullName: data.fullName,
                password: data.password,
            });

            toast.success('Данные обновлены 📝', {
                icon: '✅',
            });
        } catch (error) {
            toast.error('Ошибка при обновлении данных', {
                icon: '❌',
            });
        }
    };

    const onClickSignOut = () => {
        signOut({
            callbackUrl: '/',
        });
    };

    const handleAddBankDetail = async () => {
        try {
            if (!newBankDetail.name || !newBankDetail.details || !newBankDetail.description) {
                throw new Error('Все поля должны быть заполнены');
            }
            const updatedBankDetails = await addBankDetails(newBankDetail);
            setBankDetails(updatedBankDetails);
            setNewBankDetail({name: '', details: '', description: '', price: ''});
            toast.success('Банковский реквизит добавлен');
        } catch (error) {
            toast.error('Ошибка при добавлении банковского реквизита');
        }
    };

    const handleDeleteBankDetail = async (index: number) => {
        try {
            const updatedBankDetails = await deleteBankDetail(index);
            setBankDetails(updatedBankDetails);
            toast.success('Банковский реквизит удален');
        } catch (error) {
            toast.error('Ошибка при удалении банковского реквизита');
        }
    };

    const handleEditBankDetail = (index: number) => {
        setEditIndex(index);
        setEditedDetail(bankDetails[index]);
    };

    const handleSaveBankDetail = async () => {
        if (editIndex !== null) {
            const updatedDetails = [...bankDetails];
            updatedDetails[editIndex] = editedDetail;
            try {
                await updateBankDetails(updatedDetails);
                setBankDetails(updatedDetails);
                setEditIndex(null);
                toast.success('Банковские реквизиты обновлены');
            } catch (error) {
                toast.error('Ошибка при обновлении банковских реквизитов');
            }
        }
    };

    const loginHistory = Array.isArray(data.loginHistory) ? data.loginHistory : [];

    const handleCopyCardId = () => {
        navigator.clipboard.writeText(data.cardId);
        toast.success('Card ID скопирован в буфер обмена');
    };

    const handleCopyReferral = () => {
        const domain = window.location.origin; // Get the current domain
        const referralLink = `${domain}/referral/${data.id}`;
        navigator.clipboard.writeText(referralLink);
        toast.success('Referral link скопирован в буфер обмена');
    };

    const handleRegisterPlayer = async () => {
        try {
            if (!twitch) {
                throw new Error('Поле Twitch не должно быть пустым');
            }

            // Add "https://" to the beginning if it's not present
            let formattedTwitch = twitch;
            if (!formattedTwitch.startsWith('http://') && !formattedTwitch.startsWith('https://')) {
                formattedTwitch = 'https://' + formattedTwitch;
            }

            const newPlayer = await registrationPlayer(formattedTwitch);

            // Update the state to reflect the new player status
            setIsPlayer(true);
            setPlayerName(newPlayer.name); // Assuming the server returns the new player object with a name
            setTwitch(newPlayer.twitch ?? ''); // Provide a default empty string if twitch is null

            toast.success('Вы успешно зарегистрировались как игрок');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Ошибка при регистрации как игрок');
            }
        }
    };
    const handleTwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        setTwitch(value);

        // Проверяем, содержит ли введенное значение "twitch.tv/"
        if (!value.includes('twitch.tv/')) {
            setTwitchError('Введите корректные данные Twitch');
        } else {
            setTwitchError(null);
        }
    };

    const handleUpdateTwitch = async () => {
        try {
            let formattedTwitch = twitch;
            if (!formattedTwitch.startsWith('http://') && !formattedTwitch.startsWith('https://')) {
                formattedTwitch = 'https://' + formattedTwitch;
            }
            await updateTwitch(formattedTwitch);
            toast.success('Twitch успешно обновлен');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Ошибка при обновлении Twitch');
            }
        }
    };

    const handleUpdatePlayerName = async () => {
        try {
            if (!playerName) {
                throw new Error('Имя игрока не должно быть пустым');
            }
            await updatePlayerName(playerName);
            toast.success('Имя игрока успешно обновлено');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Ошибка при обновлении имени игрока');
            }
        }
    };


    return (
        <Container className="w-[98%]">
            <div className="flex flex-col gap-3 w-full mt-10">
                <div className="flex flex-col md:flex-row gap-3 w-full">
                    <div className="w-full md:w-1/3 p-4 rounded-lg">
                        <Title text={`Личные данные | #${data.id}`} size="md" className="font-bold"/>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-blue-500">Email: {data.email}</label>
                            <div className="flex">
                                <label className="block text-sm font-medium text-green-500">
                                    Card ID: {data.cardId}
                                </label>
                                <Button
                                    onClick={handleCopyCardId}
                                    className="ml-2 bg-blue-500 text-white px-2 py-1 rounded h-5"
                                >
                                    Copy
                                </Button>

                            </div>
                            <div className="flex">
                                <label className="block text-sm font-medium text-green-500">
                                    Referral: {`${window.location.origin}/referral/${data.id}`}
                                </label>
                                <Button
                                    onClick={handleCopyReferral}
                                    className="ml-2 bg-blue-500 text-white px-2 py-1 rounded h-5"
                                >
                                    Copy
                                </Button>
                            </div>
                            <label className="flex items-center">
                                Role:
                                <span
                                    className={`block text-sm font-medium ml-2 ${data.role === 'BANED' ? 'text-red-500' : 'text-green-500'}`}
                                >
            {data.role}
        </span>
                            </label>
                        </div>

                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <FormInput name="fullName" label="Полное имя" required/>
                                <FormInput type="password" name="password" label="Новый пароль" required/>
                                <FormInput type="password" name="confirmPassword" label="Повторите пароль" required/>

                                <Button disabled={form.formState.isSubmitting} className="text-base mt-10"
                                        type="submit">
                                    Сохранить
                                </Button>

                                <Button
                                    onClick={onClickSignOut}
                                    variant="secondary"
                                    disabled={form.formState.isSubmitting}
                                    className="text-base ml-3"
                                    type="button"
                                >
                                    Выйти
                                </Button>
                            </form>
                        </FormProvider>
                    </div>

                    <div className="w-full md:w-2/3 p-4 rounded-lg">
                        <Accordion type="single" collapsible>
                            <AccordionItem value="loginHistory">
                                <AccordionTrigger>История входов</AccordionTrigger>
                                <AccordionContent>
                                    {loginHistory.length > 0 ? (
                                        <div className="space-y-1">
                                            {loginHistory.map((entry: any, index: number) => (
                                                <div key={index} className="p-1 border border-gray-300 rounded-lg">
                                                    <p>
                                                        <strong>IP:</strong> {entry.ip}, {new Date(entry.lastLogin).toLocaleString()}, <strong>VPN:</strong> {entry.vpn ? 'Да' : 'Нет'}, {entry.loginCount}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>История входов отсутствует.</p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="referralIPs">
                                <AccordionTrigger>IP адреса рефералов</AccordionTrigger>
                                <AccordionContent>
                                    {referrals.length > 0 ? (
                                        <div className="space-y-1">
                                            {referrals.map((referral, index) => (
                                                <div key={index} className="p-1 border border-gray-300 rounded-lg">
                                                    <p className={referral.referralStatus ? 'text-green-600' : 'text-gray-400'}>
                                                        <strong>IP:</strong> {referral.referralIpAddress}, <strong>Дата:</strong> {new Date(referral.createdAt).toLocaleString()},
                                                        +{referral.referralPoints}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>Нет данных о рефералах.</p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="bankDetails">
                                <AccordionTrigger>Реквизиты банков</AccordionTrigger>
                                <AccordionContent>
                                    <div className="mb-4">
                                        <FormProvider {...form}>
                                            <FormInput
                                                name="bankName"
                                                label="Название"
                                                value={newBankDetail.name || ''} // Убедитесь, что значение всегда строка
                                                onChange={(e) => setNewBankDetail({
                                                    ...newBankDetail,
                                                    name: e.target.value
                                                })}
                                            />
                                            <FormInput
                                                name="bankDetails"
                                                label="Реквизиты"
                                                value={newBankDetail.details || ''} // Убедитесь, что значение всегда строка
                                                onChange={(e) => setNewBankDetail({
                                                    ...newBankDetail,
                                                    details: e.target.value
                                                })}
                                            />
                                            <FormInput
                                                name="bankDescription"
                                                label="Описание"
                                                value={newBankDetail.description || ''} // Убедитесь, что значение всегда строка
                                                onChange={(e) => setNewBankDetail({
                                                    ...newBankDetail,
                                                    description: e.target.value
                                                })}
                                            />

                                            <FormInput
                                                name="price"
                                                label="Цена за 1 Point"
                                                value={newBankDetail.price || ''} // Ensure the value is always a string
                                                onChange={(e) => {
                                                    let value = e.target.value;
                                                    // Заменяем точку на запятую
                                                    value = value.replace('.', ',');
                                                    // Проверяем, соответствует ли значение регулярному выражению
                                                    const regex = /^\d*[,]?\d*$/;
                                                    if (regex.test(value)) {
                                                        // Если значение пустое, сбрасываем цену
                                                        if (value === '') {
                                                            setEditedDetail({...editedDetail, price: ''});
                                                            return;
                                                        }
                                                        // Если значение начинается с запятой или точки, добавляем "0," в начало
                                                        if (value.startsWith(',') || value.startsWith('.')) {
                                                            value = '0,' + value.slice(1);
                                                        }
                                                        // Если значение начинается с "0" и за ним не следует запятая, добавляем запятую
                                                        if (value.startsWith('0') && value.length > 1 && value[1] !== ',') {
                                                            value = '0,' + value.slice(1);
                                                        }
                                                        // Предотвращаем добавление второй запятой после "0,0"
                                                        if (value.startsWith('0,') && value[3] === ',') {
                                                            value = '0,' + value.slice(4);
                                                        }
                                                        // Предотвращаем добавление второй запятой после "0,0"
                                                        if (value.startsWith('0,') && value[4] === ',') {
                                                            value = '0,' + value.slice(5);
                                                        }
                                                        // Разделяем значение на части до и после запятой
                                                        const parts = value.split(',');
                                                        // Ограничиваем длину части до запятой и проверяем, не превышает ли она 100000
                                                        if (parts[0].length > 6 || parseInt(parts[0]) > 100000) {
                                                            parts[0] = parts[0].slice(0, 6);
                                                            if (parseInt(parts[0]) > 100000) {
                                                                parts[0] = '100000';
                                                            }
                                                        }
                                                        // Ограничиваем длину части после запятой
                                                        if (parts[1] && parts[1].length > 10) {
                                                            parts[1] = parts[1].slice(0, 10);
                                                        }
                                                        // Объединяем части обратно в строку
                                                        value = parts.join(',');

                                                        // Преобразуем строку в число с плавающей точкой и проверяем, является ли оно числом
                                                        const floatValue = parseFloat(value.replace(',', '.'));
                                                        if (!isNaN(floatValue)) {
                                                            setNewBankDetail({...newBankDetail, price: value});
                                                        }
                                                    }
                                                }}
                                            />
                                        </FormProvider>
                                        <Button
                                            onClick={handleAddBankDetail}
                                            disabled={!newBankDetail.name || !newBankDetail.details || !newBankDetail.description || !newBankDetail.price}
                                            className="mt-2"
                                        >Добавить</Button>
                                    </div>

                                    <div className="space-y-1">
                                        {bankDetails.map((detail, index) => (
                                            <div key={index}
                                                 className="p-1 border border-gray-300 rounded-lg">
                                                {editIndex === index ? (
                                                    <div>
                                                        <input
                                                            type="text"
                                                            value={editedDetail.name || ''}
                                                            onChange={(e) => setEditedDetail({
                                                                ...editedDetail,
                                                                name: e.target.value
                                                            })}
                                                            className="block w-full mb-1"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editedDetail.details || ''}
                                                            onChange={(e) => setEditedDetail({
                                                                ...editedDetail,
                                                                details: e.target.value
                                                            })}
                                                            className="block w-full mb-1"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editedDetail.description || ''}
                                                            onChange={(e) => setEditedDetail({
                                                                ...editedDetail,
                                                                description: e.target.value
                                                            })}
                                                            className="block w-full mb-1"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editedDetail.price || ''}
                                                            onChange={(e) => {
                                                                let value = e.target.value;
                                                                value = value.replace('.', ',');
                                                                const regex = /^\d*[,]?\d*$/;
                                                                if (regex.test(value)) {
                                                                    if (value === '') {
                                                                        setEditedDetail({...editedDetail, price: ''});
                                                                        return;
                                                                    }
                                                                    if (value.startsWith(',') || value.startsWith('.')) {
                                                                        value = '0,' + value.slice(1);
                                                                    }
                                                                    if (value.startsWith('0') && value.length > 1 && value[1] !== ',') {
                                                                        value = '0,' + value.slice(1);
                                                                    }
                                                                    if (value.startsWith('0,') && value[3] === ',') {
                                                                        value = '0,' + value.slice(4);
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
                                                                        setEditedDetail({
                                                                            ...editedDetail,
                                                                            price: value
                                                                        });
                                                                    }
                                                                }
                                                            }}
                                                            className="block w-full mb-1"
                                                        />
                                                        <Button
                                                            onClick={handleSaveBankDetail}
                                                            className="mt-2"
                                                            disabled={!editedDetail.name || !editedDetail.details || !editedDetail.description || !editedDetail.price}
                                                        >
                                                            Сохранить
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p><strong>Название валюты:</strong> {detail.name}</p>
                                                        <p><strong>Реквизиты:</strong> {detail.details}</p>
                                                        <p><strong>Описание:</strong> {detail.description}</p>
                                                        <p><strong>Цена за 1 Point:</strong> {detail.price}</p>
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap space-x-2 mt-2">
                                                    <Button onClick={() => handleEditBankDetail(index)}
                                                            variant="secondary">Изменить</Button>
                                                    <Button onClick={() => handleDeleteBankDetail(index)}
                                                            variant="secondary">Удалить</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="telegram">
                                <AccordionTrigger>Настройки Telegram</AccordionTrigger>
                                <AccordionContent>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Telegram</label>
                                        <Input
                                            type="text"
                                            value={telegram}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                // Убедитесь, что первый символ всегда '@'
                                                if (!value.startsWith('@')) {
                                                    value = '@' + value.replace(/^@+/, ''); // Удаляем все начальные '@' и добавляем один
                                                }
                                                setTelegram(value);
                                            }}
                                            className="mb-2 p-2 border border-gray-300 rounded"
                                        />
                                        <div className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                checked={telegramView}
                                                onChange={(e) => setTelegramView(e.target.checked)}
                                                className="mr-2"
                                            />


                                            <p className="text-sm font-medium ">Показывать Telegram на странице <Link
                                                className="text-blue-500" href="/rating" target="_blank">Rating</Link>
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium "> В заключившихся сделках (orderP2P) Telegram
                                            отображается. </p>
                                        <Button onClick={handleUpdateTelegram}
                                                className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                                            Обновить Telegram
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="registerPlayer">
                                <AccordionTrigger>Зарегистрироваться как игрок</AccordionTrigger>
                                <AccordionContent>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Twitch (можно оставить
                                            heroes3_site или введите свой)</label>
                                        <Input
                                            type="text"
                                            value={twitch}
                                            onChange={handleTwitchChange}
                                            className={`mb-2 p-2 border ${twitchError ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        />
                                        {twitchError && <p className="text-red-500 text-sm">{twitchError}</p>}
                                        {!telegram && (
                                            <p className="text-red-500 text-sm">
                                                Чтобы стать игроком, вам нужно еще заполнить поле Telegram в Настройках
                                                Telegram
                                            </p>
                                        )}
                                        {!isPlayer && (
                                            <Button
                                                onClick={handleRegisterPlayer}
                                                className="mt-2 mr-3 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                                                disabled={!!twitchError || !telegram || !twitch} // Disable if there's an error or Telegram is empty
                                            >
                                                Зарегистрироваться
                                            </Button>
                                        )}
                                        <Button
                                            onClick={handleUpdateTwitch}
                                            className="mt-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                                            disabled={!!twitchError || !isPlayer} // Отключаем кнопку, если есть ошибка или пользователь не игрок
                                        >
                                            Обновить Twitch
                                        </Button>


                                        {isPlayer && (
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Имя игрока</label>
                                                <div>
                                                    <Input
                                                        type="text"
                                                        value={playerName}
                                                        onChange={(e) => setPlayerName(e.target.value)}
                                                        className="mb-2 p-2 border border-gray-300 rounded"
                                                    />
                                                    <Button
                                                        onClick={handleUpdatePlayerName}
                                                        className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                                                        disabled={!playerName} // Отключаем кнопку, если имя пустое
                                                    >
                                                        Обновить имя
                                                    </Button>
                                                </div>
                                            </div>)}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>
        </Container>
    );
};
