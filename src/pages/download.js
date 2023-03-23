import React from 'react';
export default function Download({ downloadUrl, fileExtension }) {
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
            <div className="w-screen h-screen bg-sky-100">
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <div className="w-384 p-2">
                        <div className={`w-full h-10 rounded-md bg-blue-500 hover:bg-blue-400 hover:cursor-pointer duration-100 mt-10
  flex justify-center items-center`}
                             onClick={download}
                        >
                            <p className="text-white font-poppins">
                                Download
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export async function getServerSideProps(context) {
    const props = {};

    if (!context.query?.downloadUrl || !context.query?.fileExtension) {
        return { redirect: { destination: '/',  permanent: false } };
    }

    props.downloadUrl = context.query.downloadUrl;
    props.fileExtension = context.query.fileExtension;
    return { props };
}
