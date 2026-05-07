# StayGenius AI - Hotel Booking Chatbot

A full-stack, AI-powered hotel booking chatbot web application featuring a modern 3-panel UI, glassmorphism, and a dark gradient colorful theme.

## Features
- **3-Panel Dashboard**: Left navigation, center chat interface, and right advanced filters.
- **AI Chatbot**: Intelligently parses user requests to find the perfect hotel using OpenAI.
- **Dynamic Filters**: Filters state (budget, ratings, amenities) is combined with the chat request.
- **Modern UI**: Built with Tailwind CSS, custom gradients, and smooth animations.

## Tech Stack
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (via CDN)
- **Backend**: Python 3, Flask
- **APIs**: OpenAI API (for chatbot logic), RapidAPI / Mock data (for hotel search)

## Setup Instructions

### 1. Prerequisites
- Python 3.8 or higher installed on your machine.
- An OpenAI API Key (optional but recommended for real AI responses).

### 2. Installation
Navigate to the project directory and install the required dependencies:
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Open the `.env` file in the root directory and add your API keys.
If you do not have an OpenAI API key, the app will automatically fall back to mock AI responses so you can still test the UI and flow.

```env
OPENAI_API_KEY=your_openai_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
```

### 4. Run the Application
Start the Flask server:
```bash
python app.py
```

### 5. Access the Web App
Open your web browser and navigate to:
```
http://localhost:5000
```

## How to Test
1. Send a message like "Find me a cheap hotel in NYC" or click one of the quick reply buttons.
2. Adjust the budget slider and amenity checkboxes on the right panel, then send another search request to see the mock filters apply dynamically.
3. Observe the AI extracting your intent and returning rich hotel cards directly in the chat interface!
