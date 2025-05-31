import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Container} from "@/components/container";
import {Player} from "@prisma/client";
import Link from "next/link";
import {Button} from "@/components/ui";

interface Props {
    playerData: Player;
    className?: string;
}

export const Player_Data: React.FC<Props> = ({playerData}) => {
    const tournamentFields = [
        { name: "HeroesCup1deaL", data: playerData.HeroesCup1deaL },
        { name: "HeroesCup", data: playerData.HeroesCup },
        { name: "HeroesCup2", data: playerData.HeroesCup2 },
        { name: "HeroesCup3", data: playerData.HeroesCup3 },
        { name: "HC3PO", data: playerData.HC3PO },
        { name: "HC2PO", data: playerData.HC2PO },
    ];

    return (
        <Container>
            <Link href="/player">
                <Button className="mx-5 h-5">ИГРОКИ</Button>
            </Link>
            <Link href="/tournament">
                <Button className="mx-5 h-5">ТУРНИРЫ HEROES HUB</Button>
            </Link>
            <div className="text-2xl text-center">{playerData.name}</div>
            <div className="text-center text-green-500 font-bold">All Player Details</div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-blue-500" style={{ width: '50%', textAlign: 'center' }}>Attribute</TableHead>
                        <TableHead className="text-blue-500" style={{ width: '50%', textAlign: 'center' }}>Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell style={{ width: '50%', textAlign: 'center' }}>Name</TableCell>
                        <TableCell style={{ width: '50%', textAlign: 'center' }}>{playerData.name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ width: '50%', textAlign: 'center' }}>Games Played</TableCell>
                        <TableCell style={{ width: '50%', textAlign: 'center' }}>{playerData.countGame ?? 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ width: '50%', textAlign: 'center' }}>Wins</TableCell>
                        <TableCell style={{ width: '50%', textAlign: 'center' }}>{playerData.winGame ?? 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ width: '50%', textAlign: 'center' }}>Losses</TableCell>
                        <TableCell style={{ width: '50%', textAlign: 'center' }}>{playerData.lossGame ?? 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ width: '50%', textAlign: 'center' }}>Win Rate (%)</TableCell>
                        <TableCell style={{ width: '50%', textAlign: 'center' }}>{playerData.rateGame !== null && playerData.rateGame !== undefined ? playerData.rateGame.toFixed(2) : 'N/A'}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            {tournamentFields.map((tournament, index) => {
                const data = tournament.data ? JSON.parse(tournament.data as string) : null;
                return (
                    <div key={index}>
                        <div className="text-center mt-5 text-amber-500 font-bold">{tournament.name}</div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-blue-500" style={{ width: '50%', textAlign: 'center' }}>Attribute</TableHead>
                                    <TableHead className="text-blue-500" style={{ width: '50%', textAlign: 'center' }}>Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell style={{ width: '50%', textAlign: 'center' }}>Tournament</TableCell>
                                    <TableCell style={{ width: '50%', textAlign: 'center' }}>{data?.tournament ?? 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ width: '50%', textAlign: 'center' }}>Games Played</TableCell>
                                    <TableCell style={{ width: '50%', textAlign: 'center' }}>{data?.countGame ?? 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ width: '50%', textAlign: 'center' }}>Wins</TableCell>
                                    <TableCell style={{ width: '50%', textAlign: 'center' }}>{data?.winGame ?? 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ width: '50%', textAlign: 'center' }}>Losses</TableCell>
                                    <TableCell style={{ width: '50%', textAlign: 'center' }}>{data?.lossGame ?? 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ width: '50%', textAlign: 'center' }}>Win Rate (%)</TableCell>
                                    <TableCell className="text-red-400" style={{ width: '50%', textAlign: 'center' }}>{data?.rateGame !== null && data?.rateGame !== undefined ? data.rateGame.toFixed(2) : 'N/A'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                );
            })}
        </Container>
    );
};
