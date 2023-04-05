import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Decimal from "decimal.js";

export default function User({username, profile, items}) {
    const router = useRouter();

    const [selectedAudio, setSelectedAudio] = useState(null);
    const [selectedAudioState, setSelectedAudioState] = useState(false);
    const [selectedAudioDuration, setSelectedAudioDuration] = useState(0);
    const [audioElementCurrentTime, setAudioElementCurrentTime] = useState(0);

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
                <title>{username} at xpo.space</title>
            </Head>
            <div className="w-screen h-screen relative">
                <audio id="audio" type="audio/mpeg" className="invisible"/>
                <div className="w-full h-16 px-8 flex justify-between items-center">
                    <h6 className="font-grotesk text-xl">{username}</h6>
                    <div className="h-full flex items-center">
                        <div className="w-10 h-10 flex justify-center items-center relative hover:cursor-pointer">
                            <div className="w-full h-full absolute flex justify-center items-center z-10"></div>
                            <div className="w-full h-full absolute flex justify-center items-center z-0">
                                <img src="/instagram.svg" className="w-6 h-6 rounded-full invert"/>
                            </div>
                        </div>
                        <div className="w-10 h-10 flex justify-center items-center relative hover:cursor-pointer">
                            <div className="w-full h-full absolute flex justify-center items-center z-10"></div>
                            <div className="w-full h-full absolute flex justify-center items-center z-0">
                                <img src="/facebook.svg" className="w-6 h-6 rounded-full invert"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full px-8 mt-16">
                    <div className="grid grid-cols-6 gap-8">
                        {
                            items.map((item, index) => {
                                return (
                                    <div className="flex flex-col">
                                        <div
                                            className="w-full h-64 relative flex justify-center items-center rounded-md bg-center bg-cover"
                                            style={{backgroundImage: `url(${process.env.IMAGES_URL}/480_${item.image})`}}
                                        ></div>
                                        <div className="mt-2">
                                            <p className="font-grotesk text-sm truncate">{item.name}</p>
                                            <p className="font-grotesk text-sm">${formatAmount(item.price)}</p>
                                        </div>
                                        {
                                            item?.audio_preview &&
                                            <div className="mt-2 h-16 flex justify-between gap-4">
                                                <div
                                                    className="w-full h-full border border-gray-300 rounded-lg flex justify-center items-center hover:cursor-pointer"
                                                    onClick={() => handleAudioChange(item.audio_preview)}>
                                                    {
                                                        !selectedAudioState
                                                            ?
                                                            <img src="/play.svg" className="w-8 h-8"/>
                                                            :
                                                            <>
                                                                {
                                                                    selectedAudioState && selectedAudio === item.audio_preview
                                                                        ?
                                                                        <img src="/pause.svg" className="w-8 h-8"/>
                                                                        :
                                                                        <img src="/play.svg" className="w-8 h-8"/>
                                                                }
                                                            </>
                                                    }
                                                </div>
                                                <div
                                                    className="w-full h-full border border-gray-300 rounded-lg flex justify-center items-center hover:cursor-pointer"
                                                    onClick={() => router.push(`/checkout?itemId=${item._id}`)}>
                                                    <img src="/cart.svg" className="w-8 h-8"/>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
            {/*<div className="w-screen h-screen">*/}
            {/*    <audio id="audio" type="audio/mpeg" className="invisible"/>*/}
            {/*    <div className="w-full h-full flex flex-col items-center">*/}
            {/*        <div className="container">*/}
            {/*            <div className="flex flex-col mt-16">*/}
            {/*                <div className="w-40 h-40 h-10 rounded-md">*/}
            {/*                    {*/}
            {/*                        !profile?.avatar || profile.avatar === ''*/}
            {/*                            ?*/}
            {/*                            <div*/}
            {/*                                className="w-full h-full flex flex-col justify-center items-center rounded-full border border-black">*/}
            {/*                                <img src="/user.svg" className="w-12 h-12 rounder-full"/>*/}
            {/*                            </div>*/}
            {/*                            :*/}
            {/*                            <div*/}
            {/*                                className="w-full h-full rounded-full bg-cover bg-center"*/}
            {/*                                style={{backgroundImage: `url(${process.env.IMAGES_URL}/480_${profile.avatar})`}}*/}
            {/*                            >*/}
            {/*                            </div>*/}
            {/*                    }*/}
            {/*                </div>*/}
            {/*                <div className="w-40 mt-4">*/}
            {/*                    <p className="text-2xl font-bold text-center">{profile.name ? profile.name : username}</p>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*        <div className="container mt-16">*/}
            {/*            <div className="w-full">*/}
            {/*                <div className="grid grid-cols-6">*/}
            {/*                    {*/}
            {/*                        items.length > 0 &&*/}
            {/*                        items.map((item, index) => {*/}
            {/*                            return (*/}
            {/*                                <div className="flex flex-col" key={index}>*/}
            {/*                                    <div className="w-40 h-40 relative">*/}
            {/*                                        <div*/}
            {/*                                            className="w-full h-full absolute z-0 bg-cover bg-center rounded-md"*/}
            {/*                                            style={{backgroundImage: `url(${process.env.IMAGES_URL}/240_${item.image})`}}*/}
            {/*                                        ></div>*/}
            {/*                                        {*/}
            {/*                                            item?.audio_preview &&*/}
            {/*                                            <div className="w-8 h-8 absolute right-2 bottom-2 border border-black*/}
            {/*                                            rounded hover:cursor-pointer hover:border-green-500"*/}
            {/*                                                 onClick={() => handleAudioChange(item.audio_preview)}*/}
            {/*                                            >*/}
            {/*                                                <div*/}
            {/*                                                    className="w-full h-full absolute z-10 flex justify-center items-center">*/}
            {/*                                                    {*/}
            {/*                                                        !selectedAudioState*/}
            {/*                                                            ?*/}
            {/*                                                            <img src="/play.svg" className="w-4 h-4"/>*/}
            {/*                                                            :*/}
            {/*                                                            <>*/}
            {/*                                                                {*/}
            {/*                                                                    selectedAudioState && selectedAudio === item.audio_preview*/}
            {/*                                                                        ?*/}
            {/*                                                                        <img src="/pause.svg"*/}
            {/*                                                                             className="w-4 h-4"/>*/}
            {/*                                                                        :*/}
            {/*                                                                        <img src="/play.svg"*/}
            {/*                                                                             className="w-4 h-4"/>*/}
            {/*                                                                }*/}
            {/*                                                            </>*/}
            {/*                                                    }*/}
            {/*                                                </div>*/}
            {/*                                                <div*/}
            {/*                                                    className="w-full h-full z-0 absolute bg-white rounded-sm"></div>*/}
            {/*                                            </div>*/}
            {/*                                        }*/}
            {/*                                        <div className="w-8 h-8 absolute right-12 bottom-2 border border-black*/}
            {/*                                            rounded hover:cursor-pointer hover:border-blue-500"*/}
            {/*                                             onClick={() => router.push(`/checkout?itemId=${item._id}`)}*/}
            {/*                                        >*/}
            {/*                                            <div*/}
            {/*                                                className="w-full h-full absolute z-10 flex justify-center items-center">*/}
            {/*                                                <img src="/cart.svg" className="w-4 h-4"/>*/}
            {/*                                            </div>*/}
            {/*                                            <div*/}
            {/*                                                className="w-full h-full z-0 absolute bg-white rounded-sm"></div>*/}
            {/*                                        </div>*/}
            {/*                                    </div>*/}
            {/*                                    <p className="w-40 mt-2 text-center">{item.name}</p>*/}
            {/*                                    <p className="w-40 text-center">${item.price / 100}</p>*/}
            {/*                                </div>*/}
            {/*                            )*/}
            {/*                        })*/}
            {/*                    }*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </>
    );
}

export async function getServerSideProps(context) {
    const props = {};
    const username = context.params.user;
    props.username = username;

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
