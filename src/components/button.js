import React from "react";

export default function Button({disabled, submit, text, loading = false}) {

    return (<div className={`w-full h-12 md:h-16 rounded-md duration-100
            flex justify-center items-center 
            ${disabled ? 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed' : 'bg-green-300 hover:bg-green-400 hover:cursor-pointer'}
        `}
                 onClick={submit}
    >
        {!loading ? <p className="text-black font-grotesk">{text}</p> : <span className="button-loader"></span>}
    </div>);
}