import React from 'react';

export default function Header({router}) {
    return (
        <>
            <div className="w-full flex justify-between h-24">
                {
                    router.pathname !== '/' && router.pathname !== '/checkout' && router.pathname !== '/download'
                        ?
                        <div className="h-full flex items-center px-4 md:px-8 hover:cursor-pointer"
                             onClick={() => router.push('/')}>
                            <img src="/next.svg" alt="logo" className="h-4 md:h-8"/>
                        </div>
                        :
                        <div className="h-full flex items-center px-4 md:px-8">
                            <img src="/next.svg" alt="logo" className="h-4 md:h-8"/>
                        </div>
                }
                {
                    (router.pathname !== '/checkout' && router.pathname !== '/download') &&
                    <div className="h-full flex justify-end items-center px-4 md:px-8">
                        <div
                            className="h-8 md:h-16 px-4 md:px-8 flex items-center font-poppins truncate hover:cursor-pointer"
                            onClick={() => router.push(router.pathname !== '/sign-in' ? '/sign-in' : '/sign-up')}>
                            {router.pathname !== '/sign-in' ? 'Sign in' : 'Sign up'}
                        </div>
                    </div>
                }
            </div>
        </>
    );
}
