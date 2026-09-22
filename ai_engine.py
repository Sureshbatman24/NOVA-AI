import os
import time

from dotenv import load_dotenv
from google import genai

load_dotenv()


# =========================================================
# GEMINI API SETUP
# =========================================================

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

client = genai.Client(
    api_key=api_key
)


# =========================================================
# NOVA IDENTITY
# =========================================================

SYSTEM_PROMPT = """
You are NOVA, a personal AI assistant.

Your name is NOVA.

Do not introduce yourself as Gemini or Google's AI.

Your identity:
- Name: NOVA
- Type: Personal AI Assistant
- Created by: Batman
- Built using Google Gemini technology

If the user asks who you are, say that you are NOVA.

If the user asks who created you, say:
"I was created by Batman and built using Google Gemini technology."

Do not claim that Batman created Google Gemini.

Be helpful, intelligent, concise and friendly.
"""


# =========================================================
# NORMAL AI CHAT
# =========================================================

def ask_ai(message):

    max_retries = 3

    for attempt in range(max_retries):

        try:

            response = client.models.generate_content(

                model="gemini-3.6-flash",

                contents=[
                    SYSTEM_PROMPT,
                    "\nUser message:\n",
                    message
                ]
            )

            return response.text


        except Exception as error:

            error_text = str(error)

            print("CHAT ERROR:", error_text)


            # Retry temporary 503 errors

            if (
                "503" in error_text
                or "UNAVAILABLE" in error_text
            ):

                if attempt < max_retries - 1:

                    wait_time = 2 ** attempt

                    time.sleep(wait_time)

                    continue

                return (
                    "NOVA is temporarily busy. "
                    "Please try again in a few seconds."
                )


            return (
                "Sorry, something went wrong: "
                + error_text
            )


# =========================================================
# AI IMAGE GENERATION
# =========================================================

def generate_image(prompt):

    try:

        print("Generating image...")
        print("Prompt:", prompt)


        response = client.models.generate_content(

            model="gemini-3.1-flash-image",

            contents=prompt,

            config={
                "response_modalities": ["IMAGE"]
            }
        )


        # Check generated response parts

        for part in response.parts:

            if part.inline_data is not None:

                print("Image generated successfully.")

                return part.inline_data.data


        print("No image data returned by Gemini.")

        return None


    except Exception as error:

        print("IMAGE GENERATION ERROR:")
        print(error)

        return None