import React, {useState} from 'react';
import {useRouter} from 'next/router';
import axios from 'axios';
import DashboardLayout from '../layout';

function DashboardItems({user, items}) {
    const router = useRouter();

    const [itemsLocal, setItemsLocal] = useState(items);

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
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl">Items</h4>
                <div
                    className="w-16 h-16 flex justify-center items-center relative rounded-md bg-green-300 hover:cursor-pointer hover:bg-green-400"
                    onClick={() => router.push('/dashboard/items/create')}
                >
                    <img src="/plus.svg" className="w-8 h-8"/>
                </div>
            </div>
            <div className="h-24"></div>
            <p className="font-grotesk text-xl text-right">[{itemsLocal.length}/{user.plan.items}]</p>
            <div className="h-8"></div>
            <div className="w-full relative">
                {
                    itemsLocal.map((item, index) => {
                        return (
                            <div key={index}>
                                <div
                                    className="w-full h-12 md:h-16 rounded-md border border-black p-2 flex justify-between">
                                    <div className="flex items-center">
                                        <div className="w-8 md:w-12 h-8 md:h-12 rounded-sm bg-center bg-cover"
                                             style={{backgroundImage: `url(${process.env.IMAGES_URL}/240_${item.image})`}}></div>
                                        <p className="ml-4 text-black font-grotesk text-lg truncate">{item.name}</p>
                                    </div>
                                    <div className="flex items-center"
                                         onClick={() => item?.audio_preview && deleteItem(item._id)}>
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
            </div>
        </div>
    );
}

DashboardItems.getLayout = function (page) {
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

        const response = await axios.get(`${process.env.BACKEND_URL}/items/get-many?username=${props.user.username}`, {withCredentials: true});
        props.items = response.data.data.items;
    } catch (error) {
        console.log('Failed to fetch items: ', error);
    }

    return {props};
}

export default DashboardItems;
