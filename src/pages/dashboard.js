import jwt from 'jsonwebtoken';
import {useRouter} from 'next/router';
import React from 'react';
import DashboardProfile from '../components/dashboard/profile';
import axios from "axios";

export default function Dashboard({user, profile}) {
    const router = useRouter();

    return (
        <>
            <div className="w-screen h-screen ">
                <div className="w-full h-full flex justify-center bg-sky-100">
                    <DashboardProfile profile={profile} />
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

    return {props};
}
