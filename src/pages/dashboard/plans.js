import React from 'react';
import DashboardLayout from './layout';
import axios from 'axios';
import Decimal from 'decimal.js';
import Button from '../../components/button';
import {useState, useEffect} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import FormData from 'form-data';
import {useDispatch} from 'react-redux';
import toggleNotification from '../../helpers/toggleNotification';

function DashboardPlans({user, plans, paymentMethod}) {
    const dispatch = useDispatch();

    const [stripeClient, setStripeClient] = useState(null);
    const [stripeElements, setStripeElements] = useState(null);
    const [stripeCardElement, setStripeCardElement] = useState(null);
    const [stripeCardElementComplete, setStripeCardElementComplete] = useState(false);
    const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
    const [paymentMethodLocal, setPaymentMethodLocal] = useState(paymentMethod);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [userCurrentPlan, setUserCurrentPlan] = useState(user.plan.name);
    const [formButtonDisabled, setFormButtonDisabled] = useState(false);
    const [formButtonLoading, setFormButtonLoading] = useState(false);

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
        const stripe = await loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);
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
            setFormButtonDisabled(true);
            setFormButtonLoading(true);

            const paymentMethod = await stripeClient.createPaymentMethod({
                type: 'card',
                card: stripeCardElement,
            });

            const formData = new FormData();
            formData.append('stripePaymentMethodId', paymentMethod.paymentMethod.id);
            try {
                const response = await axios.post(`${process.env.BACKEND_URL}/users/update`, formData, {withCredentials: true});
                toggleNotification(dispatch, response.data.message, 'success');

                hideAddPaymentMethod();
                setPaymentMethodLocal({last4: paymentMethod.paymentMethod.card.last4});
                setFormButtonDisabled(false);
                setFormButtonLoading(false);
            } catch (error) {
                toggleNotification(dispatch, error.response.data.message, 'error');
            }
        }
    }

    const confirmSubscription = async () => {
        try {
            setFormButtonDisabled(true);
            setFormButtonLoading(true);

            let subscriptionResponse;
            if (selectedPlan.price > 0) {
                const formData = new FormData();
                formData.append('planId', selectedPlan._id);
                const response = subscriptionResponse = await axios.post(
                    `${process.env.BACKEND_URL}/stripe/create-subscription`,
                    formData,
                    {withCredentials: true}
                );
                toggleNotification(dispatch, response.data.message, 'success');
            } else {
                const response = subscriptionResponse = await axios.post(
                    `${process.env.BACKEND_URL}/stripe/cancel-subscription`,
                    {},
                    {withCredentials: true}
                );
                toggleNotification(dispatch, response.data.message, 'success');
            }

            setUserCurrentPlan(subscriptionResponse.data.data.plan.name);
            setSelectedPlan(null);
            setFormButtonDisabled(false);
            setFormButtonLoading(false);
        } catch (error) {
            toggleNotification(dispatch, error.response.data.message, 'error');
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
                    !showAddPaymentMethod && !selectedPlan
                        ?
                        <>
                            <div className="w-full flex justify-between items-center">
                                <h6 className="font-grotesk text-lg">Payment
                                    method: {paymentMethodLocal ? `*${paymentMethodLocal.last4}` : ''}</h6>
                                <div
                                    className="px-4 py-0.5 rounded-md bg-green-300 hover:cursor-pointer hover:bg-green-400"
                                    onClick={addPaymentMethod}>
                                    <p className="font-grotesk text-lg text-center select-none">{!paymentMethodLocal ? 'add' : 'change'}</p>
                                </div>
                            </div>
                            <div className="h-12"></div>
                            <div className="w-full">
                                {
                                    plans.map((plan, index) => {
                                        return (
                                            <div key={`plan-${index}`}>
                                                <div className="w-full px-4 py-2 grid grid-cols-2 rounded-lg border-2">
                                                    <div>
                                                        <p className="font-grotesk font-bold text-lg">{plan.name}</p>
                                                        {
                                                            Object.keys(plan.includes).map((key) => {
                                                                return (
                                                                    <p className="font-grotesk text-lg">&middot; {plan.includes[key].description}</p>
                                                                )
                                                            })
                                                        }
                                                        <div className="h-8"></div>
                                                        <p className="font-grotesk text-lg">${formatAmount(plan.price)} / month</p>
                                                    </div>
                                                    {
                                                        plan.name === userCurrentPlan
                                                            ?
                                                            <div className="h-full flex justify-end items-end">
                                                                <div className="px-4 h-8 flex items-center justify-center">
                                                                    <img src="/check.svg" className="w-6 h-6"/>
                                                                </div>
                                                            </div>
                                                            :
                                                            <div className="h-full flex justify-end items-end">
                                                                <div className={`px-4 py-0.5 rounded-md 
                                                                ${paymentMethodLocal ? 'bg-green-300 hover:cursor-pointer hover:bg-green-400' : 'bg-gray-300'}`}
                                                                     onClick={() => setSelectedPlan(plan)}
                                                                >
                                                                    <p className="font-grotesk text-lg text-center select-none">select</p>
                                                                </div>
                                                            </div>
                                                    }
                                                </div>
                                                {
                                                    index !== plans.length - 1 &&
                                                    <div className="h-8"></div>
                                                }
                                            </div>
                                        );
                                    })
                                }
                                {
                                    !paymentMethodLocal &&
                                    <p className="font-grotesk text-sm text-center">*you need to add payment method to
                                        upgrade</p>
                                }
                            </div>
                        </>
                        :
                        <>
                            {
                                showAddPaymentMethod
                                    ?
                                    <div className="w-full">
                                        <div className="w-full flex justify-between items-center">
                                            <h6 className="font-grotesk text-lg">Add payment method</h6>
                                            <div
                                                className="px-4 h-8 flex items-center rounded-md border hover:border-black hover:cursor-pointer"
                                                onClick={hideAddPaymentMethod}>
                                                <img src="/arrow-left.svg" className="w-4 h-4"/>
                                            </div>
                                        </div>
                                        <div className="h-8"></div>
                                        <div
                                            className="h-12 md:h-16 px-2 md:px-4 flex items-center border rounded-md border-black">
                                            <div className="w-full">
                                                <div id="card-element"></div>
                                            </div>
                                        </div>
                                        <div className="h-2"></div>
                                        <div className="font-grotesk text-xs">powered by Stripe</div>
                                        <div className="h-10"></div>
                                        <Button
                                            disabled={!stripeCardElementComplete || formButtonDisabled}
                                            loading={formButtonLoading}
                                            submit={submitPaymentMethod}
                                            text="Add card"
                                        />
                                    </div>
                                    :
                                    <div className="w-full">
                                        <div className="w-full flex justify-between items-center">
                                            <h6 className="font-grotesk text-lg">Selected plan: {selectedPlan.name}</h6>
                                            <div
                                                className="px-4 h-8 flex items-center rounded-md border hover:border-black hover:cursor-pointer"
                                                onClick={() => setSelectedPlan(null)}>
                                                <img src="/arrow-left.svg" className="w-4 h-4"/>
                                            </div>
                                        </div>
                                        <div className="h-8"></div>
                                        {
                                            selectedPlan.price > 0
                                            ?
                                                <p className="font-grotesk">
                                                    You are going to change your plan to Enhanced plan. You will be charged
                                                    ${formatAmount(selectedPlan.price)} automatically every month.
                                                    You will be able to cancel your subscription at any time.
                                                </p>
                                                :
                                                <p className="font-grotesk">
                                                    You are going to cancel your subscription. Your plan will be changed to Free
                                                    with 10 items for sell. If you have more items, they will be deleted after 7 days.
                                                    You will be able to upgrade your plan at any time.
                                                </p>
                                        }

                                        <div className="h-10"></div>
                                        <Button
                                            disabled={formButtonDisabled}
                                            loading={formButtonLoading}
                                            submit={() => confirmSubscription()}
                                            text="Confirm"
                                        />
                                    </div>
                            }
                        </>
                }
            </div>
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
