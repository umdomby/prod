"use client";
import React, { useState, useEffect, useTransition } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { PlayerStatistic, User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button, Input } from "@/components/ui";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { tournamentSumPlayers, createPlayerStatistic, getPlayerStatistics } from "@/app/actions";

const cityTranslations = {
    CASTLE: "ЗАМОК",
    RAMPART: "ОПЛОТ",
    TOWER: "БАШНЯ",
    INFERNO: "ИНФЕРНО",
    NECROPOLIS: "НЕКРОПОЛИС",
    DUNGEON: "ТЕМНИЦА",
    STRONGHOLD: "ЦИТАДЕЛЬ",
    FORTRESS: "КРЕПОСТЬ",
    CONFLUX: "СОПРЯЖЕНИЕ",
    COVE: "ПРИЧАЛ",
    FACTORY: "ФАБРИКА"
};

enum ColorPlayer {
    RED = "КРАСНЫЙ",
    BLUE = "СИНИЙ",
    GREEN = "ЗЕЛЁНЫЙ",
    YELLOW = "ЖЁЛТЫЙ",
    PURPLE = "ФИОЛЕТОВЫЙ",
    ORANGE = "ОРАНЖЕВЫЙ",
    TEAL = "БИРЮЗОВЫЙ",
    PINK = "РОЗОВЫЙ"
}

interface PlayerStatisticWithRelations extends PlayerStatistic {
    turnirBet?: { name: string };
    category?: { name: string };
    player?: { id: number; name: string };
}

interface PlayerStatisticsProps {
    user: User | null;
    turnirs: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    players: { id: number; name: string }[];
}

