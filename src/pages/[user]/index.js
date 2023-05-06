import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Decimal from 'decimal.js';
import jwt from 'jsonwebtoken';

export default function User({username, profile, items, user}) {
    const router = useRouter();

    const [selectedAudio, setSelectedAudio] = useState(null);
    const [selectedAudioState, setSelectedAudioState] = useState(false);
    const [selectedAudioDuration, setSelectedAudioDuration] = useState(0);
    const [audioElementCurrentTime, setAudioElementCurrentTime] = useState(0);
    const [avatarImage] = useState(profile && profile?.avatar ? `${process.env.IMAGES_URL}/1920_${profile.avatar}` : '');
    const [backgroundImage] = useState(profile && profile?.background ? `${process.env.IMAGES_URL}/1920_${profile.background}` : '');

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
                <audio id="audio" type="audio/mpeg" className="invisible"/>
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-screen-2xl relative z-20">
                        <div
                            className="w-full h-16 py-4 lg:py-0 px-8 flex flex-row justify-between items-center">
                            <h6 className="font-grotesk text-xl select-none">{username}</h6>
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
                        <h2 className="font-grotesk text-3xl">{profile.name}</h2>
                        <p className="font-grotesk mt-8">Items: {items.length}</p>
                        <div className="w-full h-px mt-1 bg-gray-300"></div>
                        <div
                            className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
                        >
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
