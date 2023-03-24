import axios from 'axios';
import Input from '../components/input';
import {useForm} from 'react-hook-form';
import {useState} from 'react';
import {useRouter} from 'next/router';

export default function Index() {
    const router = useRouter();

    const {register, handleSubmit, formState: {errors}, setError, reset} = useForm();
    const [availableUsername, setAvailableUsername] = useState('');

    const submit = async (data) => {
        if (!Object.keys(errors).length) {
            try {
                const response = await axios.get(`${process.env.BACKEND_URL}/users/check-username-availability?username=${data.username}`);
                const username = response.data.data.username;

                if (username) {
                    setError('username', {
                        type: 'custom',
                        message: 'Username is already taken'
                    });
                } else {
                    setAvailableUsername(data.username);
                }
            } catch (error) {
                console.log('Failed to check username availability: ', error);
            }
        }
    };

    const resetForm = () => {
        reset();
        setAvailableUsername('');
    }

    const backgroundImage = 'https://images.unsplash.com/photo-1677443030437-93c9f5e08ae6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=80'

    return (
        <>
            <div className="w-screen h-screen relative">
                {/*<iframe className="absolute h-full w-full z-0" src="https://embed.lottiefiles.com/animation/78692"></iframe>*/}
                <div className="w-full h-full flex justify-center bg-cover bg-center"
                    style={{backgroundImage: `url(${backgroundImage})`}}
                >
                    <div className="container relative flex flex-col justify-center items-end">
                        <div className="w-384">
                            {
                                !availableUsername &&
                                <div>
                                    <img src="/logo.svg" alt="logo" className="h-10"/>
                                </div>
                            }
                            {
                                !availableUsername
                                    ?
                                    <h1 className="text-6xl mt-10 font-poppins font-bold">Make your account today</h1>
                                    :
                                    <h1 className="text-6xl mt-10 font-poppins font-bold">Almost there</h1>
                            }
                        </div>
                        {
                            !availableUsername
                                ?
                                <form className="w-384 mt-10">
                                    <Input
                                        name="username"
                                        register={register}
                                        errors={errors}
                                        validationSchema={{
                                            required: 'Username is required',
                                            minLength: {
                                                value: 6,
                                                message: 'Username must be at least 6 characters long'
                                            },
                                            pattern: {
                                                value: /^[a-zA-Z0-9_]*$/i,
                                                message: 'Username can include only alphanumeric characters and "_"'
                                            }
                                        }}
                                    />
                                    <div className={`w-full h-12 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 mt-5
  flex justify-center items-center ${Object.keys(errors).length && 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed'}`}
                                         onClick={handleSubmit(submit)}
                                    >
                                        <p className="text-white font-poppins">
                                            Claim your account
                                        </p>
                                    </div>
                                </form>
                                :
                                <div className="w-384 p-2">
                                    <p className="text-xl mt-5">Your page is <span
                                        className="font-bold">space.com/{availableUsername}</span>
                                    </p>
                                    <div className="mt-10">
                                        <div
                                            className="w-full h-12 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 flex justify-center items-center"
                                            onClick={() => router.push(`/sign-up?username=${availableUsername}`)}
                                        >
                                            <p className="text-white font-poppins">
                                                Continue
                                            </p>
                                        </div>
                                        <div
                                            className="w-full h-12 mt-2 rounded-md flex justify-center items-center group hover:cursor-pointer"
                                            onClick={() => resetForm()}
                                        >
                                            <p className="font-poppins text-blue-500 group-hover:text-blue-400">
                                                Try another
                                            </p>
                                        </div>
                                    </div>
                                </div>
                        }
                        {
                            !availableUsername &&
                            <div className="absolute bottom-0 w-384 flex justify-center">
                                <div
                                    className="w-32 h-12 flex justify-center items-center rounded-t-3xl bg-white hover:cursor-pointer">
                                    <p className="text-black font-poppins">Read more</p>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps(context) {
    if (context.req.cookies.token) {
        return {redirect: {destination: '/dashboard', permanent: false}};
    }

    return {props: {}};
}
