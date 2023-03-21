import axios from 'axios';
import Input from '../components/input';
import PasswordInput from '../components/passwordInput';
import {useForm} from 'react-hook-form';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';

export default function ForgotPassword() {
    const router = useRouter();

    const {register, handleSubmit, formState: {errors}, setError, setValue} = useForm();
    const [restorePasswordHash] = useState(router.query?.restorePasswordHash ? router.query.restorePasswordHash : null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [email, setEmail] = useState('');

    const submit = async (data) => {
        if (!Object.keys(errors).length) {
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

                router.push('/forgot-password');
            } catch (error) {
                console.log('Failed to send forgot password request: ', error);
            }
        }
    }

    return (
        <>
            <div className="w-screen h-screen">
                <div className="w-full h-full flex flex-col justify-center items-center bg-sky-100">
                    {
                        !formSubmitted
                            ?
                            <form className="w-384 p-2">
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

                                <div
                                    className={`w-full h-10 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 mt-10 flex justify-center items-center ${Object.keys(errors).length && 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed'}`}
                                    onClick={handleSubmit(submit)}
                                >
                                    {
                                        !restorePasswordHash
                                            ?
                                            <p className="text-white font-poppins">Request password reset link</p>
                                            :
                                            <p className="text-white font-poppins">Set new password</p>
                                    }
                                </div>
                            </form>
                            :
                            <div className="w-384 p-2">
                                {
                                    !restorePasswordHash
                                        ?
                                        <>
                                            <p className="text-2xl font-poppins font-bold">Check your email address</p>
                                            <p className="text-sm mt-2">
                                                We have sent a password reset link to <span
                                                className="text-blue-500">{email}</span>
                                            </p>
                                        </>
                                        :
                                        <>
                                            <p className="text-2xl font-poppins font-bold">You have successfully set
                                                your new password</p>
                                            <p className="text-sm mt-2">
                                                Now you can <span className="text-blue-500 hover:cursor-pointer"
                                                                  onClick={() => router.push('/sign-in')}>sign in</span>
                                            </p>
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
