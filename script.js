
//API URL
const defaultURL = "https://api.openweathermap.org/data/2.5/forecast?lat=59.334591&lon=18.063240&appid=15a1790288c26c9ab80c3b6f2209e071"; //Default Stockholm
const parURL = "https://api.openweathermap.org/data/2.5/forecast?lat=48.85341&lon=2.3488&appid=15a1790288c26c9ab80c3b6f2209e071"; // Paris
const barURL = "https://api.openweathermap.org/data/2.5/forecast?lat=41.38879&lon=2.15899&appid=15a1790288c26c9ab80c3b6f2209e071"; // Barcelona

//DOM Elements
const cityName = document.getElementById("cityName");
const weatherDesc = document.getElementById("weatherDesc");
const sunrise = document.getElementById("sunrise");
const mainTemp = document.getElementById("mainTemp");
const weatherIcon = document.getElementById("weatherIcon");
const searchButton = document.getElementById("inputBtn");
const weatherMain = document.getElementById("weatherMain");
const nextCity = document.getElementById("nextCity");
let fetchedData = [];

//Fetch API data
const fetchData = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }
    const data = await response.json();
    fetchedData = [data];  // Wrap the response in an array

    updateCity();
    fetchForecastData(url); // Fetch forecast data after fetching main weather data
  }
  catch (error) {
    alert("There was an error, please try again later: " + error);
    console.error("Error fetching data:", error);
  }
};

//Fetch Forecast data
const fetchForecastData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.list || data.list.length === 0) {
      throw new Error("Forecast data is empty or undefined");
    }
    fetchedData[0].forecast = data.list
      .reduce((acc, item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!acc.some(entry => entry.date === date)) {
          acc.push({
            date: date,
            temp: Math.round(item.main.temp - 273.15),
            description: item.weather[0].description,
            icon: item.weather[0].icon
          });
        }
        return acc;
      }, [])
      .slice(1, 5); // Skip today's date and take the next 4 days

    updateForecast();
  }
  catch (error) {
    console.error("Error fetching forecast data:", error);
    alert("There was an error, please try again later");
  }
};

//Update Forecast
const updateForecast = () => {
  const forecastContainer = document.getElementById("weekForecast");
  if (forecastContainer) {
    forecastContainer.innerHTML = '';

    fetchedData[0].forecast.forEach((day) => {
      const listItem = document.createElement("li");
      const iconCode = day.icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
      listItem.innerHTML = `<span>${day.date}</span> <span>${day.temp}°C</span> <img src="${iconUrl}" alt="${day.description} icon"> <span>${day.description}</span>`;
      forecastContainer.appendChild(listItem);
    });
  }
  else {
    console.error("Forecast container not found in the DOM.");
    alert("An error occurred while updating the forecast. Please try again later.");
  }
};

//Time conversion
const timeConversion = () => {
  const timestamps = {
    sunrise: fetchedData[0].city.sunrise,
    sunset: fetchedData[0].city.sunset,
  };
  Object.entries(timestamps).forEach(([key, value]) => {
    const date = new Date(value * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // Update the respective HTML elements
    // Safely update the respective HTML elements
    const element = document.getElementById(key);
    if (element) {
      element.innerHTML = `${hours}:${minutes}`;
    }
    else {
      console.warn(`Element with id '${key}' not found in the DOM.`);
      alert("There was an error, please try again later");
    }
  });
};

//Update City
const updateCity = () => {
  if (fetchedData[0].city && fetchedData[0].city.name) {
    cityName.innerHTML = fetchedData[0].city.name;
    weatherDesc.innerHTML = fetchedData[0].list[0].weather[0].description;
    updateWeather();
    timeConversion();
    updateMainTemp();
  }
  else {
    console.error("City data is missing in fetchedData", fetchedData);
  }
};

//Update Weather
const updateWeather = () => {
  document.body.className = '';
  if (fetchedData[0].list[0].weather[0].main === "Clear") {
    document.body.classList.add("clear");
    weatherMain.innerHTML = `Get your sunnies on. ${fetchedData[0].city.name} is looking rather great today.`;
    weatherIcon.innerHTML = `<img
          src="./img/clear.svg"
          alt="Sunglasses for clear weather"
          class="weatherIcon weatherIconClear"
        >`;
  }
  else if (fetchedData[0].list[0].weather[0].main === "Clouds") {
    document.body.classList.add("cloud");
    weatherMain.innerHTML = `It's sweather weather in ${fetchedData[0].city.name} today. Get cosy!`;
    weatherIcon.innerHTML = `<i class="fa-solid fa-cloud weatherIcon weatherIconCloud"></i>`;
  }
  else if (fetchedData[0].list[0].weather[0].main === "Rain") {
    document.body.classList.add("rain");
    weatherMain.innerHTML = `Don't forget your umbrella. It's wet in ${fetchedData[0].city.name} today.`;
    weatherIcon.innerHTML = `<img
          src="./img/rain.svg"
          alt="An umbrella for rainy weather"
          class="weatherIcon weatherIconRain"
        >`;
  }
  else {
    document.body.classList.add("default");
  }
};

//Update Main Temperature
const updateMainTemp = () => {
  if (fetchedData[0].list[0].main.temp) {
    const tempInCelsius = fetchedData[0].list[0].main.temp - 273.15;
    mainTemp.innerHTML = tempInCelsius.toFixed(0) + "°C";
  }
  else {
    console.error("Main temperature is missing in fetchedData", fetchedData);
  }
};

//Search City
const searchCity = () => {
  const inputElement = document.getElementById("searchInput");
  if (!inputElement) {
    alert("Search input element not found in the DOM");
    return;
  }
  const input = inputElement.value;
  if (input.trim() === "") {
    alert("Please enter a city name");
    return;
  }
  let searchURL = `https://api.openweathermap.org/data/2.5/forecast?q=${input}&appid=15a1790288c26c9ab80c3b6f2209e071`;
  fetchData(searchURL);

  // This clears the input field after the search
  document.getElementById("searchInput").value = ""
};

//Event Listeners
searchButton.addEventListener("click", searchCity);
const nextCityClick = () => {
  if (fetchedData[0].city.name === "Stockholm") {
    fetchData(parURL);
  }
  else if (fetchedData[0].city.name === "Paris") {
    fetchData(barURL);
  }
  else {
    fetchData(defaultURL);
  }
};
nextCity.addEventListener("click", nextCityClick);

//Initial fetch
fetchData(defaultURL);