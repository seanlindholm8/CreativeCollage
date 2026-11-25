(function () {
    if (!document.querySelector("#project-dialog")) return;

    const dialog = document.querySelector("#project-dialog");
    const dialogTitle = document.querySelector("#dialog-title");
    const dialogStatement = document.querySelector("#dialog-statement");
    const dialogImage = document.querySelector("#dialog-artwork");
    const closeButton = document.querySelector(".close-dialog");
    const zoomSlider = document.querySelector("#zoom-slider");
    const zoomLabel = document.querySelector("#zoom-label");
    const previousButton = document.querySelector("#previous-artwork");
    const nextButton = document.querySelector("#next-artwork");
    const artworks = document.querySelectorAll(".artwork");
    const artistStatements = {
        "Clayface": [
            "This illustration is my interpretation of the clayface character from the recent DC Studios film.",
            "I wanted to push the boundaries of the character so I made him a giant monster!"
        ].join(" "),
        "Absolute Flash": [
            "A cover I made myself after reading the first volume of the Absolute Flash comic.",
            "Had fun sketching out dynamic poses and lightning effects for this piece."
        ].join(" "),
        "Brand New Day": [
            "I made this illustration after seeing the new spidey film 3 times!",
            "I wanted to have Spider-Man at the center and to tell the rest of the story with key icons to represent the other elements of the character.",
            "The only inaccuracy is the camera because this Peter Parker isn't a photographer, but hey that's the beauty of art. I can do what I want."
        ].join(" "),
        "Absolute Wonder Woman": [
            "I really liked how the pose for this one came out.",
            "I don't draw many female characters so that was a bit of a challenge.",
            "I also experimented with how I used layers to color this illustration."
        ].join(" "),
        "Berserk": [
            "I wanted to practice traditional inking with a liner brush.",
            "This illustration was my test drive.",
            "I rendered the rest of the piece in procreate, which is where I do most of my work."
        ].join(" "),
        "Luffy VS Trump": [
            "I made this to put out my feelings of current US politics and to draw one of my favorite characters.",
            "This piece is a kind of political cartoon that also exists as a meme."
        ].join(" "),
        "They Are Watching": [
            "I was looking at some naruto manga panels and found this cool one with the eyes.",
            "It reminded me of the feeling of being watched so I threw on the twist of the current surveillance issue with flock cameras!",
            "Nothing better than art that means something."
        ].join(" "),
        "Iron Man: Mark 1": "Artist statement for Iron Man: Mark 1.",
        "Fun in the Sun": "Artist statement for Fun in the Sun.",
        "Jungle Zoro Redraw": [
            "This is a remake of another illustration I made 2 years ago.",
            "I wanted to see it in my current art style to look for any progress."
        ].join(" "),
        "Rest Your Eyes": [
            "This is an illustration based off my own photography I did at the zoo.",
            "I wanted to capture that warm and peaceful feeling I have whenever I see these adorable creatures.",
            "I had a blast playing around with the wave/ripple patterns."
        ].join(" "),
        "Rockstar": "Artist statement for Rockstar."
    };
    let currentArtworkIndex = 0;
    let zoomLevel = 1;
    let panX = 0;
    let panY = 0;
    let isPanning = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    function updateZoom() {
        if (zoomLevel === 1) {
            panX = 0;
            panY = 0;
        }

        dialogImage.style.transform =
            "translate(" + panX + "px, " + panY + "px) scale(" + zoomLevel + ")";
        zoomSlider.value = Math.round(zoomLevel * 100);
        zoomLabel.textContent = Math.round(zoomLevel * 100) + "%";
    }

    function resetView() {
        zoomLevel = 1;
        panX = 0;
        panY = 0;
        updateZoom();
    }

    function openArtwork(artwork) {
        currentArtworkIndex = Array.from(artworks).indexOf(artwork);
        dialogTitle.textContent = artwork.dataset.project;
        const statement = artistStatements[artwork.dataset.project];
        if (!statement) {
            throw new Error("Missing artist statement for " + artwork.dataset.project);
        }
        dialogStatement.textContent = statement;
        const preloadImage = new Image();
        preloadImage.decoding = "async";
        preloadImage.src = artwork.dataset.image;
        preloadImage.onload = function () {
            if (!dialog.open || dialogTitle.textContent !== artwork.dataset.project) return;
            dialogImage.src = artwork.dataset.image;
            dialogImage.alt = artwork.dataset.project + " illustration";
        };
        resetView();
        dialog.showModal();
    }

    function moveThroughArtworks(direction) {
        currentArtworkIndex =
            (currentArtworkIndex + direction + artworks.length) % artworks.length;
        openArtwork(artworks[currentArtworkIndex]);
    }

    artworks.forEach(function (artwork) {
        artwork.addEventListener("click", function () {
            openArtwork(artwork);
        });

        artwork.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openArtwork(artwork);
            }
        });
    });

    closeButton.addEventListener("click", function () {
        dialog.close();
    });

    dialog.addEventListener("close", function () {
        dialogImage.removeAttribute("src");
    });

    previousButton.addEventListener("click", function () {
        moveThroughArtworks(-1);
    });

    nextButton.addEventListener("click", function () {
        moveThroughArtworks(1);
    });

    dialog.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") {
            moveThroughArtworks(-1);
        }

        if (event.key === "ArrowRight") {
            moveThroughArtworks(1);
        }
    });

    zoomSlider.addEventListener("input", function () {
        zoomLevel = Number(zoomSlider.value) / 100;

        if (zoomLevel <= 1) {
            resetView();
            return;
        }

        updateZoom();
    });

    dialogImage.addEventListener("pointerdown", function (event) {
        if (zoomLevel <= 1) return;

        event.preventDefault();
        isPanning = true;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        dialogImage.classList.add("is-panning");
        dialogImage.setPointerCapture(event.pointerId);
    });

    dialogImage.addEventListener("pointermove", function (event) {
        if (!isPanning) return;
        event.preventDefault();

        panX += event.clientX - lastPointerX;
        panY += event.clientY - lastPointerY;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;

        const stage = document.querySelector(".dialog-image");
        const stageWidth = stage.clientWidth;
        const stageHeight = stage.clientHeight;
        const imageWidth = dialogImage.clientWidth * zoomLevel;
        const imageHeight = dialogImage.clientHeight * zoomLevel;
        const maxX = Math.max(0, (imageWidth - stageWidth) / 2);
        const maxY = Math.max(0, (imageHeight - stageHeight) / 2);

        if (panX > maxX) panX = maxX;
        if (panX < -maxX) panX = -maxX;
        if (panY > maxY) panY = maxY;
        if (panY < -maxY) panY = -maxY;

        updateZoom();
    });

    dialogImage.addEventListener("pointerup", function (event) {
        isPanning = false;
        dialogImage.classList.remove("is-panning");
        if (dialogImage.hasPointerCapture(event.pointerId)) {
            dialogImage.releasePointerCapture(event.pointerId);
        }
    });

    dialogImage.addEventListener("pointercancel", function () {
        isPanning = false;
        dialogImage.classList.remove("is-panning");
    });

    dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
            dialog.close();
        }
    });
})();
