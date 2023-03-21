import {useForm} from 'react-hook-form';
import React, {useEffect, useState} from 'react';
import Input from '../input';
import FileInput from '../fileInput';
import axios from 'axios';

export default function DashboardProfile({profile}) {
    const {register, handleSubmit, formState: {errors}, setValue} = useForm();
    const [avatarTemp, setAvatarTemp] = useState(profile?.avatar && profile.avatar !== '' ? `${process.env.IMAGES_URL}/240_${profile.avatar}` : '');
    const [initialAvatar, setInitialAvatar] = useState(profile?.avatar && profile.avatar !== '' ? `${process.env.IMAGES_URL}/240_${profile.avatar}` : '');
    const [avatarInput, setAvatarInput] = useState(null);

    useEffect(() => {
        if (profile?.name && profile.name) setValue('name', profile.name);
    }, [profile]);

    const submit = async (data) => {
        if (!Object.keys(errors).length) {
            try {
                const FormData = require('form-data');
                const formData = new FormData();
                formData.append('name', data.name);
                if (avatarInput) formData.append('avatar', avatarInput);

                await axios.post(`${process.env.BACKEND_URL}/profiles/update`, formData, {withCredentials: true});
            } catch (error) {
                console.log('Failed to update profile: ', error);
            }
        }
    }

    const handleAvatarChange = (event) => {
        if (event.target.files.length) {
            setAvatarTemp(URL.createObjectURL(event.target.files[0]));
            setAvatarInput(event.target.files[0]);
        } else {
            setAvatarTemp('');
            setAvatarInput(null);
        }
    }

    const clearInitialAvatar = (event) => {
        setInitialAvatar('');
        setAvatarTemp('');
    }

    return (
        <>
            <div className="container h-full">
                <div className="w-full p-16">
                    <h2 className="text-2xl font-poppins font-bold">Profile</h2>
                    <section className="mt-12">
                        <div className="grid grid-cols-3">
                            <div className="flex justify-center flex-col">
                                <div
                                    className={`w-24 h-24 relative rounded-full border border-gray-500 duration-100 
                                    ${!initialAvatar && 'hover:cursor-pointer hover:border-blue-500'}`}
                                    onClick={() => !initialAvatar && document.getElementById('avatar').click()}
                                >
                                    {
                                        !avatarTemp
                                            ?
                                            <div
                                                className="w-full h-full absolute flex justify-center items-center rounded-full z-0">
                                                <img src="/photo.svg" className="w-8 h-8 rounder-full"/>
                                            </div>
                                            :
                                            <div
                                                className="w-full h-full absolute rounded-full z-10 bg-cover bg-center"
                                                style={{backgroundImage: `url(${avatarTemp})`}}
                                            >
                                            </div>
                                    }
                                    {
                                        !initialAvatar &&
                                        <FileInput
                                            name="avatar"
                                            register={register}
                                            errors={errors}
                                            validationSchema={{}}
                                            onFileInputChange={handleAvatarChange}
                                        />
                                    }
                                </div>
                                {
                                    initialAvatar &&
                                    <p className="w-24 text-sm text-center font-poppins text-blue-500 hover:cursor-pointer"
                                       onClick={() => clearInitialAvatar()}
                                    >
                                        Change
                                    </p>
                                }
                                <div className="mt-4">
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
    );
}

export async function getServerSideProps(context) {
    const props = {};

    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/profiles/get?username=${res.user.username}`, {withCredentials: true});
        props.profile = response.data.data.profile;

        console.log('response: ', response);
    } catch (error) {
        console.log('Failed to fetch profile: ', error);
    }

    return {props: {}}
}
