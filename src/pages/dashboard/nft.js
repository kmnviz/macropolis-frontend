import React, {useState} from 'react';
import DashboardLayout from './layout';
import axios from 'axios';
import Input from '../../components/input';
import Button from '../../components/button';
import {useForm} from 'react-hook-form';
import {useDispatch} from 'react-redux';
import toggleNotification from '../../helpers/toggleNotification';
import validateEthereumAddress from '../../helpers/validateEthereumAddress';
import NftAddressesTypesEnumerations from '../../enumerations/nftAddressesTypes';

function DashboardNft({user, nft}) {
    const dispatch = useDispatch();
    const {register, handleSubmit, formState: {errors}, setError, reset} = useForm();

    const [showAddOwnerAddress, setShowAddOwnerAddress] = useState(false);
    const [showAddCollectionAddress, setShowAddCollectionAddress] = useState(false);
    const [formButtonDisabled, setFormButtonDisabled] = useState(false);
    const [formButtonLoading, setFormButtonLoading] = useState(false);
    const [addressType, setAddressType] = useState('');

    const hideForm = () => {
        setShowAddOwnerAddress(false);
        setShowAddCollectionAddress(false);
        setFormButtonDisabled(false);
        setFormButtonLoading(false);
        setAddressType('');
        reset();
    }

    const addOwnerAddress = () => {
        setShowAddOwnerAddress(true);
        setAddressType(NftAddressesTypesEnumerations.OWNER);
    }

    const addCollectionAddress = () => {
        setShowAddCollectionAddress(true);
        setAddressType(NftAddressesTypesEnumerations.COLLECTION);
    }

    const submit = async (data) => {
        if (!validateEthereumAddress(data.address)) {
            setError('address', {message: 'Invalid Ethereum address'});
        } else {
            setFormButtonDisabled(true);
            setFormButtonLoading(true);

            const formData = new FormData();
            formData.append('address', data.address);
            formData.append('type', addressType);

            try {
                const response = await axios.post(`${process.env.BACKEND_URL}/nft/create`, formData, {withCredentials: true});
                toggleNotification(dispatch, response.data.message, 'success');

                setTimeout(() => {
                    setFormButtonDisabled(false);
                    setFormButtonLoading(false);
                    window.location.reload();
                }, 1000);
            } catch (error) {
                toggleNotification(dispatch, error.response.data.message, 'error');
            }
        }
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl">NFT</h4>
            </div>
            <div className="h-24"></div>
            <div className="w-full">
                {
                    (!showAddOwnerAddress && !showAddCollectionAddress)
                    ?
                        <>
                            <div className="w-full flex justify-between items-center">
                                <h6 className="font-grotesk text-lg">Owner addresses</h6>
                                <div
                                    className="px-4 py-0.5 rounded-md bg-green-300 hover:cursor-pointer hover:bg-green-400"
                                    onClick={() => addOwnerAddress(true)}
                                >
                                    <p className="font-grotesk text-lg text-center select-none">add</p>
                                </div>
                            </div>
                            <div className="h-4"></div>
                            {
                                (nft && nft?.owner && nft.owner.length > 0)
                                    ?
                                    nft.owner.map((address) => {
                                        return (
                                            <div className="p-2 rounded-md border border-black">
                                                <p className="font-grotesk">{address}</p>
                                            </div>
                                        );
                                    })
                                    :
                                    <p className="font-grotesk text-sm">* You have no added owner addresses yet</p>
                            }
                            <div className="h-24"></div>
                            <div className="w-full flex justify-between items-center">
                                <h6 className="font-grotesk text-lg">Collections addresses</h6>
                                <div
                                    className="px-4 py-0.5 rounded-md bg-green-300 hover:cursor-pointer hover:bg-green-400"
                                    onClick={() => addCollectionAddress(true)}
                                >
                                    <p className="font-grotesk text-lg text-center select-none">add</p>
                                </div>
                            </div>
                            <div className="h-4"></div>
                            {
                                (nft && nft?.collection && nft.collection.length > 0)
                                    ?
                                    nft.collection.map((address) => {
                                        return (
                                            <div className="p-2 rounded-md border border-black">
                                                <p className="font-grotesk">{address}</p>
                                            </div>
                                        );
                                    })
                                    :
                                    <p className="font-grotesk text-sm">* You have no added collections addresses yet</p>
                            }
                        </>
                        :
                        <>
                            <div className="w-full">
                                <div className="w-full flex justify-between items-center">
                                    <h6 className="font-grotesk text-lg">Enter an address</h6>
                                    <div
                                        className="px-4 h-8 flex items-center rounded-md border hover:border-black hover:cursor-pointer"
                                        onClick={() => hideForm()}
                                    >
                                        <img src="/arrow-left.svg" className="w-4 h-4"/>
                                    </div>
                                </div>
                                <div className="h-8"></div>
                                <Input
                                    name="address"
                                    label="Address"
                                    register={register}
                                    errors={errors}
                                    validationSchema={{
                                        required: 'Address is required',
                                    }}
                                />
                                <div className="h-10"></div>
                                <Button
                                    disabled={Object.keys(errors).length || formButtonDisabled}
                                    loading={formButtonLoading}
                                    submit={handleSubmit(submit)}
                                    text="Confirm"
                                />
                            </div>
                        </>
                }
            </div>
        </div>
    );
}

DashboardNft.getLayout = function (page) {
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

        const nftResponse = await axios.get(`${process.env.BACKEND_URL}/nft/get?username=${props.user.username}`, {withCredentials: true});
        props.nft = nftResponse.data.data.nft;
    } catch (error) {
        console.log('Failed to fetch NFT: ', error);
    }

    return {props};
}

export default DashboardNft;
