import React from 'react';
import DashboardLayout from './layout';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import Decimal from 'decimal.js';
import Button from '../../components/button';
import {useState, useEffect} from 'react';
import {loadStripe} from '@stripe/stripe-js';

function DashboardPayments({sales, balance, paymentMethod}) {
    const [stripeClient, setStripeClient] = useState(null);
    const [stripeElements, setStripeElements] = useState(null);
    const [stripeCardElement, setStripeCardElement] = useState(null);
    const [stripeCardElementComplete, setStripeCardElementComplete] = useState(false);
    const [addPaymentMethodState, setAddPaymentMethodState] = useState(false);
    const [paymentMethodLocal, setPaymentMethodLocal] = useState(paymentMethod);

    useEffect(() => {
        if (stripeCardElement) {
            stripeCardElement.on('change', (event) => {
                const { complete } = event;
                setStripeCardElementComplete(complete);
            });
        }
    }, [stripeCardElement]);

    const addPaymentMethod = async () => {
        setAddPaymentMethodState(true);
        const stripe = await loadStripe('pk_test_tJtcQqBrRirhhiwzIAr1brzT000LqQs92t');
        setStripeClient(stripe);
        const elements = stripe.elements();
        setStripeElements(elements);
        const cardElement = elements.create('card', {
            hidePostalCode: true,
        });
        cardElement.mount('#card-element');
        setStripeCardElement(cardElement);
    }

    const submitPaymentMethod = async () => {
        if (stripeCardElementComplete) {
            const paymentMethod = await stripeClient.createPaymentMethod({
                type: 'card',
                card: stripeCardElement,
            });

            const formData = new FormData();
            formData.append('stripePaymentMethodId', paymentMethod.paymentMethod.id);
            try {
                await axios.post(`${process.env.BACKEND_URL}/users/update`, formData, {withCredentials: true});
                setAddPaymentMethodState(false);
                setPaymentMethodLocal({
                    last4: paymentMethod.paymentMethod.card.last4,
                });
            } catch (error) {
                console.log('Failed to update user: ', error);
            }
        }
    }

    const formatAmount = (amount) => {
        return Decimal(amount).div(100).toFixed(2);
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl">Payments</h4>
            </div>
            <div className="h-24"></div>
            <div className="w-full relative">
                <h6 className="font-grotesk text-2l">Payment methods: {`${paymentMethodLocal ? `*${paymentMethodLocal.last4}` : 'none'}`}</h6>
                <div className="h-6"></div>
                {
                    addPaymentMethodState
                        ?
                        <div>
                            <div id="card-element"></div>
                            <div className="h-6"></div>
                            <Button
                                disabled={!stripeCardElementComplete}
                                submit={submitPaymentMethod}
                                text="Add card"
                            />
                        </div>
                        :
                        <Button
                            disabled={false}
                            submit={addPaymentMethod}
                            text={`${!paymentMethodLocal ? 'Add card' : 'Change card'}`}
                        />
                }
            </div>
            <div className="h-12"></div>
            <div className="w-full relative">
                <h6 className="font-grotesk text-2l">Balance: ${formatAmount(balance)}</h6>
            </div>
            <div className="h-12"></div>
            <div className="w-full relative">
                <h6 className="font-grotesk text-2l">Sales: {sales.length}</h6>
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

    try {
        const salesResponse = await axios.get(`${process.env.BACKEND_URL}/sales/get-many`, {
            headers: {
                'Cookie': context.req.headers.cookie
            },
            withCredentials: true
        });
        const paymentMethodResponse = await axios.get(`${process.env.BACKEND_URL}/stripe/get-payment-method`, {
            headers: {
                'Cookie': context.req.headers.cookie
            },
            withCredentials: true
        });
        props.sales = salesResponse.data.data.sales;
        props.balance = props.sales.reduce((total, sale) => {
            return total.plus(new Decimal(sale.bought_for));
        }, new Decimal(0)).toString();
        props.paymentMethod = paymentMethodResponse.data.data.paymentMethod;

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

export default DashboardPayments;
