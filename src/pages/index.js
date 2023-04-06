import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import determineScreenType from '../helpers/determineScreenType';

export default function Index({usernames}) {
    const router = useRouter();

    const [inputUsername, setInputUsername] = useState('');
    const [inputState, setInputState] = useState(true);
    const [buttonMessage, setButtonMessage] = useState('next');
    const [screenWidth, setScreenWidth] = useState(0);
    const [screenType, setScreenType] = useState('');

    useEffect(() => {
        inputInitial();
        inputCaretAnimation();
        inputValidation();
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
        fakeInputCaret.classList.add(`h-8`, 'md:h-16', 'absolute', 'top-2', 'md:top-4', 'w-0.5', 'md:w-1', 'bg-black');

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
                setButtonMessage(`${inputElement.value} is busy`);
                setInputState(false);
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
                <title>xpo.space - a space for tour content</title>
            </Head>
            <div className="w-screen h-screen relative flex justify-center">
                <div id="page-overlay" className="w-0 h-full absolute right-0 z-0 bg-black"></div>
                <div className="w-full max-w-screen-2xl">
                    <div className="w-full flex justify-between h-24">
                        <div className="h-full flex items-center px-4 md:px-8">
                            <img src="/next.svg" alt="logo" className="h-4 md:h-8"/>
                        </div>
                        <div className="h-full flex justify-end items-center px-4 md:px-8">
                            {/*<div*/}
                            {/*    className="h-16 px-8 flex items-center font-poppins text-black mr-8 hover:cursor-pointer">Who*/}
                            {/*    we serve?*/}
                            {/*</div>*/}
                            {/*<div*/}
                            {/*    className="h-16 px-8 flex items-center font-poppins text-black mr-8 hover:cursor-pointer">What*/}
                            {/*    we offer?*/}
                            {/*</div>*/}
                            <div
                                className="h-8 md:h-16 px-4 md:px-8 flex items-center font-poppins truncate hover:cursor-pointer rounded-4xl border md:border-2 border-black"
                                onClick={() => router.push('/sign-in')}>Sign in
                            </div>
                        </div>
                    </div>
                    <div className="w-full mt-16">
                        <div className="w-full flex flex-col justify-center py-12">
                            <h1 className="p-2 font-grotesk text-5xl md:text-8xl">SPACE FOR <span
                                className="font-bold">CONTENT</span></h1>
                            <div className="w-full mt-8 p-1 md:p-2 text-base md:text-3xl lg:text-5xl">
                                <div id="input-main"
                                     className="w-full h-12 md:h-24 relative flex border-2 border-black rounded-lg">
                                    <div id="platform-name-wrapper"
                                         className="px-4 md:px-16 h-full relative flex justify-center items-center bg-black font-grotesk text-white z-30">
                                        <h4 id="platform-name">xpo.space/</h4>
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
                                    <div className="hidden md:block basis-48 md:basis-96 h-full"></div>
                                    <div
                                        id="button-wrapper"
                                        className={`h-full flex-grow relative hover:cursor-pointer border md:border-2 border-black rounded-lg 
                                        ${inputState ? 'bg-green-300' : 'bg-gray-300'}`}
                                        onClick={nextStep}
                                    >
                                        <div id="button"
                                             className="w-full h-full flex justify-center items-center font-grotesk truncate z-0">
                                            {buttonMessage}
                                        </div>
                                        <div id="button-overlay"
                                             className="w-0 h-full absolute top-0 bg-black rounded-md z-10 flex justify-center items-center">
                                            <h4 id="button-overlay-text"
                                                className="h-full flex items-center text-white truncate"></h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export async function getServerSideProps(context) {
    const props = {};
    if (context.req.cookies.token) {
        return {redirect: {destination: '/dashboard', permanent: false}};
    }

    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/users/get-usernames`);
        props.usernames = response.data.data.usernames;
    } catch (error) {
        console.log('Failed to fetch usernames: ', error);
    }

    return {props};
}
