import React from 'react';
import axios from 'axios';
import Head from 'next/head';
import Button from '../components/button';
import Header from '../components/header';
import {useRouter} from 'next/router';

export default function Download({download, username}) {
    const router = useRouter();

    const handleDownload = (file) => {
        const link = document.createElement('a');
        link.style.display = 'none';
        link.setAttribute('href', file.signed_url);
        link.setAttribute('target', '_blank');
        link.setAttribute('download', `file.${file.file_extension}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <>
            <Head>
                <title>{process.env.APP_NAME}</title>
            </Head>
            <div className="w-screen min-h-screen relative flex justify-center">
                <div className="w-full max-w-screen-2xl">
                    <Header router={router}/>
                    <div className="w-full flex justify-center px-2 md:px-8">
                        <div className="w-full max-w-8xl p-2 md:p-8 shadow-md rounded-lg">
                            <div className="h-24 md:h-0"></div>
                            <div
                                className="w-full max-w-8xl relative rounded-lg flex flex-col justify-end items-center">
                                <div className="w-full h-full absolute bg-cover bg-center rounded-lg z-0"
                                     style={{backgroundImage: `url(${process.env.IMAGES_URL}/960_${download.image})`}}
                                ></div>
                                <div className="w-full h-full absolute black-to-transparent-gradient rounded-md"></div>
                                <div className="relative z-10">
                                    <div className="h-24"></div>
                                    <p className="font-grotesk text-white text-base sm:text-xl md:text-2xl text-center">Click
                                        the button below to download</p>
                                    <div className="h-2"></div>
                                    <p className="font-grotesk text-white text-base sm:text-xl md:text-2xl text-center">
                                        <span className="font-bold">{download.name}</span> by <span
                                        className="font-bold">{download.username}</span>
                                    </p>
                                    <div className="h-10"></div>
                                    <div className="w-full">
                                        {
                                            download.files.map((file, index) => {
                                                return (
                                                    <div key={`download-${index}`} className={`${index === 0 ? 'mb-4' : ''}`}>
                                                        <Button
                                                            disabled={false}
                                                            submit={() => handleDownload(file)}
                                                            text={download.files.length === 1 ?`Download` : `Download ${file.name}`}
                                                        />
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                    <div className="h-4"></div>
                                    <div className="font-grotesk text-white text-center hover:cursor-pointer"
                                         onClick={() => router.push(`/${download.username}`)}>go to {download.username}'s page
                                    </div>
                                    <div className="h-24"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-24"></div>
        </>
    );
}

export async function getServerSideProps(context) {
    const props = {};

    if (!context.query?.id) {
        return {redirect: {destination: '/', permanent: false}};
    }

    if (context.query.id) {
        try {
            const response = await axios.get(`${process.env.BACKEND_URL}/downloads/get?id=${context.query.id}`);
            props.download = response.data.data.download;
        } catch (error) {
            console.log('Failed to fetch download: ', error);
        }
    }

    return {props};
}
