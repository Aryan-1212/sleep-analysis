import ollama
import json
import os
from typing import List, Dict, Any
import threading
import time

# Global cache for conversation history
_conversation_cache = []
_cache_file = 'data.json'
_last_save_time = 0
_save_lock = threading.Lock()

def load_conversation_history():
    """Load conversation history from file with error handling"""
    global _conversation_cache
    try:
        if os.path.exists(_cache_file):
            with open(_cache_file, 'r') as file:
                data = json.load(file)
                _conversation_cache = data if isinstance(data, list) else []
        else:
            _conversation_cache = []
    except (json.JSONDecodeError, FileNotFoundError):
        _conversation_cache = []

def save_conversation_history_async():
    """Save conversation history asynchronously without blocking"""
    global _last_save_time, _conversation_cache
    current_time = time.time()
    
    # Only save if 5 seconds have passed since last save
    if current_time - _last_save_time > 5:
        with _save_lock:
            try:
                with open(_cache_file, 'w') as file:
                    json.dump(_conversation_cache, file, indent=2)
                _last_save_time = current_time
                print(f"Saved conversation history with {len(_conversation_cache)} exchanges")
            except Exception as e:
                print(f"Error saving conversation: {e}")

def is_sleep_related(user_input: str) -> bool:
    """Check if the user input is sleep-related"""
    sleep_keywords = [
        'sleep', 'bed', 'rest', 'tired', 'insomnia', 'wake', 'dream', 'nap',
        'bedtime', 'night', 'morning', 'awake', 'drowsy', 'energy', 'fatigue',
        'stress', 'anxiety', 'relax', 'calm', 'meditation', 'routine'
    ]
    user_input_lower = user_input.lower()
    return any(keyword in user_input_lower for keyword in sleep_keywords)

def get_system_prompt(user_input: str) -> str:
    """Get appropriate system prompt based on user input"""
    if is_sleep_related(user_input):
        return (
            "You are a friendly sleep coach. Give helpful, detailed sleep advice. "
            "Be concise but provide enough information to fully answer the user's question."
        )
    else:
        # More neutral, general assistant prompt
        return (
            "You are a helpful, friendly AI assistant. "
            "If the user greets you, greet them back. "
            "If the user asks about sleep, provide sleep advice. "
            "Otherwise, answer their question or respond appropriately, giving as much detail as needed."
        )

def chat(user_input: str) -> str:
    """
    Smart response generation that adapts to user input while maintaining speed
    """
    global _conversation_cache
    
    # Load conversation history once
    if not _conversation_cache:
        load_conversation_history()
    
    user_msg = {
        "role": "user",
        "content": user_input
    }

    # Use last 3 exchanges for better context
    recent_history = _conversation_cache[-3:] if len(_conversation_cache) > 3 else _conversation_cache
    
    # Get appropriate system prompt based on user input
    system_prompt = get_system_prompt(user_input)
    
    # Build minimal messages array
    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]
    
    # Add only the most recent conversation
    for pair in recent_history:
        messages.extend(pair)
    
    # Add current message
    messages.append(user_msg)

    try:
        # Maximum speed settings for gemma:2b on your system
        response = ollama.chat(
            model='gemma:2b',
            messages=messages,
            options={
                'temperature': 0.5,
                'top_p': 0.9,
                'top_k': 40,
                'num_predict': 150,  # Allow much longer responses
                # No stop tokens!
                'repeat_penalty': 1.1,
                'seed': 42,
                'num_ctx': 512,
                'num_thread': 6,
                'num_gpu': 0,
                'num_batch': 16,
                'num_keep': 0,
                'tfs_z': 0.5,
                'typical_p': 0.5,
                'repeat_last_n': 10,
                'mirostat': 0,
                'mirostat_tau': 0.0,
                'mirostat_eta': 0.0,
            }
        )

        assistant_msg = response['message']
        
        # Update cache
        _conversation_cache.append([user_msg, assistant_msg])
        
        # Keep only last 10 conversations to maintain some context
        if len(_conversation_cache) > 10:
            _conversation_cache = _conversation_cache[-10:]
        
        # Save asynchronously without blocking
        threading.Thread(target=save_conversation_history_async, daemon=True).start()

        return assistant_msg['content']
        
    except Exception as e:
        print(f"Error generating response: {e}")
        return "Sorry, I'm having trouble. Make sure, your model is running."

# Initialize conversation history on module load
load_conversation_history()
