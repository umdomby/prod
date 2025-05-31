"use server";

import {Container} from "@/components/container";
import PlayerC from "@/components/PlayerC";
import SocketClient from "@/components/SocketClient";

export default async function Home() {


    return (
        <Container className="w-[100%] relative">
            <SocketClient/>
            {/*<PlayerC/>*/}
        </Container>
    );
}
