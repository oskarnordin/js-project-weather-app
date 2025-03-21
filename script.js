
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
        throw new Error(`HTPP errror! Status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.list || data.list.length === 0) {
        throw new Error("Forecast data is empty or undefined");
      }
      //filterr out for clsoest to 12:00
      fetchedData.forecast = data.list
        .filter(item => {
          const date = new Date(item.dt * 1000);
          const hours = date.getUTCHours();
          return hours === 12;
        })
        .slice(0, 4) //for 4 days only
        .map(item => {
          return {
            date: new Date(item.dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            temp: Math.round(item.main.temp - 273.15), //from Kelevin to Celsius
            description: item.weather[0].description,
            icon: item.weather[0].icon
          };
        });
      updateForecast();
    } catch (error) {
      console.error("Errrror fetching forecast data:", error);
      alert("There was an error, please try again later: " + error.message);
    }
  };
  const updateForecast = () => {
    const forecastContainer = document.getElementById("weekForecast");
    forecastContainer.innerHTML = ``;
    fetchedData.forecast.forEach((day) => {
      const listItem = document.createElement("li");
      const iconCode = day.icon;
              const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
      listItem.innerHTML = `<span>${day.date}</span> <span>${day.temp}°C</span> <img src="${iconUrl}" alt="${day.description} icon"> <span>${day.description}</span>`;
      forecastContainer.appendChild(listItem);
    });
  };

//Time conversion
const timeConversion = () => {
  const timestamps = {
    sunrise: fetchedData[0].city.sunrise,
    sunset: fetchedData[0].city.sunset,    
  };
  const timezone = fetchedData[0].city.timezone;

  Object.entries(timestamps).forEach(([key, value]) => { 
    const date = new Date((value + timezone) * 1000);    
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');  
    
    // Update the respective HTML elements
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
    weatherMain.innerHTML = `Get your sunnies on. ${fetchedData[0].city.name} is looking great today.`;
    weatherIcon.innerHTML = `<img
          src="./img/clear.svg"
          alt="Sunglasses for clear weather"
          class="weatherIcon weatherIconClear"
        >`;
  }
  else if (fetchedData[0].list[0].weather[0].main === "Clouds") {
    document.body.classList.add("cloud");
    weatherMain.innerHTML = `It's sweater weather in ${fetchedData[0].city.name} today. Get cosy!`;
    weatherIcon.innerHTML = `<i class="fa-solid fa-cloud weatherIcon weatherIconCloud"></i>`;
  } else if (fetchedData[0].list[0].weather[0].main === "Snow") {
    document.body.classList.add("snow")
    weatherMain.innerHTML = `It's snowing in ${fetchedData[0].city.name} today. Grab your sled!`
    weatherIcon.innerHTML = `<i class="fa-solid fa-snowflake weatherIcon weatherIconSnow"></i>`
  } else if (fetchedData[0].list[0].weather[0].main === "Rain") {
    document.body.classList.add("rain");
    weatherMain.innerHTML = `Don't forget your umbrella. It's wet in ${fetchedData[0].city.name} today.`;
    weatherIcon.innerHTML = `<img
          src="./img/rain.svg"
          alt="An umbrella for rainy weather"
          class="weatherIcon weatherIconRain"
        >`;
  } else {
    document.body.classList.add("");
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