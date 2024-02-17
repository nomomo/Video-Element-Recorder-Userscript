# Video Element Recorder Userscript

This userscript enables the recording of video elements directly from the web browser. It was designed for educational purposes to study the MediaRecorder API and to experiment with the capabilities of ChatGPT-4. While the script does not work perfectly in all scenarios, it has proven quite effective during testing.

## Acknowledgements

Over 90% of this code was written by ChatGPT-4 as part of an exploration into automating the creation of useful scripts and understanding web technologies. This README was also written with the assistance of ChatGPT-4.

## Purpose

The script was developed as a learning project to delve into the intricacies of the MediaRecorder API and to test the programming assistance capabilities of ChatGPT-4. It serves as a practical experiment for recording video content from various websites for personal use and study.

## Features

- **User-Friendly:** Incorporates a simple floating button to initiate and conclude recordings.
- **Configurable Limits:** Allows users to set maximum file sizes and video lengths through easy browser prompts.
- **Wide Range Support:** Compatible with numerous websites, including but not limited to Chzzk, Hakuna.live and Youtube.

## Installation

1. **Userscript Manager Required:** Ensure you have a userscript manager (like Tampermonkey or Greasemonkey) installed in your browser.
2. **Script Installation:** Open the userscript manager's dashboard, create a new script, and copy-paste the entire content of `video-element-recorder.user.js`. Save to integrate it into your browser.
3. **Navigate to a Supported Site:** Go to a compatible website to see the recorder button, indicating the script is ready for use.

## Usage

- **Starting a Recording:** Click the on-screen button, located at the left bottom side of the screen, with a red dot to begin capturing the video currently playing. This floating button allows you to easily start the recording process without interfering with the website's layout or functionality.
- **Stopping a Recording:** Press the button again to halt the recording, triggering an automatic download of the video file.
- **Adjusting File Size:** Access "Set Max File Size MB (0:infinite)" from the script manager's menu to specify a file size limit.
- **Setting Video Duration:** Use "Set Max Video Time (0:infinite)" from the menu to limit recording time.

## Supported Sites

The script is intended to work on a variety of platforms, such as:
- `https://chzzk.naver.com/*`
- `https://*.hakuna.live/*`
- `https://*.youtube.com/*`
- `https://*.afreecatv.com/*`

Refer to the script's `@match` sections for a comprehensive list.

## Known issues
An issue where videos recorded on certain platforms or long-recorded videos do not play properly. If you use ffmpeg to convert the video as shown below, the problem can be solved. This was written by a human😅.

```bat
ffmpeg -y -i %inputFileName%.webm -analyzeduration 2147483647 -probesize 2147483647 -c:v copy -c:a copy -start_at_zero -copyts %outputFileName%.mp4
```

or

```bat
ffmpeg -y -i %inputFileName%.webm -analyzeduration 2147483647 -probesize 2147483647 -c:v copy -start_at_zero -copyts %outputFileName%.mp4
```

## To-Do

- Post-processing with ffmpeg.wasm
- Record a certain amount of video clip even before clicking the record button(time shifting)

## Contributing

Contributions are welcome! If you have ideas for improvements or additional features, please fork this repository and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This script is for personal use and educational purposes only. It's important to respect copyright laws and adhere to the content creators' terms of service.

## Note

This script and its documentation are experimental and may not function flawlessly across all sites and scenarios. They were created for educational purposes to explore web APIs and the capabilities of AI-assisted programming.
