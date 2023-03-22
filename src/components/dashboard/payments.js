import {useForm} from 'react-hook-form';
import React, {useEffect, useState} from 'react';
import Input from '../input';
import FileInput from '../fileInput';
import axios from 'axios';
import FormData from 'form-data';

export default function DashboardPayments({profile}) {
    const {register, handleSubmit, formState: {errors}, setValue} = useForm();

    const submit = async (data) => {

    }

    return (
        <>
            <div className="container">
                <div className="w-full">
                    <div className="bg-gray-100 px-8 py-4">
                        <h2 className="text-2xl font-poppins font-bold">Payments</h2>
                    </div>
                    <section className="px-8 py-16">
                        <div className="grid grid-cols-3">
                            <div className="flex flex-col items-center">
                                <div className="w-full">
                                    <Input
                                        name="name"
                                        label="Name"
                                        register={register}
                                        errors={errors}
                                        validationSchema={{
                                            required: 'Name is required',
                                        }}
                                    />
                                </div>
                                <div className={`w-full h-10 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 mt-10
  flex justify-center items-center ${Object.keys(errors).length && 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed'}`}
                                     onClick={handleSubmit(submit)}
                                >
                                    <p className="text-white font-poppins">
                                        Save
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}
