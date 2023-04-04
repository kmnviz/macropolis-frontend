import {useForm} from 'react-hook-form';
import React, {useEffect, useState} from 'react';
import Input from '../../components/input';
import FileInput from '../../components/fileInput';
import axios from 'axios';
import FormData from 'form-data';
import DashboardLayout from './layout';
import jwt from 'jsonwebtoken';
import Decimal from 'decimal.js';

export default function DashboardItems({user, items}) {
    const {register, handleSubmit, formState: {errors}, setValue, reset} = useForm();
    const [itemsLocal, setItemsLocal] = useState(items);
    const [imageTemp, setImageTemp] = useState('');
    const [imageInput, setImageInput] = useState(null);
    const [audioInput, setAudioInput] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formButtonDisabled, setFormButtonDisabled] = useState(false);

    useEffect(() => {
        if (showForm) {
            handlePriceInput();
        }
    }, [showForm]);

    const submit = async (data) => {
        setFormButtonDisabled(true);

        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('price', data.price);
            if (imageInput) formData.append('image', imageInput);
            if (audioInput) formData.append('audio', audioInput);

            await axios.post(`${process.env.BACKEND_URL}/items/create`, formData, {withCredentials: true});
            const itemsResponse = await axios.get(`${process.env.BACKEND_URL}/items/get-many?username=${user.username}`, {withCredentials: true});

            setItemsLocal(itemsResponse.data.data.items);
            setTimeout(() => {
                setFormButtonDisabled(false);
                setShowForm(false);
                reset();
                setImageTemp('');
                setImageInput(null);
                setAudioInput(null);
            }, 1000);
        } catch (error) {
            setFormButtonDisabled(false);
            console.log('Failed to create items: ', error);
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

    const handlePriceInput = () => {
        const priceInputElement = document.getElementById('price');
        if (priceInputElement) {
            priceInputElement.addEventListener('input', (event) => {
                let value = event.target.value.replace(/[^\d]/g, '').replace(/^0+/, '');
                let integerPart = value.slice(0, -2);
                let decimalPart = value.slice(-2).padStart(2, '0');
                value = integerPart + '.' + decimalPart;
                event.target.value = value;
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="w-full">
                <div className="w-full h-16 flex justify-between items-center">
                    <h4 className="font-grotesk font-bold text-4xl">Items</h4>
                    <div
                        className="w-16 h-16 flex justify-center items-center relative rounded-md bg-green-300 hover:cursor-pointer hover:bg-green-400"
                        onClick={() => setShowForm(!showForm)}>
                        {
                            !showForm
                                ?
                                <img src="/plus.svg" className="w-8 h-8"/>
                                :
                                <img src="/arrow-left.svg" className="w-8 h-8"/>
                        }
                    </div>
                </div>
                <div className="h-24"></div>
                {
                    !showForm
                        ?
                        <div className="w-full relative">
                            {
                                itemsLocal.map((item, index) => {
                                    return (
                                        <div key={index}>
                                            <div
                                                className="w-full h-16 rounded-md border border-black p-2 flex justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 rounded-sm bg-center bg-cover"
                                                         style={{backgroundImage: `url(${process.env.IMAGES_URL}/240_${item.image})`}}></div>
                                                    <p className="ml-4 text-black font-grotesk text-lg truncate">{item.name}</p>
                                                </div>
                                                <div className="flex items-center">
                                                    <div
                                                        className="w-12 h-12 rounded-sm border border-gray-300 flex items-center justify-center hover:border-red-300 hover:cursor-pointer">
                                                        <img src="/trash.svg" className="w-6 h-6"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-4"></div>
                                        </div>
                                    )
                                })
                            }
                            <div
                                className="w-full h-16 rounded-md border border-black p-2 flex justify-center items-center hover:cursor-pointer hover:border-2"
                                onClick={() => setShowForm(!showForm)}
                            >
                                <div className="flex items-center">
                                    <div className="w-12 h-12 flex items-center justify-center">
                                        <img src="/plus.svg" className="w-6 h-6"/>
                                    </div>
                                </div>
                                <p className="ml-4 text-black font-grotesk text-lg truncate">Add item</p>
                            </div>
                        </div>
                        :
                        <>
                            <div className="flex items-center">
                                <div className="w-32 h-32 relative border border-gray-500 rounded-md hover:cursor-pointer hover:border-gray-900 hover:border-2 flex flex-col items center"
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

                                <div className="w-32 h-32 ml-4 relative border border-gray-500 rounded-md hover:cursor-pointer hover:border-gray-900 hover:border-2 flex flex-col items center"
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
                            <div className="h-4"></div>
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
                                        icon="dollar"
                                        register={register}
                                        errors={errors}
                                        validationSchema={{
                                            required: 'Price is required',
                                            pattern: {
                                                value: /^-?\d+(?:\.\d+)?$/,
                                                message: 'Must be a number'
                                            }
                                        }}
                                    />
                                </div>
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
                        </>
                }


            </div>
            {/*            <div className="container">*/}
            {/*                <div className="bg-white p-6 rounded-2xl">*/}
            {/*                    <h2 className="text-2xl font-poppins font-bold">Items</h2>*/}
            {/*                    <div className="w-full h-px bg-gray-300 mt-4"></div>*/}
            {/*                    <div className="mt-4"></div>*/}
            {/*                    {*/}
            {/*                        !showForm ?*/}
            {/*                            <div className="grid grid-cols-4">*/}
            {/*                                <div className="flex flex-col items-center">*/}
            {/*                                    <div className="w-32 h-32 relative border border-gray-500 rounded-md hover:border-blue-500*/}
            {/*                            hover:cursor-pointer duration-100 flex flex-col items center"*/}
            {/*                                         onClick={() => setShowForm(true)}*/}
            {/*                                    >*/}
            {/*                                        <div*/}
            {/*                                            className="w-full h-full absolute z-0 flex flex-col justify-center items-center">*/}
            {/*                                            <img src="/plus.svg" className="w-8 h-8"/>*/}
            {/*                                            <p className="text-sm font-poppins">Add item</p>*/}
            {/*                                        </div>*/}
            {/*                                    </div>*/}
            {/*                                </div>*/}
            {/*                                {*/}
            {/*                                    itemsLocal.map((item, index) => {*/}
            {/*                                        return (*/}
            {/*                                            <div className="flex flex-col items-center" key={index}>*/}
            {/*                                                <div className="w-32 h-32 relative">*/}
            {/*                                                    <div*/}
            {/*                                                        className="w-full h-full absolute z-0 bg-cover bg-center rounded-md"*/}
            {/*                                                        style={{backgroundImage: `url(${process.env.IMAGES_URL}/240_${item.image})`}}*/}
            {/*                                                    ></div>*/}
            {/*                                                    {*/}
            {/*                                                        item?.audio_preview &&*/}
            {/*                                                        <div className="w-8 h-8 absolute top-2 right-2 border border-black*/}
            {/*                                                    rounded hover:cursor-pointer hover:border-red-500"*/}
            {/*                                                             onClick={() => item?.audio_preview && deleteItem(item._id)}*/}
            {/*                                                        >*/}
            {/*                                                            <div*/}
            {/*                                                                className="w-full h-full absolute z-10 flex justify-center items-center">*/}
            {/*                                                                <img src="/trash.svg" className="w-4 h-4"/>*/}
            {/*                                                            </div>*/}
            {/*                                                            <div*/}
            {/*                                                                className="w-full h-full z-0 absolute bg-white opacity-50 rounded-sm"></div>*/}
            {/*                                                        </div>*/}
            {/*                                                    }*/}
            {/*                                                </div>*/}
            {/*                                                <p className="w-32 text-left">{item.name}</p>*/}
            {/*                                                <p className="w-32 text-left">{item.price}</p>*/}
            {/*                                            </div>*/}
            {/*                                        )*/}
            {/*                                    })*/}
            {/*                                }*/}
            {/*                            </div>*/}
            {/*                            :*/}
            {/*                            <div className="grid grid-cols-3">*/}
            {/*                                <div className="flex flex-col items-center">*/}
            {/*                                    <div className="w-32 h-32 relative border border-gray-500 rounded-md hover:border-blue-500*/}
            {/*                            hover:cursor-pointer duration-100 flex flex-col items center"*/}
            {/*                                         onClick={() => document.getElementById('image').click()}*/}
            {/*                                    >*/}
            {/*                                        {*/}
            {/*                                            !imageTemp &&*/}
            {/*                                            <div*/}
            {/*                                                className="w-full h-full absolute z-0 flex flex-col justify-center items-center">*/}
            {/*                                                <img src="/photo.svg" className="w-8 h-8"/>*/}
            {/*                                                <p className="text-sm font-poppins">Select image</p>*/}
            {/*                                            </div>*/}
            {/*                                        }*/}
            {/*                                        {*/}
            {/*                                            !imageTemp*/}
            {/*                                                ?*/}
            {/*                                                <div className="w-full h-full absolute z-10"></div>*/}
            {/*                                                :*/}
            {/*                                                <div className="w-full h-full absolute z-10 bg-cover bg-center"*/}
            {/*                                                     style={{backgroundImage: `url(${imageTemp})`}}></div>*/}
            {/*                                        }*/}
            {/*                                        <FileInput*/}
            {/*                                            name="image"*/}
            {/*                                            register={register}*/}
            {/*                                            errors={errors}*/}
            {/*                                            validationSchema={{}}*/}
            {/*                                            onFileInputChange={handleImageChange}*/}
            {/*                                        />*/}
            {/*                                    </div>*/}

            {/*                                    <div className="w-32 h-32 mt-4 relative border border-gray-500 rounded-md hover:border-blue-500*/}
            {/*                            hover:cursor-pointer duration-100 flex flex-col items center"*/}
            {/*                                         onClick={() => document.getElementById('audio').click()}*/}
            {/*                                    >*/}
            {/*                                        {*/}
            {/*                                            !audioInput &&*/}
            {/*                                            <div*/}
            {/*                                                className="w-full h-full absolute z-0 flex flex-col justify-center items-center">*/}
            {/*                                                <img src="/play.svg" className="w-8 h-8"/>*/}
            {/*                                                <p className="text-sm font-poppins">Select audio</p>*/}
            {/*                                            </div>*/}
            {/*                                        }*/}
            {/*                                        {*/}
            {/*                                            !audioInput*/}
            {/*                                                ?*/}
            {/*                                                <div className="w-full h-full absolute z-10"></div>*/}
            {/*                                                :*/}
            {/*                                                <div*/}
            {/*                                                    className="w-full h-full absolute z-10 flex justify-center items-center">*/}
            {/*                                                    <p className="w-full text-sm font-poppins overflow-hidden break-words">{audioInput.name}</p>*/}
            {/*                                                </div>*/}
            {/*                                        }*/}
            {/*                                        <FileInput*/}
            {/*                                            name="audio"*/}
            {/*                                            register={register}*/}
            {/*                                            errors={errors}*/}
            {/*                                            validationSchema={{}}*/}
            {/*                                            onFileInputChange={handleAudioChange}*/}
            {/*                                        />*/}
            {/*                                    </div>*/}
            {/*                                </div>*/}
            {/*                                <div className="flex flex-col items-center">*/}
            {/*                                    <div className="w-full">*/}
            {/*                                        <Input*/}
            {/*                                            name="name"*/}
            {/*                                            label="Name"*/}
            {/*                                            register={register}*/}
            {/*                                            errors={errors}*/}
            {/*                                            validationSchema={{*/}
            {/*                                                required: 'Name is required',*/}
            {/*                                            }}*/}
            {/*                                        />*/}
            {/*                                    </div>*/}
            {/*                                    <div className="w-full mt-4">*/}
            {/*                                        <Input*/}
            {/*                                            name="price"*/}
            {/*                                            label="Price"*/}
            {/*                                            register={register}*/}
            {/*                                            errors={errors}*/}
            {/*                                            validationSchema={{*/}
            {/*                                                required: 'Price is required',*/}
            {/*                                            }}*/}
            {/*                                        />*/}
            {/*                                    </div>*/}
            {/*                                    <div className={`w-full h-10 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 mt-10*/}
            {/*flex justify-center items-center ${Object.keys(errors).length && 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed'}`}*/}
            {/*                                         onClick={handleSubmit(submit)}*/}
            {/*                                    >*/}
            {/*                                        <p className="text-white font-poppins">*/}
            {/*                                            Save*/}
            {/*                                        </p>*/}
            {/*                                    </div>*/}
            {/*                                    <div*/}
            {/*                                        className="w-full h-10 mt-4 rounded-md flex justify-center items-center group hover:cursor-pointer"*/}
            {/*                                        onClick={() => setShowForm(false)}*/}
            {/*                                    >*/}
            {/*                                        <p className="font-poppins text-blue-500 group-hover:text-blue-400">*/}
            {/*                                            Cancel*/}
            {/*                                        </p>*/}
            {/*                                    </div>*/}
            {/*                                </div>*/}
            {/*                            </div>*/}
            {/*                    }*/}
            {/*                </div>*/}
            {/*            </div>*/}
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
        const response = await axios.get(`${process.env.BACKEND_URL}/items/get-many?username=${props.user.username}`, {withCredentials: true});
        props.items = response.data.data.items;
    } catch (error) {
        console.log('Failed to fetch items: ', error);
    }

    return {props};
}