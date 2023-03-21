import React from 'react';

export default function FileInput({ name, register, validationSchema, errors, onFileInputChange }) {

    const handleChange = (event) => {
        onFileInputChange(event)
    }

    return (
        <>
            <div className="invisible">
                <input
                    type="file"
                    id={name}
                    name={name}
                    className="invisible w-0 h-0"
                    {...register(name, validationSchema)}
                    onChange={(event) => handleChange(event)}
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