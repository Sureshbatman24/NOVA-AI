const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");
const welcomeScreen = document.getElementById("welcomeScreen");


/* =========================================================
   ADD TEXT MESSAGE
   ========================================================= */

function addMessage(text, type) {

    const messageDiv = document.createElement("div");

    messageDiv.className = "message " + type;

    const content = document.createElement("div");

    content.className = "message-content";

    content.textContent = text;

    messageDiv.appendChild(content);

    messages.appendChild(messageDiv);

    messageDiv.scrollIntoView({
        behavior: "smooth",
        block: "end"
    });

    return messageDiv;
}


/* =========================================================
   ADD IMAGE MESSAGE
   ========================================================= */

function addImageMessage(imageBase64) {

    const messageDiv = document.createElement("div");

    messageDiv.className = "message ai";

    const content = document.createElement("div");

    content.className = "message-content";

    const image = document.createElement("img");

    image.src = "data:image/png;base64," + imageBase64;

    image.alt = "NOVA generated image";

    image.style.maxWidth = "100%";
    image.style.borderRadius = "12px";
    image.style.display = "block";

    content.appendChild(image);

    messageDiv.appendChild(content);

    messages.appendChild(messageDiv);

    messageDiv.scrollIntoView({
        behavior: "smooth",
        block: "end"
    });

    return messageDiv;
}


/* =========================================================
   IMAGE REQUEST DETECTOR
   ========================================================= */

function isImageRequest(message) {

    const text = message.toLowerCase();

    const imageWords = [
        "generate an image",
        "generate image",
        "create an image",
        "create image",
        "make an image",
        "make image",
        "generate a picture",
        "generate picture",
        "create a picture",
        "create picture",
        "make a picture",
        "make picture",
        "draw an image",
        "draw image",
        "show me an image",
        "show me a picture",
        "ai image",
        "image of",
        "picture of"
    ];

    return imageWords.some(word => text.includes(word));
}


/* =========================================================
   GENERATE IMAGE
   ========================================================= */

async function generateImage(prompt) {

    const loadingMessage = addMessage(
        "Creating your image...",
        "ai loading"
    );

    try {

        const response = await fetch("/api/image", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                prompt: prompt
            })

        });


        const data = await response.json();


        loadingMessage.remove();


        if (data.error) {

            addMessage(
                "NOVA: " + data.error,
                "ai"
            );

            return;
        }


        if (!data.image) {

            addMessage(
                "NOVA could not create the image.",
                "ai"
            );

            return;
        }


        addImageMessage(data.image);

    }

    catch (error) {

        loadingMessage.remove();

        addMessage(
            "NOVA image generation failed. Please try again.",
            "ai"
        );

        console.error(error);
    }
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

    const message = input.value.trim();

    if (!message) {
        return;
    }


    /* Hide welcome */

    welcomeScreen.style.display = "none";


    /* Show user message */

    addMessage(message, "user");


    /* Clear input */

    input.value = "";


    /* Disable button */

    sendButton.disabled = true;

    sendButton.textContent = "⏳";


    /* =====================================================
       CHECK IMAGE REQUEST
       ===================================================== */

    if (isImageRequest(message)) {

        await generateImage(message);

        sendButton.disabled = false;

        sendButton.textContent = "➤";

        input.focus();

        return;
    }


    /* =====================================================
       NORMAL AI CHAT
       ===================================================== */

    const loadingMessage = addMessage(
        "Thinking...",
        "ai loading"
    );


    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });


        const data = await response.json();


        /* Remove loading */

        loadingMessage.remove();


        /* Error */

        if (data.error) {

            addMessage(
                "Sorry, something went wrong: " + data.error,
                "ai"
            );

            return;
        }


        /* AI response */

        addMessage(
            data.reply,
            "ai"
        );

    }

    catch (error) {

        loadingMessage.remove();

        addMessage(
            "Connection error. Please try again.",
            "ai"
        );

        console.error(error);

    }

    finally {

        sendButton.disabled = false;

        sendButton.textContent = "➤";

        input.focus();
    }
}


/* =========================================================
   SEND BUTTON
   ========================================================= */

sendButton.addEventListener(
    "click",
    sendMessage
);


/* =========================================================
   ENTER KEY
   ========================================================= */

input.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();
        }

    }
);