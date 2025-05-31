"use client";
import React, { useState } from 'react';
import { Input, Button } from '@/components/ui';
import { updateUserInfoTelegram } from '@/app/actions';
import toast from 'react-hot-toast';
import Link from "next/link";



const BanedNotification = () => {

    return (
        <div className="fixed bottom-4 right-4 p-4 shadow-lg rounded-lg z-50">
            <p className="text-md text-red-500 font-bold">
                Ваш аккаунт был заблокирован. Пожалуйста, свяжитесь с администратором для получения дополнительной
                информации: <Link className="text-blue-500 hover:text-green-300 font-bold text-xl"
                                  href={'https://t.me/navatar85'} target="_blank">@navatar85</Link>
            </p>
        </div>
    );
};

export default BanedNotification;
