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

    return (
        <>
            <div className="w-screen h-screen">
                <div className="w-full h-full flex flex-col justify-center items-center bg-sky-100">
                    {
                        !availableUsername
                            ?
                            <form className="w-384 p-2">
                                <Input
                                    name="username"
                                    label="Username"
                                    register={register}
                                    errors={errors}
                                    validationSchema={{
                                        required: 'Username is required',
                                        minLength: {value: 6, message: 'Username must be at least 6 characters long'},
                                        pattern: {
                                            value: /^[a-zA-Z0-9_]*$/i,
                                            message: 'Username can include only alphanumeric characters and "_"'
                                        }
                                    }}
                                />
                                <div className={`w-full h-10 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 mt-10
  flex justify-center items-center ${Object.keys(errors).length && 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed'}`}
                                     onClick={handleSubmit(submit)}
                                >
                                    <p className="text-white font-poppins">
                                        Is it available?
                                    </p>
                                </div>
                            </form>
                            :
                            <div className="w-384 p-2">
                                <p className="text-xl text-center">Yes, <span
                                    className="font-bold">{availableUsername}</span> is available
                                </p>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div
                                        className="w-full h-10 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 flex justify-center items-center"
                                        onClick={() => router.push(`/sign-up?username=${availableUsername}`)}
                                    >
                                        <p className="text-white font-poppins">
                                            Sign up
                                        </p>
                                    </div>
                                    <div
                                        className="w-full h-10 rounded-md flex justify-center items-center group hover:cursor-pointer"
                                        onClick={() => resetForm()}
                                    >
                                        <p className="font-poppins text-blue-500 group-hover:text-blue-400">
                                            Try another
                                        </p>
                                    </div>
                                </div>
                            </div>
                    }
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps(context) {
    if (context.req.cookies.token) {
        return { redirect: { destination: '/dashboard',  permanent: false } };
    }

    return { props: {} };
}
