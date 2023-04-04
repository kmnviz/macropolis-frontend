import React from 'react';
import DashboardLayout from './layout';
import jwt from 'jsonwebtoken';

export default function DashboardPayments() {

    return (
        <DashboardLayout>
            <div className="w-full">
                <div className="w-full h-16 flex justify-between items-center">
                    <h4 className="font-grotesk font-bold text-4xl">Payments</h4>
                </div>
            </div>
        </DashboardLayout>
    );
}

export async function getServerSideProps(context) {
    const props = {};

    if (context.req.cookies?.token) {
        props.user = jwt.decode(context.req.cookies.token);
    } else {
        return {redirect: {destination: '/', permanent: false}};
    }

    return {props};
}
