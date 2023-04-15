import React, {useState} from 'react';
import {useRouter} from 'next/router';

export default function Input({ name, label, register, validationSchema, errors, forgotPassword = false }) {
    const router = useRouter();

    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
        const passwordInputElement = document.getElementById(name);
        passwordInputElement.type = passwordVisible ? 'password' : 'text';
    }

    return (
        <>
            <div className="w-full">
                <div className="w-full flex justify-between">
                    <label
                        htmlFor={name}
                        className="text-sm font-grotesk"
                    >
                        {label}
                    </label>
                    {
                        forgotPassword &&
                        <p className="text-sm font-grotesk text-blue-300 hover:cursor-pointer" onClick={() => router.push('/forgot-password')}>Forgot password</p>
                    }
                </div>
                <div className="w-full relative">
                    <input
                        type="password"
                        id={name}
                        name={name}
                        className={`block w-full mt-1 h-12 md:h-16 px-2 md:px-4 border rounded-md focus:outline-none focus:border-gray-900
                    focus:border-2 bg-transparent text-base md:text-2xl ${!errors?.[name] ? 'border-black' : 'border-red-300'}`}
                        {...register(name, validationSchema)}
                    />
                    <div className="w-8 md:w-8 h-8 md:h-12 absolute top-2 right-2 flex justify-center items-center">
                        <div className="w-full h-full absolute z-10 hover:cursor-pointer" onClick={togglePasswordVisibility}></div>
                        <div className="w-full h-full absolute z-0 flex justify-center items-center">
                            {
                                !passwordVisible
                                ?
                                <img src="/eye.svg" className="w-4 md:w-8 h-4 md:w-8"/>
                                :
                                <img src="/eye-slash.svg" className="w-4 md:w-8 h-4 md:w-8"/>
                            }
                        </div>
                    </div>
                </div>
                <div className={`w-full mt-1 ${!errors?.[name] ? 'hidden' : 'block'}`}>
                    <p className="text-xs font-grotesk text-red-300 mt-1">
                        {`${errors?.[name] ? errors[name].message : ''}`}
                    </p>
                </div>
            </div>
        </>
    )
}