import React from 'react';

export default function Input({ name, label, placeholder, register, validationSchema, errors }) {

    return (
        <>
            <div className="w-full relative">
                {
                    label &&
                    <label
                        htmlFor={name}
                        className="text-sm font-poppins"
                    >
                        {label}
                    </label>
                }
                <input
                    type="text"
                    id={name}
                    name={name}
                    placeholder={placeholder}
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