import axios from 'axios';
import Input from '../components/input';
import {useForm} from 'react-hook-form';
import React, {useState, useEffect} from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head';
import Decimal from "decimal.js";

export default function Checkout({item, paymentIntentId, emailAddress}) {
    const {register, handleSubmit, formState: {errors}, setError, reset} = useForm();
    const [enteredEmail, setEnteredEmail] = useState('');
    const [paymentIntent, setPaymentIntent] = useState(null);
    const [stripeClient, setStripeClient] = useState(null);
    const [stripeElements, setStripeElements] = useState(null);
    const [stage, setStage] = useState(0);

    useEffect(() => {
        if (stage === 1) {
            const paymentElement = stripeElements.create('payment');
            paymentElement.mount('#payment-element');
        }
    }, [stage]);

    const submit = async (data) => {
        if (stage === 0) {
            if (!Object.keys(errors).length) {
                setEnteredEmail(data.email);

                try {
                    const postData = { itemId: item._id, email: data.email };
                    const response = await axios.post(`${process.env.BACKEND_URL}/stripe/create-payment-intent`, postData, { withCredentials: true });
                    const stripe = await loadStripe(response.data.data.payment_intent.publishable_key);
                    const elements = stripe.elements({ clientSecret: response.data.data.payment_intent.client_secret });

                    setPaymentIntent(response.data.data.payment_intent);
                    setStripeClient(stripe);
                    setStripeElements(elements);
                    setStage(1);
                } catch (error) {
                    console.log('Failed to create payment intent: ', error);
                }
            }
        } else if (stage === 1) {
            const response = stripeClient.confirmPayment({
                elements: stripeElements,
                confirmParams: {
                    return_url: `${process.env.DOMAIN_URL}/checkout?paymentIntentId=${paymentIntent.id}&itemId=${item._id}&emailAddress=${enteredEmail}`
                },
            });

            if (response?.error && response.error) {
                console.log(`Failed to confirm payment intent: ${response.error.message}`)
            }
        }
    }

    const formatAmount = (amount) => {
        return Decimal(amount).div(100).toFixed(2);
    }

    return (
        <>
            <Head>
                <title>xpo.space - checkout</title>
            </Head>
            <div className="w-screen h-screen">
                <div className="w-full h-full flex flex-col justify-center items-center">
                    {
                        !paymentIntentId
                        ?
                            <form className="w-576 p-2">
                                <div className="w-full flex flex-col items-center">
                                    <div className="w-32 h-32 rounded-lg" style={{backgroundImage: `url(${process.env.IMAGES_URL}/240_${item.image})`}}></div>
                                    <p className="w-full font-grotesk text-md truncate text-center">{item.name}</p>
                                    {
                                        stage === 1 &&
                                        <>
                                            <p className="w-full font-grotesk text-md truncate text-center">price: {`$${formatAmount(item.price)}`}</p>
                                            <p className="w-full font-grotesk text-md truncate text-center">stripe fee: {`$${formatAmount(paymentIntent.stripe_fee)}`}</p>
                                            <p className="w-full font-grotesk text-md truncate text-center">total: {`$${formatAmount(paymentIntent.total_amount)}`}</p>
                                        </>
                                    }
                                </div>
                                <div className="h-8"></div>
                                {
                                    stage === 0
                                        ?
                                        <Input
                                            name="email"
                                            label="Email"
                                            register={register}
                                            errors={errors}
                                            validationSchema={{
                                                required: 'Email is required',
                                                pattern: {
                                                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
                                                    message: 'Must be a valid email address'
                                                }
                                            }}
                                        />
                                        :
                                        <>
                                            <div>
                                                <div id="payment-element"></div>
                                            </div>
                                        </>
                                }
                                <div className={`w-full h-16 rounded-md duration-100 mt-10
                                    flex justify-center items-center 
                                    ${Object.keys(errors).length ? 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed' : 'bg-green-300 hover:bg-green-400 hover:cursor-pointer'}
                                    `}
                                     onClick={handleSubmit(submit)}
                                >
                                    <p className="text-black font-grotesk">
                                        Continue
                                    </p>
                                </div>
                            </form>
                            :
                            <div className="w-576 flex flex-col items-center">
                                <p className="text-2xl font-grotesk font-bold text-center">Congratulations, you just bought</p>
                                <div className="w-full flex flex-col items-center mt-4">
                                    <div className="w-32 h-32 rounded-lg" style={{backgroundImage: `url(${process.env.IMAGES_URL}/240_${item.image})`}}></div>
                                    <p className="w-full font-grotesk text-md truncate text-center">{item.name}</p>
                                </div>
                                <p className="text-xl font-grotesk text-center mt-8">We have sent a download link to <span className="font-bold">{emailAddress}</span></p>
                            </div>
                    }
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(context) {
    const props = {};

    if (!context.query?.itemId && !context.query?.paymentIntentId) {
        return {redirect: {destination: '/', permanent: false}};
    }

    if (context.query.itemId) {
        try {
            const response = await axios.get(`${process.env.BACKEND_URL}/items/get?id=${context.query.itemId}`);
            props.item = response.data.data.item;
        } catch (error) {
            console.log('Failed to fetch item: ', error);
        }
    }

    if (context.query.paymentIntentId) {
        props.paymentIntentId = context.query.paymentIntentId;
    }

    if (context.query.emailAddress) {
        props.emailAddress = context.query.emailAddress;
    }

    return {props};
}
