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
import itemTypesEnumerations from '../../../enumerations/itemTypes';

function DashboardCollectionsCreate({user, items}) {
    const router = useRouter();
    const dispatch = useDispatch();

    const [collectionTypesOptions, setCollectionTypesOptions] = useState([]);
    const [selectedCollectionTypeOption, setSelectedCollectionTypeOption] = useState(null);
    const {register, handleSubmit, formState: {errors}, reset, setError, clearErrors} = useForm();
    const [imageTemp, setImageTemp] = useState('');
    const [imageInput, setImageInput] = useState(null);
    const [formButtonDisabled, setFormButtonDisabled] = useState(false);
    const [formButtonLoading, setFormButtonLoading] = useState(false);
    const [itemsLocal, setItemsLocal] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        defineCollectionTypesOptions();
    }, []);

    useEffect(() => {
        if (selectedCollectionTypeOption) {
            handlePriceInput();
            setItemsLocal(items.filter((item) => item.type === selectedCollectionTypeOption.value));
        }
    }, [selectedCollectionTypeOption]);

    useEffect(() => {
        if (selectedItems.length) {
            clearErrors('items');
        }
    }, [selectedItems]);

    const submit = async (data) => {
        if (!selectedItems.length) {
            setError('items', {
                type: 'custom',
                message: 'You need to select at least on item to the collection'
            });
            return;
        }

        setFormButtonDisabled(true);
        setFormButtonLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('price', data.price);
            formData.append('type', selectedCollectionTypeOption.value);
            selectedItems.forEach((item) => {
                formData.append('items[]', item);
            });
            if (imageInput) formData.append('image', imageInput);
            if (data?.description && data.description) formData.append('description', data.description);

            const response = await axios.post(`${process.env.BACKEND_URL}/collections/create`, formData, {withCredentials: true});
            toggleNotification(dispatch, response.data.message, 'success');
            router.push('/dashboard/collections');
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
        setSelectedCollectionTypeOption(event);
    }

    const defineCollectionTypesOptions = () => {
        const options = [];
        if (items.filter((item) => item.type === itemTypesEnumerations.AUDIO).length) {
            options.push({ key: 'Audio collection', value: itemTypesEnumerations.AUDIO });
        }
        if (items.filter((item) => item.type === itemTypesEnumerations.ARCHIVE).length) {
            options.push({ key: 'Archive collection', value: itemTypesEnumerations.ARCHIVE });
        }

        setCollectionTypesOptions(options);
    }

    const toggleSelectedItem = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter((item) => item !== itemId));
        } else {
            const localSelectedItems = [...selectedItems];
            localSelectedItems.push(itemId);
            setSelectedItems(localSelectedItems);
        }
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl truncate">Collections / Add</h4>
                <div
                    className="w-16 h-16 flex justify-center items-center relative rounded-md bg-green-300 hover:cursor-pointer hover:bg-green-400"
                    onClick={() => router.push('/dashboard/collections')}>
                    <img src="/arrow-left.svg" className="w-8 h-8"/>
                </div>
            </div>
            <div className="h-24"></div>
            {
                !selectedCollectionTypeOption
                ?
                    <Select
                        label="Collection type"
                        name="collectionType"
                        placeholder={selectedCollectionTypeOption ? selectedCollectionTypeOption.key : 'Select collection type'}
                        options={collectionTypesOptions}
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
                        </div>
                        {
                            errors?.image &&
                            <p className="text-xs font-grotesk text-red-300 mt-1">{errors.image.message}</p>
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
                            <div className="w-full mt-4">
                                <div className="w-full relative">
                                    <label htmlFor="items" className="text-sm font-grotesk">Select items</label>
                                    <div className="h-1"></div>
                                    {
                                        itemsLocal.map((item, index) => {
                                            return (
                                                <div
                                                    key={`item-option-${item._id}`}
                                                    className={`block w-full h-6 md:h-8 px-1 md:px-2 border rounded-md border-black flex items-center
                                                    hover:cursor-pointer ${index < itemsLocal.length - 1 ? 'mb-2' : ''}`}
                                                    onClick={() => toggleSelectedItem(item._id)}
                                                >
                                                    <div className="h-4 w-4 mr-2">
                                                        {
                                                            selectedItems.includes(item._id) &&
                                                            <img src="/check.svg" />
                                                        }
                                                    </div>
                                                    <p className="font-grotesk text-sm">{item.name}</p>
                                                </div>
                                            );
                                        })
                                    }
                                    <div className={`w-full mt-1 ${!errors?.items ? 'hidden' : 'block'}`}>
                                        <p className="text-xs font-grotesk text-red-300 mt-1">
                                            {`${errors?.items ? errors.items.message : ''}`}
                                        </p>
                                    </div>
                                </div>
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

DashboardCollectionsCreate.getLayout = function (page) {
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

        const itemsResponse = await axios.get(`${process.env.BACKEND_URL}/items/get-many?username=${props.user.username}`, {withCredentials: true});
        props.items = itemsResponse.data.data.items;
    } catch (error) {
        console.log('Failed to fetch user: ', error);
    }

    return {props};
}

export default DashboardCollectionsCreate;
