import React, {useState, useEffect} from 'react';

export default function Select({ name, label, placeholder, options = [], onSelect }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            document.addEventListener('click', handleSelectElementClickEvent);
        } else {
            document.removeEventListener('click', handleSelectElementClickEvent);
        }
    }, [open]);

    const toggleOpen = () => {
        setOpen(!open);
    }

    const handleSelectElementClickEvent = (event) => {
        if (!event.target.classList.contains('select-element')) {
            setOpen(false);
        }
    }

    const handleSelectOption = (option) => {
        onSelect(option);
        setOpen(false);
    }

    return (
        <>
            <div className="w-full relative">
                <label className="text-sm font-grotesk">
                    {label}
                </label>
                <div className="w-full relative mt-1">
                    <div className="select-element w-full relative">
                        <div className={`select-element flex items-center h-12 md:h-16 px-2 md:px-4 border border-black hover:cursor-pointer hover:border-gray-900
                    hover:border-2 ${!open ? 'rounded-md' : 'rounded-t-md'}`}
                        onClick={() => toggleOpen()}
                        >
                            <span className="select-element text-gray-400">{placeholder}</span>
                        </div>
                    </div>
                    {
                        open &&
                        <div className="select-element w-full absolute top-12 md:top-16 max-h-42 md:max-h-56 overflow-y-auto border rounded-b-md border-black z-30">
                            {
                                options.map((option, index) => {
                                    return (
                                        <div
                                            key={`select-option-${option.key}-${option.value}-${index}`}
                                            className="select-element flex items-center h-12 md:h-16 px-2 md:px-4 hover:cursor-pointer"
                                            onClick={() => handleSelectOption(option)}
                                        >
                                            {option.key}
                                        </div>
                                    )
                                })
                            }
                        </div>
                    }
                </div>
            </div>
        </>
    )
}