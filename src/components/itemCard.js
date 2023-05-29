import React from 'react';
import {useRouter} from 'next/router';
import Decimal from 'decimal.js';

export default function itemCard({ id, username, image, name, price, category = 'item' }) {
    const router = useRouter();

    const formatAmount = (amount) => {
        return Decimal(amount).div(100).toFixed(2);
    }

    return (
        <>
            <div key={`item-${id}`}
                 className="relative flex flex-col rounded-md shadow hover:shadow-lg cursor-pointer group overflow-hidden border-4 border-white"
                 onClick={() => router.push(`/${username}/${category}/${id}`)}
            >
                <div className="w-full h-80 relative overflow-hidden relative">
                    <img
                        className="w-full h-full absolute top-0 object-cover object-center rounded-md group-hover:scale-105 duration-300 border-2 border-white"
                        src={`${process.env.IMAGES_URL}/480_${image}`}/>
                    <div className="w-full h-16 absolute bottom-0">
                        <div className="w-full h-full relative overflow-hidden">
                            <div className="w-full h-full absolute bottom-0 bg-white z-0"></div>
                            <div className="w-full h-full absolute bottom-0 z-10 px-4 flex flex-col justify-center">
                                <p className="font-grotesk text-gray-800 truncate">{name}</p>
                                <p className="font-grotesk text-gray-800 truncate text-right">${formatAmount(price)}</p>
                            </div>
                            <div className="w-full h-full absolute -bottom-16 z-20 flex justify-center items-center bg-blue-400
                                 duration-300 group-hover:bottom-0 hover:bg-blue-800 rounded-b-md"
                                 onClick={(event) => {
                                     event.stopPropagation();
                                     router.push(`/checkout/${category}?id=${id}&username=${username}`);
                                 }}
                            >
                                <p className="font-grotesk text-white">Buy now</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
