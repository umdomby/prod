"use client";
import {
    Table,
    TableBody,
    TableCell, TableHead, TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import React, { useState } from "react";
import COOP from "@/components/COOP";
import {Button} from "@/components/ui";

export const CONTACTS = () => {
    const [notification, setNotification] = useState<string | null>(null);

    const copyToClipboard = (text: string, name: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setNotification(`Скопировано: ${name}`);
            setTimeout(() => {
                setNotification(null);
            }, 3000);
        }, (err) => {
            console.error("Ошибка копирования: ", err);
        });
    };

    return (
        <div>
            {notification && (
                <div className="fixed top-4 right-4 bg-green-500 text-white p-3 rounded shadow-lg">
                    {notification}
                </div>
            )}
            <div className="text-2xl text-center text-slate-500 my-10"><strong>Heroes3.site</strong></div>
            <COOP/>

            <div className="my-10 mx-3">
                <div className="rounded-lg shadow-md">
                    <h1 className="text-2xl text-center font-bold text-blue-600 mb-4">О проекте heroes3.site:</h1>
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Биржа ставок на 2, 3 и 4 игроков</h2>
                    <p className="text-lg mb-4">
                        Наша платформа позволяет пользователям делать ставки на исходы игр с гибкими настройками
                        коэффициентов. Это делает процесс ставок более интересным и динамичным.
                    </p>
                    <h2 className="text-xl font-semibold text-green-600 mb-2">Уникальные турниры</h2>
                    <p className="text-lg mb-4">
                        Мы разработали новый формат турниров, где на карте соревнуются 4 игрока. Это делает игру более
                        быстрой и захватывающей, привлекая внимание как игроков, так и зрителей.
                    </p>
                    <h2 className="text-xl font-semibold text-purple-600 mb-2">Внутренняя валюта и P2P торговля</h2>
                    <p className="text-lg mb-4">
                        Система $ points позволяет пользователям обмениваться баллами и участвовать в экономике
                        платформы. Это создает дополнительные стимулы для активного участия.
                    </p>
                    <h2 className="text-xl font-semibold text-orange-600 mb-2">Статистика и аналитика</h2>
                    <p className="text-lg mb-4">
                        Мы предоставляем детальную статистику ставок и турниров, что помогает пользователям принимать
                        обоснованные решения и улучшать свои результаты.
                    </p>

                    <h1 className="text-2xl text-center font-bold text-blue-600 mb-4">Уникальная система ставок и гибкие
                        настройки коэффициентов на heroes3.site</h1>
                    <p className="text-lg mb-4">
                        На нашей платформе heroes3.site мы внедрили инновационную систему ставок, которая позволяет
                        пользователям участвовать в биржевой торговле с гибкими настройками коэффициентов. Эта система
                        обеспечивает справедливое распределение выигрышей и стимулирует активное участие пользователей.
                    </p>
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Как это работает:</h2>
                    <ul className="list-disc list-inside mb-4">
                        <li><strong>Гибкие коэффициенты:</strong> Мы используем динамическую систему корректировки
                            коэффициентов, которая учитывает распределение ставок между игроками. Если на одного из
                            игроков поставлено больше, чем на других, его коэффициент автоматически уменьшается. Это
                            делает ставку на него менее выгодной и помогает сбалансировать распределение ставок.
                        </li>
                        <li><strong>Внутренний фонд:</strong> Внутренний фонд используется для обеспечения справедливого
                            распределения выигрышей. Он позволяет компенсировать разницу в ставках и поддерживать баланс
                            на платформе. С помощью понижения коэффициента для лидирующих ставок, фонд поддерживается в
                            постоянной величине, что обеспечивает стабильность и надежность системы.
                        </li>
                    </ul>
                    <h2 className="text-xl font-semibold text-green-600 mb-2">Пример распределения ставок:</h2>
                    <ul className="list-disc list-inside mb-4">
                        <li>Игрок 1 ставит 100 единиц с коэффициентом 2.</li>
                        <li>Игрок 2 ставит 10 единиц с коэффициентом 2.</li>
                        <li>Если выигрывает Игрок 1, из внутреннего фонда берется недостающая сумма в 90 единиц для
                            покрытия выигрыша.
                        </li>
                        <li>Если выигрывает Игрок 2, фонд пополняется на 90 единиц.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-purple-600 mb-2">Преимущества для партнеров:</h2>
                    <ul className="list-disc list-inside mb-4">
                        <li><strong>Прозрачность и справедливость:</strong> Наша система обеспечивает прозрачное и
                            справедливое распределение выигрышей, что повышает доверие пользователей к платформе.
                        </li>
                        <li><strong>Увеличение вовлеченности:</strong> Гибкие коэффициенты и возможность влиять на
                            исходы ставок стимулируют пользователей активно участвовать в процессе.
                        </li>
                        <li><strong>Инновационный подход:</strong> Мы предлагаем уникальные решения, которые выделяют
                            нашу платформу на фоне конкурентов и привлекают внимание как игроков, так и партнеров.
                        </li>
                    </ul>

                    <h1 className="text-2xl text-center font-bold text-blue-600 mb-4">Возможности сотрудничества:</h1>
                    <p className="text-lg mb-4">
                        Мы ищем партнеров для организации турниров с призовым фондом и привлечения новых пользователей к
                        ресурсу heroes3.site.
                    </p>
                    <ul className="list-disc list-inside mb-4">
                        <li><strong>Реклама и продвижение:</strong> Мы готовы предложить рекламные возможности на нашей
                            платформе, что поможет вам привлечь новую аудиторию.
                        </li>
                        <li><strong>Возможные доли в проекте:</strong> Мы открыты для обсуждения различных форм
                            сотрудничества, включая возможное участие в проекте.
                        </li>
                    </ul>
                    <p className="text-lg mb-4">
                        Мы уверены, что наше сотрудничество будет взаимовыгодным и поможет привлечь внимание к вашему
                        бренду в сообществе Heroes 3 HoTA.
                    </p>
                    <p className="text-lg mb-4">
                        Если у вас есть вопросы или вы хотите обсудить возможности сотрудничества, пожалуйста, свяжитесь
                        с нами <a href="https://t.me/navatar85"
                                  className="text-blue-800 underline">https://t.me/navatar85</a>
                    </p>
                    <p className="text-lg text-amber-600">
                        <strong>С уважением, Сергей Heroes3.site</strong>
                    </p>
                </div>
            </div>
            <div className="flex justify-center my-4" >
            <Button className="gap-2 h-10 p-2 flex-1 text-center">
                <Link target="_blank" href="/profile">Регистрация</Link>
            </Button>
            </div>

            <Table className="my-10">
                <TableBody className="space-y-3">
                    <TableRow className="border-b border-gray-200">
                        <TableCell className="text-center overflow-hidden whitespace-nowrap w-[25%]">
                            <div className="text-green-500 text-xl">Telegram Group</div>
                        </TableCell>
                        <TableCell className="text-center overflow-hidden whitespace-nowrap w-[25%]">
                            <Link href="https://t.me/heroes3_site/1" target="_blank"
                                  className="text-blue-500 hover:text-green-300 font-bold text-xl">
                                https://t.me/heroes3_site
                            </Link>
                        </TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-200">
                        <TableCell className="text-center overflow-hidden whitespace-nowrap w-[25%]">
                            <div className="text-green-500 text-xl">Telegram Username</div>
                        </TableCell>
                        <TableCell className="text-center overflow-hidden whitespace-nowrap w-[25%]">
                            <Link className="text-blue-500 hover:text-green-300 font-bold text-xl"
                                  href={'https://t.me/navatar85'} target="_blank">@navatar85</Link>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            {/*<div className="text-center my-3"><h1>Поддержать проект</h1></div>*/}
            {/*<Table style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>*/}
            {/*    <TableHeader>*/}
            {/*        <TableRow style={{ backgroundColor: '#1f2937' }}>*/}
            {/*            <TableHead className="w-[20%]" style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Name</TableHead>*/}
            {/*            <TableHead className="w-[10%]" style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Copy</TableHead>*/}
            {/*            <TableHead className="w-[50%] text-left" style={{ color: '#fff', fontWeight: 'bold' }}>Description</TableHead>*/}
            {/*            <TableHead className="w-[20%] text-left" style={{ color: '#fff', fontWeight: 'bold' }}></TableHead>*/}
            {/*        </TableRow>*/}
            {/*    </TableHeader>*/}
            {/*    <TableBody className="space-y-3">*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>USTD</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('0x51470b98c8737f14958231cb27491b28c5702c13', 'USTD')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                0x51470b98c8737f14958231cb27491b28c5702c13*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>BSC (BEP20)</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>BTC</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('19hCv645WrUthCNUWb4ncBdHVu6iLhZVow', 'BTC')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                19hCv645WrUthCNUWb4ncBdHVu6iLhZVow*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>BTC</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>Webmoney</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('Z302613587731', 'Webmoney')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                Z302613587731*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>Z</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>Webmoney</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('E296211930999', 'Webmoney')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                E296211930999*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>E</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>Webmoney</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('X041916442920', 'Webmoney')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                X041916442920*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>X</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>Технобанк</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('4704693052762369', 'Технобанк')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                4704693052762369*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>10/27 VISA</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>Технобанк</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('ЕРИП  (№ Договора - GRN29573) Платежи - Банковские, финансовые услуги - Банки, НКФО – Технобанк – Пополнение карты - (№ Договора - GRN29573) IBAN BY95TECN3014000000GRN0029573', 'Технобанк')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                ЕРИП  (№ Договора - GRN29573) Платежи - Банковские, финансовые услуги - Банки, НКФО – Технобанк – Пополнение карты - (№ Договора - GRN29573)*/}
            {/*                IBAN BY95TECN3014000000GRN0029573*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>ЕРИП </TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>Альфа-Банк</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('5208130010810772', 'Альфа-Банк')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                5208130010810772*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>02/29 MasterCard</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>Альфа-Банк</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('375333814578', 'Альфа-Банк')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                375333814578*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>По номеру телефона</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>Альфа-Банк</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('Платежи - Банковские, финансовые услуги - Банки, НКФО – Альфа-Банк – Пополнение счета - № Телефона - 375333814578', 'Альфа-Банк')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                Платежи - Банковские, финансовые услуги - Банки, НКФО – Альфа-Банк – Пополнение счета - № Телефона - 375333814578*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>ЕРИП</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>Альфа-Банк</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('BY17ALFA3014309V9P0050270000', 'Альфа-Банк')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                BY17ALFA3014309V9P0050270000*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>IBAN</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>MTB</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('5351041664841598', 'MTB')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                5351041664841598*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>04/27 MasterCard</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>MTB</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № Договора - 33623213', 'MTB')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № Договора - 33623213*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>ЕРИП</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>Беларусбанк</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('9112380168621532', 'Беларусбанк')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                9112380168621532*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>02/29 MIR</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>Банк Дабрабыт</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('9112397016744373', 'Банк Дабрабыт')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                9112397016744373*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>02/29</TableCell>*/}
            {/*        </TableRow>*/}
            {/*        <TableRow className="border-b border-gray-200">*/}
            {/*            <TableCell className="w-[20%]" style={{ textAlign: 'center', fontWeight: 'bold', color: '#f64343', fontSize: '1.1rem' }}>Банк Дабрабыт</TableCell>*/}
            {/*            <TableCell className="w-[10%] text-center">*/}
            {/*                <button*/}
            {/*                    className="bg-blue-500 text-white h-6 px-2 rounded"*/}
            {/*                    onClick={() => copyToClipboard('Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № IBAN - BY29MMBN30140116007150001246', 'Банк Дабрабыт')}*/}
            {/*                >*/}
            {/*                    Скопировать*/}
            {/*                </button>*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[50%] text-left" style={{ color: '#1db812' }}>*/}
            {/*                Платежи - Банковские, финансовые услуги - Банки, НКФО – MTБанк – Пополнение дебетовой карты - № IBAN - BY29MMBN30140116007150001246*/}
            {/*            </TableCell>*/}
            {/*            <TableCell className="w-[20%] text-left" style={{ fontWeight: 'bold', color: '#b89112' }}>ЕРИП</TableCell>*/}
            {/*        </TableRow>*/}
            {/*    </TableBody>*/}
            {/*</Table>*/}
        </div>
    );
};
