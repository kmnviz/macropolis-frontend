import {useForm} from 'react-hook-form';
import React, {useEffect, useState} from 'react';
import Input from '../../components/input';
import FileInput from '../../components/fileInput';
import axios from 'axios';
import FormData from 'form-data';
import DashboardLayout from './layout';
import jwt from "jsonwebtoken";

export default function DashboardProfile({profile}) {
    const {register, handleSubmit, formState: {errors}, setValue} = useForm();
    const [avatarTemp, setAvatarTemp] = useState(profile?.avatar && profile.avatar !== '' ? `${process.env.IMAGES_URL}/240_${profile.avatar}` : '');
    const [initialAvatar, setInitialAvatar] = useState(profile?.avatar && profile.avatar !== '' ? `${process.env.IMAGES_URL}/240_${profile.avatar}` : '');
    const [avatarInput, setAvatarInput] = useState(null);
    const [formButtonDisabled, setFormButtonDisabled] = useState(false);

    useEffect(() => {
        if (profile?.name && profile.name) setValue('name', profile.name);
    }, [profile]);

    const submit = async (data) => {
        setFormButtonDisabled(true);

        try {
            const formData = new FormData();
            formData.append('name', data.name);
            if (avatarInput) formData.append('avatar', avatarInput);

            await axios.post(`${process.env.BACKEND_URL}/profiles/update`, formData, {
                withCredentials: true,
                headers: {
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Origin': '*',
                    'SameSite': 'None',
                    'Secure': true
                }
            });

            setTimeout(() => {
                setFormButtonDisabled(false);
            }, 1000);
        } catch (error) {
            setFormButtonDisabled(false);
            console.log('Failed to update profile: ', error);
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

    const clearInitialAvatar = () => {
        setInitialAvatar('');
        setAvatarTemp('');
    }

    return (
        <DashboardLayout>
            <div className="w-full">
                <div className="w-full h-16 flex justify-between items-center">
                    <h4 className="font-grotesk font-bold text-4xl">Profile</h4>
                </div>
                <div className="h-24"></div>
                <div className="flex flex-col mt-4">
                    <div
                        className={`w-32 h-32 relative rounded-md border border-black duration-100 
                                                      ${!initialAvatar && 'hover:cursor-pointer hover:border-gray-900 hover:border-2'}`}
                        onClick={() => !initialAvatar && document.getElementById('avatar').click()}
                    >
                        {
                            !avatarTemp
                                ?
                                <div
                                    className="w-full h-full absolute flex flex-col justify-center items-center rounded-md z-0">
                                    <img src="/photo.svg" className="w-8 h-8 rounder-full"/>
                                    <p className="text-sm font-poppins">Select avatar</p>
                                </div>
                                :
                                <div
                                    className="w-full h-full absolute rounded-md z-10 bg-cover bg-center"
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
                        <p className="w-24 mt-2 text-sm font-poppins text-blue-500 hover:cursor-pointer"
                           onClick={() => clearInitialAvatar()}
                        >
                            Change
                        </p>
                    }
                </div>
                <div className="h-4"></div>
                <Input
                    name="name"
                    label="Name"
                    register={register}
                    errors={errors}
                    validationSchema={{
                        required: 'Name is required',
                    }}
                />
                <div className="h-10"></div>
                <div className={`w-full h-16 rounded-md duration-100
                    flex justify-center items-center 
                    ${Object.keys(errors).length || formButtonDisabled ? 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed' : 'bg-green-300 hover:bg-green-400 hover:cursor-pointer'}
                    `}
                     onClick={handleSubmit(submit)}
                >
                    <p className="text-black font-grotesk">Save</p>
                </div>
            </div>
        </DashboardLayout>
    );
}

export async function getServerSideProps(context) {
    const props = {};

    if (context.req.cookies?.token) {
        props.user = jwt.decode(context.req.cookies.token);
    } else {
        return {redirect: {destination: '/', permanent: false}};
    }

    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/profiles/get?username=${props.user.username}`, { withCredentials: true });
        props.profile = response.data.data.profile;
    } catch (error) {
        console.log('Failed to fetch profile: ', error);
    }

    return {props};
}
