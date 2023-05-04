import React from 'react';
import {useEffect, useState} from 'react';

export default function TextArea({ name, label, placeholder, register, validationSchema, errors, counter = false, maxLength = 0 }) {

    const [count, setCount] = useState(0);

    useEffect(() => {
        const element = document.getElementById(name);
        element.addEventListener('input', (event) => {
            setCount(event.target.value.length);
        });
    }, []);

    return (
        <>
            <div className="w-full relative">
                {
                    label &&
                    <label
                        htmlFor={name}
                        className="text-sm font-grotesk"
                    >
                        {label}
                    </label>
                }
                <div className="w-full relative">
                    <textarea
                        id={name}
                        name={name}
                        placeholder={placeholder}
                        className={`block w-full mt-1 h-24 md:h-32 p-2 md:p-4 border rounded-md border-black focus:outline-none focus:border-gray-900
                    focus:border-2 bg-transparent font-grotesk text-base md:text-2xl ${!errors?.[name] ? 'border-black-500' : 'border-red-300'}`}
                        {...register(name, validationSchema)}
                    ></textarea>
                    {
                        counter && maxLength > 0 &&
                        <div className={`absolute bottom-1 right-1 p-1 shadow rounded select-none ${count > maxLength ? 'text-red-300' : ''}`}>{count}/{maxLength}</div>
                    }
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