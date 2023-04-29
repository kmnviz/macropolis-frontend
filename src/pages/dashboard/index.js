import {useForm} from 'react-hook-form';
import React, {useEffect, useState} from 'react';
import Input from '../../components/input';
import FileInput from '../../components/fileInput';
import axios from 'axios';
import FormData from 'form-data';
import DashboardLayout from './layout';
import Button from '../../components/button';
import validateImage from '../../helpers/validateImage';

const DashboardProfile = ({profile}) => {
    const {register, handleSubmit, formState: {errors}, setError, setValue, clearErrors} = useForm();
    const [avatarTemp, setAvatarTemp] = useState(profile?.avatar && profile.avatar !== '' ? `${process.env.IMAGES_URL}/240_${profile.avatar}` : '');
    const [initialAvatar, setInitialAvatar] = useState(profile?.avatar && profile.avatar !== '' ? `${process.env.IMAGES_URL}/240_${profile.avatar}` : '');
    const [hasInitialAvatar, setHasInitialAvatar] = useState(profile?.avatar && profile.avatar !== '');
    const [avatarInput, setAvatarInput] = useState(null);

    const [backgroundTemp, setBackgroundTemp] = useState(profile?.background && profile.background !== '' ? `${process.env.IMAGES_URL}/240_${profile.background}` : '');
    const [initialBackground, setInitialBackground] = useState(profile?.background && profile.background !== '' ? `${process.env.IMAGES_URL}/240_${profile.background}` : '');
    const [hasInitialBackground, setHasInitialBackground] = useState(profile?.background && profile.background !== '');
    const [backgroundInput, setBackgroundInput] = useState(null);

    const [formButtonDisabled, setFormButtonDisabled] = useState(false);
    const [formButtonLoading, setFormButtonLoading] = useState(false);

    useEffect(() => {
        if (profile?.name && profile.name) setValue('name', profile.name);
    }, [profile]);

    const submit = async (data) => {
        setFormButtonDisabled(true);
        setFormButtonLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', data.name);

            if (!hasInitialAvatar) {
                formData.append('avatar', avatarInput ? avatarInput : '');
            } else {
                if (!initialAvatar) {
                    formData.append('avatar', avatarInput ? avatarInput : '');
                }
            }

            if (!hasInitialBackground) {
                formData.append('background', backgroundInput ? backgroundInput : '');
            } else {
                if (!initialAvatar) {
                    formData.append('background', backgroundInput ? backgroundInput : '');
                }
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
                setFormButtonLoading(false);
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

    const handleBackgroundChange = (event) => {
        if (event.target.files.length) {
            if (!validateImage(event.target.files[0], 4 * 1024 * 1024)) {
                setBackgroundTemp('');
                setBackgroundInput(null);
                setError('background', {
                    type: 'custom',
                    message: 'Accepted image formats: jpg, jpeg, png. Maximum size 4MB'
                });
            } else {
                clearErrors('background');
                setBackgroundTemp(URL.createObjectURL(event.target.files[0]));
                setBackgroundInput(event.target.files[0]);
            }
        } else {
            setBackgroundTemp('');
            setBackgroundInput(null);
        }
    }

    const clearInitialAvatar = () => {
        setInitialAvatar('');
        setAvatarTemp('');
    }

    const clearInitialBackground = () => {
        setInitialBackground('');
        setBackgroundTemp('');
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl">Profile</h4>
            </div>
            <div className="h-24"></div>

            <div className="w-full flex mt-4">
                <div className="flex flex-col">
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
                                    <p className="text-sm font-poppins text-center">Select avatar</p>
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
                <div className="flex flex-col ml-4">
                    <div
                        className={`w-32 h-32 relative rounded-md border border-black duration-100 
                                  ${!initialBackground && 'hover:cursor-pointer hover:border-gray-900 hover:border-2'}
                                  ${errors?.background && 'border-red-300'}`}
                        onClick={() => !initialBackground && document.getElementById('background').click()}
                    >
                        {
                            !backgroundTemp
                                ?
                                <div
                                    className="w-full h-full absolute flex flex-col justify-center items-center rounded-md z-0">
                                    <img src="/photo.svg" className="w-8 h-8 rounder-full"/>
                                    <p className="text-sm font-poppins text-center">Select background</p>
                                </div>
                                :
                                <div
                                    className="w-full h-full absolute rounded-md z-10 bg-cover bg-center"
                                    style={{backgroundImage: `url(${backgroundTemp})`}}
                                >
                                </div>
                        }
                        {
                            !initialBackground &&
                            <FileInput
                                name="background"
                                register={register}
                                errors={errors}
                                validationSchema={{}}
                                onFileInputChange={handleBackgroundChange}
                            />
                        }
                    </div>
                    {
                        errors?.background &&
                        <p className="text-xs font-grotesk text-red-300 mt-1">{errors.background.message}</p>
                    }
                    {
                        initialBackground &&
                        <p className="w-24 mt-2 text-sm font-poppins text-blue-500 hover:cursor-pointer"
                           onClick={() => clearInitialBackground()}
                        >
                            Change
                        </p>
                    }
                </div>
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
                loading={formButtonLoading}
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

        const response = await axios.get(`${process.env.BACKEND_URL}/profiles/get?username=${props.user.username}`, {withCredentials: true});
        props.profile = response.data.data.profile;
    } catch (error) {
        console.log('Failed to fetch profile: ', error);
    }

    return {props};
}

export default DashboardProfile;
