// ==UserScript==
// @name         brickognize webcam
// @version      1.1.1
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
  animation: progress 1750ms linear forwards;
  color: rgba(255,255,255,var(--tw-text-opacity));
}

@keyframes progress {
  from { width: 0; }
  to { width: 100%; }
}


`);

// TURN FEATURES ON AND OFF HERE //
ENABLE_COLORS = true; // toggles coloring based on match%. default: true
COLORS_OPACITY = 0.5; // 0.0-1.0, determines how strong the color is. default: 0.5
ENABLE_DETAILS = true; // toggles extra details (fig/part/category). default: true
AUTO_OPEN_BRICKLINK = true; // toggles opening bricklink pages in new tab automatically. default: true.
AUTO_OPEN_BRICKLINK_MATCH_PERCENT = 90; // minimum match percentage to auto-open a bricklink page. will only open 1 max. default: 90
///////////////////////////////////

(function () {
  "use strict";

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
    video: true,
  };

  // COLORS, DETAILS //
  if (ENABLE_COLORS || ENABLE_DETAILS || AUTO_OPEN_BRICKLINK) {
    let isResultsPage = false;
    if (window.location.href.includes("/results")) {
      isResultsPage = true;
      // console.log("results page");
      const segments = window.location.href.split("/");
      const pageId = segments.pop();
      // https://storage.googleapis.com/brickognize-static/responses/572b670a-results.json

      fetch(`https://storage.googleapis.com/brickognize-static/responses/${pageId}-results.json`)
        .then((response) => response.json())
        .then((data) => {
          // do something with the parsed JSON data
          let items = data.items;
          //   console.log(items);
          let itemScores = items.map((i) => i.score);

          //   console.log(itemScores);
            console.log(itemScores[0]);
          //   console.log(AUTO_OPEN_BRICKLINK_MATCH_PERCENT / 100);
          if (AUTO_OPEN_BRICKLINK) {
            if (itemScores[0] >= AUTO_OPEN_BRICKLINK_MATCH_PERCENT / 100) {
              window.open(items[0].external_sites[0].url, "_blank");
            }
          }
          const resultsListing = document.getElementById("results-listing");
          const childElements = resultsListing.children;

          let index = 0;

          for (let i = 0; i < childElements.length; i++) {
            const firstChild = childElements[i].firstElementChild;
            if (firstChild) {
              const firstChildOfFirstChild = firstChild.firstElementChild;
              //   console.log(firstChildOfFirstChild);
              if (ENABLE_COLORS) {
                firstChildOfFirstChild.style.backgroundColor = getColor(itemScores[i]);
              }
              if (ENABLE_DETAILS) {
                let newDetails = document.createElement("span");
                let detailsContent = `[${items[i].type}] ${items[i].category}`;
                let shortDetails = detailsContent;
                if (detailsContent.length >= 40) {
                  shortDetails = detailsContent.slice(0, 40) + "..";
                }

                newDetails.textContent = shortDetails;
                newDetails.setAttribute("title", detailsContent);
                newDetails.classList.add("text-gray-600", "text-lg");
                firstChildOfFirstChild.children[1].appendChild(newDetails);

                firstChildOfFirstChild.children[1].style.justifyContent = "space-between";
                firstChildOfFirstChild.children[1].style.alignItems = "space-between";
                // firstChildOfFirstChild.children[1].children[0].style.marginRight = "1x";
                firstChildOfFirstChild.children[1].children[1].style.marginRight = "10px";
                firstChildOfFirstChild.children[1].children[2].style.marginLeft = "auto";

                // firstChildOfFirstChild.children[1].children[0].style.float = "left";
              }
            }
          }
        })
        .catch((error) => console.error(error));
    }
  }

  function getColor(value) {
    const red = [255, 0, 0];
    const white = [255, 255, 255];
    const green = [0, 255, 0];

    let color;

    if (value < 0.5) {
      const ratio = value * 2;
      color = [
        Math.round((1 - ratio) * red[0] + ratio * white[0]),
        Math.round((1 - ratio) * red[1] + ratio * white[1]),
        Math.round((1 - ratio) * red[2] + ratio * white[2]),
      ];
    } else {
      const ratio = (value - 0.5) * 2;
      color = [
        Math.round((1 - ratio) * white[0] + ratio * green[0]),
        Math.round((1 - ratio) * white[1] + ratio * green[1]),
        Math.round((1 - ratio) * white[2] + ratio * green[2]),
      ];
    }

    return `rgb(${color[0]}, ${color[1]}, ${color[2]}, ${COLORS_OPACITY})`;
  }

  //   log(window.location.href);

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      video.srcObject = stream;
      var elementExists = document.getElementById("query-preview");
      if (elementExists) {
        //document.querySelector("#query-preview").appendParent(video);
        //document.querySelector(".box").prepend(video);
        // Get the image element
        const img = document.querySelector("#query-preview");

        // Create the parent div element with class "parent-preview"
        const parentDiv = document.createElement("div");
        parentDiv.classList.add("parent-preview");
        parentDiv.style.display = "flex";
        parentDiv.style.justifyContent = "center";
        parentDiv.style.alignItems = "center";
        parentDiv.style.gap = "20px";

        // Create the first span element and append the image inside it
        const firstSpan = document.createElement("span");

        firstSpan.appendChild(img);

        // Create the second span element and append it to the parent div
        const secondSpan = document.createElement("span");

        video.style.maxWidth = "200px";
        video.style.maxHeight = "200px";
        video.style.width = "auto";
        video.style.height = "auto";
        video.classList.add("mx-auto");
        video.classList.add("rounded");
        video.classList.add("mt-4");

        parentDiv.appendChild(firstSpan);
        parentDiv.appendChild(secondSpan);
        secondSpan.appendChild(video);

        // Find the ".box" class element and append the parent div inside it
        const box = document.querySelector(".box");
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

  const searchBtn = document.querySelector(".btn");

  searchInput.addEventListener("click", (event) => {
    event.preventDefault();
  });

  searchBtn.addEventListener("click", (event) => {
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
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
      };

      fetch("https://api.brickognize.com/predict/", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          let carbs = JSON.parse(result);
          let listingId = carbs.listing_id;

          // Wait
          setTimeout(function () {
            window.location.href = `https://brickognize.com/results/${listingId}`;
          }, 500);
        })
        .catch((error) => console.log("error", error));
    }, "image/png");
  });
})();
