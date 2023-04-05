import React from 'react';
import DashboardLayout from './layout';
import jwt from 'jsonwebtoken';
import DashboardItems from "@/pages/dashboard/items";

function DashboardPayments() {

    return (
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl">Payments</h4>
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

    if (context.req.cookies?.token) {
        props.user = jwt.decode(context.req.cookies.token);
    } else {
        return {redirect: {destination: '/', permanent: false}};
    }

    return {props};
}

export default DashboardPayments;
