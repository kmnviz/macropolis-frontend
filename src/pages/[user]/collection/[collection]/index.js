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

export default function User({username, collection, items, user}) {
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
                <title>{`${collection.name} by ${username} on ${process.env.APP_NAME}`}</title>
                <meta name="description" content={`Explore ${collection.name} by ${username} on ${process.env.APP_NAME}. 
                    ${collection?.description && collection.description ? collection.description : ''}. Macropolis is a space for netizens. 
                    Sell, mint, show, share, collaborate and more. Join our community of creators today.`}
                />
                <meta property="og:title" content={`${collection.name} by ${username} on ${process.env.APP_NAME}`} />
                <meta property="og:type" content="product" />
                <meta property="og:url" content={`${process.env.DOMAIN_URL}/${username}/collection/${collection._id}`} />
                <meta property="og:description" content={collection?.description && collection.description ? collection.description : ''} />
                <meta property="og:image" content={`${process.env.IMAGES_URL}/480_${collection.image}`} />
                <meta property="product:price:amount" content={formatAmount(collection.price)} />
                <meta property="product:price:currency" content="USD" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`${process.env.DOMAIN_URL}/${username}/collection/${collection._id}`} />
            </Head>
            <div className="w-screen min-h-screen relative">
                <div id="background-full" className="w-full h-full fixed top-0 left-0 z-0"
                     style={{
                         background: `linear-gradient(216.82deg, rgba(31, 33, 46, 0) 17.63%, rgba(31, 33, 46, 0.10) 48.3%, rgba(31, 33, 46, 0.20) 60.15%, #1F212E 71.81%, #1F212E 84.02%), url(${process.env.IMAGES_URL}/1920_${collection.image})`,
                         filter: 'blur(50px)',
                         opacity: '0.75'
                    }}
                ></div>
                <div className="w-full flex justify-center relative bg-white shadow-md">
                    <div className="w-full max-w-screen-2xl relative">
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
                    <div className="w-full max-w-screen-2xl px-8 z-10">
                        <div className="w-full flex flex-col lg:flex-row">
                            <div className="w-full lg:w-2/5">
                                <div className="w-full m-0 lg:mr-8 rounded-lg relative">
                                    <img className="w-full rounded-lg z-0"
                                         src={`${process.env.IMAGES_URL}/480_${collection.image}`} alt={collection.name}/>
                                </div>
                            </div>
                            <div className="w-full lg:w-3/5 mt-8 lg:mt-0">
                                <div className="w-full p-0 lg:pl-8">
                                    <div className="flex">
                                        <p className="font-grotesk text-sm py-1 px-2 bg-green-300 rounded-md select-none">{collection.type}</p>
                                    </div>
                                    <div className="rounded-md mt-8">
                                        <h1 className="font-grotesk text-3xl text-white">{collection.name}</h1>
                                        {
                                            collection?.description && collection.description &&
                                            <h6 className="font-grotesk text-base mt-4 max-w-xl text-white">{collection.description}</h6>
                                        }
                                    </div>
                                    <div className="w-64 mt-8 shadow-md rounded-lg border-white border-2">
                                        <Button
                                            disabled={false}
                                            submit={() => router.push(`/checkout/collection?id=${collection._id}&username=${username}`)}
                                            text={`Buy $${formatAmount(collection.price)}`}
                                            color="blue"
                                            textColor="text-white"
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
                        <div className="w-full max-w-screen-2xl px-8 z-10">
                            <h4 className="font-grotesk text-4xl text-white">Collection items</h4>
                            <div className="w-full mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                                {
                                    items.map((item, index) => {
                                        return (
                                            <div key={`item-${item._id}`}
                                                 className="relative flex flex-col rounded-md shadow hover:shadow-lg cursor-pointer group overflow-hidden bg-white"
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
                                                    {`Buy $${formatAmount(item.price)}`}
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
    const collectionId = context.params.collection;
    props.username = username;

    if (context.req.cookies?.token) {
        props.user = jwt.decode(context.req.cookies.token);
    }

    try {
        const profileResponse = await axios.get(`${process.env.BACKEND_URL}/profiles/get?username=${username}`, {withCredentials: true});
        props.profile = profileResponse.data.data.profile;

        const collectionResponse = await axios.get(`${process.env.BACKEND_URL}/collections/get?id=${collectionId}`, {withCredentials: true});
        props.collection = collectionResponse.data.data.collection;

        const itemsResponse = await axios.get(`${process.env.BACKEND_URL}/items/get-many?username=${username}&collectionId=${collectionId}`, {withCredentials: true});
        props.items = itemsResponse.data.data.items;

        if (!props.collection) {
            return {redirect: {destination: '/404', permanent: false}};
        }
    } catch (error) {
        console.log('Failed to fetch: ', error);
        return {redirect: {destination: '/500', permanent: false}};
    }

    return {props};
}
