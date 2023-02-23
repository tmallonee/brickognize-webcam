// ==UserScript==
// @name         brickognize webcam
// @version      1.0.3
// @description  allows for webcam use on brickognize
// @author       tim
// @match        https://*.brickognize.com/
// @match        https://*.brickognize.com/results*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=brickognize.com
// @updateURL    https://raw.githubusercontent.com/PoopsMcButt/brickognize-webcam/main/brickognize-webcam.user.js
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
  
.loading {
  position: relative;
  display: inline-block;
  background-color: #eee;
}

.loading::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 0;
  background-color: #ef4444;
  animation: progress 1000ms linear forwards;
  color: rgba(255,255,255,var(--tw-text-opacity));
}

@keyframes progress {
  from { width: 0; }
  to { width: 100%; }
}


`);


(function() {
    'use strict';

    const loadingDiv = document.querySelector(".btn");
    //const loadingDiv = document.getElementById("search-input");

    function startLoading() {
        loadingDiv.classList.add("loading");
    }

    // Stop the loading bar animation
    function stopLoading() {
        loadingDiv.classList.remove("loading");
    }


    // get video stream from webcam and display it in "box" element
    const video = document.createElement("video");
    video.width = 1920;
    video.height = 1080;
    video.autoplay = true;
    video.muted = true;

    const constraints = {
        audio: false,
        video: true
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            video.srcObject = stream;
            var elementExists = document.getElementById("query-preview");
            console.log(elementExists);
            if (elementExists) {
                //document.querySelector("#query-preview").appendParent(video);
                //document.querySelector(".box").prepend(video);
                // Get the image element
                const img = document.querySelector('#query-preview');

                // Create the parent div element with class "parent-preview"
                const parentDiv = document.createElement('div');
                parentDiv.classList.add('parent-preview');
                parentDiv.style.display = 'flex';
                parentDiv.style.justifyContent = 'center';
                parentDiv.style.alignItems = 'center';
                parentDiv.style.gap = '20px';

                // Create the first span element and append the image inside it
                const firstSpan = document.createElement('span');

                firstSpan.appendChild(img);

                // Create the second span element and append it to the parent div
                const secondSpan = document.createElement('span');


                video.style.maxWidth = '200px';
                video.style.maxHeight = '200px';
                video.style.width = 'auto';
                video.style.height = 'auto';
                video.classList.add('mx-auto');
                video.classList.add('rounded');
                video.classList.add('mt-4');


                parentDiv.appendChild(firstSpan);
                parentDiv.appendChild(secondSpan);
                secondSpan.appendChild(video);

                // Find the ".box" class element and append the parent div inside it
                const box = document.querySelector('.box');
                box.appendChild(parentDiv);


            } else {
                document.querySelector(".box").appendChild(video);
            }
        })
        .catch((error) => {
            console.error("Error accessing video stream: " + error);
        });

    // take snapshot from webcam and submit formdata on search input click
    const searchInput = document.querySelector("#search-input");




    searchInput.addEventListener("click", (event) => {
        event.preventDefault();

        startLoading(); // Start the loading animation
        setTimeout(stopLoading, 3000); // Stop the loading animation after 3 seconds, doesn't actually matter, page moves on before this hits


        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            const myHeaders = new Headers();
            myHeaders.append("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0");
            myHeaders.append("Accept", "application/json, text/plain, */*");
            myHeaders.append("Accept-Language", "en-US,en;q=0.5");
            myHeaders.append("Accept-Encoding", "gzip, deflate, br");
            myHeaders.append("Origin", "https://brickognize.com");
            myHeaders.append("Connection", "keep-alive");
            myHeaders.append("Referer", "https://brickognize.com/");

            const formdata = new FormData();
            formdata.append("query_image", blob, "webcam_snapshot.png");

            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: formdata,
                redirect: 'follow'
            };

            fetch("https://api.brickognize.com/predict/", requestOptions)
                .then(response => response.text())
                .then((result) => {
                    console.log(JSON.parse(result));
                    let carbs = JSON.parse(result);
                    console.log(carbs.listing_id);
                    let listingId = carbs.listing_id;

                    // Wait 
                    setTimeout(function() {
                        window.location.href = `https://brickognize.com/results/${listingId}`;
                    }, 500);


                })
                .catch(error => console.log('error', error));
        }, "image/png");
    });

})();