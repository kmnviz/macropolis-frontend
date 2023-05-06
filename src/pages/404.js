import {useRouter} from 'next/router';
import Head from 'next/head';
import Button from '../components/button';

export default function Custom404({user}) {
    const router = useRouter();

    return (
        <>
            <Head>
                <title>{`${process.env.APP_NAME} - sign in`}</title>
            </Head>
            <div className="w-screen min-h-screen relative flex flex-col justify-center items-center">
                <h1 className="font-grotesk text-6xl">Page was not found [404]</h1>
                <div className="h-16"></div>
                <div className="w-48">
                    <Button text="Back to homepage" submit={() => router.push('/')} />
                </div>
            </div>
        </>
    )
}
