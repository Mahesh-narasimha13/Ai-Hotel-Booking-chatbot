import os
import json
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "booking-com.p.rapidapi.com")

if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
else:
    gemini_model = None

def get_mock_hotels():
    return [
        {
            "id": 1,
            "name": "Grand Azure Resort & Spa",
            "rating": 4.8,
            "reviews": 1240,
            "price": "$299",
            "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "amenities": ["Pool", "Spa", "Free WiFi", "Breakfast"],
            "location": "City Center"
        },
        {
            "id": 2,
            "name": "The Modernist Hotel",
            "rating": 4.5,
            "reviews": 850,
            "price": "$189",
            "image": "https://images.unsplash.com/photo-1551882547-ff40c0d509af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "amenities": ["Gym", "Bar", "Free WiFi"],
            "location": "Downtown"
        },
        {
            "id": 3,
            "name": "Oceanview Suites",
            "rating": 4.9,
            "reviews": 2100,
            "price": "$450",
            "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "amenities": ["Beachfront", "Pool", "Restaurant", "Balcony"],
            "location": "Coastal Area"
        }
    ]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")
    filters = data.get("filters", {})
    
    # Simple mock intent recognition based on keywords
    is_search = any(word in user_message.lower() for word in ["find", "search", "hotel", "book", "room", "stay"])
    
    response_text = ""
    hotels = []

    if gemini_model:
        try:
            system_prompt = """You are a professional, helpful AI hotel booking assistant. 
You must ALWAYS respond with a valid JSON object in this exact format:
{
  "reply": "Your conversational response to the user here.",
  "hotels": []
}

If the user is asking to search for or find a hotel in a specific location, populate the 'hotels' array with exactly 3 realistic, fictional hotels for that location. 
If no location is specified or they are not asking for hotels, leave the 'hotels' array empty.

Each hotel object in the 'hotels' array must have this format:
{
  "name": "Hotel Name",
  "rating": 4.5,
  "reviews": 150,
  "price": "€200",
  "image": "https://image.pollinations.ai/prompt/luxurious_hotel_room_in_paris?width=800&height=600&nologo=true",
  "amenities": ["Pool", "Free WiFi"],
  "location": "Downtown"
}
Make up realistic names, prices, and amenities based on the requested location. 
CRITICAL RULES:
1. The 'price' must use the correct local currency symbol (e.g., ¥ for Japan, € for Europe, ₹ for India, £ for UK) and represent a realistic local amount.
2. The 'image' MUST be a unique URL using https://image.pollinations.ai/prompt/ followed by a descriptive prompt of the hotel (e.g., beautiful_beach_resort_in_miami?width=800&height=600&nologo=true). Do NOT repeat the same image URL! Make each image prompt completely unique based on the hotel name and location."""

            prompt = f"System: {system_prompt}\nUser message: {user_message}\nActive filters applied by user: {json.dumps(filters)}"
            
            response = gemini_model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            try:
                response_data = json.loads(response.text)
                response_text = response_data.get("reply", "I'm having trouble parsing the AI response.")
                hotels = response_data.get("hotels", [])
            except json.JSONDecodeError:
                # Fallback if AI fails to return JSON
                response_text = response.text
                if is_search:
                    hotels = get_mock_hotels()
                
        except Exception as e:
            response_text = f"An error occurred with the Gemini AI service: {str(e)}"
    else:
        # Fallback Mock Logic
        lower_msg = user_message.lower()
        
        if is_search:
            response_text = "I'd be happy to help you find a hotel! Based on your request, I've found some excellent options for you. Take a look at these:"
            hotels = get_mock_hotels()
            
            # Filter mock hotels somewhat based on budget filter just to show interactivity
            budget = filters.get("budget", 1000)
            hotels = [h for h in hotels if int(h["price"].replace("$", "")) <= int(budget)]
            if not hotels:
                response_text = "I couldn't find hotels within that specific budget. Here are some other great options:"
                hotels = get_mock_hotels()
        elif "upcoming trips" in lower_msg:
            response_text = "You currently have no upcoming trips booked with StayGenius. Want to plan one?"
        elif "cancellation" in lower_msg:
            response_text = "To cancel a booking, please provide your booking reference number."
        elif "price trends" in lower_msg:
            response_text = "Prices in coastal areas are trending slightly downward this week! It's a great time to book."
        elif "deals right now" in lower_msg:
            response_text = "We have a flash sale! Get 20% off at The Modernist Hotel if you book today."
        elif "saved hotels" in lower_msg:
            response_text = "You haven't saved any hotels yet. Keep searching to find your perfect stay!"
        elif "recently viewed" in lower_msg:
            response_text = "You recently viewed Grand Azure Resort & Spa and Oceanview Suites."
        elif "customer support" in lower_msg:
            response_text = "Our customer support team is available 24/7. Please dial 1-800-STAYGENIUS or leave a detailed message here."
        elif "account settings" in lower_msg:
            response_text = "Your account settings are currently up to date. You can manage your search preferences on the right panel."
        elif "log me out" in lower_msg:
            response_text = "You have been securely logged out. Have a great day!"
        else:
            response_text = f"I am your AI booking assistant. You said: '{user_message}'. How can I help you plan your next trip?"

    return jsonify({
        "reply": response_text,
        "hotels": hotels
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
