"use server";
import { prisma } from '@/prisma/prisma-client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";


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

async function fetchGlobalData(): Promise<GlobalData | null> {
    try {
        const data = await prisma.globalData.findUnique({
            where: { id: 1 },
        });
        return data;
    } catch (error) {
        console.error('Failed to fetch global data:', error);
        return null;
    }
}

export default async function GlobalDataComponent() {

    // Получаем обновленные данные
    const globalData = await fetchGlobalData();

    if (!globalData) {
        return <div>Нет доступных данных</div>;
    }

    const totalSumUsers =
        (globalData.openBetsPoints ?? 0) +
        (globalData.usersPoints ?? 0) +
        (globalData.gameUserBetOpen ?? 0)+
        (globalData.p2pPoints ?? 0);

    const totalSum = totalSumUsers +
        (globalData.betFund ?? 0) +
        (globalData.margin ?? 0);


    return (
        <Table style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <TableHeader>
                <TableRow style={{ backgroundColor: '#1f2937' }}>
                    <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Start</TableHead>
                    <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>User</TableHead>
                    <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Fund</TableHead>
                    <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Margin</TableHead>
                    <TableHead style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Sum</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow  style={{ transition: 'background-color 0.3s', cursor: 'pointer' }}>
                    <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#db2777', textDecoration: 'none' }}>11M</TableCell>
                    <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#cdca59', textDecoration: 'none' }}>{totalSumUsers ?? 'N/A'}</TableCell>
                    <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#b541d3', textDecoration: 'none' }}>
                        {globalData.betFund !== null && globalData.betFund !== undefined
                            ? Math.floor(globalData.betFund * 100) / 100
                            : 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#2563eb', textDecoration: 'none' }}>{globalData.margin ?? 'N/A'}</TableCell>
                    <TableCell className="text-xs" style={{ textAlign: 'center', fontWeight: 'bold', color: '#1db812', textDecoration: 'none' }}>{Math.floor(totalSum * 100) / 100}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}
