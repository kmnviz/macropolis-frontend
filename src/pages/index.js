import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Header from '../components/header';
import ImageBlob from '../components/imageBlob';

export default function Index({usernames, item, isLoggedIn}) {
    const router = useRouter();

    const [inputUsername, setInputUsername] = useState('');
    const [inputState, setInputState] = useState(true);
    const [buttonMessage, setButtonMessage] = useState('next');
    const [screenWidth, setScreenWidth] = useState(0);
    const [screenType, setScreenType] = useState('');
    const [busyUsername, setBusyUsername] = useState('');

    useEffect(() => {
        if (!isLoggedIn) {
            inputInitial();
            inputCaretAnimation();
            inputValidation();
        }
    }, []);

    const inputInitial = () => {
        const inputElement = document.getElementById('input-username');
        inputElement.focus();
    }

    const inputCaretAnimation = () => {
        const inputElement = document.getElementById('input-username');
        const fakeInputElement = document.getElementById('fake-input');

        let fakeInputCaret, caretPosition = 0;
        fakeInputCaret = document.createElement('div');
        fakeInputCaret.id = 'fake-input-caret';
        fakeInputCaret.classList.add(`h-8`, 'md:h-16', 'absolute', 'top-1.5', 'md:top-4', 'w-0.5', 'md:w-1', 'bg-black');

        // Add initial fake input caret
        if (!document.getElementById('fake-input-caret')) {
            fakeInputElement.appendChild(fakeInputCaret);
        }

        inputElement.addEventListener('input', () => {
            // Set current caret position
            caretPosition = inputElement.selectionStart;

            // Remove all fake input spans
            while (fakeInputElement.firstChild) {
                fakeInputElement.removeChild(fakeInputElement.firstChild);
            }

            // Create new fake input spans
            for (let i = 0; i < inputElement.value.length; i++) {
                const letter = inputElement.value.charAt(i);
                const span = document.createElement('span');
                span.classList.add('fake-input-span', 'block', 'h-full', 'relative', 'flex', 'items-center');
                span.textContent = letter;
                fakeInputElement.appendChild(span);
            }
        });

        inputElement.addEventListener('blur', () => {
            const fakeInputCaret = document.getElementById('fake-input-caret');
            if (fakeInputCaret)
                fakeInputCaret.remove();
        });

        ['input', 'click', 'keyup'].forEach((eventType) => {
            fakeInputElement.appendChild(fakeInputCaret);

            inputElement.addEventListener(eventType, () => {
                caretPosition = inputElement.selectionStart;

                // If there is no value append fake input caret to the start of fakeInputElement
                if (!inputElement.value.length) {
                    fakeInputCaret.classList.remove('right-0', 'md:right-0');
                    fakeInputCaret.classList.add('left-4', 'md:left-8');
                    fakeInputElement.appendChild(fakeInputCaret);
                } else {
                    // Else append fakeInputCaret to fakeInputSpan that is at caretPosition
                    const fakeInputSpan = document.getElementsByClassName('fake-input-span')[caretPosition > 0 ? caretPosition - 1 : 0];
                    if (caretPosition > 0) {
                        fakeInputCaret.classList.remove('left-4', 'md:left-8');
                        fakeInputCaret.classList.add('right-0', 'md:right-0');
                    } else {
                        fakeInputCaret.classList.remove('left-0', 'md:left-0', 'left-4', 'md:left-4', 'right-0', 'md:right-0');
                    }

                    fakeInputSpan.appendChild(fakeInputCaret);
                }
            });
        })
    }

    const inputValidation = () => {
        const inputElement = document.getElementById('input-username');
        inputElement.addEventListener('input', () => {
            const isUsernameValid = inputElement.value.match(/^[a-zA-Z0-9_]*$/i);
            const isUsernameAvailable = !usernames.includes(inputElement.value);
            setBusyUsername('');

            if (inputElement.value.length) {
                inputElement.value = inputElement.value.toLowerCase();
                setInputUsername(inputElement.value);
            } else {
                setInputUsername('');
            }

            if (!inputElement.value.length) {
                setButtonMessage('required');
                setInputState(false);
            } else if (!isUsernameValid) {
                setButtonMessage('not allowed!');
                setInputState(false);
            } else if (!isUsernameAvailable) {
                setButtonMessage(` is busy`);
                setInputState(false);
                setBusyUsername(inputElement.value);
            } else if (isUsernameValid && isUsernameAvailable) {
                setButtonMessage(`next`);
                setInputState(true);
            }
        });
    }

    const nextStep = async (data) => {
        if (inputState) {
            if (inputUsername) {
                animateInput();
                animateButton();
                animatePageOverlay();
                redirectToSignUp();
            } else {
                setInputState(false);
                setButtonMessage('required');
            }
        }
    };

    const animateInput = () => {
        // Smoothly paint the input and text color
        const fakeInputElement = document.getElementById('fake-input');
        const fakeInputElementOverlay = fakeInputElement.cloneNode(true);
        fakeInputElementOverlay.id = 'fake-input-overlay';
        fakeInputElementOverlay.classList.remove('w-full', 'px-4', 'md:px-8');
        fakeInputElementOverlay.classList.add('w-0', 'bg-black', 'text-white', 'truncate', 'z-20');
        window.innerWidth < 768 && fakeInputElementOverlay.style.setProperty('padding-left', '16px', 'important');
        fakeInputElement.insertAdjacentElement('afterend', fakeInputElementOverlay);

        // Move platform name to chosen username
        const platformNameElement = document.getElementById('platform-name');
        const firstFakeInputSpanElement = document.getElementsByClassName('fake-input-span')[0];
        const platformNameElementRect = platformNameElement.getBoundingClientRect();
        const firstFakeInputSpanElementRect = firstFakeInputSpanElement.getBoundingClientRect();

        requestAnimationFrame(() => {
            platformNameElement.style.transition = 'transform 0.5s';
            platformNameElement.style.transform = `translateX(${firstFakeInputSpanElementRect.left - platformNameElementRect.right}px)`;
        });

        setTimeout(() => {
            const {left: platformNameElementLeft} = platformNameElement.getBoundingClientRect();
            platformNameElement.textContent = `${platformNameElement.textContent}${inputUsername}`;
            platformNameElement.style.transition = 'none';
            platformNameElement.style.transform = 'translateX(0)';
            platformNameElement.style.position = 'absolute';
            platformNameElement.style.left = `${platformNameElementLeft - 8}px`;

            const platformNameWrapperElement = document.getElementById('platform-name-wrapper');
            platformNameWrapperElement.classList.add('w-full');

            const finalPosition = (platformNameWrapperElement.offsetWidth / 2 - platformNameElement.offsetWidth / 2) - (platformNameElementLeft - 8);
            platformNameElement.style.transition = 'transform 0.5s';
            platformNameElement.style.transform = `translateX(${finalPosition}px)`;

            const inputUsernameWrapperElement = document.getElementById('input-username-wrapper');
            inputUsernameWrapperElement.remove();
        }, 1000);
    }

    const animateButton = () => {
        const buttonWrapperElement = document.getElementById('button-wrapper');
        const buttonElement = document.getElementById('button');
        const buttonOverlayElement = document.getElementById('button-overlay');
        const buttonOverlayTextElement = document.getElementById('button-overlay-text');
        const buttonOverlayText = 'redirecting...'
        buttonOverlayElement.style.transition = 'width 0.5s';
        buttonOverlayElement.classList.add('w-full');

        setTimeout(() => {
            buttonElement.remove();
            buttonWrapperElement.classList.remove('h-full', 'border', 'md:border-2', 'bg-green-300');
            buttonOverlayText.split('').forEach((letter, index) => {
                setTimeout(() => {
                    buttonOverlayTextElement.textContent = `${buttonOverlayTextElement.textContent}${letter}`;
                }, index * 50);
            });
        }, 200);

        setTimeout(() => {
            const inputMainElement = document.getElementById('input-main');
            const buttonMainElement = document.getElementById('button-main');
            const inputMainStyle = getComputedStyle(inputMainElement);
            const buttonMainStyle = getComputedStyle(buttonMainElement);
            const rpx = (value) => {
                return value.replace('px', '') * 1
            };

            buttonOverlayElement.style.transition = 'transform 0.5s';
            buttonOverlayElement.style.transform = `translateY(-${rpx(inputMainStyle.height) + rpx(buttonMainStyle.marginTop)}px)`;
        }, 1000);
    };

    const animatePageOverlay = () => {
        setTimeout(() => {
            const pageOverlayElement = document.getElementById('page-overlay');
            pageOverlayElement.style.transition = 'width 0.5s';
            pageOverlayElement.classList.add('z-40', 'w-full');
        }, 2000);
    }

    const redirectToSignUp = () => {
        setTimeout(() => {
            router.push('/sign-up?username=' + inputUsername);
        }, 3000);
    }

    return (
        <>
            <Head>
                <title>{`${process.env.APP_NAME} - Space for netizens.`}</title>
                <meta name="description" content={`${process.env.APP_NAME}, a space where you can create your own space
                    and take control of your digital items. Sell, mint, show, share, collaborate. Join our community of creators today.`}
                />
                <meta property="og:title" content={`${process.env.APP_NAME} - Space for netizens`} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${process.env.DOMAIN_URL}`} />
                <meta property="og:description" content={`${process.env.APP_NAME}, a space where you can create your own space
                    and take control of your digital items. Sell, mint, show, share, collaborate and more. Join our community of creators today.`}
                />
                <meta property="og:image" content={`${process.env.DOMAIN_URL}/rocket-launch.svg`} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={process.env.DOMAIN_URL} />
            </Head>
            <div className="w-screen min-h-screen relative flex justify-center">
                <div id="page-overlay" className="w-0 h-full absolute right-0 z-0 bg-black"></div>
                <div className="w-full max-w-screen-2xl relative">
                    <Header router={router} isLoggedIn={isLoggedIn} />
                    <div className="w-full mt-16">
                        <div className="w-full flex flex-col justify-center py-12 relative">
                            {
                                item &&
                                <>
                                    <div
                                        className="hidden xl:block w-384 h-384 absolute -top-6 right-8 rounded-md overflow-hidden
                                            object-cover object-center hover:cursor-pointer"
                                        onClick={() => router.push(`/${item.username}/${item._id}`)}
                                    >
                                        <ImageBlob imageSrc={`${process.env.IMAGES_URL}/480_${item.image}`} />
                                    </div>
                                </>
                            }
                            <div>
                                <h1 className="px-2 font-grotesk text-3xl md:text-7xl">DIGITAL SPACE <span className="text-3xl">FOR</span></h1>
                                <h1 className="px-2 font-grotesk text-4xl md:text-8xl font-bold">DIGITAL CREATORS</h1>
                            </div>
                            {
                                !isLoggedIn &&
                                <div className="w-full mt-8 p-1 md:p-2 text-base md:text-3xl lg:text-5xl z-30">
                                    <div id="input-main"
                                         className="w-full h-12 md:h-24 relative flex border-2 border-black rounded-lg">
                                        <div id="platform-name-wrapper"
                                             className="px-4 md:px-16 h-full relative flex justify-center items-center bg-black font-grotesk text-white z-30">
                                            <h4 id="platform-name">macropolis.io/</h4>
                                        </div>
                                        <div id="input-username-wrapper"
                                             className="h-full flex-grow relative hover:cursor-pointer truncate">
                                            <input
                                                id="input-username"
                                                name="username"
                                                className="w-full h-full rounded-r-md font-grotesk bg-transparent px-4 md:px-8 input-caret text-transparent absolute z-10"
                                            />
                                            <div id="fake-input"
                                                 className="w-full h-full font-grotesk px-4 md:px-8 absolute z-0 top-0 left-0 flex items-center"></div>
                                        </div>
                                    </div>
                                    <div id="button-main" className="w-full h-12 md:h-24 flex mt-4">
                                        <div className="hidden md:block basis-48 md:basis-112 h-full"></div>
                                        <div
                                            id="button-wrapper"
                                            className={`h-full flex-grow relative border md:border-2 border-black rounded-lg 
                                        ${inputState ? 'bg-green-300 hover:cursor-pointer' : 'bg-gray-300 hover:cursor-not-allowed'}`}
                                            onClick={nextStep}
                                        >
                                            <div id="button"
                                                 className="w-full h-full flex justify-center items-center font-grotesk truncate z-0">
                                                {
                                                    busyUsername !== ''
                                                        ?
                                                        <>
                                                            <a target="_blank" href={`/${busyUsername}`} className="block text-blue-300"><span className="text-blue-300 underline">{busyUsername}</span> <span className="text-black">{buttonMessage}</span></a>
                                                        </>
                                                        :
                                                        buttonMessage
                                                }
                                            </div>
                                            <div id="button-overlay"
                                                 className="w-0 h-full absolute top-0 bg-black rounded-md z-10 flex justify-center items-center">
                                                <h4 id="button-overlay-text"
                                                    className="h-full flex items-center text-white truncate"></h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    {/*<div className="w-full fixed left-0 bottom-0 z-30">*/}
                    {/*    <div className="w-full relative">*/}
                    {/*        <div className="w-full flex justify-center items-center">*/}
                    {/*            <div className="py-2 px-16 bg-black rounded-t-2xl hover:cursor-pointer font-grotesk*/}
                    {/*                text-white shadow-2xl flex justify-between items-center"*/}
                    {/*            >*/}
                    {/*                <img src="/arrow-up.svg" className="w-8 h-4 invert"/>*/}
                    {/*                <p className="select-none">About</p>*/}
                    {/*                <img src="/arrow-up.svg" className="w-8 h-4 invert"/>*/}
                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*        <div className="w-screen min-h-screen bg-black"></div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps(context) {
    const props = {};

    props.isLoggedIn = false;
    if (context.req.cookies.token) {
        props.isLoggedIn = true;
    }

    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/users/get-usernames`);
        props.usernames = response.data.data.usernames;

        const itemResponse = await axios.get(`${process.env.BACKEND_URL}/items/get-many?limit=1&sort=desc`)
        props.item = itemResponse.data.data.items.length ? itemResponse.data.data.items[0] : null;
    } catch (error) {
        console.log('Failed to fetch usernames: ', error);
    }

    return {props};
}
