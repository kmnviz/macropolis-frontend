import axios from 'axios';
import Input from '../components/input';
import PasswordInput from '../components/passwordInput';
import {useForm} from 'react-hook-form';
import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';
import Cookies from 'universal-cookie';

export default function SignUp() {
    const router = useRouter();

    const {register, handleSubmit, formState: {errors}, setError, setValue} = useForm();
    const [signUpConfirmed, setSignUpConfirmed] = useState(false);

    useEffect(() => {
        if (router.query?.username || router.query?.confirmationHash) {
            setValue('username', router.query.username);
            setSignUpConfirmed(true);
            router.push('/sign-in', undefined, { shallow: true });
        }
    }, []);


    const submit = async (data) => {
        if (!Object.keys(errors).length) {
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

                router.push('/dashboard');
            } catch (error) {
                console.log('Failed to sign in: ', error);
            }
        }
    }

    return (
        <>
            <div className="w-screen h-screen">
                <div className="w-full h-full flex flex-col justify-center items-center bg-sky-100">
                    {
                        signUpConfirmed &&
                        <div className="w-384 p-2">
                            <p className="text-2xl font-poppins font-bold">Email address was confirmed. Welcome!</p>
                        </div>
                    }
                    <form className="w-384 p-2">
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
                        <div className={`w-full h-10 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 mt-10
          flex justify-center items-center ${Object.keys(errors).length && 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed'}`}
                             onClick={handleSubmit(submit)}
                        >
                            <p className="text-white font-poppins">
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
        return { redirect: { destination: '/dashboard',  permanent: false } };
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

    return { props: {} }
}
