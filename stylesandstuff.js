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
    const paperVariants = {
        "5x7": [
            "Paper Textures/optimized/5x7/5x7.1.png",
            "Paper Textures/optimized/5x7/5x7.2.png",
            "Paper Textures/optimized/5x7/5x7.3.png"
        ],
        "5x7-landscape": [
            "Paper Textures/optimized/5x7-landscape/5x7.1.png",
            "Paper Textures/optimized/5x7-landscape/5x7.2.png",
            "Paper Textures/optimized/5x7-landscape/5x7.3.png"
        ],
        "comic": [
            "Paper Textures/optimized/Comic/Comic1.png",
            "Paper Textures/optimized/Comic/Comic2.png",
            "Paper Textures/optimized/Comic/Comic3.png"
        ],
        "square": [
            "Paper Textures/optimized/Square/1x1.1.png",
            "Paper Textures/optimized/Square/1x1.2.png",
            "Paper Textures/optimized/Square/1x1.3.png"
        ]
    };
    const paperSizes = {
        "5x7": [900, 1260],
        "5x7-landscape": [1260, 900],
        "comic": [848, 1360],
        "square": [1200, 1200]
    };

    function loadGalleryImage(source) {
        return new Promise(function (resolve, reject) {
            const image = new Image();
            image.onload = function () {
                resolve(image);
            };
            image.onerror = function () {
                reject(new Error("Unable to load gallery asset: " + source));
            };
            image.src = source;
        });
    }

    function renderPaperThumbnail(artwork) {
        const imageElement = artwork.querySelector("img");
        const paperKey = artwork.dataset.paper === "5x7" && artwork.dataset.orientation === "landscape"
            ? "5x7-landscape"
            : artwork.dataset.paper;
        const variants = paperVariants[paperKey];
        const texture = variants[Math.floor(Math.random() * variants.length)];
        const dimensions = paperSizes[paperKey];

        return Promise.all([
            loadGalleryImage(imageElement.src),
            loadGalleryImage(texture)
        ]).then(function (images) {
            const artworkImage = images[0];
            const paperImage = images[1];
            const width = dimensions[0];
            const height = dimensions[1];
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;

            context.drawImage(paperImage, 0, 0, width, height);
            context.globalCompositeOperation = "multiply";
            const scale = Math.max(width / artworkImage.naturalWidth, height / artworkImage.naturalHeight);
            const artworkWidth = artworkImage.naturalWidth * scale;
            const artworkHeight = artworkImage.naturalHeight * scale;
            context.drawImage(
                artworkImage,
                (width - artworkWidth) / 2,
                (height - artworkHeight) / 2,
                artworkWidth,
                artworkHeight
            );
            context.globalCompositeOperation = "destination-in";
            context.drawImage(paperImage, 0, 0, width, height);

            const composite = canvas.toDataURL("image/webp", 0.9);
            if (!composite.startsWith("data:image/webp")) {
                throw new Error("WebP export is not supported by this browser.");
            }
            const shadowImage = document.createElement("img");
            shadowImage.className = "artwork-shadow";
            shadowImage.alt = "";
            shadowImage.setAttribute("aria-hidden", "true");
            shadowImage.src = composite;
            artwork.insertBefore(shadowImage, imageElement);
            imageElement.src = composite;
        });
    }

    artworks.forEach(function (artwork) {
        renderPaperThumbnail(artwork).catch(function (error) {
            console.error("Could not render " + artwork.dataset.project + " thumbnail.", error);
        });
    });

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
