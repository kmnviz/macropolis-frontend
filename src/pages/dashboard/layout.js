import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import Cookies from 'universal-cookie';
import Head from 'next/head';
import {useSelector} from 'react-redux';

export default function DashboardLayout({children, user}) {
    const router = useRouter();

    const {notifications} = useSelector(state => state.notifications);
    const [menuVisible, setMenuVisible] = useState(false);
    const [metamaskAccount, setMetamaskAccount] = useState('');

    useEffect(() => {
        if ('entry' in router.query) {
            animatePageOverlay();
        }
    }, []);

    const logout = () => {
        const cookies = new Cookies();
        cookies.remove('token', { domain: process.env.DOMAIN_NAME });
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

    const isCurrentRoute = (routePath) => {
        const routesGroups = {
            '/dashboard': ['/dashboard'],
            '/dashboard/items': ['/dashboard/items', '/dashboard/items/create'],
            '/dashboard/collections': ['/dashboard/collections', '/dashboard/collections/create'],
            '/dashboard/sales': ['/dashboard/sales'],
            '/dashboard/withdrawals': ['/dashboard/withdrawals'],
            '/dashboard/plans': ['/dashboard/plans'],
            '/dashboard/nft': ['/dashboard/nft'],
        }

        return routesGroups[routePath].includes(router.pathname);
    }

    const redirectTo = (route) => {
        showMenu();
        router.push(route);
    }

    useEffect(() => {
        getMetamaskAccount();
        trackAccountsChangedEvent();
    }, []);

    const getMetamaskAccount = async () => {
        if (isMetamaskInstalled() && await isMetamaskUnlocked()) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setMetamaskAccount(accounts[0]);
        }
    }

    const isMetamaskUnlocked = async () => {
        return 'ethereum' in window && await window.ethereum._metamask.isUnlocked();
    }

    const isMetamaskInstalled = () => {
        return typeof window.ethereum !== 'undefined';
    }

    const connectToMetamask = async () => {
        if (isMetamaskInstalled() && !(await isMetamaskUnlocked())) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setMetamaskAccount(accounts[0]);
        }
    }

    const trackAccountsChangedEvent = async () => {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (!accounts.length) {
                setMetamaskAccount('');
            } else {
                setMetamaskAccount(accounts[0]);
            }
        });
    }

    return (
        <>
            <Head>
                <title>{`${process.env.APP_NAME} - dashboard`}</title>
            </Head>
            <div id="dashboard-menu-button"
                 className="lg:hidden fixed right-2 bottom-2 z-30 flex justify-center items-center border-2 rounded-lg bg-black hover:cursor-pointer"
                 onClick={showMenu}
            >
                <div id="dashboard-menu-icon" className="relative">
                    <div className="w-full h-1 bg-white rounded-sm absolute"></div>
                    <div className="w-full h-1 bg-white rounded-sm absolute"></div>
                </div>
            </div>
            {
                notifications.length > 0 &&
                <div className="w-full fixed top-4 flex justify-center z-20">
                    <div className="w-64 lg:w-384">
                        {
                            notifications.map((notification, index) => {
                                return (
                                    <div key={`notification-message-${index}`}
                                         className={`p-4 rounded-md shadow-md 
                                            ${notification.status === 'error' ? 'bg-red-300' : 'bg-green-300'} 
                                            ${index < notifications.length - 1 ? 'mb-2' : ''}`
                                    }
                                    >
                                        <p className={`font-grotesk`}>
                                            {notification.message}
                                        </p>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            }
            <div className="w-screen min-h-screen relative">
                <div id="page-overlay"
                     className={`h-full absolute z-0 bg-black ${'entry' in router.query ? 'w-full' : 'w-0'}`}
                ></div>
                <div id="dashboard-menu-main"
                     className="ml-[-100%] lg:ml-0 w-full lg:w-80 min-h-full h-1 fixed top-0 left-0 bg-black z-20 lg:p-0">
                    <div id="dashboard-menu-wrapper" className="w-full h-full min-h-full flex flex-col overflow-y-auto">
                        <div className="w-full flex-grow bg-black">
                            <div
                                className="w-full h-12 p-4 flex text-white text-2xl font-grotesk select-none"
                            >
                                <img src="/macropolis-logo.svg" alt="logo" className="h-12 invert"/>
                                <p className="text-sm">{user?.plan ? user.plan.name : ''}</p>
                            </div>
                            <div
                                className="w-full h-12 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300"></div>
                            <div
                                className={`w-full h-12 p-4 flex items-center text-2xl font-grotesk hover:cursor-pointer hover:text-green-300 ${isCurrentRoute('/dashboard') ? 'text-green-300' : 'text-white'}`}
                                onClick={() => redirectTo('/dashboard')}>Profile
                            </div>
                            <div
                                className={`w-full h-12 p-4 flex items-center text-2xl font-grotesk hover:cursor-pointer hover:text-green-300  ${isCurrentRoute('/dashboard/items') ? 'text-green-300' : 'text-white'}`}
                                onClick={() => redirectTo('/dashboard/items')}>Items
                            </div>
                            <div
                                className={`w-full h-12 p-4 flex items-center text-2xl font-grotesk hover:cursor-pointer hover:text-green-300  ${isCurrentRoute('/dashboard/collections') ? 'text-green-300' : 'text-white'}`}
                                onClick={() => redirectTo('/dashboard/collections')}>Collections
                            </div>
                            <div
                                className={`w-full h-12 p-4 flex items-center text-2xl font-grotesk hover:cursor-pointer hover:text-green-300  ${isCurrentRoute('/dashboard/sales') ? 'text-green-300' : 'text-white'}`}
                                onClick={() => redirectTo('/dashboard/sales')}>Sales
                            </div>
                            <div
                                className={`w-full h-12 p-4 flex items-center text-2xl font-grotesk hover:cursor-pointer hover:text-green-300  ${isCurrentRoute('/dashboard/withdrawals') ? 'text-green-300' : 'text-white'}`}
                                onClick={() => redirectTo('/dashboard/withdrawals')}>Withdrawals
                            </div>
                            <div
                                className={`w-full h-12 p-4 flex items-center text-2xl font-grotesk hover:cursor-pointer hover:text-green-300  ${isCurrentRoute('/dashboard/nft') ? 'text-green-300' : 'text-white'}`}
                                onClick={() => redirectTo('/dashboard/nft')}>NFT
                            </div>
                        </div>
                        <div className="w-full bg-black">
                            <div
                                className={`w-full h-12 p-4 flex items-center text-2xl font-grotesk hover:cursor-pointer hover:text-green-300 text-white`}
                                onClick={() => connectToMetamask()}><p className="truncate">{metamaskAccount ? metamaskAccount : 'Connect to Metamask'}</p>
                            </div>
                            <div
                                className={`w-full h-12 p-4 flex items-center text-2xl font-grotesk hover:cursor-pointer hover:text-green-300  ${isCurrentRoute('/dashboard/plans') ? 'text-green-300' : 'text-white'}`}
                                onClick={() => redirectTo(`/dashboard/plans`)}>Plans
                            </div>
                            <div
                                className="w-full h-12 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300"
                                onClick={() => redirectTo(`/${user.username}`)}>My page
                            </div>
                            <div
                                className="w-full h-12 p-4 flex items-center text-white text-2xl font-grotesk hover:cursor-pointer hover:text-green-300"
                                onClick={logout}>Logout
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-2 md:p-16 lg:ml-80">
                    <div className="w-full lg:w-576">{children}</div>
                </div>
                <div className="h-20"></div>
            </div>
        </>
    );
}
