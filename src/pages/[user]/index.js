import axios from 'axios';
import React, {useState} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Decimal from 'decimal.js';
import jwt from 'jsonwebtoken';

export default function User({username, profile, items, user, collections}) {
    const router = useRouter();

    const [avatarImage] = useState(profile && profile?.avatar ? `${process.env.IMAGES_URL}/1920_${profile.avatar}` : '');
    const [backgroundImage] = useState(profile && profile?.background ? `${process.env.IMAGES_URL}/1920_${profile.background}` : '');
    const [selectedGroup, setSelectedGroup] = useState('items');

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
                <title>{`${username}'s profile on ${process.env.APP_NAME}`}</title>
                <meta name="description" content={`${process.env.APP_NAME}, a space where you can create your own space
                    and take control of your digital items. Sell, mint, show, share, collaborate and more. Join our community of creators today.`}
                />
                <meta property="og:title" content={`${username}'s space in ${process.env.APP_NAME}`}/>
                <meta property="og:type" content="profile"/>
                <meta property="og:url" content={`${process.env.DOMAIN_URL}/${username}`}/>
                <meta property="og:description" content={`${process.env.APP_NAME}, a space where you can create your own space
                    and take control of your digital items. Sell, mint, show, share, collaborate. Join our community of creators today.`}/>
                <meta property="og:image" content={avatarImage}/>
                <meta name="robots" content="index, follow"/>
                <link rel="canonical" href={`${process.env.DOMAIN_URL}/${username}`}/>
            </Head>
            <div className="w-screen min-h-screen">
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-screen-2xl relative z-20">
                        <div
                            className="w-full h-16 py-4 lg:py-0 px-8 flex flex-row justify-between items-center">
                            <h6 className="font-grotesk text-xl select-none">{username}</h6>
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
                <div className="w-full h-64 md:h-80 relative">
                    <div className="w-full h-56 md:h-72 absolute top-0 left-0 z-10 bg-cover bg-center"
                         style={{backgroundImage: `url(${backgroundImage})`}}></div>
                    <div className="w-full h-40 absolute bottom-0 left-0 z-20 flex justify-center">
                        <div className="w-full max-w-screen-2xl">
                            <div className="w-full px-8">
                                <div className="w-40 h-40 rounded-full border-white border-4 shadow bg-cover bg-center"
                                     style={{backgroundImage: `url(${avatarImage})`}}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex justify-center mt-4">
                    <div className="w-full max-w-screen-2xl px-8">
                        <h2 className="font-grotesk text-3xl">{profile?.name ? profile.name : ''}</h2>
                        <div className="mt-8 flex overflow-scroll">
                            <p className={`font-grotesk text-md mr-4 select-none hover:cursor-pointer 
                                ${selectedGroup === 'items' ? 'text-blue-400 font-bold' : ''}`}
                               onClick={() => setSelectedGroup('items')}
                            >
                                Items
                            </p>
                            {
                                collections.length &&
                                <p className={`font-grotesk text-md select-none hover:cursor-pointer 
                                    ${selectedGroup === 'collections' ? 'text-blue-400 font-bold' : ''}`}
                                   onClick={() => setSelectedGroup('collections')}
                                >
                                    Collections
                                </p>
                            }
                        </div>
                        <div className="w-full h-px mt-1 bg-gray-300"></div>
                        <div
                            className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
                        >
                            {
                                selectedGroup === 'items' &&
                                items.map((item, index) => {
                                    return (
                                        <div key={`item-${item._id}`}
                                             className="relative flex flex-col rounded-md shadow hover:shadow-lg cursor-pointer group overflow-hidden"
                                             onClick={() => router.push(`/${username}/item/${item._id}`)}
                                        >
                                            <div className="w-full h-64 relative overflow-hidden">
                                                <img
                                                    className="w-full h-full absolute top-0 object-cover object-center rounded-t-md group-hover:scale-105 duration-300"
                                                    src={`${process.env.IMAGES_URL}/480_${item.image}`}/>
                                            </div>
                                            <div className="w-full p-4">
                                                <p className="font-grotesk truncate">{item.name}</p>
                                            </div>
                                            <div
                                                className="w-full h-12 bg-blue-300 rounded-b flex items-center justify-center text-white hover:bg-blue-400"
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
                            {
                                selectedGroup === 'collections' &&
                                collections.map((collection, index) => {
                                    return (
                                        <div key={`collection-${collection._id}`}
                                             className="relative flex flex-col rounded-md shadow hover:shadow-lg cursor-pointer group overflow-hidden"
                                             onClick={() => router.push(`/${username}/collection/${collection._id}`)}
                                        >
                                            <div className="w-full h-64 relative overflow-hidden">
                                                <img
                                                    className="w-full h-full absolute top-0 object-cover object-center rounded-t-md group-hover:scale-105 duration-300"
                                                    src={`${process.env.IMAGES_URL}/480_${collection.image}`}/>
                                            </div>
                                            <div className="w-full p-4">
                                                <p className="font-grotesk truncate">{collection.name}</p>
                                            </div>
                                            <div
                                                className="w-full h-12 bg-blue-300 rounded-b flex items-center justify-center text-white hover:bg-blue-400"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    router.push(`/checkout/collection?id=${collection._id}&username=${username}`);
                                                }}
                                            >
                                                {`Buy $${formatAmount(collection.price)}`}
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
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
    props.username = username;

    if (context.req.cookies?.token) {
        props.user = jwt.decode(context.req.cookies.token);
    }

    try {
        const profilesResponse = await axios.get(`${process.env.BACKEND_URL}/profiles/get?username=${username}`, {withCredentials: true});
        props.profile = profilesResponse.data.data.profile;
    } catch (error) {
        console.log('Failed to fetch profile: ', error);
    }

    try {
        const itemsResponse = await axios.get(`${process.env.BACKEND_URL}/items/get-many?username=${username}`, {withCredentials: true});
        props.items = itemsResponse.data.data.items;
    } catch (error) {
        console.log('Failed to fetch items: ', error);
    }

    try {
        const collectionsResponse = await axios.get(`${process.env.BACKEND_URL}/collections/get-many?username=${username}`, {withCredentials: true});
        props.collections = collectionsResponse.data.data.collections;
    } catch (error) {
        console.log('Failed to fetch collections: ', error);
    }

    return {props};
}
