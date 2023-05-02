import axios from 'axios';
import Input from '../components/input';
import PasswordInput from '../components/passwordInput';
import {useForm} from 'react-hook-form';
import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Header from '../components/header';
import Button from '../components/button';

export default function ForgotPassword() {
    const router = useRouter();

    const {register, handleSubmit, formState: {errors}, setError, setValue} = useForm();
    const [restorePasswordHash] = useState(router.query?.restorePasswordHash ? router.query.restorePasswordHash : null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formButtonDisabled, setFormButtonDisabled] = useState(false);
    const [email, setEmail] = useState('');

    const submit = async (data) => {
        setFormButtonDisabled(true);

        try {
            const postData = {};
            if (!restorePasswordHash) {
                postData.email = data.email;
            } else {
                postData.restorePasswordHash = restorePasswordHash;
                postData.newPassword = data.password;
            }

            await axios.post(`${process.env.BACKEND_URL}/users/forgot-password`, postData);
            setFormSubmitted(true);
            setEmail(data.email);

            setTimeout(() => {
                setFormButtonDisabled(false);
                router.push('/forgot-password');
            });
        } catch (error) {
            setFormButtonDisabled(false);
            console.log('Failed to send forgot password request: ', error);
        }
    }

    return (
        <>
            <Head>
                <title>{`${process.env.APP_NAME} - forgot password`}</title>
            </Head>
            <div className="w-screen min-h-screen relative flex justify-center">
                <div className="w-full max-w-screen-2xl">
                    <Header router={router}/>
                    <div className="w-full flex flex-col items-center mt-24">
                        {
                            !formSubmitted
                                ?
                                <form className="w-full md:w-576 p-2">
                                    {
                                        !restorePasswordHash
                                            ?
                                            <Input
                                                name="email"
                                                label="Email"
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
                                            :
                                            <PasswordInput
                                                name="password"
                                                label="Password"
                                                register={register}
                                                errors={errors}
                                                validationSchema={{
                                                    required: 'Password is required',
                                                    minLength: {
                                                        value: 8,
                                                        message: 'Password must be at least 8 characters long'
                                                    },
                                                }}
                                            />
                                    }
                                    <div className="h-10"></div>
                                    <Button
                                        disabled={Object.keys(errors).length || formButtonDisabled}
                                        submit={(handleSubmit(submit))}
                                        text={!restorePasswordHash ? 'Request password reset link' : 'Set new password'}
                                    />
                                </form>
                                :
                                <div className="w-full md:w-576 p-2">
                                    {
                                        !restorePasswordHash
                                            ?
                                            <>
                                                <div className="w-full md:w-576 p-2">
                                                    <p className="text-xl md:text-4xl font-grotesk font-bold">Check your
                                                        email address</p>
                                                    <p className="text-base md:text-lg mt-4">
                                                        We have sent a password reset link to <span
                                                        className="text-blue-300">{email}</span>
                                                    </p>
                                                </div>
                                            </>
                                            :
                                            <>
                                                <div className="w-full md:w-576 p-2">
                                                    <p className="text-xl md:text-4xl font-grotesk font-bold">You have
                                                        successfully set
                                                        your new password</p>
                                                    <p className="text-base: text-lg mt-4">
                                                        Now you can <span className="text-blue-300 hover:cursor-pointer"
                                                                          onClick={() => router.push('/sign-in')}>sign in</span>
                                                    </p>
                                                </div>
                                            </>
                                    }
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
