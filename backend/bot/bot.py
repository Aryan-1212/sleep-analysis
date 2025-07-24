# bot/bot.py
from flask import Blueprint, request, jsonify
from .bot_backend import chat
from deep_translator import GoogleTranslator

bot_bp = Blueprint('bot', __name__)

@bot_bp.route("/api/chat", methods=["POST"])
def handle_message():
    user_input = request.json.get("message")
    bot_response = chat(user_input)
    return jsonify({"reply": bot_response})

@bot_bp.route("/api/translate", methods=["POST"])
def handle_translation():
    data = request.json
    text = data.get("message")
    lang = data.get("lang")
    translator = GoogleTranslator(source='auto', target=lang)
    translated = translator.translate(text)
    return jsonify({'translated_text': translated})
