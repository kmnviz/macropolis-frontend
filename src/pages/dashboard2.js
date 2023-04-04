import jwt from 'jsonwebtoken';
import {useRouter} from 'next/router';
import React, {useState} from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import DashboardProfile from '../components/dashboard/profile';
import Head from 'next/head';

export default function Dashboard({user, profile, items}) {
    const router = useRouter();
    const logout = () => {
        const cookies = new Cookies();
        cookies.set('token', null, { expires: new Date(0) });
        router.push('/sign-in');
    }

    return (
        <>
            <Head>
                <title>xpo.space - dashboard</title>
            </Head>
            <div className="w-screen h-screen relative flex">
                <div id="dashboard-menu-main" className="w-320 min-h-full bg-black flex flex-col">
                    <div className="w-full flex-grow bg-black">
                        <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk select-none">xpo.space</div>
                        <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300"></div>
                        <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300">profile</div>
                        <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300">items</div>
                    </div>
                    <div className="w-full bg-black">
                        <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300" onClick={logout}>logout</div>
                    </div>
                </div>
                <div className="flex-grow p-16">
                    <div className="w-576">
                        <DashboardProfile profile={profile} />
                    </div>
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(context) {
    const props = {};

    if (context.req.cookies?.token) {
        props.user = jwt.decode(context.req.cookies.token);
    } else {
        return {redirect: {destination: '/', permanent: false}};
    }

    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/profiles/get?username=${props.user.username}`, { withCredentials: true });
        props.profile = response.data.data.profile;
    } catch (error) {
        console.log('Failed to fetch profile: ', error);
    }

    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/items/get-many?username=${props.user.username}`, { withCredentials: true });
        props.items = response.data.data.items;


    } catch (error) {
        console.log('Failed to fetch items: ', error);
    }

    return {props};
}
