import React, {useState} from 'react';
import DashboardLayout from '../layout';
import axios from 'axios';
import {useRouter} from 'next/router';
import {useDispatch} from 'react-redux';
import toggleNotification from '../../../helpers/toggleNotification';

function DashboardCollections({user, items, collections}) {
    const router = useRouter();
    const dispatch = useDispatch();

    const [collectionsLocal, setCollectionsLocal] = useState(collections);

    const deleteCollection = async (id) => {
        try {
            const response = await axios.delete(`${process.env.BACKEND_URL}/collections/delete?id=${id}`, {withCredentials: true});
            const filteredCollections = [...collectionsLocal].filter((collection) => collection._id !== id);
            setCollectionsLocal(filteredCollections);
            toggleNotification(dispatch, response.data.message, 'success');
        } catch (error) {
            toggleNotification(dispatch, error.response.data.message, 'error');
        }
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl">Collections</h4>
                {
                    items.length &&
                    <div
                        className="w-16 h-16 flex justify-center items-center relative rounded-md bg-green-300 hover:cursor-pointer hover:bg-green-400"
                        onClick={() => router.push('/dashboard/collections/create')}
                    >
                        <img src="/plus.svg" className="w-8 h-8"/>
                    </div>
                }
            </div>
            <div className="h-24"></div>
            <div className="w-full relative">
                {
                    collectionsLocal.map((collection, index) => {
                        return (
                            <div key={`collection-${collection._id}`}>
                                <div
                                    className="w-full h-12 md:h-16 rounded-md border border-black p-2 flex justify-between">
                                    <div className="flex items-center">
                                        <div className="w-8 md:w-12 h-8 md:h-12 rounded-sm bg-center bg-cover"
                                             style={{backgroundImage: `url(${process.env.IMAGES_URL}/240_${collection.image})`}}></div>
                                        <p className="ml-4 text-black font-grotesk text-lg truncate">{collection.name}</p>
                                    </div>
                                    <div className="flex items-center"
                                         onClick={() => deleteCollection(collection._id)}
                                    >
                                        <div
                                            className="w-8 md:w-12 h-8 md:h-12 rounded-sm border border-gray-300 flex items-center justify-center hover:border-red-300 hover:cursor-pointer">
                                            <img src="/trash.svg" className="w-4 md:w-6 h-4 md:h-6"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-4"></div>
                            </div>
                        )
                    })
                }
                {
                    items.length
                        ?
                        <div
                            className="w-full h-12 md:h-16 rounded-md border border-black p-2 flex justify-center items-center hover:cursor-pointer hover:border-2"
                            onClick={() => router.push('/dashboard/collections/create')}
                        >
                            <div className="flex items-center">
                                <div className="w-8 md:w-12 h-8 md:h-12 flex items-center justify-center">
                                    <img src="/plus.svg" className="w-4 md:w-6 h-4 md:h-6"/>
                                </div>
                            </div>
                            <p className="ml-4 text-black font-grotesk text-base md:text-lg truncate">Add collection</p>
                        </div>
                        :
                        <>
                            <p className="font-grotesk text-lg">*You have to create items to create a Collection</p>
                            <div className="h-2"></div>
                            <div
                                className="w-full h-12 md:h-16 rounded-md border border-black p-2 flex justify-center items-center hover:cursor-pointer hover:border-2"
                                onClick={() => router.push('/dashboard/items/create')}
                            >
                                <div className="flex items-center">
                                    <div className="w-8 md:w-12 h-8 md:h-12 flex items-center justify-center">
                                        <img src="/plus.svg" className="w-4 md:w-6 h-4 md:h-6"/>
                                    </div>
                                </div>
                                <p className="ml-4 text-black font-grotesk text-base md:text-lg truncate">Add item</p>
                            </div>
                        </>
                }
            </div>
        </div>
    );
}

DashboardCollections.getLayout = function (page) {
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

        const collectionsResponse = await axios.get(`${process.env.BACKEND_URL}/collections/get-many?username=${props.user.username}`, {withCredentials: true});
        props.collections = collectionsResponse.data.data.collections;
    } catch (error) {
        console.log('Failed to fetch collections: ', error);
    }

    return {props};
}

export default DashboardCollections;
