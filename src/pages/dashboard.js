import jwt from 'jsonwebtoken';
import {useRouter} from 'next/router';
import React from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import DashboardProfile from '../components/dashboard/profile';
import DashboardPayments from '../components/dashboard/payments';
import DashboardItems from '../components/dashboard/items';

export default function Dashboard({user, profile, items}) {
    const router = useRouter();

    const logout = () => {
        const cookies = new Cookies();
        cookies.set('token', null, { expires: new Date(0) });
        window.location = '/';
    }

    return (
        <>
            <div className="w-screen min-h-screen">
                <div className="w-full flex flex-col items-center">
                    <div className="container">
                        <div className="grid grid-cols-4">
                            <div className="col-span-1"></div>
                            <div className="col-span-2">
                                <div className="container">
                                    <div className="p-6 flex justify-between items-center">
                                        <h2 className="text-2xl font-poppins font-bold">Dashboard</h2>
                                        <p className="font-poppins hover:cursor-pointer" onClick={() => logout()}>Logout</p>
                                    </div>
                                </div>
                                <DashboardProfile profile={profile} />
                                <div className="mt-8"></div>
                                <DashboardItems user={user} items={items} />
                            </div>
                            <div className="col-span-1"></div>
                        </div>
                        <div className="h-32"></div>
                    </div>

                    <DashboardPayments />
                    <div className="mt-8"></div>
                    <DashboardItems user={user} items={items} />
                </div>
            </div>
        </>
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
        const response = await axios.get(`${process.env.BACKEND_URL}/profiles/get?username=${props.user.username}`, { withCredentials: true });
        props.profile = response.data.data.profile;
    } catch (error) {
        console.log('Failed to fetch profile: ', error);
    }

    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/items/get-many?username=${props.user.username}`, { withCredentials: true });
        props.items = response.data.data.items;


    } catch (error) {
        console.log('Failed to fetch items: ', error);
    }

    return {props};
}
