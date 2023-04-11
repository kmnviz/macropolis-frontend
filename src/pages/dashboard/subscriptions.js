import React from 'react';
import DashboardLayout from './layout';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import Decimal from 'decimal.js';
import Button from '../../components/button';
import {useState, useEffect} from 'react';
import {loadStripe} from '@stripe/stripe-js';

function DashboardPayments({user, subscriptions}) {
    const [currentSubscription, setCurrentSubscription] = useState(!user?.subscription ? 'free' : user.subscription);

    const formatAmount = (amount) => {
        return Decimal(amount).div(100).toFixed(2);
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl">Subscriptions</h4>
            </div>
            <div className="h-24"></div>
            <div className="w-full relative">
                <h6 className="font-grotesk text-2l">Plans:</h6>
                <div className="h-4"></div>
                {
                    subscriptions.map((subscription, index) => {
                        return (
                            <div key={index}>
                                <div
                                    className="w-full h-16 rounded-md border border-black p-2 flex justify-between">
                                    <div className="flex items-center">
                                        <div className="">
                                            <p className="ml-4 text-black font-grotesk text-sm truncate">{subscription.name}</p>
                                            <p className="ml-4 text-black font-grotesk text-sm truncate">${formatAmount(subscription.price)}</p>
                                        </div>
                                    </div>
                                    <div className="h-full flex flex-col justify-center">
                                        <div
                                            className={`w-8 md:w-12 h-8 md:h-12 rounded-sm border border-gray-300 flex items-center justify-center 
                                            ${subscription.name !== 'free' && `hover:border-green-300 hover:cursor-pointer` }`}>
                                            {
                                                currentSubscription === subscription.name
                                                    ?
                                                    <img src="/check.svg" className="w-4 md:w-6 h-4 md:h-6"/>
                                                    :
                                                    <img src="/rocket-launch.svg" className="w-4 md:w-6 h-4 md:h-6"/>

                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="h-4"></div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
}

DashboardPayments.getLayout = function (page) {
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
        const userResponse = await axios.get(`${process.env.BACKEND_URL}/users/get`, {
            headers: {
                'Cookie': context.req.headers.cookie
            },
            withCredentials: true
        });
        props.user = userResponse.data.data.user;

        const responseSubscriptions = await axios.get(`${process.env.BACKEND_URL}/subscriptions/get-many`);
        props.subscriptions = responseSubscriptions.data.data.subscriptions;

        console.log('props.subscriptions: ', props.subscriptions);
    } catch (error) {
        console.log('Failed to fetch subscriptions: ', error);
    }

    return {props};
}

export default DashboardPayments;
