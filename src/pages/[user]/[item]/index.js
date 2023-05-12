import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Decimal from 'decimal.js';
import jwt from 'jsonwebtoken';
import itemTypesEnumerations from '../../../enumerations/itemTypes';
import Button from "@/components/button";

export default function User({username, item, items}) {
    const router = useRouter();

    const [audioState, setAudioState] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);

    useEffect(() => {
        handleAudioElement();
    }, []);

    const toggleAudioState = () => {
        const audioElement = document.getElementById('audio');

        if(!audioState) {
            audioElement.play();
            setAudioState(true);
        } else {
            setAudioState(false);
            audioElement.pause();
        }
    }

    const handleAudioElement = () => {
        const audioElement = document.getElementById('audio');
        const seekSliderElement = document.getElementById('seek-slider');
        const seekSliderWrapperElement = document.getElementById('seek-slider-wrapper');

        seekSliderElement.value = 0;
        setAudioDuration(audioElement.duration);
        audioElement.addEventListener('timeupdate', () => {
            setAudioCurrentTime(audioElement.currentTime);
            seekSliderWrapperElement.style.setProperty('--seek-before-width', seekSliderElement.value / seekSliderElement.max * 100 + '%');
            seekSliderElement.value = (audioElement.currentTime / audioElement.duration) * 100;
            if (audioElement.currentTime >= audioElement.duration - 0.1) {
                setAudioState(false);
            }
        });

        seekSliderElement.addEventListener('change', () => {
            audioElement.currentTime = (audioElement.duration / 100) * seekSliderElement.value;
            setAudioCurrentTime(audioElement.currentTime);
            seekSliderWrapperElement.style.setProperty('--seek-before-width', seekSliderElement.value / seekSliderElement.max * 100 + '%');
        });

        seekSliderElement.addEventListener('input', (e) => {
            audioElement.currentTime = (audioElement.duration / 100) * seekSliderElement.value;
            seekSliderWrapperElement.style.setProperty('--seek-before-width', seekSliderElement.value / seekSliderElement.max * 100 + '%');
        });

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: item.name,
                artist: username,
                artwork: [
                    { src: `${process.env.IMAGES_URL}/480_${item.image}`, sizes: '96x96', type: 'image/png' },
                    { src: `${process.env.IMAGES_URL}/480_${item.image}`, sizes: '128x128', type: 'image/png' },
                    { src: `${process.env.IMAGES_URL}/480_${item.image}`, sizes: '192x192', type: 'image/png' },
                    { src: `${process.env.IMAGES_URL}/480_${item.image}`, sizes: '256x256', type: 'image/png' },
                    { src: `${process.env.IMAGES_URL}/480_${item.image}`, sizes: '384x384', type: 'image/png' },
                    { src: `${process.env.IMAGES_URL}/480_${item.image}`, sizes: '512x512', type: 'image/png' }
                ]
            });
        }
    }

    const formatAmount = (amount) => {
        return Decimal(amount).div(100).toFixed(2);
    }

    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
                <meta name="description" content={`Buy ${item.name} by ${username} on ${process.env.APP_NAME}. 
                    ${item?.description && item.description ? item.description : ''}.
                     Browse our marketplace for more digital creations by ${username} and other talented creators.`}
                />
                <meta property="og:title" content={`${item.name} by ${username} on ${process.env.APP_NAME}`} />
                <meta property="og:type" content="product" />
                <meta property="og:url" content={`${process.env.DOMAIN_URL}/${username}/${item._id}`} />
                <meta property="og:description" content={item?.description && item.description ? item.description : ''} />
                <meta property="og:image" content={`${process.env.IMAGES_URL}/480_${item.image}`} />
                <meta property="product:price:amount" content={formatAmount(item.price)} />
                <meta property="product:price:currency" content="USD" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`${process.env.DOMAIN_URL}/${username}/${item._id}`} />
            </Head>
            <div className="w-screen min-h-screen">
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-screen-2xl relative z-20">
                        <div
                            className="w-full h-16 py-4 lg:py-0 px-8 flex flex-row justify-between items-center">
                            <h6 className="font-grotesk text-xl select-none hover:cursor-pointer" onClick={() => router.push(`/${username}`)}>{username}</h6>
                            <div className="h-full flex items-center">
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
                                                 src={`${process.env.IMAGES_URL}/480_${item.image}`} alt={item.name}/>
                                            <audio src={`${process.env.AUDIO_PREVIEWS_URL}/${item.audio_preview}`}
                                                   id="audio" type="audio/mpeg" className="invisible" preload="metadata"/>
                                            <div className="w-full h-16 absolute bottom-0 px-4 backdrop-blur rounded-b-lg">
                                                <div className="w-full h-full flex justify-between items-center">
                                                    <div onClick={() => toggleAudioState()}>
                                                        {
                                                            audioState
                                                                ?
                                                                <img src="/pause.svg" className="w-12 h-12 invert"/>
                                                                :
                                                                <img src="/play.svg" className="w-12 h-12 invert"/>
                                                        }
                                                    </div>
                                                    <div className="h-full ml-4 grow flex justify-between items-center">
                                                        <div id="current-time" className="w-16 font-grotesk text-white text-lg">
                                                            {formatTime(audioCurrentTime)}
                                                        </div>
                                                        <div className="h-full grow relative">
                                                            <div id="seek-slider-wrapper" className="w-full h-full flex items-center">
                                                                <input id="seek-slider" className="w-full" type="range" min="0" max="100"/>
                                                            </div>
                                                        </div>
                                                        <div id="duration" className="w-16 font-grotesk text-white text-lg text-right">
                                                            {formatTime(audioDuration)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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
                                            submit={() => router.push(`/checkout?itemId=${item._id}&username=${username}`)}
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
                                                 onClick={() => router.push(`/${username}/${item._id}`)}
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
                                                         router.push(`/checkout?itemId=${item._id}&username=${username}`);
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
        console.log('Failed to fetch profile: ', error);
        return {redirect: {destination: '/500', permanent: false}};
    }

    return {props};
}
