import axios from 'axios';
import FormData from 'form-data';
import {useForm} from 'react-hook-form';
import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Input from '../../../components/input';
import FileInput from '../../../components/fileInput';
import DashboardLayout from '../layout';
import Button from '../../../components/button';
import Select from '../../../components/select';
import TextArea from '../../../components/textArea';
import validateImage from '../../../helpers/validateImage';
import validateAudio from '../../../helpers/validateAudio';
import validateArchive from '../../../helpers/validateArchive';
import {useDispatch} from 'react-redux';
import toggleNotification from '../../../helpers/toggleNotification';

function DashboardItemsCreate({user}) {
    const router = useRouter();
    const dispatch = useDispatch();

    const itemTypesOptions = [
        { key: '.zip, .rar', value: 'archive' },
        { key: '.wav, .flac, .aiff', value: 'audio' },
    ];

    const [selectedItemTypeOption, setSelectedItemTypeOption] = useState(null);
    const {register, handleSubmit, formState: {errors}, reset, setError, clearErrors} = useForm();
    const [imageTemp, setImageTemp] = useState('');
    const [imageInput, setImageInput] = useState(null);
    const [itemInput, setItemInput] = useState(null);
    const [formButtonDisabled, setFormButtonDisabled] = useState(false);
    const [formButtonLoading, setFormButtonLoading] = useState(false);

    useEffect(() => {
        if (selectedItemTypeOption) {
            handlePriceInput();
        }
    }, [selectedItemTypeOption]);

    const submit = async (data) => {
        setFormButtonDisabled(true);
        setFormButtonLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('price', data.price);
            formData.append('type', selectedItemTypeOption.value);
            if (imageInput) formData.append('image', imageInput);
            if (itemInput) formData.append('item', itemInput);
            if (data?.description && data.description) formData.append('description', data.description);

            const response = await axios.post(`${process.env.BACKEND_URL}/items/create`, formData, {withCredentials: true});
            toggleNotification(dispatch, response.data.message, 'success');
            router.push('/dashboard/items');
        } catch (error) {
            setFormButtonDisabled(false);
            setFormButtonLoading(false);
            toggleNotification(dispatch, error.response.data.message, 'error');
        }
    }

    const handleImageChange = (event) => {
        if (event.target.files.length) {
            if (!validateImage(event.target.files[0], 4 * 1024 * 1024)) {
                setImageTemp('');
                setImageInput(null);
                setError('image', {
                    type: 'custom',
                    message: 'Accepted image formats: jpg, jpeg, png. Maximum size 4MB'
                });
            } else {
                clearErrors('image');
                setImageTemp(URL.createObjectURL(event.target.files[0]));
                setImageInput(event.target.files[0]);
            }
        } else {
            setImageTemp('');
            setImageInput(null);
        }
    }

    const handleItemChange = (event) => {
        if (event.target.files.length) {
            let validated = false, message = '';
            if (selectedItemTypeOption.value === 'archive') {
                validated = validateArchive(event.target.files[0], 200 * 1024 * 1024);
                message = 'Accepted archive formats: zip, rar. Maximum size 200MB';
            } else if (selectedItemTypeOption.value === 'audio') {
                validated = validateAudio(event.target.files[0], 200 * 1024 * 1024);
                message = 'Accepted archive formats: wav, flac, aiff. Maximum size 200MB';
            }

            if (!validated) {
                setItemInput(null);
                setError('item', {
                    type: 'custom',
                    message: message
                });
            } else {
                clearErrors('item');
                setItemInput(event.target.files[0]);
            }
        } else {
            setItemInput(null);
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

                if (value && value !== '.00') {
                    clearErrors('price');
                }
            });
        }
    };

    const handleSelectEvent = (event) => {
        setSelectedItemTypeOption(event);
    }

    const itemIconSrc = () => {
        if (selectedItemTypeOption.value === 'archive') {
            return '/archive.svg';
        } else if (selectedItemTypeOption.value === 'audio') {
            return '/play.svg';
        }
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl">Items / Add</h4>
                <div
                    className="w-16 h-16 flex justify-center items-center relative rounded-md bg-green-300 hover:cursor-pointer hover:bg-green-400"
                    onClick={() => router.push('/dashboard/items')}>
                    <img src="/arrow-left.svg" className="w-8 h-8"/>
                </div>
            </div>
            <div className="h-24"></div>
            {
                !selectedItemTypeOption
                ?
                    <Select
                        label="Item type"
                        name="itemType"
                        placeholder={selectedItemTypeOption ? selectedItemTypeOption.key : 'Select item type'}
                        options={itemTypesOptions}
                        onSelect={(event) => handleSelectEvent(event)}
                    />
                    :
                    <>
                        <div className="flex items-center">
                            <div
                                className={`w-32 h-32 relative border border-gray-500 rounded-md hover:cursor-pointer hover:border-gray-900 hover:border-2 flex flex-col items center
                    ${errors?.image && 'border-red-300'}`}
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

                            <div
                                className={`w-32 h-32 ml-4 relative border border-gray-500 rounded-md hover:cursor-pointer hover:border-gray-900 hover:border-2 flex flex-col items center
                    ${errors?.item && 'border-red-300'}
                    `}
                                onClick={() => document.getElementById('item').click()}
                            >
                                {
                                    !itemInput &&
                                    <div
                                        className="w-full h-full absolute z-0 flex flex-col justify-center items-center">
                                        <img src={itemIconSrc()} className="w-8 h-8"/>
                                        <p className="text-sm font-poppins">Select item</p>
                                    </div>
                                }
                                {
                                    !itemInput
                                        ?
                                        <div className="w-full h-full absolute z-10"></div>
                                        :
                                        <div
                                            className="w-full h-full absolute z-10 flex justify-center items-center">
                                            <p className="w-full text-sm font-poppins overflow-hidden break-words">{itemInput.name}</p>
                                        </div>
                                }
                                <FileInput
                                    name="item"
                                    register={register}
                                    errors={errors}
                                    validationSchema={{}}
                                    onFileInputChange={handleItemChange}
                                />
                            </div>
                        </div>
                        {
                            errors?.image &&
                            <p className="text-xs font-grotesk text-red-300 mt-1">{errors.image.message}</p>
                        }
                        {
                            errors?.item &&
                            <p className="text-xs font-grotesk text-red-300 mt-1">{errors.item.message}</p>
                        }
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
                                <TextArea
                                    name="description"
                                    label="Description"
                                    counter={true}
                                    maxLength={200}
                                    register={register}
                                    errors={errors}
                                    validationSchema={{
                                        maxLength: {
                                            value: 200,
                                            message: 'Maximum 200 characters'
                                        }
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
                            <Button
                                disabled={Object.keys(errors).length || formButtonDisabled}
                                loading={formButtonLoading}
                                submit={handleSubmit(submit)}
                                text="Save"
                            />
                        </div>
                    </>
            }
        </div>
    );
}

DashboardItemsCreate.getLayout = function (page) {
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
        const response = await axios.get(`${process.env.BACKEND_URL}/users/get?withPlan=true`, {
            headers: {
                'Cookie': context.req.headers.cookie
            },
            withCredentials: true
        });
        props.user = response.data.data.user;
    } catch (error) {
        console.log('Failed to fetch user: ', error);
    }

    return {props};
}

export default DashboardItemsCreate;
