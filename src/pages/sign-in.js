import axios from 'axios';
import Input from '../components/input';
import PasswordInput from '../components/passwordInput';
import {useForm} from 'react-hook-form';
import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import Cookies from 'universal-cookie';
import Head from 'next/head';

export default function SignUp() {
    const router = useRouter();

    const {register, handleSubmit, formState: {errors}, setError, setValue} = useForm();
    const [signUpConfirmed, setSignUpConfirmed] = useState(false);
    const [formButtonDisabled, setFormButtonDisabled] = useState(false);

    useEffect(() => {
        if (router.query?.username || router.query?.confirmationHash) {
            setValue('username', router.query.username);
            setSignUpConfirmed(true);
            router.push('/sign-in', undefined, {shallow: true});
        }

        if ('entry' in router.query) {
            animatePageOverlay(true);
        }
    }, []);


    const submit = async (data) => {
        setFormButtonDisabled(true);

        try {
            const response = await axios.post(`${process.env.BACKEND_URL}/users/sign-in`, {
                username: data.username,
                password: data.password
            });

            const cookies = new Cookies();
            cookies.set('token', response.data.data.token, {
                domain: process.env.DOMAIN_NAME,
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
            });

            setTimeout(() => {
                animatePageOverlay();
                setTimeout(() => {
                    setFormButtonDisabled(false);
                    router.push('/dashboard?entry');
                }, 1000);
            }, 1000);
        } catch (error) {
            setFormButtonDisabled(false);
            if (error.response.status === 401) {
                setError('username', {
                    type: 'custom',
                    message: error.response.data.message
                });
                setError('password', {
                    type: 'custom',
                    message: error.response.data.message
                });
            }
            console.log('Failed to sign in: ', error);
        }
    }

    const animatePageOverlay = (reverse = false) => {
        const pageOverlayElement = document.getElementById('page-overlay');
        pageOverlayElement.style.transition = 'width 0.5s';
        if (!reverse) {
            pageOverlayElement.classList.add('z-40', 'w-full');
        } else {
            pageOverlayElement.classList.remove('w-full');
            pageOverlayElement.classList.add('w-0');
        }
    }

    return (
        <>
            <Head>
                <title>xpo.space - sign in</title>
            </Head>
            <div className="w-screen h-screen">
                <div id="page-overlay" className={`h-full absolute right-0 bg-black ${!('entry' in router.query) ? 'w-0 z-0' : 'w-full z-40'}`}></div>
                <div className="w-full">
                    <div className="w-full flex justify-between h-24">
                        <div className="h-full flex items-center px-8 hover:cursor-pointer"
                             onClick={() => router.push('/')}>
                            <img src="/next.svg" alt="logo" className="h-8"/>
                        </div>
                        <div className="h-full flex justify-end items-center">
                            {/*<div*/}
                            {/*    className="h-16 px-8 flex items-center font-poppins text-black mr-8 hover:cursor-pointer">Who*/}
                            {/*    we serve?*/}
                            {/*</div>*/}
                            {/*<div*/}
                            {/*    className="h-16 px-8 flex items-center font-poppins text-black mr-8 hover:cursor-pointer">What*/}
                            {/*    we offer?*/}
                            {/*</div>*/}
                            <div
                                className="h-16 px-8 flex items-center font-poppins mr-8 hover:cursor-pointer rounded-4xl border-2 border-black"
                                onClick={() => router.push('/sign-up')}>Sign up
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full h-full flex flex-col items-center mt-24">
                    {
                        signUpConfirmed &&
                        <div className="w-576 p-2">
                            <p className="text-4xl font-grotesk font-bold">Email address was confirmed. Welcome!</p>
                        </div>
                    }
                    <form className="w-576 p-2">
                        <h6 className="font-grotesk text-xl">Sign in</h6>
                        <div className="h-4"></div>
                        <Input
                            name="username"
                            label="Username"
                            register={register}
                            errors={errors}
                            validationSchema={{
                                required: 'Username is required',
                                minLength: {value: 6, message: 'Username must be at least 6 characters long'},
                                pattern: {
                                    value: /^[a-zA-Z0-9_]*$/i,
                                    message: 'Username can include only alphanumeric characters and "_"'
                                }
                            }}
                        />
                        <div className="h-4"></div>
                        <PasswordInput
                            name="password"
                            label="Password"
                            register={register}
                            errors={errors}
                            forgotPassword={true}
                            validationSchema={{
                                required: 'Password is required',
                                minLength: {value: 8, message: 'Password must be at least 8 characters long'},
                            }}
                        />
                        <div className={`w-full h-16 rounded-md duration-100 mt-10
                                    flex justify-center items-center 
                                    ${Object.keys(errors).length || formButtonDisabled ? 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed' : 'bg-green-300 hover:bg-green-400 hover:cursor-pointer'}
                                    `}
                             onClick={handleSubmit(submit)}
                        >
                            <p className="text-black font-grotesk">
                                Sign in
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps(context) {
    if (context.req.cookies.token) {
        return {redirect: {destination: '/dashboard', permanent: false}};
    }

    if (context.query?.username && context.query?.confirmationHash) {
        try {
            const FormData = require('form-data');

            const formData = new FormData();
            formData.append('username', context.query.username);
            formData.append('confirmationHash', context.query.confirmationHash);
            await axios.post(`${process.env.BACKEND_URL}/users/confirm-sign-up`, formData);
        } catch (error) {
            console.log('Failed to confirm sign up: ', error);
        }
    }

    return {props: {}}
}
