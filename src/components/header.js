import React from 'react';

export default function Header({router, isLoggedIn}) {
    return (
        <>
            <div className="w-full flex justify-between h-24">
                {
                    router.pathname !== '/' && router.pathname !== '/checkout' && router.pathname !== '/download'
                        ?
                        <div className="h-full flex items-center pl-1 pr-8 md:px-16 hover:cursor-pointer"
                             onClick={() => router.push('/')}>
                            {/*<p className="font-grotesk text-xl">{process.env.APP_NAME}</p>*/}
                            <img src="/macropolis-logo.svg" alt="logo" className="h-12"/>
                        </div>
                        :
                        <div className="h-full flex items-center pl-1 pr-8 md:px-16">
                            {/*<p className="font-grotesk text-xl">{process.env.APP_NAME}</p>*/}
                            <img src="/macropolis-logo.svg" alt="logo" className="h-12"/>
                        </div>
                }
                {
                    (router.pathname !== '/checkout' && router.pathname !== '/download') &&
                    <div className="h-full flex justify-end items-center md:px-8">
                        {
                            !isLoggedIn
                            ?
                                <div
                                    className="h-8 md:h-16 pl-8 pr-1 md:px-8 flex items-center font-poppins truncate hover:cursor-pointer"
                                    onClick={() => router.push(router.pathname !== '/sign-in' ? '/sign-in' : '/sign-up')}>
                                    {router.pathname !== '/sign-in' ? 'Sign in' : 'Sign up'}
                                </div>
                                :
                                <div
                                    className="w-10 h-10 flex justify-center items-center font-poppins truncate hover:cursor-pointer hover:shadow-md hover:rounded-md"
                                    onClick={() => router.push('/dashboard')}
                                >
                                    <img src="/home.svg" className="w-6 h-6"/>
                                </div>
                        }

                    </div>
                }
            </div>
        </>
    );
}
