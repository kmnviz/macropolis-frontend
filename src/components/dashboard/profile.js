import {useForm} from 'react-hook-form';
import React, {useEffect, useState} from 'react';
import Input from '../input';
import FileInput from '../fileInput';
import axios from 'axios';
import FormData from 'form-data';

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
            <div className="container">
                <div className="bg-white p-6 rounded-2xl">
                    <h2 className="text-2xl font-poppins font-bold">Profile</h2>
                    <div className="w-full h-px bg-gray-300 mt-4"></div>
                    <div className="flex flex-col justify-center items-center">
                        <div className="flex flex-col items-center mt-4">
                            <div
                                className={`w-32 h-32 relative rounded-full border border-gray-500 duration-100 
                                    ${!initialAvatar && 'hover:cursor-pointer hover:border-blue-500'}`}
                                onClick={() => !initialAvatar && document.getElementById('avatar').click()}
                            >
                                {
                                    !avatarTemp
                                        ?
                                        <div
                                            className="w-full h-full absolute flex flex-col justify-center items-center rounded-full z-0">
                                            <img src="/photo.svg" className="w-8 h-8 rounder-full"/>
                                            <p className="text-sm font-poppins">Select avatar</p>
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
                                <p className="w-24 mt-2 text-sm text-center font-poppins text-blue-500 hover:cursor-pointer"
                                   onClick={() => clearInitialAvatar()}
                                >
                                    Change
                                </p>
                            }
                        </div>
                        <div className="w-96">
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
                        <div className={`w-96 h-10 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 mt-4
  flex justify-center items-center ${Object.keys(errors).length && 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed'}`}
                             onClick={handleSubmit(submit)}
                        >
                            <p className="text-white font-poppins">
                                Save
                            </p>
                        </div>
                    </div>
                </div>
                {/*<div className="w-full">*/}
                {/*    <div className="px-8 py-4 bg-white">*/}
                {/*        <h2 className="text-2xl font-poppins font-bold">Profile</h2>*/}
                {/*    </div>*/}
                {/*    <div className="w-full h-px bg-gray-300"></div>*/}
                {/*                  <section className="px-8 py-16">*/}
                {/*                      <div className="grid grid-cols-3">*/}
                {/*                          <div className="flex flex-col items-center">*/}
                {/*                              <div*/}
                {/*                                  className={`w-32 h-32 relative rounded-full border border-gray-500 duration-100 */}
                {/*                                  ${!initialAvatar && 'hover:cursor-pointer hover:border-blue-500'}`}*/}
                {/*                                  onClick={() => !initialAvatar && document.getElementById('avatar').click()}*/}
                {/*                              >*/}
                {/*                                  {*/}
                {/*                                      !avatarTemp*/}
                {/*                                          ?*/}
                {/*                                          <div className="w-full h-full absolute flex flex-col justify-center items-center rounded-full z-0">*/}
                {/*                                              <img src="/photo.svg" className="w-8 h-8 rounder-full"/>*/}
                {/*                                              <p className="text-sm font-poppins">Select avatar</p>*/}
                {/*                                          </div>*/}
                {/*                                          :*/}
                {/*                                          <div*/}
                {/*                                              className="w-full h-full absolute rounded-full z-10 bg-cover bg-center"*/}
                {/*                                              style={{backgroundImage: `url(${avatarTemp})`}}*/}
                {/*                                          >*/}
                {/*                                          </div>*/}
                {/*                                  }*/}
                {/*                                  {*/}
                {/*                                      !initialAvatar &&*/}
                {/*                                      <FileInput*/}
                {/*                                          name="avatar"*/}
                {/*                                          register={register}*/}
                {/*                                          errors={errors}*/}
                {/*                                          validationSchema={{}}*/}
                {/*                                          onFileInputChange={handleAvatarChange}*/}
                {/*                                      />*/}
                {/*                                  }*/}
                {/*                              </div>*/}
                {/*                              {*/}
                {/*                                  initialAvatar &&*/}
                {/*                                  <p className="w-24 mt-2 text-sm text-center font-poppins text-blue-500 hover:cursor-pointer"*/}
                {/*                                     onClick={() => clearInitialAvatar()}*/}
                {/*                                  >*/}
                {/*                                      Change*/}
                {/*                                  </p>*/}
                {/*                              }*/}

                {/*                          </div>*/}
                {/*                          <div className="flex flex-col items-center">*/}
                {/*                              <div className="w-full">*/}
                {/*                                  <Input*/}
                {/*                                      name="name"*/}
                {/*                                      label="Name"*/}
                {/*                                      register={register}*/}
                {/*                                      errors={errors}*/}
                {/*                                      validationSchema={{*/}
                {/*                                          required: 'Name is required',*/}
                {/*                                      }}*/}
                {/*                                  />*/}
                {/*                              </div>*/}
                {/*                              <div className={`w-full h-10 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 mt-10*/}
                {/*flex justify-center items-center ${Object.keys(errors).length && 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed'}`}*/}
                {/*                                   onClick={handleSubmit(submit)}*/}
                {/*                              >*/}
                {/*                                  <p className="text-white font-poppins">*/}
                {/*                                      Save*/}
                {/*                                  </p>*/}
                {/*                              </div>*/}
                {/*                          </div>*/}
                {/*                      </div>*/}
                {/*                  </section>*/}
                {/*              </div>*/}
            </div>
        </>
    );
}
