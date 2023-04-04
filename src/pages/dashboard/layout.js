import {useRouter} from 'next/router';
import React from 'react';
import Cookies from 'universal-cookie';
import Head from 'next/head';

export default function DashboardLayout({children}) {
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
                        <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300" onClick={() => router.push('/dashboard')}>profile</div>
                        <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300" onClick={() => router.push('/dashboard/items')}>items</div>
                    </div>
                    <div className="w-full bg-black">
                        <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300" onClick={logout}>logout</div>
                    </div>
                </div>
                <div className="flex-grow p-16">
                    <div className="w-576">{children}</div>
                </div>
            </div>
        </>
    );
}
