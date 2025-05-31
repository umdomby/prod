"use server";

import {Container} from "@/components/container";
import PlayerC from "@/components/PlayerC";

export default async function Home() {


    return (
        <Container className="w-[100%] relative">
            <PlayerC/>
        </Container>
    );
}
