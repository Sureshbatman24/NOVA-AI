from flask import Flask, render_template, request, jsonify
from ai_engine import ask_ai, generate_image
import base64

app = Flask(__name__)


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


# =========================================================
# AI CHAT
# =========================================================

@app.route("/api/chat", methods=["POST"])
def chat():

    data = request.get_json()

    message = data.get("message", "").strip()

    if not message:
        return jsonify({
            "error": "Message is empty"
        }), 400

    try:

        reply = ask_ai(message)

        return jsonify({
            "reply": reply
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# AI IMAGE GENERATION
# =========================================================

@app.route("/api/image", methods=["POST"])
def image():

    data = request.get_json()

    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({
            "error": "Image prompt is empty"
        }), 400

    try:

        image_data = generate_image(prompt)

        if not image_data:
            return jsonify({
                "error": "NOVA could not generate the image."
            }), 500

        # Convert image bytes to Base64
        image_base64 = base64.b64encode(image_data).decode("utf-8")

        return jsonify({
            "image": image_base64
        })

    except Exception as e:

        print("Image API Error:", e)

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":
    app.run(
        debug=True,
        port=8000
    )