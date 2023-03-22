import {useForm} from 'react-hook-form';
import React, {useEffect, useState} from 'react';
import Input from '../input';
import FileInput from '../fileInput';
import axios from 'axios';
import FormData from 'form-data';

export default function DashboardItems({user, items}) {
    const {register, handleSubmit, formState: {errors}, setValue} = useForm();
    const [itemsLocal, setItemsLocal] = useState(items);
    const [imageTemp, setImageTemp] = useState('');
    const [imageInput, setImageInput] = useState(null);
    const [audioInput, setAudioInput] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const submit = async (data) => {
        if (!Object.keys(errors).length) {
            try {
                const formData = new FormData();
                formData.append('name', data.name);
                formData.append('price', data.price);
                if (imageInput) formData.append('image', imageInput);
                if (audioInput) formData.append('audio', audioInput);

                await axios.post(`${process.env.BACKEND_URL}/items/create`, formData, {withCredentials: true});
                const itemsResponse = await axios.get(`${process.env.BACKEND_URL}/items/get-many?username=${user.username}`, {withCredentials: true});

                setItemsLocal(itemsResponse.data.data.items);
                setShowForm(false);
            } catch (error) {
                console.log('Failed to create items: ', error);
            }
        }
    }

    const handleImageChange = (event) => {
        if (event.target.files.length) {
            setImageTemp(URL.createObjectURL(event.target.files[0]));
            setImageInput(event.target.files[0]);
        } else {
            setImageTemp('');
            setImageInput(null);
        }
    }

    const handleAudioChange = (event) => {
        if (event.target.files.length) {
            setAudioInput(event.target.files[0]);
        } else {
            setAudioInput(null);
        }
    }

    const deleteItem = async (id) => {
        try {
            await axios.delete(`${process.env.BACKEND_URL}/items/delete?id=${id}`, {withCredentials: true});
            const filteredItems = [...itemsLocal].filter((item) => item._id !== id);
            setItemsLocal(filteredItems);
        } catch (error) {
            console.log('Failed to delete item: ', error);
        }
    }

    return (
        <>
            <div className="container">
                <div className="w-full">
                    <div className="bg-gray-100 px-8 py-4">
                        <h2 className="text-2xl font-poppins font-bold">Items</h2>
                    </div>
                    <section className="px-8 py-16">
                        {
                            !showForm ?
                                <div className="grid grid-cols-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-32 h-32 relative border border-gray-500 rounded-md hover:border-blue-500
                                hover:cursor-pointer duration-100 flex flex-col items center"
                                             onClick={() => setShowForm(true)}
                                        >
                                            <div
                                                className="w-full h-full absolute z-0 flex flex-col justify-center items-center">
                                                <img src="/plus.svg" className="w-8 h-8"/>
                                                <p className="text-sm font-poppins">Add item</p>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        itemsLocal.map((item, index) => {
                                            return (
                                                <div className="flex flex-col items-center" key={index}>
                                                    <div className="w-32 h-32 relative">
                                                        <div
                                                            className="w-full h-full absolute z-0 bg-cover bg-center rounded-md"
                                                            style={{backgroundImage: `url(${process.env.IMAGES_URL}/240_${item.image})`}}
                                                        ></div>
                                                        {
                                                            item?.audio_preview &&
                                                            <div className="w-8 h-8 absolute top-2 right-2 border border-black
                                                        rounded hover:cursor-pointer hover:border-red-500"
                                                                 onClick={() => item?.audio_preview && deleteItem(item._id)}
                                                            >
                                                                <div
                                                                    className="w-full h-full absolute z-10 flex justify-center items-center">
                                                                    <img src="/trash.svg" className="w-4 h-4"/>
                                                                </div>
                                                                <div
                                                                    className="w-full h-full z-0 absolute bg-white opacity-50 rounded-sm"></div>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                :
                                <div className="grid grid-cols-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-32 h-32 relative border border-gray-500 rounded-md hover:border-blue-500
                                hover:cursor-pointer duration-100 flex flex-col items center"
                                             onClick={() => document.getElementById('image').click()}
                                        >
                                            {
                                                !imageTemp &&
                                                <div
                                                    className="w-full h-full absolute z-0 flex flex-col justify-center items-center">
                                                    <img src="/photo.svg" className="w-8 h-8"/>
                                                    <p className="text-sm font-poppins">Select image</p>
                                                </div>
                                            }
                                            {
                                                !imageTemp
                                                    ?
                                                    <div className="w-full h-full absolute z-10"></div>
                                                    :
                                                    <div className="w-full h-full absolute z-10 bg-cover bg-center"
                                                         style={{backgroundImage: `url(${imageTemp})`}}></div>
                                            }
                                            <FileInput
                                                name="image"
                                                register={register}
                                                errors={errors}
                                                validationSchema={{}}
                                                onFileInputChange={handleImageChange}
                                            />
                                        </div>

                                        <div className="w-32 h-32 mt-4 relative border border-gray-500 rounded-md hover:border-blue-500
                                hover:cursor-pointer duration-100 flex flex-col items center"
                                             onClick={() => document.getElementById('audio').click()}
                                        >
                                            {
                                                !audioInput &&
                                                <div
                                                    className="w-full h-full absolute z-0 flex flex-col justify-center items-center">
                                                    <img src="/play.svg" className="w-8 h-8"/>
                                                    <p className="text-sm font-poppins">Select audio</p>
                                                </div>
                                            }
                                            {
                                                !audioInput
                                                    ?
                                                    <div className="w-full h-full absolute z-10"></div>
                                                    :
                                                    <div
                                                        className="w-full h-full absolute z-10 flex justify-center items-center">
                                                        <p className="w-full text-sm font-poppins overflow-hidden break-words">{audioInput.name}</p>
                                                    </div>
                                            }
                                            <FileInput
                                                name="audio"
                                                register={register}
                                                errors={errors}
                                                validationSchema={{}}
                                                onFileInputChange={handleAudioChange}
                                            />
                                        </div>
                                    </div>
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
                                        <div className="w-full mt-4">
                                            <Input
                                                name="price"
                                                label="Price"
                                                register={register}
                                                errors={errors}
                                                validationSchema={{
                                                    required: 'Price is required',
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
                                        <div
                                            className="w-full h-10 mt-4 rounded-md flex justify-center items-center group hover:cursor-pointer"
                                            onClick={() => setShowForm(false)}
                                        >
                                            <p className="font-poppins text-blue-500 group-hover:text-blue-400">
                                                Cancel
                                            </p>
                                        </div>
                                    </div>
                                </div>
                        }
                    </section>
                </div>
            </div>
        </>
    );
}
