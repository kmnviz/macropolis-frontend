import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import Cookies from 'universal-cookie';
import Head from 'next/head';

export default function DashboardLayout({children}) {
    const router = useRouter();

    useEffect(() => {
        if ('entry' in router.query) {
            animatePageOverlay();
        }
    }, []);

    const logout = () => {
        const cookies = new Cookies();
        cookies.set('token', null, { expires: new Date(0) });
        animatePageOverlay(true);
        setTimeout(() => {
            router.push('/sign-in');
        }, 1000);
    }

    const animatePageOverlay = (reverse = false) => {
        const pageOverlayElement = document.getElementById('page-overlay');
        const dashboardMenuWrapperElement = document.getElementById('dashboard-menu-wrapper');
        pageOverlayElement.style.transition = 'width 0.5s';

        if (!reverse) {
            pageOverlayElement.classList.remove('w-full');
            pageOverlayElement.classList.add('z-40', 'w-0');
            dashboardMenuWrapperElement.style.marginLeft = '-320px';
            dashboardMenuWrapperElement.style.transition = 'all 0.5s';
            setTimeout(() => {
                dashboardMenuWrapperElement.style.marginLeft = '0px';
            }, 500);
        } else {
            dashboardMenuWrapperElement.style.marginLeft = '-320px';
            setTimeout(() => {
                pageOverlayElement.classList.remove('w-0');
                pageOverlayElement.classList.add('w-full');
                dashboardMenuWrapperElement.style.marginLeft = '0';
                dashboardMenuWrapperElement.style.transition = 'all 0.5s';
            }, 500);
        }
    }

    return (
        <>
            <Head>
                <title>xpo.space - dashboard</title>
            </Head>
            <div className="w-screen h-screen relative flex">
                <div id="page-overlay" className={`h-full absolute z-0 bg-black ${'entry' in router.query ? 'w-full' : 'w-0'}`}></div>
                <div id="dashboard-menu-main" className="w-320 min-h-full bg-black">
                    <div id="dashboard-menu-wrapper" className="w-full h-full flex flex-col">
                        <div className="w-full flex-grow bg-black">
                            <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk select-none">xpo.space</div>
                            <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300"></div>
                            <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300" onClick={() => router.push('/dashboard')}>profile</div>
                            <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300" onClick={() => router.push('/dashboard/items')}>items</div>
                            <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300" onClick={() => router.push('/dashboard/payments')}>payments</div>
                        </div>
                        <div className="w-full bg-black">
                            <div className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300" onClick={logout}>logout</div>
                        </div>
                    </div>
                </div>
                <div className="flex-grow p-16">
                    <div className="w-576">{children}</div>
                </div>
            </div>
        </>
    );
}
