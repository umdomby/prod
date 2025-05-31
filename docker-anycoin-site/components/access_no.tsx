import React from 'react';
import Link from 'next/link';
import {ModeToggle} from "@/components/buttonTheme";
import {Button} from "@/components/ui";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface Props {
    className?: string;
}

export const Access_no: React.FC<Props> = ({className}) => {

        return (

                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="width-[20%]">
                            <Button variant="outline" className="h-7">SYSTEM</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-45">
                            <DropdownMenuRadioGroup>
                                <Link href="/">
                                    <DropdownMenuRadioItem value="home" className="cursor-pointer">
                                        HOME
                                    </DropdownMenuRadioItem>
                                </Link>
                                <Link href="/contacts">
                                    <DropdownMenuRadioItem value="bet-closed" className="cursor-pointer">
                                        CONTACTS
                                    </DropdownMenuRadioItem>
                                </Link>
                                <Link href="/bet-winn-lose-closed-2">
                                    <DropdownMenuRadioItem value="bet-winn-lose-closed-2" className="cursor-pointer">
                                        WINN/LOSE PLAYERS 2
                                    </DropdownMenuRadioItem>
                                </Link>
                                <Link href="/bet-winn-lose-closed-3">
                                    <DropdownMenuRadioItem value="bet-winn-lose-closed-3" className="cursor-pointer">
                                        WINN/LOSE PLAYERS 3
                                    </DropdownMenuRadioItem>
                                </Link>
                                <Link href="/bet-winn-lose-closed-4">
                                    <DropdownMenuRadioItem value="bet-winn-lose-closed-4" className="cursor-pointer">
                                        WINN/LOSE PLAYERS 4
                                    </DropdownMenuRadioItem>
                                </Link>
                                <Link href="/player">
                                    <DropdownMenuRadioItem value="player" className="cursor-pointer">
                                        PLAYER
                                    </DropdownMenuRadioItem>
                                </Link>
                                <Link href="/tournament">
                                    <DropdownMenuRadioItem value="tournament" className="cursor-pointer">
                                        TOURNAMENT
                                    </DropdownMenuRadioItem>
                                </Link>
                                <Link href="/rating">
                                    <DropdownMenuRadioItem value="rating" className="cursor-pointer">
                                        RATING
                                    </DropdownMenuRadioItem>
                                </Link>
                                {/*<Link href="/manual">*/}
                                {/*    <DropdownMenuRadioItem value="manual" className="cursor-pointer">*/}
                                {/*        MANUAL*/}
                                {/*    </DropdownMenuRadioItem>*/}
                                {/*</Link>*/}
                                {/*<Link href="/turnir">*/}
                                {/*    <DropdownMenuRadioItem value="tur" className="cursor-pointer">*/}
                                {/*        ТУРНИРЫ*/}
                                {/*    </DropdownMenuRadioItem>*/}
                                {/*</Link>*/}
                                <Link href="/hall-of-fame">
                                    <DropdownMenuRadioItem value="hall-of-fame" className="cursor-pointer">
                                        HALL-OF-FAME
                                    </DropdownMenuRadioItem>
                                </Link>
                                <DropdownMenuRadioItem value="create-bet"><ModeToggle/></DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
            </div>
        );
};
