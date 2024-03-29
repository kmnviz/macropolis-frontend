import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Header from '../components/header';
import ImageBlob from '../components/imageBlob';
import Button from '../components/button';

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

    const seeWhy = () => {
        const element = document.getElementById('see-why-section');
        element.scrollIntoView({ behavior: 'smooth' });
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
                    <div className="w-full mt-32 md:mt-16">
                        <div className="w-full flex flex-col justify-center py-12 relative">
                            {
                                item &&
                                <>
                                    <div
                                        className="hidden xl:block w-384 h-384 absolute -top-6 right-8 rounded-md overflow-hidden
                                            object-cover object-center hover:cursor-pointer"
                                        onClick={() => router.push(`/${item.username}/item/${item._id}`)}
                                    >
                                        <ImageBlob imageSrc={`${process.env.IMAGES_URL}/480_${item.image}`} />
                                    </div>
                                </>
                            }
                            <div>
                                <h1 className="px-2 font-grotesk text-4xl md:text-8xl font-bold">Claim an username</h1>
                                {/*<h1 className="px-2 font-grotesk text-3xl md:text-7xl">DIGITAL SPACE <span className="text-3xl">FOR</span></h1>*/}
                                {/*<h1 className="px-2 font-grotesk text-4xl md:text-8xl font-bold">DIGITAL CREATORS</h1>*/}
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
                    <div className="w-full absolute left-0 bottom-0 z-30">
                        <div className="w-full relative">
                            <div className="w-full flex justify-center items-center">
                                <div className="py-2 px-16 bg-black rounded-t-2xl hover:cursor-pointer font-grotesk
                                    text-white shadow-2xl flex justify-between items-center relative"
                                     onClick={() => seeWhy()}
                                >
                                    <img src="/arrow-down.svg" className="w-8 h-4 invert"/>
                                    <h6 className="font-grotesk text-base md:text-2xl">See why</h6>
                                    <img src="/arrow-down.svg" className="w-8 h-4 invert"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="see-why-section" className="w-screen min-h-screen relative bg-black shadow-xl">
                <div className="h-16 lg:h-32"></div>
                <div className="w-full flex flex-col lg:flex-row">
                    <div className="w-full lg:pl-32 lg:pr-16 flex justify-center lg:justify-end items-center">
                        <div className="w-80 lg:w-96 h-80 lg:h-96 relative">
                            <div className="w-full h-full absolute top-0 left-0 z-0">
                                <div className="w-full h-full relative overflow-hidden rounded-lg">
                                    <div className="absolute top-0 left-0 rotate-background"></div>
                                </div>
                            </div>
                            <img className="w-full h-full absolute top-0 left-0 rounded-lg z-10 scale-99 shadow-md object-cover object-center" src={`${process.env.PUBLIC_FILES_URL}/homepage1.jpeg`} alt="sell your digital art without commission"/>
                        </div>
                    </div>
                    <div className="w-full pt-8 lg:pt-0 px-8 lg:pr-32 lg:pl-16 flex justify-center items-center">
                        <div>
                            <h1 className="font-grotesk text-2xl md:text-4xl font-bold text-white">Sell digital art with 0% commission</h1>
                            <div className="h-8"></div>
                            <p className="font-grotesk text-base md:text-2xl text-white">With Macropolis, we believe that your hard work deserves to be rewarded fully. Say goodbye to hefty commissions! Our subscription-based model ensures you keep 100% of your sales revenue.</p>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col-reverse lg:flex-row">
                    <div className="w-full pt-8 lg:pt-32 px-8 lg:pl-32 lg:pr-16 flex justify-center items-center">
                        <div>
                            <h1 className="font-grotesk text-2xl md:text-4xl font-bold text-white lg:text-right">Unleash the NFT Era</h1>
                            <div className="h-8"></div>
                            <p className="font-grotesk text-base md:text-2xl text-white lg:text-right">Macropolis empowers you to embrace the world of NFTs. List your unique creations as NFTs and open up exciting new opportunities to engage with collectors and art enthusiasts worldwide.</p>
                        </div>
                    </div>
                    <div className="w-full pt-16 lg:pt-32 lg:pr-32 lg:pl-16 flex justify-center lg:justify-start items-center">
                        <div className="w-80 lg:w-96 h-80 lg:h-96 relative">
                            <img className="w-full h-full absolute top-0 left-0 rounded-lg z-10 scale-99 shadow-md" src={`${process.env.PUBLIC_FILES_URL}/homepage2.gif`} alt="sell your digital art without commission"/>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col lg:flex-row">
                    <div className="w-full pt-16 lg:pt-32 lg:pl-32 lg:pr-16 flex justify-center lg:justify-end items-center">
                        <div className="w-80 lg:w-96 h-80 lg:h-96 relative">
                            <div className="w-full h-full absolute top-0 left-0 z-0">
                                <div className="w-full h-full relative overflow-hidden rounded-lg">
                                    <div className="absolute top-0 left-0 rotate-background"></div>
                                </div>
                            </div>
                            <img className="w-full h-full absolute top-0 left-0 rounded-lg z-10 scale-99 shadow-md object-cover object-center" src={`${process.env.PUBLIC_FILES_URL}/homepage3.webp`} alt="sell your digital art without commission"/>
                        </div>
                    </div>
                    <div className="w-full pt-8 lg:pt-16 lg:pt-32 px-8 lg:pr-32 lg:pl-16 flex justify-center items-center">
                        <div>
                            <h1 className="font-grotesk text-2xl md:text-4xl font-bold text-white">Customize and Shine</h1>
                            <div className="h-8"></div>
                            <p className="font-grotesk text-base md:text-2xl text-white">Your Macropolis page is your digital canvas. Personalize it, showcase your portfolio, and captivate your audience with a seamless blend of artistry and technology. It's your platform, your style!</p>
                        </div>
                    </div>
                </div>
                <div className="h-16 lg:h-32"></div>
            </div>
            <div className="w-screen relative">
                <h1 className="mt-16 font-grotesk text-3xl md:text-6xl font-bold text-center">Choose your plan</h1>
                <div className="w-full hidden lg:flex justify-center items-center">
                    <div className="w-768 min-h-576">
                        <div className="w-full relative mt-16">
                            <div className="floating-container w-96 p-8 rounded-md absolute shadow-md bg-white z-0 border-blue-300 border-2 left-2">
                                <h6 className="font-grotesk text-xl text-center font-bold">Free</h6>
                                <div className="flex justify-center items-center flex-col mt-8">
                                    <p className="w-full text-left font-grotesk">&middot; Up to 10 items for sale</p>
                                    <p className="w-full text-left font-grotesk">&middot; Up to 1GB of space</p>
                                    <p className="w-full text-left font-grotesk">&middot; Page customization</p>
                                    <p className="w-full text-left font-grotesk font-bold mt-8 text-center">$0 / month</p>
                                </div>
                                <div className="w-full mt-2">
                                    <Button color="blue" text="Join now" textColor="text-white" submit={() => router.push('/sign-up')} />
                                </div>
                            </div>
                            <div className="floating-container w-96 p-8 rounded-md absolute right-0 shadow-md bg-white z-10 border-green-300 border-2 right-2">
                                <h6 className="font-grotesk text-xl text-center font-bold">Enhanced</h6>
                                <div className="flex justify-center items-center flex-col mt-8">
                                    <p className="w-full text-left font-grotesk">&middot; Unlimited number of items</p>
                                    <p className="w-full text-left font-grotesk">&middot; Up to 10GB of space</p>
                                    <p className="w-full text-left font-grotesk">&middot; Create collections</p>
                                    <p className="w-full text-left font-grotesk">&middot; List NFT</p>
                                    <p className="w-full text-left font-grotesk">&middot; Mint NFT (soon)</p>
                                    <p className="w-full text-left font-grotesk">&middot; Receive donations (soon)</p>
                                    <p className="w-full text-left font-grotesk font-bold mt-8 text-center">$9 / month</p>
                                </div>
                                <div className="w-full mt-2">
                                    <Button text="Join now" textColor="text-white" submit={() => router.push('/sign-up')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex lg:hidden flex-col justify-center items-center">
                    <div className="w-96 p-8 mt-16 rounded-md shadow-md bg-white border-blue-300 border-2">
                        <h6 className="font-grotesk text-xl text-center font-bold">Free</h6>
                        <div className="flex justify-center items-center flex-col mt-8">
                            <p className="w-full text-left font-grotesk">&middot; Up to 10 items for sale</p>
                            <p className="w-full text-left font-grotesk">&middot; Up to 1GB of space</p>
                            <p className="w-full text-left font-grotesk">&middot; Page customization</p>
                            <p className="w-full text-left font-grotesk font-bold mt-8 text-center">$0 / month</p>
                        </div>
                        <div className="w-full mt-2">
                            <Button color="blue" text="Join now" textColor="text-white" submit={() => router.push('/sign-up')} />
                        </div>
                    </div>
                    <div className="w-96 p-8 mt-16 rounded-md shadow-md bg-white border-green-300 border-2">
                        <h6 className="font-grotesk text-xl text-center font-bold">Enhanced</h6>
                        <div className="flex justify-center items-center flex-col mt-8">
                            <p className="w-full text-left font-grotesk">&middot; Unlimited number of items</p>
                            <p className="w-full text-left font-grotesk">&middot; Up to 10GB of space</p>
                            <p className="w-full text-left font-grotesk">&middot; Create collections</p>
                            <p className="w-full text-left font-grotesk">&middot; List NFT</p>
                            <p className="w-full text-left font-grotesk">&middot; Mint NFT</p>
                            <p className="w-full text-left font-grotesk">&middot; Receive donations (soon)</p>
                            <p className="w-full text-left font-grotesk font-bold mt-8 text-center">$9 / month</p>
                        </div>
                        <div className="w-full mt-2">
                            <Button text="Join now" textColor="text-white" submit={() => router.push('/sign-up')} />
                        </div>
                    </div>
                </div>
                <div className="w-full mt-16 lg:mt-0">
                    <h6 className="w-full text-center font-grotesk py-2 text-base">crafted by <span className="font-bold select-none">kmnviz</span></h6>
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps(context) {
    const props = {};
    props.isLoggedIn = !!context.req.cookies.token;

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
