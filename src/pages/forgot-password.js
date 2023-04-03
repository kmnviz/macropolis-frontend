import axios from 'axios';
import Input from '../components/input';
import PasswordInput from '../components/passwordInput';
import {useForm} from 'react-hook-form';
import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';

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
            <div className="w-screen h-screen">
                <div className="w-full">
                    <div className="w-full flex justify-between h-24">
                        <div className="h-full flex items-center px-8 hover:cursor-pointer"
                             onClick={() => router.push('/')}>
                            <img src="/next.svg" alt="logo" className="h-8"/>
                        </div>
                        <div className="h-full flex justify-end items-center">
                            <div
                                className="h-16 px-8 flex items-center font-poppins text-black mr-8 hover:cursor-pointer">Who
                                we serve?
                            </div>
                            <div
                                className="h-16 px-8 flex items-center font-poppins text-black mr-8 hover:cursor-pointer">What
                                we offer?
                            </div>
                            <div
                                className="h-16 px-8 flex items-center font-poppins mr-8 hover:cursor-pointer rounded-4xl border-2 border-black"
                                onClick={() => router.push('/sign-up')}>Sign up
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full h-full flex flex-col items-center mt-24">
                    {
                        !formSubmitted
                            ?
                            <form className="w-576 p-2">
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
                                <div className={`w-full h-16 rounded-md duration-100 mt-10
                                    flex justify-center items-center 
                                    ${Object.keys(errors).length ? 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed' : 'bg-green-300 hover:bg-green-400 hover:cursor-pointer'}
                                    `}
                                     onClick={handleSubmit(submit)}
                                >
                                    {
                                        !restorePasswordHash
                                            ?
                                            <p className="black font-grotesk">Request password reset link</p>
                                            :
                                            <p className="black font-grotesk">Set new password</p>
                                    }
                                </div>
                            </form>
                            :
                            <div className="w-576 p-2">
                                {
                                    !restorePasswordHash
                                        ?
                                        <>
                                            <div className="w-576 p-2">
                                                <p className="text-4xl font-grotesk font-bold">Check your email address</p>
                                                <p className="text-lg mt-4">
                                                    We have sent a password reset link to <span
                                                    className="text-blue-300">{email}</span>
                                                </p>
                                            </div>
                                        </>
                                        :
                                        <>
                                            <div className="w-576 p-2">
                                                <p className="text-4xl font-grotesk font-bold">You have successfully set
                                                    your new password</p>
                                                <p className="text-lg mt-4">
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
        </>
    )
}

export async function getServerSideProps(context) {
    if (context.req.cookies.token) {
        return { redirect: { destination: '/dashboard',  permanent: false } };
    }

    return { props: {} };
}
