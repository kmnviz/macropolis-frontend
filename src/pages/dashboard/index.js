import {useForm} from 'react-hook-form';
import React, {useEffect, useState} from 'react';
import Input from '../../components/input';
import FileInput from '../../components/fileInput';
import axios from 'axios';
import FormData from 'form-data';
import DashboardLayout from './layout';
import jwt from 'jsonwebtoken';
import Button from '../../components/button';
import validateImage from '../../helpers/validateImage';

const DashboardProfile = ({profile}) => {
    const {register, handleSubmit, formState: {errors}, setError, setValue, clearErrors} = useForm();
    const [avatarTemp, setAvatarTemp] = useState(profile?.avatar && profile.avatar !== '' ? `${process.env.IMAGES_URL}/240_${profile.avatar}` : '');
    const [initialAvatar, setInitialAvatar] = useState(profile?.avatar && profile.avatar !== '' ? `${process.env.IMAGES_URL}/240_${profile.avatar}` : '');
    const [hasInitialAvatar, setHasInitialAvatar] = useState(profile?.avatar && profile.avatar !== '');
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

            if (!hasInitialAvatar) {
                formData.append('avatar', avatarInput ? avatarInput : '');
            } else {
                if (!initialAvatar)
                    formData.append('avatar', avatarInput ? avatarInput : '');
            }

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
            if (!validateImage(event.target.files[0], 4 * 1024 * 1024)) {
                setAvatarTemp('');
                setAvatarInput(null);
                setError('avatar', {
                    type: 'custom',
                    message: 'Accepted image formats: jpg, jpeg, png. Maximum size 4MB'
                });
            } else {
                clearErrors('avatar');
                setAvatarTemp(URL.createObjectURL(event.target.files[0]));
                setAvatarInput(event.target.files[0]);
            }
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
        <div className="w-full">
                <div className="w-full h-16 flex justify-between items-center">
                    <h4 className="font-grotesk font-bold text-4xl">Profile</h4>
                </div>
                <div className="h-24"></div>
                <div className="flex flex-col mt-4">
                    <div
                        className={`w-32 h-32 relative rounded-md border border-black duration-100 
                                  ${!initialAvatar && 'hover:cursor-pointer hover:border-gray-900 hover:border-2'}
                                  ${errors?.avatar && 'border-red-300'}`}
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
                        errors?.avatar &&
                        <p className="text-xs font-grotesk text-red-300 mt-1">{errors.avatar.message}</p>
                    }
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
                <Button
                    disabled={Object.keys(errors).length || formButtonDisabled}
                    submit={handleSubmit(submit)}
                    text="Save"
                />
            </div>
    );
}

DashboardProfile.getLayout = function (page) {
    return (
        <DashboardLayout user={page.props.user}>
            {page}
        </DashboardLayout>
    );
}

export async function getServerSideProps(context) {
    const props = {};

    if (!context.req.cookies?.token) {
        return {redirect: {destination: '/', permanent: false}};
    }

    try {
        const userResponse = await axios.get(`${process.env.BACKEND_URL}/users/get?withPlan=true`, {
            headers: {
                'Cookie': context.req.headers.cookie
            },
            withCredentials: true
        });
        props.user = userResponse.data.data.user;

        const response = await axios.get(`${process.env.BACKEND_URL}/profiles/get?username=${props.user.username}`, { withCredentials: true });
        props.profile = response.data.data.profile;
    } catch (error) {
        console.log('Failed to fetch profile: ', error);
    }

    return {props};
}

export default DashboardProfile;
