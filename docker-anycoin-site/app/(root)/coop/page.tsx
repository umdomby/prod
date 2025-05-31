"use server"

import {Container} from "@/components/container";
import Loading from "@/app/(root)/loading";
import React, {Suspense} from "react";
import COOP from "@/components/COOP";

export default async function CoopPage() {

    return (
        <Container >
            <Suspense fallback={<Loading />}>
                <COOP/>
            </Suspense>
        </Container>
    );
}