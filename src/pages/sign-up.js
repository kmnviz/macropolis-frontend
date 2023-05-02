import axios from 'axios';
import Input from '../components/input';
import PasswordInput from '../components/passwordInput';
import {useForm} from 'react-hook-form';
import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Header from '../components/header';
import Button from '../components/button';

export default function SignUp() {
    const router = useRouter();

    const {register, handleSubmit, formState: {errors}, setError, setValue} = useForm();
    const [predefinedUsername, setPredefinedUsername] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formButtonDisabled, setFormButtonDisabled] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (router.query?.username) {
            setValue('username', router.query.username);
            setPredefinedUsername(router.query.username);
            animatePageOverlay();
        }
    }, [errors]);

    const submit = async (data) => {
        setFormButtonDisabled(true);

        try {
            await axios.post(`${process.env.BACKEND_URL}/users/sign-up`, {
                username: data.username,
                email: data.email,
                password: data.password
            });

            setTimeout(() => {
                setFormButtonDisabled(false);
                setFormSubmitted(true);
                setEmail(data.email);
            }, 1000);
        } catch (error) {
            setFormButtonDisabled(false);
            if (error.response.status === 409) {
                setError('username', {
                    type: 'custom',
                    message: error.response.data.message
                });
                setError('email', {
                    type: 'custom',
                    message: error.response.data.message
                });
            }

            console.log('Failed to sign up: ', error);
        }
    }

    const animatePageOverlay = () => {
        const pageOverlayElement = document.getElementById('page-overlay');
        if (pageOverlayElement) {
            pageOverlayElement.style.transition = 'width 0.5s';
            pageOverlayElement.classList.add('w-0');
            pageOverlayElement.classList.remove('w-full');
        }
    }

    return (
        <>
            <Head>
                <title>{`${process.env.APP_NAME} - sign up`}</title>
            </Head>
            <div className="w-screen min-h-screen relative flex justify-center">
                {
                    router.query?.username &&
                    <div id="page-overlay" className="w-full h-full absolute right-0 z-40 bg-black"></div>
                }
                <div className="w-full max-w-screen-2xl">
                    <Header router={router} />
                    <div className="w-full flex flex-col items-center mt-24">
                        {
                            !formSubmitted
                                ?
                                <form className="w-full md:w-576 p-2">
                                    <h6 className="font-grotesk text-xl">Sign up</h6>
                                    <div className="h-4"></div>
                                    {
                                        !predefinedUsername ?
                                            <Input
                                                name="username"
                                                label="Username"
                                                register={register}
                                                errors={errors}
                                                validationSchema={{
                                                    required: 'Username is required',
                                                    minLength: {
                                                        value: 6,
                                                        message: 'Username must be at least 6 characters long'
                                                    },
                                                    pattern: {
                                                        value: /^[a-zA-Z0-9_]*$/i,
                                                        message: 'Username can include only alphanumeric characters and "_"'
                                                    }
                                                }}
                                            />
                                            :
                                            <div className="w-full relative">
                                                <label htmlFor="username" className="text-sm font-grotesk">username</label>
                                                <div className="block w-full mt-1 h-12 md:h-16 px-4 border rounded-md border-black focus:outline-none focus:border-blue-500
                                                focus:border-2 bg-black flex items-center text-base md:text-2xl">
                                                    <p className="font-grotesk text-white">{predefinedUsername}</p>
                                                </div>
                                            </div>
                                    }
                                    <div className="h-4"></div>
                                    <Input
                                        name="email"
                                        label="email"
                                        register={register}
                                        errors={errors}
                                        validationSchema={{
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
                                                message: 'Must be a valid email address'
                                            }
                                        }}
                                    />
                                    <div className="h-4"></div>
                                    <PasswordInput
                                        name="password"
                                        label="password"
                                        register={register}
                                        errors={errors}
                                        validationSchema={{
                                            required: 'Password is required',
                                            minLength: {
                                                value: 8,
                                                message: 'Password must be at least 8 characters long'
                                            }
                                        }}
                                    />
                                    <div className="h-10"></div>
                                    <Button
                                        disabled={Object.keys(errors).length > 0 || formButtonDisabled}
                                        submit={handleSubmit(submit)}
                                        text="Sign up"
                                    />
                                </form>
                                :
                                <div className="w-full md:w-576 p-2">
                                    <p className="text-xl md:text-4xl font-grotesk font-bold">Confirm your email address to get
                                        started</p>
                                    <p className="text-base md:text-lg mt-4">
                                        We have sent a confirmation request to <span
                                        className="text-blue-300">{email}</span> to verify that the email address belongs to
                                        you.
                                    </p>
                                </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps(context) {
    if (context.req.cookies.token) {
        return {redirect: {destination: '/dashboard', permanent: false}};
    }

    return {props: {}};
}
