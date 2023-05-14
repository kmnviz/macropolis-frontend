import React, {useState, useEffect} from 'react';

export default function AudioPlayer({audioSrc, imageSrc, title = '', artist = ''}) {

    const [audioState, setAudioState] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);

    useEffect(() => {
        handleAudioElement();
    }, []);

    const toggleAudioState = () => {
        const audioElement = document.getElementById('audio');

        if (!audioState) {
            audioElement.play();
            setAudioState(true);
        } else {
            setAudioState(false);
            audioElement.pause();
        }
    }

    const handleAudioElement = () => {
        const audioElement = document.getElementById('audio');
        const seekSliderElement = document.getElementById('seek-slider');
        const seekSliderWrapperElement = document.getElementById('seek-slider-wrapper');

        audioElement.addEventListener('loadedmetadata', () => {
            setAudioDuration(audioElement.duration);
        });

        seekSliderElement.value = 0;
        audioElement.addEventListener('timeupdate', () => {
            setAudioCurrentTime(audioElement.currentTime);
            seekSliderWrapperElement.style.setProperty('--seek-before-width', seekSliderElement.value / seekSliderElement.max * 100 + '%');
            seekSliderElement.value = (audioElement.currentTime / audioElement.duration) * 100;
            if (audioElement.currentTime >= audioElement.duration - 0.1) {
                setAudioState(false);
            }
        });

        seekSliderElement.addEventListener('change', () => {
            audioElement.currentTime = (audioElement.duration / 100) * seekSliderElement.value;
            setAudioCurrentTime(audioElement.currentTime);
            seekSliderWrapperElement.style.setProperty('--seek-before-width', seekSliderElement.value / seekSliderElement.max * 100 + '%');
        });

        seekSliderElement.addEventListener('input', (e) => {
            audioElement.currentTime = (audioElement.duration / 100) * seekSliderElement.value;
            seekSliderWrapperElement.style.setProperty('--seek-before-width', seekSliderElement.value / seekSliderElement.max * 100 + '%');
        });

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: title,
                artist: artist,
                album: title,
                artwork: [
                    { src: imageSrc },
                ]
            });
        }
    }

    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
        <>
            <audio src={audioSrc}
                   id="audio" type="audio/mpeg" className="invisible" preload="metadata"/>
            <div className="w-full h-16 absolute bottom-0 px-4 backdrop-blur rounded-b-lg">
                <div className="w-full h-full flex justify-between items-center">
                    <div className="hover:cursor-pointer" onClick={() => toggleAudioState()}>
                        {
                            audioState
                                ?
                                <img src="/pause.svg" className="w-12 h-12 invert"/>
                                :
                                <img src="/play.svg" className="w-12 h-12 invert"/>
                        }
                    </div>
                    <div className="h-full ml-4 grow flex justify-between items-center">
                        <div id="current-time" className="w-16 font-grotesk text-white text-lg">
                            {formatTime(audioCurrentTime)}
                        </div>
                        <div className="h-full grow relative">
                            <div id="seek-slider-wrapper" className="w-full h-full flex items-center">
                                <input id="seek-slider" className="w-full" type="range" min="0" max="100"/>
                            </div>
                        </div>
                        <div id="duration" className="w-16 font-grotesk text-white text-lg text-right">
                            {audioDuration ? formatTime(audioDuration) : '00:00'}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}