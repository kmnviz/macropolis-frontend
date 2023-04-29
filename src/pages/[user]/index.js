import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Decimal from "decimal.js";
import jwt from 'jsonwebtoken';

export default function User({username, profile, items, user}) {
    const router = useRouter();

    const [selectedAudio, setSelectedAudio] = useState(null);
    const [selectedAudioState, setSelectedAudioState] = useState(false);
    const [selectedAudioDuration, setSelectedAudioDuration] = useState(0);
    const [audioElementCurrentTime, setAudioElementCurrentTime] = useState(0);
    const [avatarImage, setAvatarImage] = useState(profile && profile?.avatar ? `${process.env.IMAGES_URL}/1920_${profile.avatar}` : '');
    const [backgroundImage, setBackgroundImage] = useState(profile && profile?.background ? `${process.env.IMAGES_URL}/1920_${profile.background}` : '');

    const handleAudioChange = (src) => {
        const audioElement = document.getElementById('audio');
        audioElement.addEventListener('timeupdate', () => {
            if (audioElement.currentTime >= audioElement.duration - 0.1) {
                setSelectedAudioState(false);
            }
        });

        if (!selectedAudio) {
            setAudioElementCurrentTime(0);
            setSelectedAudio(src);
            audioElement.src = `${process.env.AUDIO_PREVIEWS_URL}/${src}`;
            audioElement.play();
            setSelectedAudioState(true);
            setSelectedAudioDuration(audioElement.duration);
        } else {
            if (src === selectedAudio) {
                if (selectedAudioState) {
                    audioElement.pause();
                    setAudioElementCurrentTime(audioElement.currentTime)
                    setSelectedAudioState(false);
                } else {
                    audioElement.currentTime = audioElementCurrentTime;
                    audioElement.play();
                    setSelectedAudioState(true);
                }
            } else {
                setAudioElementCurrentTime(0);
                setSelectedAudio(src);
                audioElement.src = `${process.env.AUDIO_PREVIEWS_URL}/${src}`;
                audioElement.play();
                setSelectedAudioState(true);
                setSelectedAudioDuration(audioElement.duration);
            }
        }
    }

    const formatAmount = (amount) => {
        return Decimal(amount).div(100).toFixed(2);
    }

    return (
        <>
            <Head>
                <title>{`${username} at ${process.env.APP_NAME}`}</title>
            </Head>
            <div className="w-screen h-screen">
                <audio id="audio" type="audio/mpeg" className="invisible"/>
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-screen-2xl">
                        <div className="w-full h-24 lg:h-16 py-4 lg:py-0 px-8 flex flex-col lg:flex-row justify-between items-center">
                            <h6 className="font-grotesk text-xl select-none">{username}</h6>
                            <div className="h-full flex items-center">
                                <div
                                    className="w-10 h-10 flex justify-center items-center relative hover:cursor-pointer">
                                    <div className="w-full h-full absolute flex justify-center items-center z-10"></div>
                                    <div className="w-full h-full absolute flex justify-center items-center z-0">
                                        <img src="/instagram.svg" className="w-6 h-6 rounded-full invert"/>
                                    </div>
                                </div>
                                <div
                                    className="w-10 h-10 flex justify-center items-center relative hover:cursor-pointer">
                                    <div className="w-full h-full absolute flex justify-center items-center z-10"></div>
                                    <div className="w-full h-full absolute flex justify-center items-center z-0">
                                        <img src="/facebook.svg" className="w-6 h-6 rounded-full invert"/>
                                    </div>
                                </div>
                                {
                                    (user && user.username === username) &&
                                    <div
                                        className="w-10 h-10 flex justify-center items-center relative hover:cursor-pointer"
                                        onClick={() => router.push('/dashboard')}>
                                        <div
                                            className="w-full h-full absolute flex justify-center items-center z-10"></div>
                                        <div className="w-full h-full absolute flex justify-center items-center z-0">
                                            <img src="/user.svg" className="w-6 h-6 rounded-full"/>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {
                    profile &&
                    <>
                        <div className="w-full h-auto lg:h-80 relative flex justify-center">
                            <div className="w-full h-full absolute bg-cover bg-center blur-sm grayscale z-0"
                                 style={{backgroundImage: `url(${backgroundImage})`}}></div>
                            <div className="w-full h-full max-w-screen-2xl px-8 z-10 flex flex-col lg:flex-row items-center z-10">
                                <div className="w-40 lg:w-64 h-40 lg:h-64 mt-8 lg:mt-0 bg-cover bg-center rounded-lg"
                                     style={{backgroundImage: `url(${avatarImage})`}}></div>
                                <div className="hidden lg:w-16 lg:block"></div>
                                <div className="block h-8 lg:hidden"></div>
                                <div className="h-auto lg:h-64">
                                    <div className="h-full flex items-center">
                                        <h1 className="font-grotesk font-bold text-white text-center lg:text-right text-5xl lg:text-7xl">{profile && profile?.name ? profile.name : ''}</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                }
                <div className="h-32"></div>
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-screen-2xl px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {
                                items.map((item, index) => {
                                    return (
                                        <div className="h-96 rounded-lg relative shadow-md"
                                             style={{backgroundImage: `url(${process.env.IMAGES_URL}/480_${item.image})`}}
                                             key={`item-${index}`}
                                        >
                                            <div
                                                className="w-full h-full rounded-lg absolute black-to-transparent-gradient"></div>
                                            {
                                                item?.audio && item?.audio_preview &&
                                                <div className="w-full h-full absolute flex justify-center items-center"
                                                     onClick={() => handleAudioChange(item.audio_preview)}>
                                                    <div className="w-16 h-16 -mt-16 hover:cursor-pointer">
                                                        {
                                                            selectedAudioState && selectedAudio === item.audio_preview
                                                                ?
                                                                <img src="/pause.svg" className="w-full h-full invert"/>
                                                                :
                                                                <img src="/play.svg" className="w-full h-full invert"/>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                            <div className="w-full absolute bottom-0 p-4 flex flex-col">
                                                <p className="font-grotesk text-base text-white h-12 overflow-hidden overflow-ellipsis">{item.name}</p>
                                                <div className="h-6"></div>
                                                <div
                                                    className="w-full h-10 px-4 bg-black border rounded-lg flex justify-between items-center hover:cursor-pointer group"
                                                    onClick={() => router.push(`/checkout?itemId=${item._id}&username=${username}`)}>
                                                    <div
                                                        className="h-full flex items-center group-hover:pl-2 duration-200">
                                                        <img src="/cart.svg" className="w-6 h-6 invert"/>
                                                    </div>
                                                    <p className="font-grotesk text-base text-white">${formatAmount(item.price)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="w-full h-24 pb-2 flex justify-center items-end">
                    <h6 className="font-grotesk text-base text-black">by <span className="font-bold hover:cursor-pointer" onClick={() => router.push('/')}>{process.env.APP_NAME}</span></h6>
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
        const response = await axios.get(`${process.env.BACKEND_URL}/profiles/get?username=${username}`, {withCredentials: true});
        props.profile = response.data.data.profile;
    } catch (error) {
        console.log('Failed to fetch profile: ', error);
    }

    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/items/get-many?username=${username}`, {withCredentials: true});
        props.items = response.data.data.items;
    } catch (error) {
        console.log('Failed to fetch items: ', error);
    }

    return {props};
}
