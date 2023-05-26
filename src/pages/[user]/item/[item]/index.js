import axios from 'axios';
import React from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Decimal from 'decimal.js';
import jwt from 'jsonwebtoken';
import itemTypesEnumerations from '../../../../enumerations/itemTypes';
import Button from '../../../../components/button';
import dynamic from 'next/dynamic';

const AudioPlayer = dynamic(import('../../../../components/audioPlayer'), { ssr: false });

export default function User({username, item, items, user}) {
    const router = useRouter();

    const formatAmount = (amount) => {
        return Decimal(amount).div(100).toFixed(2);
    }

    const copyLinkToClipboard = (id) => {
        navigator.clipboard.writeText(location.href)
            .then(() => {
                const element = document.getElementById(id);
                element.classList.remove('hidden');
                setTimeout(() => {
                    element.classList.add('hidden');
                }, 1000);
            });
    }

    return (
        <>
            <Head>
                <title>{`${item.name} by ${username} on ${process.env.APP_NAME}`}</title>
                <meta name="description" content={`Explore ${item.name} by ${username} on ${process.env.APP_NAME}. 
                    ${item?.description && item.description ? item.description : ''}. Macropolis is a space for netizens. 
                    Sell, mint, show, share, collaborate and more. Join our community of creators today.`}
                />
                <meta property="og:title" content={`${item.name} by ${username} on ${process.env.APP_NAME}`} />
                <meta property="og:type" content="product" />
                <meta property="og:url" content={`${process.env.DOMAIN_URL}/${username}/item/${item._id}`} />
                <meta property="og:description" content={item?.description && item.description ? item.description : ''} />
                <meta property="og:image" content={`${process.env.IMAGES_URL}/480_${item.image}`} />
                <meta property="product:price:amount" content={formatAmount(item.price)} />
                <meta property="product:price:currency" content="USD" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`${process.env.DOMAIN_URL}/${username}/item/${item._id}`} />
            </Head>
            <div className="w-screen min-h-screen">
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-screen-2xl relative z-20">
                        <div
                            className="w-full h-16 py-4 lg:py-0 px-8 flex flex-row justify-between items-center">
                            <h6 className="font-grotesk text-xl select-none hover:cursor-pointer" onClick={() => router.push(`/${username}`)}>{username}</h6>
                            <div className="h-full flex items-center">
                                {
                                    user && user.username === username &&
                                    <div
                                        className="w-10 h-10 flex justify-center items-center relative hover:cursor-pointer group">
                                        <div
                                            className="w-full h-full absolute flex justify-center items-center z-0 group-hover:rounded-md
                                        group-hover:shadow relative"
                                            onClick={() => router.push('/dashboard')}
                                        >
                                            <img src="/home.svg" className="w-6 h-6"/>
                                        </div>
                                    </div>
                                }
                                <div
                                    className="w-10 h-10 flex justify-center items-center relative hover:cursor-pointer group">
                                    <div className="w-full h-full absolute flex justify-center items-center z-10"
                                         onClick={() => copyLinkToClipboard('copy-link')}
                                    ></div>
                                    <div
                                        className="w-full h-full absolute flex justify-center items-center z-0 group-hover:rounded-md
                                        group-hover:shadow relative"
                                    >
                                        <img src="/link.svg" className="w-6 h-6"/>
                                        <div id="copy-link" className="hidden absolute top-3 -left-3 h-4 w-16 bg-gray-300 flex justify-center items-center
                                            rounded font-grotesk text-sm">
                                            copied
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-8"></div>
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-screen-2xl px-8">
                        <div className="w-full flex flex-col lg:flex-row">
                            <div className="w-full lg:w-2/5">
                                <div className="w-full m-0 lg:mr-8 rounded-lg relative">
                                    {
                                        item.type === itemTypesEnumerations.AUDIO && item?.audio_preview &&
                                        <>
                                            <img className="w-full rounded-lg z-0"
                                                 src={`${process.env.IMAGES_URL}/480_${item.image}`} alt={item.name}
                                            />
                                            <AudioPlayer
                                                audioSrc={`${process.env.AUDIO_PREVIEWS_URL}/${item.audio_preview}`}
                                                imageSrc={`${process.env.IMAGES_URL}/480_${item.image}`}
                                                title={item.name}
                                                artist={username}
                                            />
                                        </>
                                    }
                                    {
                                        item.type === itemTypesEnumerations.ARCHIVE &&
                                        <>
                                            <img className="w-full rounded-lg z-0"
                                                 src={`${process.env.IMAGES_URL}/480_${item.image}`} alt={item.name}/>
                                        </>
                                    }
                                </div>
                            </div>
                            <div className="w-full lg:w-3/5 mt-8 lg:mt-0">
                                <div className="w-full p-0 lg:pl-8">
                                    <div className="flex">
                                        <p className="font-grotesk text-sm py-1 px-2 bg-green-300 rounded-md select-none">{item.type}</p>
                                    </div>
                                    <h1 className="font-grotesk text-3xl mt-8">{item.name}</h1>
                                    {
                                        item?.description && item.description &&
                                        <h6 className="font-grotesk text-base mt-4 max-w-xl">{item.description}</h6>
                                    }
                                    <div className="w-64 mt-16">
                                        <Button
                                            disabled={false}
                                            submit={() => router.push(`/checkout/item?id=${item._id}&username=${username}`)}
                                            text={`Buy for $${formatAmount(item.price)}`}
                                            color="blue"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    items.length > 0 &&
                    <div className="w-full flex justify-center mt-24">
                        <div className="w-full max-w-screen-2xl px-8">
                            <h4 className="font-grotesk text-4xl">More from me</h4>
                            <div className="w-full mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                                {
                                    items.map((item, index) => {
                                        return (
                                            <div key={`item-${item._id}`}
                                                 className="relative flex flex-col rounded-md shadow hover:shadow-lg cursor-pointer group overflow-hidden"
                                                 onClick={() => router.push(`/${username}/item/${item._id}`)}
                                            >
                                                <div className="w-full h-64 relative overflow-hidden">
                                                    <img className="w-full h-full absolute top-0 object-cover object-center rounded-t-md group-hover:scale-105 duration-300" src={`${process.env.IMAGES_URL}/480_${item.image}`} />
                                                </div>
                                                <div className="w-full p-4">
                                                    <p className="font-grotesk truncate">{item.name}</p>
                                                </div>
                                                <div className="w-full h-12 bg-blue-300 rounded-b flex items-center justify-center text-white hover:bg-blue-400"
                                                     onClick={(event) => {
                                                         event.stopPropagation();
                                                         router.push(`/checkout/item?id=${item._id}&username=${username}`);
                                                     }}
                                                >
                                                    {`Buy for $${formatAmount(item.price)}`}
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                }
                <div className="w-full h-24 pb-2 flex justify-center items-end">
                    <h6 className="font-grotesk text-base text-black">by <span
                        className="font-bold hover:cursor-pointer"
                        onClick={() => router.push('/')}>{process.env.APP_NAME}</span></h6>
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(context) {
    const props = {};
    const username = context.params.user;
    const itemId = context.params.item;
    props.username = username;

    if (context.req.cookies?.token) {
        props.user = jwt.decode(context.req.cookies.token);
    }

    try {
        const profileResponse = await axios.get(`${process.env.BACKEND_URL}/profiles/get?username=${username}`, {withCredentials: true});
        props.profile = profileResponse.data.data.profile;

        const itemResponse = await axios.get(`${process.env.BACKEND_URL}/items/get?id=${itemId}`, {withCredentials: true});
        props.item = itemResponse.data.data.item;

        const itemsResponse = await axios.get(`${process.env.BACKEND_URL}/items/get-many?username=${username}&limit=5`, {withCredentials: true});
        props.items = itemsResponse.data.data.items;

        if (!props.item) {
            return {redirect: {destination: '/404', permanent: false}};
        }
    } catch (error) {
        console.log('Failed to fetch: ', error);
        return {redirect: {destination: '/500', permanent: false}};
    }

    return {props};
}
