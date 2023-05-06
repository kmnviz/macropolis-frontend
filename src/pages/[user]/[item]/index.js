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
    const [audioElementCurrentTime, setAudioElementCurrentTime] = useState(0);

    useEffect(() => {
        if (item.type === itemTypesEnumerations.AUDIO) {
            const audioElement = document.getElementById('audio');
            audioElement.addEventListener('loadedmetadata', () => {
                setAudioDuration(audioElement.duration);
                handleAudioDraggable();
            });
        }
    }, []);

    useEffect(() => {
        console.log('enters here...');
        // changeDraggableCursorPositionBasedOnCurrentTime(audioElementCurrentTime);
    }, [audioElementCurrentTime]);

    const handleAudioToggle = () => {
        const audioElement = document.getElementById('audio');
        audioElement.addEventListener('timeupdate', () => {
            setAudioElementCurrentTime(audioElement.currentTime);
            if (audioElement.currentTime >= audioElement.duration - 0.1) {
                setAudioState(false);
            }
        });

        if (audioState) {
            audioElement.pause();
            setAudioElementCurrentTime(audioElement.currentTime);
            setAudioState(false);
        } else {
            audioElement.currentTime = audioElementCurrentTime;
            audioElement.play();
            setAudioState(true);
        }
    }

    const changeDraggableCursorPosition = (newPosition) => {
        const audioElement = document.getElementById('audio');
        const draggableWrapper = document.getElementById('audio-draggable-wrapper');
        const draggableCursor = document.getElementById('audio-draggable-cursor');
        const draggableWrapperWidth = draggableWrapper.getBoundingClientRect().width;
        const draggableCursorWidth = draggableCursor.getBoundingClientRect().width;

        if (newPosition >= 0 && newPosition <= draggableWrapperWidth - draggableCursorWidth) {
            draggableCursor.style.left = `${newPosition}px`;

            let percentageOf = (newPosition / (draggableWrapperWidth - draggableCursorWidth)) * 100;
            percentageOf = percentageOf < 1 ? Math.floor(percentageOf) : Math.ceil(percentageOf);

            setAudioElementCurrentTime(Math.floor((audioElement.duration / 100) * percentageOf));
            audioElement.currentTime = Math.floor((audioElement.duration / 100) * percentageOf);
        }
    }

    const changeDraggableCursorPositionBasedOnCurrentTime = (audioElementCurrentTime) => {
        const draggableWrapper = document.getElementById('audio-draggable-wrapper');
        const draggableCursor = document.getElementById('audio-draggable-cursor');
        const draggableWrapperWidth = draggableWrapper.getBoundingClientRect().width;
        const draggableCursorWidth = draggableCursor.getBoundingClientRect().width;

        let percentageOf = (audioElementCurrentTime / audioDuration) * 100;
        percentageOf = percentageOf < 1 ? Math.floor(percentageOf) : Math.ceil(percentageOf);
        const newPosition = Math.floor((draggableWrapperWidth / 100) * percentageOf);

        if (newPosition > draggableCursorWidth / 2 && newPosition < draggableWrapperWidth - (draggableCursorWidth / 2)) {
            draggableCursor.style.left = `${newPosition}px`;
        }
    }

    const handleAudioDraggable = () => {
        const audioElement = document.getElementById('audio');
        const draggableWrapper = document.getElementById('audio-draggable-wrapper');
        const draggableCursor = document.getElementById('audio-draggable-cursor');
        const draggablePath = document.getElementById('audio-draggable-path');
        const draggableWrapperWidth = draggableWrapper.getBoundingClientRect().width;
        const draggableCursorWidth = draggableCursor.getBoundingClientRect().width;

        let isDragging = false;

        draggableCursor.addEventListener('mousedown', () => {
            isDragging = true;
            if (!audioState) {
                audioElement.pause();
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            if (audioState) {
                audioElement.play();
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const newPosition = event.clientX - draggableWrapper.getBoundingClientRect().left;
                changeDraggableCursorPosition(newPosition < 0 ? 0 : newPosition);
            }
        });

        draggablePath.addEventListener('click', (event) => {
            const newPosition = event.clientX - (draggablePath.getBoundingClientRect().left + (draggableCursorWidth / 2));
            changeDraggableCursorPosition(newPosition < 0 ? 0 : (newPosition > draggableWrapperWidth - draggableCursorWidth ? draggableWrapperWidth - draggableCursorWidth : newPosition));
        });
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
                <title>{`${username} at ${process.env.APP_NAME}`}</title>
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
                                <div className="w-full p-0 lg:pr-8 rounded-lg relative">
                                    {
                                        item.type === itemTypesEnumerations.AUDIO && item?.audio_preview &&
                                        <>
                                            <audio src={`${process.env.AUDIO_PREVIEWS_URL}/${item.audio_preview}`}
                                                   id="audio" type="audio/mpeg" className="invisible"/>
                                            <img className="w-full rounded-lg z-0"
                                                 src={`${process.env.IMAGES_URL}/480_${item.image}`} alt={item.name}/>
                                            <div
                                                className="w-full h-full absolute top-0 z-10 flex justify-center items-center">
                                                <div
                                                    className="w-24 h-24 border-4 border-gray-300 rounded-full relative group hover:cursor-pointer"
                                                    onClick={() => handleAudioToggle()}
                                                >
                                                    <div
                                                        className="w-full h-full absolute top-0 rounded-full bg-black opacity-75 group-hover:opacity-95 duration-300"></div>
                                                    <div
                                                        className="w-full h-full absolute top-0 flex justify-center items-center">
                                                        {
                                                            audioState
                                                                ?
                                                                <img src="/pause.svg" className="w-12 h-12 invert"/>
                                                                :
                                                                <img src="/play.svg" className="w-12 h-12 invert"/>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className="w-full h-16 absolute p-0 lg:pr-8 bottom-0 rounded-b-lg group z-20">
                                                <div className="w-full h-full relative">
                                                    <div
                                                        className="w-full h-full absolute top-0 rounded-b-lg bg-black opacity-75 z-20"></div>
                                                    <div
                                                        className="w-full h-full absolute top-0 rounded-b-lg z-30 px-4">
                                                        <div
                                                            className="w-full h-full flex justify-between items-center">
                                                            <div
                                                                className="w-12 font-grotesk text-xl text-white select-none">
                                                                {formatTime(audioElementCurrentTime)}
                                                            </div>
                                                            <div
                                                                className="h-full flex-grow flex justify-center items-center">
                                                                <div id="audio-draggable-wrapper"
                                                                     className="w-4/5 h-full relative">
                                                                    <div id="audio-draggable-path"
                                                                         className="w-full h-2 absolute top-7 rounded-sm bg-white hover:cursor-pointer"
                                                                    ></div>
                                                                    <div id="audio-draggable-cursor"
                                                                         className={`w-4 h-4 absolute top-6 rounded-full bg-green-300 hover:cursor-pointer`}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="w-12 font-grotesk text-xl text-white select-none">
                                                                {formatTime(audioDuration)}
                                                            </div>
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
                <div className="w-full flex justify-center mt-24">
                    <div className="w-full max-w-screen-2xl px-8">
                        <h4 className="font-grotesk text-4xl text-center">More from me</h4>
                        <div className="w-full mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                            {
                                items.map((item, index) => {
                                    return (
                                        <div key={`item-${item._id}`}
                                             className="relative flex flex-col rounded-md shadow hover:shadow-lg cursor-pointer group"
                                             onClick={() => router.push(`/${username}/${item._id}`)}
                                        >
                                            <div className="w-full h-64 relative">
                                                <img className="rounded-t-md group-hover:scale-105 duration-300" src={`${process.env.IMAGES_URL}/480_${item.image}`} />
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
