"use server";

import {Container} from "@/components/container";


export default async function HallofFame() {


    return (
        <Container className="flex flex-col my-10">
            <div className="text-center text-amber-500">the hall of fame is empty for now</div>
        </Container>
    )
}