export function TOURNAMENT({
                               user,
                               turnirs,
                               categories,
                               players
                           }: PlayerStatisticsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [playerStatistics, setPlayerStatistics] = useState<PlayerStatisticWithRelations[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [formData, setFormData] = useState({
        turnirId: '',
        categoryId: '',
        playerId: '',
        color: '',
        city: '',
        gold: 0,
        security: '',
        win: false,
        link: ''
    });

    const [formDataSort, setFormDataSort] = useState<{
        turnirId: string;
        categoryId: string;
        playerId: string;
        color: string;
        city: string;
        win: boolean | null;
    }>({
        turnirId: '',
        categoryId: '',
        playerId: '',
        color: '',
        city: '',
        win: null
    });

    const isFormValid = Object.values(formData).every(value => value !== '' && value !== 0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { playerStatistics, totalPages } = await getPlayerStatistics(formDataSort, currentPage);
                setPlayerStatistics(playerStatistics);
                setTotalPages(totalPages);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        fetchData();
    }, [formDataSort, currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleCalculateStatistics = () => {
        startTransition(async () => {
            try {
                await tournamentSumPlayers();
                alert('Статистика обновлена успешно!');
            } catch (error) {
                console.error('Ошибка при обновлении статистики:', error);
                alert('Ошибка при обновлении статистики.');
            }
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSearch = () => {
        setCurrentPage(1); // Reset to the first page
        // Reset win to null if neither checkbox is selected
        if (formDataSort.win === null) {
            setFormDataSort({ ...formDataSort, win: null });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPlayerStatistic(formData);
            alert('Запись успешно создана!');
            router.refresh();
        } catch (error) {
            console.error('Ошибка при создании записи:', error);
            alert('Ошибка при создании записи.');
        }
    };

    const resetFilters = () => {
        setFormDataSort({
            turnirId: '',
            categoryId: '',
            playerId: '',
            color: '',
            city: '',
            win: null
        });
        setCurrentPage(1);
    };

    return (
        <div>
            <div className="text-right">
                <Link href="/player">
                    <Button className="h-6 my-4">ИГРОКИ</Button>
                </Link>
            </div>

            <div className="flex flex-wrap items-center space-x-2">
                <Select onValueChange={(value) => {
                    setFormDataSort({...formDataSort, turnirId: value});
                    setCurrentPage(1); // Reset to the first page
                }} value={formDataSort.turnirId}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Турнир"/>
                    </SelectTrigger>
                    <SelectContent>
                        {turnirs.map((turnir) => (
                            <SelectItem key={turnir.id} value={turnir.id.toString()}>
                                {turnir.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select onValueChange={(value) => {
                    setFormDataSort({...formDataSort, categoryId: value});
                    setCurrentPage(1); // Reset to the first page
                }} value={formDataSort.categoryId}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Категория"/>
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select onValueChange={(value) => {
                    setFormDataSort({...formDataSort, playerId: value});
                    setCurrentPage(1); // Reset to the first page
                }} value={formDataSort.playerId}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Игрок"/>
                    </SelectTrigger>
                    <SelectContent>
                        {players.map((player) => (
                            <SelectItem key={player.id} value={player.id.toString()}>
                                {player.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select onValueChange={(value) => {
                    setFormDataSort({...formDataSort, color: value});
                    setCurrentPage(1); // Reset to the first page
                }} value={formDataSort.color}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Цвет"/>
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(ColorPlayer).map((color) => (
                            <SelectItem key={color} value={color}>
                                {ColorPlayer[color as keyof typeof ColorPlayer]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select onValueChange={(value) => {
                    setFormDataSort({...formDataSort, city: value});
                    setCurrentPage(1); // Reset to the first page
                }} value={formDataSort.city}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Город"/>
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(cityTranslations).map((city) => (
                            <SelectItem key={city} value={city}>
                                {cityTranslations[city as keyof typeof cityTranslations]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex items-center">
                    <span className="mr-2">Win</span>
                    <Input
                        type="checkbox"
                        name="win"
                        checked={formDataSort.win === true}
                        onChange={() => {
                            setFormDataSort({...formDataSort, win: formDataSort.win === true ? null : true});
                            setCurrentPage(1); // Reset to the first page
                        }}
                    />
                    <span className="mr-2">Lose</span>
                    <Input
                        type="checkbox"
                        name="win"
                        checked={formDataSort.win === false}
                        onChange={() => {
                            setFormDataSort({...formDataSort, win: formDataSort.win === false ? null : false});
                            setCurrentPage(1); // Reset to the first page
                        }}
                    />
                </div>
                <Button onClick={handleSearch} className="h-7">Поиск</Button>
                <Button onClick={resetFilters} className="h-7">Сбросить</Button>
            </div>

            <div className="pagination-buttons flex justify-center items-center m-3">
                <div className="flex justify-center w-full">
                    <Button
                        className="h-7 mx-2"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        Предыдущая
                    </Button>
                    <span>Страница {currentPage} из {totalPages}</span>
                    <Button
                        className="h-7 mx-2"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        Следующая
                    </Button>
                </div>
            </div>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>№</TableCell>
                        <TableCell>id</TableCell>
                        <TableCell>turnir</TableCell>
                        <TableCell>map</TableCell>
                        <TableCell>city</TableCell>
                        <TableCell>win</TableCell>
                        <TableCell>player</TableCell>
                        <TableCell>gold</TableCell>
                        <TableCell className="text-center">security</TableCell>
                        <TableCell>link</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Table>
                <TableBody>
                    {playerStatistics.map((stat, index) => (
                        <TableRow key={stat.id}>
                            <TableCell className="text-orange-500">{(currentPage - 1) * 50 + index + 1}</TableCell>
                            <TableCell className="text-orange-500">{stat.id || 'N/A'}</TableCell>
                            <TableCell className="text-green-500">{stat.turnirBet?.name || 'N/A'}</TableCell>
                            <TableCell className="text-blue-500">{stat.category?.name || 'N/A'}</TableCell>
                            <TableCell className="text-amber-500">
                                {stat.city ? cityTranslations[stat.city] || 'N/A' : 'N/A'}
                            </TableCell>
                            <TableCell>
                                {stat.win && <span className="yellow-circle"></span>}
                            </TableCell>
                            <TableCell className={`text-${stat.color?.toLowerCase() || 'gray'}-500`}>
                                {stat.player ? (
                                    <Link
                                        className="cursor-pointer hover:text-green-500"
                                        href={`/player/${stat.player.id}`}
                                    >
                                        {stat.player.name || 'N/A'}
                                    </Link>
                                ) : (
                                    'N/A'
                                )}
                            </TableCell>
                            <TableCell
                                className={`text-${stat.color?.toLowerCase() || 'gray'}-500`}>{stat.gold}</TableCell>
                            <TableCell className="text-amber-500 text-center">{stat.security || '-'}</TableCell>
                            <TableCell className="text-gray-500">
                                {stat.link ? (
                                    <Link href={stat.link} target="_blank" rel="noopener noreferrer"
                                          className="text-blue-500">
                                        Link
                                    </Link>
                                ) : ''}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="pagination-buttons flex justify-center m-6">
                <Button className="h-7 mx-2"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                >
                    Предыдущая
                </Button>
                <span>Страница {currentPage} из {totalPages}</span>
                <Button className="h-7 mx-2"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                >
                    Следующая
                </Button>
            </div>
            {(user?.role === 'ADMIN' || user?.role === 'USER_EDIT') && (
                <div>
                    <div className="m-4 text-center text-amber-500 text-xl">Создать запись</div>
                    <form onSubmit={handleSubmit} className="mb-6">
                        <div className="flex flex-wrap gap-4">
                            <Select onValueChange={(value) => setFormData({...formData, turnirId: value})}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выберите турнир"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {turnirs.map((turnir) => (
                                        <SelectItem key={turnir.id} value={turnir.id.toString()}>
                                            {turnir.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select onValueChange={(value) => setFormData({...formData, categoryId: value})}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выберите категорию"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select onValueChange={(value) => setFormData({...formData, playerId: value})}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выберите игрока"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {players.map((player) => (
                                        <SelectItem key={player.id} value={player.id.toString()}>
                                            {player.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select onValueChange={(value) => setFormData({...formData, color: value})}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выберите цвет"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(ColorPlayer).map((color) => (
                                        <SelectItem key={color} value={color}>
                                            {ColorPlayer[color as keyof typeof ColorPlayer]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select onValueChange={(value) => setFormData({...formData, city: value})}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выберите город"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(cityTranslations).map((city) => (
                                        <SelectItem key={city} value={city}>
                                            {cityTranslations[city as keyof typeof cityTranslations]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                name="gold"
                                value={formData.gold}
                                onChange={handleInputChange}
                                placeholder="Gold"
                            />
                            <Input
                                type="text"
                                name="security"
                                value={formData.security}
                                onChange={handleInputChange}
                                placeholder="Security"
                            />
                            Win
                            <Input
                                type="radio"
                                name="win"
                                checked={formData.win === true}
                                onChange={() => setFormData({...formData, win: true})}
                            />
                            Lose
                            <Input
                                type="radio"
                                name="win"
                                checked={formData.win === false}
                                onChange={() => setFormData({...formData, win: false})}
                            />
                            <Input
                                type="text"
                                name="link"
                                value={formData.link}
                                onChange={handleInputChange}
                                placeholder="Link"
                            />
                            <Button type="submit" className="h-7" disabled={!isFormValid}>
                                Сохранить
                            </Button>
                            <Button className="h-7" onClick={handleCalculateStatistics} disabled={isPending}>
                                {isPending ? 'Обновление...' : 'Обновить статистику'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}