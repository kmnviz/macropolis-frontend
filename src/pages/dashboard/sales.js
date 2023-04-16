import React from 'react';
import DashboardLayout from './layout';
import axios from 'axios';
import Decimal from 'decimal.js';

function DashboardSales({user, sales}) {

    const formatAmount = (amount) => {
        return Decimal(amount).div(100).toFixed(2);
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl">Sales</h4>
            </div>
            <div className="h-24"></div>
            <div className="w-full relative">
                <h6 className="font-grotesk text-lg">Sales: {sales.length}</h6>
                <div className="h-4"></div>
                {
                    sales.map((sale, index) => {
                        return (
                            <div key={index}>
                                <div
                                    className="w-full h-16 rounded-md border border-black p-2 flex justify-between">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-sm bg-center bg-cover"
                                             style={{backgroundImage: `url(${process.env.IMAGES_URL}/240_${sale.item.image})`}}></div>
                                        <div className="">
                                            <p className="ml-4 text-black font-grotesk text-sm truncate">{sale.item.name}</p>
                                            <p className="ml-4 text-black font-grotesk text-sm truncate">${formatAmount(sale.item.price)}</p>
                                        </div>
                                    </div>
                                    <div className="h-full flex flex-col justify-center">
                                        <p className="ml-4 text-black font-grotesk text-sm truncate text-right">{sale.bought_by}</p>
                                        <p className="ml-4 text-black font-grotesk text-sm truncate text-right">{sale.created_at}</p>
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

DashboardSales.getLayout = function (page) {
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
        props.sales = salesResponse.data.data.sales;

        const formatDate = (timestamp) => {
            const date = new Date(timestamp);
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        }

        props.sales.forEach((sale) => {
            sale.created_at = formatDate(sale.created_at);
        });
    } catch (error) {
        console.log('Failed to fetch sales: ', error);
    }

    return {props};
}

export default DashboardSales;
