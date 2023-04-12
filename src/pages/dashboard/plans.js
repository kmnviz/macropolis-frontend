import React from 'react';
import DashboardLayout from './layout';
import axios from 'axios';
import Decimal from 'decimal.js';
import Button from '../../components/button';
import {useState, useEffect} from 'react';
import {loadStripe} from '@stripe/stripe-js';

function DashboardPlans({user, plans, paymentMethod}) {
    const [stripeClient, setStripeClient] = useState(null);
    const [stripeElements, setStripeElements] = useState(null);
    const [stripeCardElement, setStripeCardElement] = useState(null);
    const [stripeCardElementComplete, setStripeCardElementComplete] = useState(false);
    const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
    const [paymentMethodLocal, setPaymentMethodLocal] = useState(paymentMethod);

    useEffect(() => {
        if (stripeCardElement) {
            stripeCardElement.on('change', (event) => {
                const {complete} = event;
                setStripeCardElementComplete(complete);
            });
        }
    }, [stripeCardElement]);

    const hideAddPaymentMethod = () => {
        setShowAddPaymentMethod(false);
        stripeCardElement.unmount('#card-element');
        stripeCardElement.clear();
        setStripeClient(null);
    }

    const addPaymentMethod = async () => {
        setShowAddPaymentMethod(true);
        const stripe = await loadStripe('pk_test_tJtcQqBrRirhhiwzIAr1brzT000LqQs92t');
        setStripeClient(stripe);
        const elements = stripe.elements();
        setStripeElements(elements);
        const cardElement = elements.create('card', {
            hidePostalCode: true,
            style: {
                base: {
                    color: '#000',
                    fontFamily: 'Space Grotesk, Arial, sans-serif',
                    fontSize: '16px',
                    fontSmoothing: 'antialiased',
                },
                invalid: {
                    iconColor: '#fca5a5',
                    color: '#fca5a5',
                },
            },
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
                hideAddPaymentMethod();
                setPaymentMethodLocal({last4: paymentMethod.paymentMethod.card.last4,});
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
                <h4 className="font-grotesk font-bold text-4xl">Plans</h4>
            </div>
            <div className="h-24"></div>
            <div className="w-full">
                {
                    !showAddPaymentMethod
                        ?
                        <div className="w-full flex justify-between items-center">
                            <h6 className="font-grotesk text-lg">Payment method: {paymentMethodLocal ? `*${paymentMethodLocal.last4}` : ''}</h6>
                            <div className="px-4 py-0.5 rounded-md bg-green-300 hover:cursor-pointer hover:bg-green-400"
                                 onClick={addPaymentMethod}>
                                <p className="font-grotesk text-lg text-center select-none">{!paymentMethodLocal ? 'add' : 'change'}</p>
                            </div>
                        </div>
                        :
                        <div className="w-full">
                            <div className="w-full flex justify-between items-center">
                                <h6 className="font-grotesk text-lg">Add payment method</h6>
                                <div className="px-4 h-8 flex items-center rounded-md border hover:border-black hover:cursor-pointer"
                                     onClick={hideAddPaymentMethod}>
                                    <img src="/arrow-left.svg" className="w-4 h-4"/>
                                </div>
                            </div>
                            <div className="h-8"></div>
                            <div className="h-12 md:h-16 px-2 md:px-4 flex items-center border rounded-md border-black">
                                <div className="w-full">
                                    <div id="card-element"></div>
                                </div>
                            </div>
                            <div className="h-2"></div>
                            <div className="font-grotesk text-xs">powered by Stripe</div>
                            <div className="h-10"></div>
                            <Button
                                disabled={!stripeCardElementComplete}
                                submit={submitPaymentMethod}
                                text="Add card"
                            />
                        </div>
                }
            </div>
            {
                !showAddPaymentMethod &&
                <>
                    <div className="h-12"></div>
                    <div className="w-full">
                        <div className="w-full px-4 py-2 grid grid-cols-2 rounded-lg border-2">
                            <div>
                                <p className="font-grotesk font-bold text-lg">Free</p>
                                <p className="font-grotesk text-lg">&middot; up to 10 items</p>
                            </div>
                            <div className="h-full flex justify-end items-end">
                                <div className="px-4 h-8 flex items-center justify-center">
                                    <img src="/check.svg" className="w-6 h-6"/>
                                </div>
                            </div>
                        </div>
                        <div className="h-8"></div>
                        <div className="w-full px-4 py-2 grid grid-cols-2 rounded-lg border-2">
                            <div>
                                <p className="font-grotesk font-bold text-lg">Enhanced</p>
                                <p className="font-grotesk text-lg">&middot; up to 50 items</p>
                                <div className="h-8"></div>
                                <p className="font-grotesk text-lg">$9.00 / month</p>
                            </div>
                            <div className="h-full flex justify-end items-end">
                                <div className="px-4 py-0.5 rounded-md bg-gray-300">
                                    <p className="font-grotesk text-lg text-center select-none">upgrade</p>
                                </div>
                            </div>
                        </div>
                        {
                            !paymentMethodLocal &&
                            <p className="font-grotesk text-sm text-center">*you need to add payment method to upgrade</p>
                        }
                    </div>
                </>
            }
                {/*<div className="w-full p-6 rounded-lg bg-orange-200">*/}
                {/*    <div>*/}
                {/*        <p className="font-grotesk font-bold text-lg">Enhanced</p>*/}
                {/*        <div className="h-8"></div>*/}
                {/*        <p className="font-grotesk text-lg">&middot; up to 50 items for sale</p>*/}
                {/*        <div className="h-8"></div>*/}
                {/*        <div className="w-full rounded-md p-4 flex justify-center items-center bg-green-300 hover:cursor-pointer hover:bg-green-400">*/}
                {/*            Select*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div className="w-full p-8 rounded-md bg-gray-300 flex justify-between items-center">*/}
                {/*    <div>*/}
                {/*        <p className="font-grotesk text-lg">Enhanced</p>*/}
                {/*        <p className="font-grotesk text-lg">up to 50 items</p>*/}
                {/*    </div>*/}
                {/*</div>*/}
            {/*</div>*/}
            {/*<div className="w-full relative">*/}
            {/*    {*/}
            {/*        plans.map((plan, index) => {*/}
            {/*            return (*/}
            {/*                <div key={index}>*/}
            {/*                    <div*/}
            {/*                        className="w-full h-16 rounded-md border border-black p-2 flex justify-between">*/}
            {/*                        <div className="flex items-center">*/}
            {/*                            <div className="">*/}
            {/*                                <p className="ml-4 text-black font-grotesk text-sm truncate">{plan.name}</p>*/}
            {/*                                <p className="ml-4 text-black font-grotesk text-sm truncate">${formatAmount(plan.price)}</p>*/}
            {/*                            </div>*/}
            {/*                        </div>*/}
            {/*                        <div className="h-full flex flex-col justify-center">*/}
            {/*                            <div*/}
            {/*                                className={`w-8 md:w-12 h-8 md:h-12 rounded-sm border border-gray-300 flex items-center justify-center */}
            {/*                                ${plan.name !== 'free' && `hover:border-green-300 hover:cursor-pointer` }`}>*/}
            {/*                                {*/}
            {/*                                    user.plan.name === plan.name*/}
            {/*                                        ?*/}
            {/*                                        <img src="/check.svg" className="w-4 md:w-6 h-4 md:h-6"/>*/}
            {/*                                        :*/}
            {/*                                        <img src="/rocket-launch.svg" className="w-4 md:w-6 h-4 md:h-6"/>*/}

            {/*                                }*/}
            {/*                            </div>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                    <div className="h-4"></div>*/}
            {/*                </div>*/}
            {/*            )*/}
            {/*        })*/}
            {/*    }*/}
            {/*</div>*/}
        </div>
    );
}

DashboardPlans.getLayout = function (page) {
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

        const responsePlans = await axios.get(`${process.env.BACKEND_URL}/plans/get-many`);
        props.plans = responsePlans.data.data.plans;

        const paymentMethodResponse = await axios.get(`${process.env.BACKEND_URL}/stripe/get-payment-method`, {
            headers: {
                'Cookie': context.req.headers.cookie
            },
            withCredentials: true
        });
        props.paymentMethod = paymentMethodResponse.data.data.paymentMethod;
    } catch (error) {
        console.log('Failed to fetch plans: ', error);
    }

    return {props};
}

export default DashboardPlans;
