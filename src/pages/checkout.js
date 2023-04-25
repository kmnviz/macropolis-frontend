import axios from 'axios';
import Input from '../components/input';
import {useForm} from 'react-hook-form';
import React, {useState, useEffect} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import Head from 'next/head';
import Decimal from 'decimal.js';
import Button from '../components/button';
import Header from '../components/header';
import {useRouter} from 'next/router';

export default function Checkout({item, paymentIntentId, emailAddress, username}) {
    const router = useRouter();

    const {register, handleSubmit, formState: {errors}, setError, reset} = useForm();
    const [enteredEmail, setEnteredEmail] = useState('');
    const [paymentIntent, setPaymentIntent] = useState(null);
    const [stripeClient, setStripeClient] = useState(null);
    const [stripeElements, setStripeElements] = useState(null);
    const [stage, setStage] = useState(0);

    useEffect(() => {
        if (stage === 1) {
            createPaymentElement();
        }
    }, [stage]);

    const submit = async (data) => {
        if (stage === 0) {
            setEnteredEmail(data.email);

            try {
                const postData = {itemId: item._id, email: data.email};
                const response = await axios.post(`${process.env.BACKEND_URL}/stripe/create-payment-intent`, postData, {withCredentials: true});
                const stripe = await loadStripe(response.data.data.payment_intent.publishable_key);
                const elements = stripe.elements({clientSecret: response.data.data.payment_intent.client_secret});

                setPaymentIntent(response.data.data.payment_intent);
                setStripeClient(stripe);
                setStripeElements(elements);
                setStage(1);
            } catch (error) {
                console.log('Failed to create payment intent: ', error);
            }
        } else if (stage === 1) {
            const response = stripeClient.confirmPayment({
                elements: stripeElements,
                confirmParams: {
                    return_url: `${process.env.DOMAIN_URL}/checkout?paymentIntentId=${paymentIntent.id}&itemId=${item._id}&emailAddress=${enteredEmail}&username=${username}`
                },
            });

            if (response?.error && response.error) {
                console.log(`Failed to confirm payment intent: ${response.error.message}`)
            }
        }
    }

    const createPaymentElement = () => {
        const paymentElement = stripeElements.create('payment');
        paymentElement.mount('#payment-element');
    }

    const formatAmount = (amount) => {
        return Decimal(amount).div(100).toFixed(2);
    }

    return (
        <>
            <Head>
                <title>{`${process.env.APP_NAME} - checkout`}</title>
            </Head>
            <div className="w-screen h-screen relative flex justify-center">
                <div className="w-full max-w-screen-2xl">
                    <Header router={router}/>
                    <div className="h-8 md:h-0"></div>
                    <div className="w-full flex justify-center px-2 md:px-8">
                        <div className="w-full max-w-8xl p-2 md:p-8 shadow-md rounded-lg">
                            {
                                !paymentIntentId &&
                                <>
                                    <div className="flex justify-between items-center">
                                        <div className="font-grotesk text-base text-black hover:cursor-pointer" onClick={() => router.push(`/${username}`)}>back to <span
                                            className="font-bold">{username}</span>
                                        </div>
                                    </div>
                                    <div className="h-8"></div>
                                </>
                            }

                            {
                                !paymentIntentId
                                ?
                                    <div className="w-full max-w-8xl p-8 grid grid-cols-1 md:grid-cols-2 border border-gray-300 rounded-lg">
                                        <div className="w-full">
                                            <div className="w-full h-60 md:h-576 relative">
                                                <div className="w-full h-full absolute bg-cover bg-center rounded-md" style={{backgroundImage: `url(${process.env.IMAGES_URL}/480_${item.image})`}}></div>
                                                <div className="w-full h-full absolute black-to-transparent-gradient rounded-md"></div>
                                                <div className="w-full absolute bottom-8">
                                                    <p className="font-grotesk text-2xl h-16 text-white text-center overflow-hidden overflow-ellipsis">{item.name}</p>
                                                </div>
                                            </div>
                                            <div className="h-8"></div>
                                            <div className="w-full h-auto flex justify-between items-center">
                                                <div className="h-full">
                                                    <p className="font-grotesk text-base">price: ${formatAmount(item.price)}</p>
                                                    <p className="font-grotesk text-sm">stripe fee: ${formatAmount(item.price)}</p>
                                                </div>
                                                <div className="h-full">
                                                    <p className="h-full font-grotesk text-base md:text-xl">total: ${formatAmount(item.price)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <div className="w-full h-full md:pl-8 flex flex-col items-center">
                                                <div className="hidden md:block w-full font-grotesk text-xl text-right">{`${stage + 1}/2`}</div>
                                                <div className="h-10"></div>
                                                {
                                                    stage === 0
                                                        ?
                                                        <>
                                                            <p className="w-full font-grotesk text-base text-left">Please provide your email to receive download link</p>
                                                            <div className="h-10"></div>
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
                                                        </>
                                                        :
                                                        <>
                                                            <div>
                                                                <div id="payment-element"></div>
                                                            </div>
                                                        </>
                                                }
                                                <div className="h-10"></div>
                                                <Button
                                                    disabled={Object.keys(errors).length}
                                                    submit={handleSubmit(submit)}
                                                    text="Continue"
                                                />
                                                <div className="h-10"></div>
                                                <div className="block md:hidden w-full font-grotesk text-xl text-right">{`${stage + 1}/2`}</div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <>
                                        <div className="h-24 md:h-0"></div>
                                        <div className="w-full max-w-8xl p-8 border border-gray-300 rounded-lg flex flex-col justify-center items-center h-96 md:h-576">
                                            <div className="w-full flex justify-center">
                                                <img src="/contgrats.png" className="w-20 h-20" />
                                            </div>
                                            <div className="h-10"></div>
                                            <p className="font-grotesk text-base sm:text-xl md:text-2xl text-center">You just bought
                                                <span className="font-bold"> {item.name} </span>
                                                by
                                                <span className="font-bold"> {username}</span>
                                            </p>
                                            <div className="h-2"></div>
                                            <p className="font-grotesk text-base sm:text-xl md:text-2xl text-center">We have sent a download link to
                                                <span className="text-blue-300"> {emailAddress}</span>
                                            </p>
                                            <div className="h-10"></div>
                                            <div className="w-320">
                                                <Button
                                                    disabled={false}
                                                    submit={() => router.push(`/${username}`)}
                                                    text={`back to ${username}'s page`}
                                                />
                                            </div>
                                        </div>
                                    </>
                            }
                        </div>
                    </div>
                    <div className="w-full h-24 pb-2 flex justify-center items-end">
                        <h6 className="font-grotesk text-base text-black">by <span className="font-bold">{process.env.APP_NAME}</span></h6>
                    </div>
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(context) {
    const props = {};

    if ((!context.query?.itemId || !context.query?.username) && !context.query?.paymentIntentId) {
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

    if (context.query.username) {
        props.username = context.query.username;
    }

    return {props};
}
