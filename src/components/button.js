import React from "react";

export default function Button({disabled, submit, text, loading = false, color = 'green', textColor = 'text-black'}) {

    const colors = {
        green: 'bg-green-300 hover:bg-green-400 hover:cursor-pointer',
        blue: 'bg-blue-300 hover:bg-blue-400 hover:cursor-pointer',
    }

    return (<div className={`w-full h-12 md:h-16 rounded-md duration-100
            flex justify-center items-center 
            ${disabled ? 'bg-gray-300 hover:bg-gray-300 hover:cursor-not-allowed' : colors[color]}
        `}
                 onClick={submit}
    >
        {!loading ? <p className={`text-black font-grotesk ${textColor} tracking-widest`}>{text}</p> : <span className="button-loader"></span>}
    </div>);
}