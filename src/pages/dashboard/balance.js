import React from 'react';
import DashboardLayout from './layout';
import axios from 'axios';
import Decimal from 'decimal.js';

function DashboardBalance({user, balance}) {

    const formatAmount = (amount) => {
        return Decimal(amount).div(100).toFixed(2);
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl">Balance</h4>
            </div>
            <div className="h-24"></div>
            <div className="w-full relative">
                <h6 className="font-grotesk text-lg">Balance: ${formatAmount(balance)}</h6>
            </div>
        </div>
    );
}

DashboardBalance.getLayout = function (page) {
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

        const salesResponse = await axios.get(`${process.env.BACKEND_URL}/sales/get-many`, {
            headers: {
                'Cookie': context.req.headers.cookie
            },
            withCredentials: true
        });
        props.balance = salesResponse.data.data.sales.reduce((total, sale) => {
            return total.plus(new Decimal(sale.bought_for));
        }, new Decimal(0)).toString();
    } catch (error) {
        console.log('Failed to fetch sales: ', error);
    }

    return {props};
}

export default DashboardBalance;
