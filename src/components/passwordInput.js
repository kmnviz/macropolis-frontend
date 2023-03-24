import React from 'react';
import {useRouter} from 'next/router';

export default function Input({ name, label, register, validationSchema, errors, forgotPassword = false }) {
    const router = useRouter();

    return (
        <>
            <div className="w-full">
                <div className="w-full flex justify-between">
                    <label
                        htmlFor={name}
                        className="text-sm font-poppins"
                    >
                        {label}
                    </label>
                    {
                        forgotPassword &&
                        <p className="text-sm font-poppins text-blue-500 hover:cursor-pointer" onClick={() => router.push('/forgot-password')}>Forgot password</p>
                    }
                </div>
                <input
                    type="password"
                    id={name}
                    name={name}
                    className={`block w-full mt-1 h-12 px-2 border rounded-md border-gray-500 focus:outline-none focus:border-blue-500
                    focus:border-2 ${!errors?.[name] ? 'border-gray-500' : 'border-red-500'}`}
                    {...register(name, validationSchema)}
                />
                <div className={`w-full mt-1 ${!errors?.[name] ? 'hidden' : 'block'}`}>
                    <p className="text-xs font-poppins text-red-500 mt-1">
                        {`${errors?.[name] ? errors[name].message : ''}`}
                    </p>
                </div>
            </div>
        </>
    )
}