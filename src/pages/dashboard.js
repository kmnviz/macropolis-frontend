import jwt from 'jsonwebtoken';
import {useRouter} from 'next/router';
import React from 'react';
import axios from 'axios';
import DashboardProfile from '../components/dashboard/profile';
import DashboardPayments from '../components/dashboard/payments';
import DashboardItems from '../components/dashboard/items';

export default function Dashboard({user, profile, items}) {
    const router = useRouter();

    return (
        <>
            <div className="w-screen h-screen bg-sky-100">
                <div className="w-full flex flex-col items-center">
                    <DashboardProfile profile={profile} />
                    {/*<DashboardPayments />*/}
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
