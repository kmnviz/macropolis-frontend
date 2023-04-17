import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import Cookies from 'universal-cookie';
import Head from 'next/head';

export default function DashboardLayout({children, user}) {
    const router = useRouter();

    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        if ('entry' in router.query) {
            animatePageOverlay();
        }
    }, []);

    const logout = () => {
        const cookies = new Cookies();
        cookies.remove('token');
        animatePageOverlay(true);
        setTimeout(() => {
            router.push('/sign-in?entry');
        }, 1000);
    }

    const animatePageOverlay = (reverse = false) => {
        const pageOverlayElement = document.getElementById('page-overlay');
        const menuWrapperElement = document.getElementById('dashboard-menu-wrapper');
        pageOverlayElement.style.transition = 'width 0.5s';

        if (!reverse) {
            pageOverlayElement.classList.remove('w-full');
            pageOverlayElement.classList.add('z-40', 'w-0');
            menuWrapperElement.style.marginLeft = '-320px';
            menuWrapperElement.style.transition = 'all 0.5s';
            setTimeout(() => {
                menuWrapperElement.style.marginLeft = '0px';
            }, 500);
        } else {
            menuWrapperElement.style.marginLeft = '-320px';
            pageOverlayElement.classList.add('z-40');
            setTimeout(() => {
                pageOverlayElement.classList.remove('w-0');
                pageOverlayElement.classList.add('w-full');
                menuWrapperElement.style.marginLeft = '0';
                menuWrapperElement.style.transition = 'all 0.5s';
            }, 500);
        }
    }

    const showMenu = () => {
        const menuMainElement = document.getElementById('dashboard-menu-main');
        const menuIconElement = document.getElementById('dashboard-menu-icon');
        menuMainElement.style.transition = 'all 0.5s';

        if (menuVisible) {
            menuMainElement.classList.remove('ml-0');
            menuMainElement.classList.add('ml-[-100%]');
            menuIconElement.classList.remove('active');
        } else {
            menuMainElement.classList.remove('ml-[-100%]');
            menuMainElement.classList.add('ml-0');
            menuIconElement.classList.add('active');
        }

        setMenuVisible(!menuVisible);
    }

    const isCurrentRoute = (route) => {
        return router.pathname === route;
    }

    const redirectTo = (route) => {
        showMenu();
        router.push(route);
    }

    return (
        <>
            <Head>
                <title>{process.env.APP_NAME} - dashboard</title>
            </Head>
            <div className="w-screen h-screen relative">
                <div id="page-overlay"
                     className={`h-full absolute z-0 bg-black ${'entry' in router.query ? 'w-full' : 'w-0'}`}></div>
                <div id="dashboard-menu-button"
                     className="lg:hidden absolute right-2 bottom-2 z-30 flex justify-center items-center border-2 rounded-lg bg-black hover:cursor-pointer"
                     onClick={showMenu}
                >
                    <div id="dashboard-menu-icon" className="relative">
                        <div className="w-full h-1 bg-white rounded-sm absolute"></div>
                        <div className="w-full h-1 bg-white rounded-sm absolute"></div>
                    </div>
                </div>
                <div id="dashboard-menu-main"
                     className="ml-[-100%] lg:ml-0 w-full lg:w-80 min-h-full h-1 fixed top-0 left-0 bg-black z-20 p-4 lg:p-0">
                    <div id="dashboard-menu-wrapper" className="w-full h-full min-h-full flex flex-col overflow-y-auto">
                        <div className="w-full flex-grow bg-black">
                            <div
                                className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk select-none">{process.env.APP_NAME} [{user.plan.name}]
                            </div>
                            <div
                                className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300"></div>
                            <div
                                className={`w-full h-16 p-4 flex items-center text-2xl font-grotesk hover:cursor-pointer hover:text-green-300 ${isCurrentRoute('/dashboard') ? 'text-green-300' : 'text-white'}`}
                                onClick={() => redirectTo('/dashboard')}>profile
                            </div>
                            <div
                                className={`w-full h-16 p-4 flex items-center text-2xl font-grotesk hover:cursor-pointer hover:text-green-300  ${isCurrentRoute('/dashboard/items') ? 'text-green-300' : 'text-white'}`}
                                onClick={() => redirectTo('/dashboard/items')}>items
                            </div>
                            <div
                                className={`w-full h-16 p-4 flex items-center text-2xl font-grotesk hover:cursor-pointer hover:text-green-300  ${isCurrentRoute('/dashboard/sales') ? 'text-green-300' : 'text-white'}`}
                                onClick={() => redirectTo('/dashboard/sales')}>sales
                            </div>
                            <div
                                className={`w-full h-16 p-4 flex items-center text-2xl font-grotesk hover:cursor-pointer hover:text-green-300  ${isCurrentRoute('/dashboard/withdrawals') ? 'text-green-300' : 'text-white'}`}
                                onClick={() => redirectTo('/dashboard/withdrawals')}>withdrawals
                            </div>
                        </div>
                        <div className="w-full bg-black">
                            <div
                                className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300"
                                onClick={() => redirectTo(`/dashboard/plans`)}>plans
                            </div>
                            <div
                                className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300"
                                onClick={() => redirectTo(`/${user.username}`)}>page
                            </div>
                            <div
                                className="w-full h-16 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300"
                                onClick={logout}>logout
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-2 md:p-16 lg:ml-80">
                    <div className="w-full lg:w-576">{children}</div>
                </div>
            </div>
        </>
    );
}
