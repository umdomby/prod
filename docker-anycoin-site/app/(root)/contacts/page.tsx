"use server";
import { Container } from '@/components/container';
import React, { Suspense } from "react";
import Loading from "@/app/(root)/loading";
import {CONTACTS} from "@/components/CONTACTS";

export default async function ContactsPage() {


    return (
        <Container className="w-[100%]">
            <Suspense fallback={<Loading />}>
                <CONTACTS/>
            </Suspense>
        </Container>
    );
}
