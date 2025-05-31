import { prisma } from '@/prisma/prisma-client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import { Button } from "@/components/ui";
import React from "react";
import { globalDataPoints } from "@/app/actions";

// Интерфейс для описания структуры данных GlobalData
interface GlobalData {
    id: number;
    margin: number | null;
    createdAt: Date;
    updatedAt: Date;
    ref: number | null;
    users: number;
    reg: number | null;
    usersPoints: number | null;
    openBetsPoints: number | null;
    betFund: number | null;
    gameUserBetOpen: number | null;
    p2pPoints: number | null;
}

// Функция для получения данных с пагинацией
const fetchGlobalData = async (page: number): Promise<GlobalData[]> => {
    const take = 27; // Количество записей на странице
    const skip = (page - 1) * take; // Пропустить записи для предыдущих страниц

    return await prisma.globalData.findMany({
        orderBy: { id: 'desc' }, // Сортировка по убыванию ID
        take,
        skip,
    });
};

// Функция для получения первой записи
const fetchGlobalFirst = async (): Promise<GlobalData | null> => {
    return await prisma.globalData.findFirst({ where: { id: 1 } });
};

// Функция для получения общего количества записей
const fetchTotalCount = async (): Promise<number> => {
    return await prisma.globalData.count();
};

// Основной компонент страницы статистики
export default async function StatisticsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    await globalDataPoints(); // Выполнение глобальных действий

    const { page = '1' } = await searchParams; // Получение параметра страницы из URL
    const currentPage = parseInt(page, 10); // Преобразование параметра страницы в число
    const [globalDataList, totalCount, globalDataFirst] = await Promise.all([
        fetchGlobalData(currentPage), // Получение данных для текущей страницы
        fetchTotalCount(), // Получение общего количества записей
        fetchGlobalFirst(), // Получение первой записи
    ]);

    // Проверка на наличие данных
    if (!globalDataFirst || globalDataList.length === 0) {
        return <div>Нет доступных данных</div>;
    }

    const totalPages = Math.ceil(totalCount / 27); // Вычисление общего количества страниц

    // Функция для вычисления общей суммы
    const calculateTotalSum = (data: GlobalData, includeInitialFund: boolean = true) => {
        const initialFund = includeInitialFund ? 1000000 : 0; // Начальный фонд
        const adjustedFund = initialFund + (data.betFund ?? 0); // Корректировка фонда

        return (
            (data.openBetsPoints ?? 0) +
            (data.usersPoints ?? 0) +
            adjustedFund +
            (data.margin ?? 0) +
            (data.gameUserBetOpen ?? 0) +
            (data.p2pPoints ?? 0)
        );
    };

    // Функция для рендеринга строки таблицы
    const renderTableRow = (data: GlobalData, includeInitialFund: boolean = true) => (
        <TableRow key={data.id} style={{ transition: 'background-color 0.3s', cursor: 'pointer' }}>
            <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343' }}>
                {new Date(data.updatedAt).toLocaleString('en-US', { hour12: false })}
            </TableCell>
            <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#1db812' }}>11M</TableCell>
            <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f1b11e' }}>{data.reg ?? 'N/A'}</TableCell>
            <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#a5e24a' }}>{data.ref ?? 'N/A'}</TableCell>
            <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#718dff' }}>{data.openBetsPoints ?? 'N/A'}</TableCell>
            <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#d11acb' }}>{data.p2pPoints ?? 'N/A'}</TableCell>
            <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#cdca59' }}>{data.gameUserBetOpen ?? 'N/A'}</TableCell>
            <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#cdca59' }}>{data.usersPoints ?? 'N/A'}</TableCell>
            <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#b541d3' }}>
                {includeInitialFund
                    ? 1000000 + Math.floor((data.betFund ?? 0) * 100) / 100
                    : data.betFund !== null && data.betFund !== undefined
                        ? Math.floor(data.betFund * 100) / 100
                        : 'N/A'}
            </TableCell>
            <TableCell style={{ textAlign: 'center', fontWeight: 'bold', color: '#2563eb' }}>{data.margin ?? 'N/A'}</TableCell>
            <TableCell style={{ textAlign: 'center', fontWeight: 'bold', color: '#30ff00' }}>{Math.floor(calculateTotalSum(data, includeInitialFund) * 100) / 100}</TableCell>
        </TableRow>
    );

    return (
        <div>
            <Table style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <TableHeader>
                    <TableRow style={{ backgroundColor: '#1f2937' }}>
                        <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Date</TableHead>
                        <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Start</TableHead>
                        <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Reg</TableHead>
                        <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Ref</TableHead>
                        <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Bet</TableHead>
                        <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>P2P</TableHead>
                        <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Game</TableHead>
                        <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>User</TableHead>
                        <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Fund</TableHead>
                        <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Margin</TableHead>
                        <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Sum</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {renderTableRow(globalDataFirst, false)}{/* Рендеринг первой записи без начального фонда */}
                    {globalDataList.map(data => renderTableRow(data))}{/* Рендеринг остальных записей */}
                </TableBody>
            </Table>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Link href={`?page=${currentPage - 1}`}>
                    <Button className="btn btn-primary mx-2 w-[100px] h-7" disabled={currentPage === 1}>Previous</Button>
                </Link>
                <span style={{ margin: '0 10px' }}>Page {currentPage}</span>
                {currentPage < totalPages && (
                    <Link href={`?page=${currentPage + 1}`}>
                        <Button className="btn btn-primary mx-2 w-[100px] h-7">Next</Button>
                    </Link>
                )}
            </div>
        </div>
    );
}