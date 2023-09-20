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
import {useDispatch} from 'react-redux';
import toggleNotification from '../../../helpers/toggleNotification';
import Web3 from 'web3';
import {ethers} from 'ethers';

function DashboardNftMint({user}) {
    const router = useRouter();
    const dispatch = useDispatch();

    const nftTypesOptions = [
        { key: '.jpg, .jpeg, .png', value: 'image' },
    ];

    const [selectedNftTypeOption, setSelectedNftTypeOption] = useState(null);
    const {register, handleSubmit, formState: {errors}, reset, setError, clearErrors} = useForm();
    const [imageTemp, setImageTemp] = useState('');
    const [imageInput, setImageInput] = useState(null);
    const [nftInput, setNftInput] = useState(null);
    const [formButtonDisabled, setFormButtonDisabled] = useState(false);
    const [formButtonLoading, setFormButtonLoading] = useState(false);
    const [metamaskAccount, setMetamaskAccount] = useState('');

    useEffect(() => {
        if (selectedNftTypeOption) {
            handlePriceInput();
        }
    }, [selectedNftTypeOption]);

    const submit = async (data) => {
        setFormButtonDisabled(true);
        setFormButtonLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('price', data.price);
            formData.append('type', selectedNftTypeOption.value);
            formData.append('senderAddress', metamaskAccount);
            if (imageInput) formData.append('image', imageInput);
            if (nftInput) formData.append('nft', nftInput);
            if (data?.description && data.description) formData.append('description', data.description);

            const response = await axios.post(`${process.env.BACKEND_URL}/nft/create-metadata`, formData, {withCredentials: true});
            await mintNft(response.data.data.tokenUri);

            toggleNotification(dispatch, response.data.message, 'success');
            router.push('/dashboard/nft');
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

    const handleNftChange = (event) => {
        if (event.target.files.length) {
            let validated = false, message = '';
            if (selectedNftTypeOption.value === 'image') {
                validated = validateImage(event.target.files[0], 4 * 1024 * 1024);
                message = 'Accepted image formats: jpg, jpeg, png. Maximum size 4MB';
            }

            if (!validated) {
                setNftInput(null);
                setError('nft', {
                    type: 'custom',
                    message: message
                });
            } else {
                clearErrors('nft');
                setNftInput(event.target.files[0]);
            }
        } else {
            setNftInput(null);
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
        setSelectedNftTypeOption(event);
    }

    const nftIconSrc = () => {
        if (selectedNftTypeOption.value === 'image') {
            return '/document-plus.svg';
        }
    }

    useEffect(() => {
        getMetamaskAccount();
    }, []);

    const isMetamaskUnlocked = async () => {
        return 'ethereum' in window && await window.ethereum._metamask.isUnlocked();
    }

    const isMetamaskInstalled = () => {
        return typeof window.ethereum !== 'undefined';
    }

    const getMetamaskAccount = async () => {
        if (isMetamaskInstalled() && await isMetamaskUnlocked()) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setMetamaskAccount(accounts[0]);
        }
    }

    const mintNft = async (tokenUri) => {
        const contractAbi = require('../../../contracts/macropolisNFTAbi.json');
        const contractAddress = process.env.MACROPOLIS_NFT_CONTRACT_ADDRESS;
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractAbi, signer);

        try {
            await contract.safeMint(account, tokenUri);
        } catch (error) {
            console.log('error: ', error);
            throw new Error('Minting failed');
        }
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl">NFT / Mint</h4>
                <div
                    className="w-16 h-16 flex justify-center items-center relative rounded-md bg-green-300 hover:cursor-pointer hover:bg-green-400"
                    onClick={() => router.push('/dashboard/nft')}>
                    <img src="/arrow-left.svg" className="w-8 h-8"/>
                </div>
            </div>
            <div className="h-8"></div>
            {
                !selectedNftTypeOption
                ?
                    <Select
                        label="NFT type"
                        name="nftType"
                        placeholder={selectedNftTypeOption ? selectedNftTypeOption.key : 'Select NFT type'}
                        options={nftTypesOptions}
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
                    ${errors?.nft && 'border-red-300'}
                    `}
                                onClick={() => document.getElementById('nft').click()}
                            >
                                {
                                    !nftInput &&
                                    <div
                                        className="w-full h-full absolute z-0 flex flex-col justify-center items-center">
                                        <img src={nftIconSrc()} className="w-8 h-8"/>
                                        <p className="text-sm font-poppins">Select NFT</p>
                                    </div>
                                }
                                {
                                    !nftInput
                                        ?
                                        <div className="w-full h-full absolute z-10"></div>
                                        :
                                        <div
                                            className="w-full h-full absolute z-10 flex justify-center items-center">
                                            <p className="w-full text-sm font-poppins overflow-hidden break-words">{nftInput.name}</p>
                                        </div>
                                }
                                <FileInput
                                    name="nft"
                                    register={register}
                                    errors={errors}
                                    validationSchema={{}}
                                    onFileInputChange={handleNftChange}
                                />
                            </div>
                        </div>
                        {
                            errors?.image &&
                            <p className="text-xs font-grotesk text-red-300 mt-1">{errors.image.message}</p>
                        }
                        {
                            errors?.nft &&
                            <p className="text-xs font-grotesk text-red-300 mt-1">{errors.nft.message}</p>
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
                                text="Mint"
                            />
                        </div>
                    </>
            }
        </div>
    );
}

DashboardNftMint.getLayout = function (page) {
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

export default DashboardNftMint;
