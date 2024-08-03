const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const openCageApiKey = '9c6b742dc0034c5ea09871fff20a1a85'; // Replace with your OpenCage API key
const openWeatherMapApiKey = 'dcee085d9c0744a270db2e349d5f0000'; // Replace with your OpenWeatherMap API key
const exchangeRateApiKey = '04067a625d9a7ab3d4ecaa35'; // Replace with your ExchangeRate API key

const botResponses = {
    "hello": "Hi there! How can I assist you with finding a room or house to rent?",
    "hi": "Hello! How can I help you today?",
    "how much": "The rent varies based on location and amenities. Can you specify your preferred area?",
    "location": "Please provide the location where you are looking for a rental.",
    "bye": "Goodbye! Feel free to come back if you have more questions.",
    "available rooms": "Please specify the location you are interested in (e.g., Downtown, Suburbs, University).",
    "exchange rate": "Please provide the base currency and target currency in the format 'baseCurrency to targetCurrency' (e.g., USD to EUR)."
};

function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === "") return;

    appendMessage(userMessage, 'user-message');
    userInput.value = "";

    if (userMessage.toLowerCase().includes('location')) {
        fetchLocationData(userMessage);
    } else if (userMessage.toLowerCase().includes('weather')) {
        const location = userMessage.split(' ').slice(-1)[0]; // Get the last word as location
        console.log('Fetching weather for location:', location); // Logging the location
        fetchWeatherData(location);
    } else if (userMessage.toLowerCase().includes('exchange rate')) {
        const [baseCurrency, targetCurrency] = userMessage.toLowerCase().split('to').map(c => c.trim()); // Split on 'to' and trim spaces
        if (baseCurrency && targetCurrency) {
            fetchCurrencyExchangeRate(baseCurrency.toUpperCase(), targetCurrency.toUpperCase());
        } else {
            appendMessage('Please provide both base currency and target currency in the format "baseCurrency to targetCurrency".', 'bot-message');
        }
    } else {
        setTimeout(() => {
            const botMessage = getBotResponse(userMessage.toLowerCase());
            appendMessage(botMessage, 'bot-message');
        }, 500);
    }
}

function appendMessage(message, className) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${className}`;
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function getBotResponse(userMessage) {
    for (const key in botResponses) {
        if (userMessage.includes(key)) {
            return botResponses[key];
        }
    }
    return "I'm sorry, I didn't understand that. Can you please rephrase?";
}

function fetchCurrencyExchangeRate(baseCurrency, targetCurrency) {
    const apiUrl = `https://v6.exchangerate-api.com/v6/${exchangeRateApiKey}/latest/${baseCurrency}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.result === "success") {
                const rate = data.conversion_rates[targetCurrency];
                const botMessage = `The current exchange rate from ${baseCurrency} to ${targetCurrency} is ${rate}.`;
                appendMessage(botMessage, 'bot-message');
            } else {
                appendMessage('Sorry, I could not fetch the exchange rate.', 'bot-message');
            }
        })
        .catch(error => {
            console.error('Error fetching exchange rate:', error);
            appendMessage('Sorry, something went wrong while fetching exchange rate.', 'bot-message');
        });
}

function fetchWeatherData(location) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${openWeatherMapApiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Weather API response:', data); // Logging the API response
            if (data.cod === 200) {
                const weatherData = `The current weather in ${location} is ${data.weather[0].description} with a temperature of ${data.main.temp}°C.`;
                appendMessage(weatherData, 'bot-message');
            } else {
                appendMessage('Sorry, I could not fetch the weather information for that location.', 'bot-message');
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            appendMessage('Sorry, something went wrong while fetching weather data.', 'bot-message');
        });
}

function fetchLocationData(location) {
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${openCageApiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length > 0) {
                const locationData = data.results[0].formatted;
                const botMessage = `Here are some listings in ${locationData}: \n\n${getMockListings(locationData)}`;
                appendMessage(botMessage, 'bot-message');
            } else {
                appendMessage('Sorry, no listings found for that location.', 'bot-message');
            }
        })
        .catch(error => {
            console.error('Error fetching location data:', error);
            appendMessage('Sorry, something went wrong while fetching location data.', 'bot-message');
        });
}

function getMockListings(location) {
    // Simulate fetching data from an API
    const mockListings = [
        `Listing 1: Cozy studio in ${location}`,
        `Listing 2: Spacious 2-bedroom apartment in ${location}`,
        `Listing 3: Affordable 1-bedroom in ${location}`,
        `Listing 4: Luxurious penthouse in ${location}`,
        `Listing 5: Budget-friendly room in shared house in ${location}`
    ];
    return mockListings.join('\n');
}
