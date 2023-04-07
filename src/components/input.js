import React from 'react';

export default function Input({ name, label, placeholder, register, validationSchema, errors, icon }) {

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
                    {
                        icon &&
                        <div className="w-8 md:w-16 h-12 md:h-16 absolute top-0 left-0 border-r border-black flex justify-center items-center">
                            <img src={`/${icon}.svg`} className="w-4 md:w-4 h-4 md:h4"/>
                        </div>
                    }
                    <input
                        type="text"
                        id={name}
                        name={name}
                        placeholder={placeholder}
                        className={`block w-full mt-1 h-12 md:h-16 px-2 md:px-4 border rounded-md border-black focus:outline-none focus:border-gray-900
                    focus:border-2 bg-transparent font-grotesk text-base md:text-2xl ${icon && 'pl-10 md:pl-20'} ${!errors?.[name] ? 'border-black-500' : 'border-red-300'}`}
                        {...register(name, validationSchema)}
                    />
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