import axios from 'axios';
import Input from '../components/input';
import PasswordInput from '../components/passwordInput';
import {useForm} from 'react-hook-form';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';

export default function SignUp() {
    const router = useRouter();

    const {register, handleSubmit, formState: {errors}, setError, setValue} = useForm();
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (router.query?.username) setValue('username', router.query.username);
    });

    const submit = async (data) => {
        if (!Object.keys(errors).length) {
            try {
                await axios.post(`${process.env.BACKEND_URL}/users/sign-up`, {
                    username: data.username,
                    email: data.email,
                    password: data.password
                });

                setFormSubmitted(true);
                setEmail(data.email);
            } catch (error) {
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
    }

    return (
        <>
            <div className="w-screen h-screen">
                <div className="w-full h-full flex flex-col justify-center items-center bg-sky-100">
                    {
                        !formSubmitted
                            ?
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
                                <div className="h-4"></div>
                                <PasswordInput
                                    name="password"
                                    label="Password"
                                    register={register}
                                    errors={errors}
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
                                        Sign up
                                    </p>
                                </div>
                            </form>
                            :
                            <div className="w-384 p-2">
                                <p className="text-2xl font-poppins font-bold">Confirm your email address to get started</p>
                                <p className="text-sm mt-2">
                                    We have sent a confirmation request to <span className="text-blue-500">{email}</span> to verify that email address is yours
                                </p>
                            </div>
                    }
                </div>
            </div>
        </>
    )
}