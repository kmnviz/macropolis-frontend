import React from 'react';
import DashboardLayout from './layout';
import axios from 'axios';
import Decimal from 'decimal.js';
import Button from '../../components/button';
import {useState} from 'react';
import FormData from 'form-data';
import Input from '../../components/input';
import {useForm} from 'react-hook-form';
import validateIban from '../../helpers/validateIban';
import {useDispatch} from 'react-redux';
import toggleNotification from '../../helpers/toggleNotification';

function DashboardWithdrawals({user, availableAmount, withdrawals}) {
    const dispatch = useDispatch();
    const {register, handleSubmit, formState: {errors}, setError, reset} = useForm();

    const [requestedWithdrawal, setRequestedWithdrawal] = useState(false);
    const [formButtonDisabled, setFormButtonDisabled] = useState(false);
    const [formButtonLoading, setFormButtonLoading] = useState(false);

    const submit = async (data) => {
        if (!validateIban(data.iban)) {
            setError('iban', {message: 'Invalid IBAN'});
        } else {
            setFormButtonDisabled(true);
            setFormButtonLoading(true);

            const formData = new FormData();
            formData.append('iban', data.iban);

            try {
                const response = await axios.post(`${process.env.BACKEND_URL}/withdrawals/create`, formData, {withCredentials: true});
                toggleNotification(dispatch, response.data.message, 'success');

                setTimeout(() => {
                    setFormButtonDisabled(false);
                    setFormButtonLoading(false);
                    window.location.reload();
                }, 1000);
            } catch (error) {
                toggleNotification(dispatch, error.response.data.message, 'error');
            }
        }
    }

    const formatAmount = (amount) => {
        return Decimal(amount).div(100).toFixed(2);
    }

    return (
        <div className="w-full">
            <div className="w-full h-16 flex justify-between items-center">
                <h4 className="font-grotesk font-bold text-4xl">Withdrawals</h4>
            </div>
            <div className="h-24"></div>
            {
                !requestedWithdrawal
                ?
                    <>
                        <div className="w-full relative">
                            <h6 className="font-grotesk text-lg">Available amount: ${formatAmount(availableAmount)}</h6>
                            <div className="h-10"></div>
                            <Button
                                disabled={parseInt(availableAmount) === 0}
                                submit={() => availableAmount > 0 && setRequestedWithdrawal(true)}
                                text="Request withdrawal"
                            />
                        </div>
                        <div className="h-24"></div>
                        <div className="w-full relative">
                            <h6 className="font-grotesk text-lg">Withdrawals: {withdrawals.length}</h6>
                            <div className="h-4"></div>
                            {
                                withdrawals.map((withdrawal, index) => {
                                    return (
                                        <div key={index}>
                                            <div
                                                className="w-full h-16 rounded-md border border-black p-2 flex justify-between">
                                                <div className="flex items-center">
                                                    <div className="">
                                                        <p className="text-black font-grotesk text-sm truncate">IBAN: {withdrawal.metadata.iban}</p>
                                                        <p className="text-black font-grotesk text-sm truncate">amount: ${formatAmount(withdrawal.amount)}</p>
                                                    </div>
                                                </div>
                                                <div className="h-full flex flex-col justify-center overflow-hidden">
                                                    <p className="text-black font-grotesk text-sm truncate text-right">status: {withdrawal.status}</p>
                                                    <p className="text-black font-grotesk text-sm truncate text-right">{withdrawal.created_at}</p>
                                                </div>
                                            </div>
                                            <div className="h-4"></div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </>
                    :
                    <>
                        <div className="w-full">
                            <div className="w-full flex justify-between items-center">
                                <h6 className="font-grotesk text-lg">Request withdrawal</h6>
                                <div
                                    className="px-4 h-8 flex items-center rounded-md border hover:border-black hover:cursor-pointer"
                                    onClick={() => setRequestedWithdrawal(false)}>
                                    <img src="/arrow-left.svg" className="w-4 h-4"/>
                                </div>
                            </div>
                            <div className="h-8"></div>
                            <p className="font-grotesk">
                                You are about to request a withdrawal of ${formatAmount(availableAmount)}. Please provide
                                your IBAN and the amount you want to withdraw. After you confirm, we will send you an email
                                with the details.
                            </p>
                            <div className="h-4"></div>
                            <Input
                                name="iban"
                                label="IBAN"
                                register={register}
                                errors={errors}
                                validationSchema={{
                                    required: 'IBAN is required',
                                }}
                            />
                            <div className="h-10"></div>
                            <Button
                                disabled={Object.keys(errors).length || formButtonDisabled}
                                loading={formButtonLoading}
                                submit={handleSubmit(submit)}
                                text="Confirm"
                            />
                        </div>
                    </>
            }
        </div>
    );
}

DashboardWithdrawals.getLayout = function (page) {
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

        const withdrawalsResponse = await axios.get(`${process.env.BACKEND_URL}/withdrawals/get-many`, {
            headers: {
                'Cookie': context.req.headers.cookie
            },
            withCredentials: true
        });
        props.withdrawals = withdrawalsResponse.data.data.withdrawals;

        const formatDate = (timestamp) => {
            const date = new Date(timestamp);
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        }
        props.withdrawals.forEach((withdrawal) => {
            withdrawal.created_at = formatDate(withdrawal.created_at);
        });

        const availableAmountResponse = await axios.get(`${process.env.BACKEND_URL}/withdrawals/available-amount`, {
            headers: {
                'Cookie': context.req.headers.cookie
            },
            withCredentials: true
        });
        props.availableAmount = availableAmountResponse.data.data.availableAmount;
    } catch (error) {
        console.log('Failed to fetch data: ', error);
    }

    return {props};
}

export default DashboardWithdrawals;
