// ==UserScript==
// @name         Video Element Recorder
// @namespace    Video_Element_Recorder
// @version      0.0.1
// @description  Record a video element in the browser
// @author       Nomo
// @match        https://chzzk.naver.com/*
// @match        https://*.hakuna.live/*
// @match        https://*.youtube.com/*
// @match        https://*.afreecatv.com/*
// @match        https://*.huya.com/*
// @match        https://tv.kakao.com/*
// @match        https://tv.naver.com/*
// @match        https://*.tiktok.com/*
// @match        https://*.twitcasting.tv/*
// @supportURL   https://github.com/nomomo/Video-Element-Recorder-Userscript/issues
// @homepage     https://github.com/nomomo/Video-Element-Recorder-Userscript/
// @icon         https://raw.githubusercontent.com/nomomo/Video-Element-Recorder-Userscript/main/icon.webp
// @downloadURL  https://github.com/nomomo/Video-Element-Recorder-Userscript/raw/main/Video-Element-Recorder.user.js
// @updateURL    https://github.com/nomomo/Video-Element-Recorder-Userscript/raw/main/Video-Element-Recorder.user.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    // Add custom style for the record button
    GM_addStyle(`
        #recordButton {
            position: fixed;
            left: 15px;
            bottom: 15px;
            z-index: 9999;
            padding: 3px 9px;
            border-radius: 5px;
            background-color: rgba(255,255,255,0.2);
            color: white;
            font-size: 13px;
            font-family: Consolas;
            letter-spacing: -0.5px;
            cursor: pointer;
            opacity: 0.2;
            transition: opacity 0.3s; /* Smooth transition for opacity change */
        }
        #recordButton:hover {
            opacity: 1.0;
        }
        #recordButton.recording {
            background-color: red;
        }
    `);

    // Initialize or retrieve settings
    let maxFileSizeMB = GM_getValue('maxFileSizeMB', 0); // Default 0 means no limit
    let useMaxFileSize = maxFileSizeMB > 0;

    let maxVideoTimeSec = GM_getValue('maxVideoTimeSec', 0); // Default 0 means no limit
    let useMaxVideoTime = maxVideoTimeSec > 0;

    // Register menu command for setting max Video time
    GM_registerMenuCommand("Set Max Video Time (0:infinite)", () => {
        let input = prompt("Enter max Video time in seconds (0 for no limit):", maxVideoTimeSec.toString());
        let value = parseInt(input, 10);
        if (!isNaN(value) && value >= 0) {
            GM_setValue('maxVideoTimeSec', value);
            maxVideoTimeSec = value;
            useMaxVideoTime = value > 0;
            alert(`Max Video time set to ${useMaxVideoTime ? value + " seconds." : "infinite."}`);
        } else {
            alert("Invalid input. Please enter a non-negative integer.");
        }
    });

    // Register menu command for setting max file size
    GM_registerMenuCommand("Set Max File Size MB (0:infinite)", () => {
        let input = prompt("Enter max file size in MB (0 for no limit):", maxFileSizeMB.toString());
        let value = parseInt(input, 10);
        if (!isNaN(value) && value >= 0) {
            GM_setValue('maxFileSizeMB', value);
            maxFileSizeMB = value;
            useMaxFileSize = value > 0;
            alert(`Max file size set to ${useMaxFileSize ? value + " MB." : "infinite."}`);
        } else {
            alert("Invalid input. Please enter a non-negative integer.");
        }
    });

    let recording = false;
    let recorder;
    let chunks = [];
    let startTime;
    let timerInterval;
    let fileSizeInMB = 0;
    let observer;

    // SVG for the record button
    const svgRecord = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="red"/>
        </svg>`;

    // Create a floating button
    const button = document.createElement('button');
    button.setAttribute('id', 'recordButton');
    button.innerHTML = svgRecord;
    document.body.appendChild(button);

    button.addEventListener('click', function() {
        if (!recording) {
            startRecording();
        } else {
            stopRecording();
        }
    });

    function startRecording() {
        try {
            button.classList.add("recording");
            const videoElement = document.querySelector('video');
            if ((videoElement && (videoElement.captureStream || videoElement.mozCaptureStream)) == false){
                alert('No video element found or your browser does not support captureStream.');
                return;
            }

            videoElement.addEventListener('ended', stopRecording, {once: true});

            observer = new MutationObserver((mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.removedNodes.length > 0) {
                        const videoStillPresent = document.querySelector('video');
                        if (!videoStillPresent) {
                            stopRecording();
                            break;
                        }
                    }
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            console.log("Found videoElement. Try to record. src =", videoElement.src);
            const stream = videoElement.captureStream ? videoElement.captureStream() : videoElement.mozCaptureStream();
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (event) => {
                chunks.push(event.data);
                fileSizeInMB += event.data.size / 1024 / 1024;
                console.log("fileSizeInMB", fileSizeInMB);
                checkConditions();
            };
            recorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                stopRecording();
                exportVideo();
            };

            recorder.onstop = exportVideo;
            recorder.start(2000);
            recording = true;
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 100);
            updateTimer();

        } catch (e) {
            console.error('Recording failed to start:', e);
            stopRecording();
        }
    }

    function checkConditions() {
        if (useMaxFileSize && fileSizeInMB > maxFileSizeMB) {
            stopRecording();
        }
    }

    function stopRecording() {
        button.classList.remove("recording");
        if (recording && recorder && recorder.state !== 'inactive') {
            recorder.stop();
        }
        clearInterval(timerInterval);
        recording = false;
        fileSizeInMB = 0;

        if (observer) {
            observer.disconnect();
        }

        button.innerHTML = svgRecord;
    }

    function updateTimer() {
        const elapsedTime = Date.now() - startTime;
        const elapsedSeconds = Math.floor((elapsedTime / 1000) % 60);
        const elapsedMinutes = Math.floor((elapsedTime / (1000 * 60)) % 60);

        const elapsedText = `${elapsedMinutes.toString().padStart(2, '0')}:${elapsedSeconds.toString().padStart(2, '0')}`;

        let timeLimitText = '';
        if (useMaxVideoTime) {
            const maxMinutes = Math.floor(maxVideoTimeSec / 60);
            const maxSeconds = maxVideoTimeSec % 60;
            timeLimitText = `/${maxMinutes.toString().padStart(2, '0')}:${maxSeconds.toString().padStart(2, '0')}`;
        }

        let fileSizeText = `${fileSizeInMB.toFixed(1)}MB`;
        if (useMaxFileSize) {
            fileSizeText = `${fileSizeInMB.toFixed(1)}/${maxFileSizeMB.toFixed(1)}MB`;
        }

        button.textContent = `${elapsedText}${timeLimitText}(${fileSizeText})`;

        if (useMaxVideoTime && elapsedTime / 1000 > maxVideoTimeSec) {
            stopRecording();
        }
    }

    function exportVideo() {
        console.log("chunks size = ", chunks.length);
        const blob = new Blob(chunks, {type: 'video/webm'});
        chunks = [];
        const domainName = window.location.hostname.replace(/[^a-zA-Z0-9]/g, '-');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `recorded-video-${domainName}-${timestamp}.webm`.replace(/[\/:*?"<>|]/g, '_');
        const url = URL.createObjectURL(blob);

        console.log("Save file:", fileName);

        if (fileSizeInMB == 0) {
            console.log("File size is zero. Skip save");
            return;
        }

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }

    window.addEventListener('beforeunload', function(event) {
        if (recording && recorder && recorder.state === 'recording') {
            stopRecording();
        }
    });
})();
