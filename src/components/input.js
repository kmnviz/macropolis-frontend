import React from 'react';

export default function Input({ name, label, placeholder, register, validationSchema, errors }) {

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
                <input
                    type="text"
                    id={name}
                    name={name}
                    placeholder={placeholder}
                    className={`block w-full mt-1 h-16 px-2 border rounded-md border-black focus:outline-none focus:border-gray-900
                    focus:border-2 bg-transparent font-grotesk ${!errors?.[name] ? 'border-black-500' : 'border-red-300'}`}
                    {...register(name, validationSchema)}
                />
                <div className={`w-full mt-1 ${!errors?.[name] ? 'hidden' : 'block'}`}>
                    <p className="text-xs font-grotesk text-red-300 mt-1">
                        {`${errors?.[name] ? errors[name].message : ''}`}
                    </p>
                </div>
            </div>
        </>
    )
}