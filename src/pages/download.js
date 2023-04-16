import React from 'react';
import axios from 'axios';
import Head from 'next/head';
import Button from '../components/button';
import Header from '../components/header';
import {useRouter} from 'next/router';

export default function Download({downloadUrl, fileExtension, item, username}) {
    const router = useRouter();

    const download = () => {
        const link = document.createElement('a');
        link.style.display = 'none';
        link.setAttribute('href', downloadUrl);
        link.setAttribute('target', '_blank');
        link.setAttribute('download', `file.${fileExtension}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <>
            <Head>
                <title>{process.env.APP_NAME}</title>
            </Head>
            <div className="w-screen h-screen relative flex justify-center">
                <div className="w-full max-w-screen-2xl">
                    <Header router={router}/>
                    <div className="h-8 md:h-24"></div>
                    <div className="w-full flex justify-center px-2 md:px-8">
                        <div className="w-full max-w-8xl p-2 md:p-8 shadow-md rounded-lg">
                            <div className="h-24 md:h-0"></div>
                            <div
                                className="w-full max-w-8xl relative p-8 border border-gray-300 rounded-lg flex flex-col justify-end items-center h-96 md:h-576">
                                <div className="w-full h-full absolute bg-cover bg-center rounded-lg z-0"
                                     style={{backgroundImage: `url(${process.env.IMAGES_URL}/960_${item.image})`}}
                                ></div>
                                <div className="w-full h-full absolute black-to-transparent-gradient rounded-md"></div>
                                <div className="relative z-10">
                                    <p className="font-grotesk text-white text-base sm:text-xl md:text-2xl text-center">Click
                                        the button below to download</p>
                                    <div className="h-2"></div>
                                    <p className="font-grotesk text-white text-base sm:text-xl md:text-2xl text-center">
                                        <span className="font-bold">{item.name}</span> by <span
                                        className="font-bold">{username}</span>
                                    </p>
                                    <div className="h-10"></div>
                                    <div className="w-full">
                                        <Button
                                            disabled={false}
                                            submit={download}
                                            text={`Download`}
                                        />
                                    </div>
                                    <div className="h-4"></div>
                                    <div className="font-grotesk text-white text-center hover:cursor-pointer"
                                         onClick={() => router.push(`/${username}`)}>go to {username}'s page
                                    </div>
                                    <div className="h-24"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*          <div className="w-screen h-screen bg-sky-100">*/}
            {/*              <div className="w-full h-full flex flex-col justify-center items-center">*/}
            {/*                  <div className="w-384 p-2">*/}
            {/*                      <div className={`w-full h-10 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 mt-10*/}
            {/*flex justify-center items-center`}*/}
            {/*                           onClick={download}*/}
            {/*                      >*/}
            {/*                          <p className="text-white font-poppins">*/}
            {/*                              Download*/}
            {/*                          </p>*/}
            {/*                      </div>*/}
            {/*                  </div>*/}
            {/*              </div>*/}
            {/*          </div>*/}
        </>
    );
}

export async function getServerSideProps(context) {
    const props = {};

    if (!context.query?.downloadUrl || !context.query?.fileExtension || !context.query?.itemId || !context.query?.username) {
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

    props.downloadUrl = context.query.downloadUrl;
    props.fileExtension = context.query.fileExtension;
    props.username = context.query.username;
    return {props};
}
