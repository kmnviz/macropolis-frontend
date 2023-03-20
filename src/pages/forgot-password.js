import axios from 'axios';
import Input from '../components/input';
import PasswordInput from '../components/passwordInput';
import {useForm} from 'react-hook-form';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';

export default function ForgotPassword() {
    const {register, handleSubmit, formState: {errors}, setError, setValue} = useForm();
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [email, setEmail] = useState('');

    const submit = async (data) => {
        if (!Object.keys(errors).length) {
            try {
                await axios.post(`${process.env.BACKEND_URL}/users/forgot-password`, {
                    email: data.email,
                });
                setFormSubmitted(true);
                setEmail(data.email);
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
                                <div className={`w-full h-10 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 mt-10 flex justify-center items-center ${Object.keys(errors).length && 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed'}`}
                                     onClick={handleSubmit(submit)}
                                >
                                    <p className="text-white font-poppins">Request password reset link</p>
                                </div>
                    </form>
                        :
                        <div className="w-384 p-2">
                            <p className="text-2xl font-poppins font-bold">Check your email address</p>
                            <p className="text-sm mt-2">
                                We have sent a password reset link to <span className="text-blue-500">{email}</span>
                            </p>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps(context) {
    const props = {};



    return { props };
}

