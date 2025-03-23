//Interface for fetched data
interface FetchedData {
  city: {
    name: string
    sunrise: number
    sunset: number
    timezone: number
  }
  forecast: {
    date: string
    temp: number
    description: string
    icon: string
  }[]
  list: {
    dt: number
    main: {
      temp: number
    }
    weather: {
      main: string
      description: string
    }[]
  }[]
}

//API URL
const defaultURL: string = "https://api.openweathermap.org/data/2.5/forecast?lat=59.334591&lon=18.063240&appid=15a1790288c26c9ab80c3b6f2209e071" //Default Stockholm
const parURL: string = "https://api.openweathermap.org/data/2.5/forecast?lat=48.85341&lon=2.3488&appid=15a1790288c26c9ab80c3b6f2209e071"; // Paris
const barURL: string = "https://api.openweathermap.org/data/2.5/forecast?lat=41.38879&lon=2.15899&appid=15a1790288c26c9ab80c3b6f2209e071"; // Barcelona

//DOM Elements
const cityName = document.getElementById("cityName") as HTMLSpanElement
const weatherDesc = document.getElementById("weatherDesc") as HTMLSpanElement
const sunrise = document.getElementById("sunrise") as HTMLSpanElement
const mainTemp = document.getElementById("mainTemp") as HTMLSpanElement
const weatherIcon = document.getElementById("weatherIcon") as HTMLDivElement
const searchButton = document.getElementById("inputBtn") as HTMLButtonElement
const weatherMain = document.getElementById("weatherMain") as HTMLHeadingElement
const nextCity = document.getElementById("nextCity") as HTMLDivElement

let fetchedData: FetchedData[] = []
//Fetch data from API
const fetchData = async (url: string) => {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Status ${response.status}`)
    }

    const data = await response.json()

    fetchedData = data

    updateCity()
    fetchForecastData(url) // Fetch forecast data after fetching main weather data
  } catch (error) {
    alert("There was an error, please try again later: " + error)
    console.error("Error fetching data:", error)
  }
}

//Fetch forecast data from API
const fetchForecastData = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTPP errror! Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.list || data.list.length === 0) {
      throw new Error("Forecast data is empty or undefined");
    }

    // Define the type for items in data.list

    type ListItem = {
      dt: number;
      main: {
        temp: number;
      };
      weather: {
        main: string;
        description: string;
        icon: string;
      }[];
    };

    type ForecastItem = {
      date: string;
      temp: number;
      description: string;
      icon: string;
    };

    //filter out time for 12:00
    fetchedData[0].forecast = data.list
      .filter((item: ListItem) => {
        const date = new Date(item.dt * 1000);
        const hours = date.getUTCHours();
        return hours === 12;
      })
      .slice(1, 5) //for 4 days only
      .map((item: ListItem) => {
        return {
          date: new Date(item.dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          temp: Math.round(item.main.temp - 273.15), //convert from Kelevin to Celsius
          description: item.weather[0].description,
          icon: item.weather[0].icon
        };
      });
    updateForecast();
  } catch (error) {
    console.error("Errrror fetching forecast data:", error);
    alert("There was an error, please try again later");
  }
};

const updateForecast = () => {
  const forecastContainer = document.getElementById("weekForecast")
  if (forecastContainer) {
    forecastContainer.innerHTML = ''

    fetchedData[0].forecast.forEach((day) => {
      const listItem = document.createElement("li")
      const iconCode = day.icon
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`
      listItem.innerHTML = `<span>${day.date}</span> <span>${day.temp}°C</span> <img src="${iconUrl}" alt="${day.description} icon"> <span>${day.description}</span>`
      forecastContainer.appendChild(listItem)
    })
  } else {
    console.error("Forecast container not found in the DOM.");
    alert("An error occurred while updating the forecast. Please try again later.");
  }
}

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

//Update city data
const updateCity = () => {
  if (fetchedData[0].city && fetchedData[0].city.name) {
    cityName.innerHTML = fetchedData[0].city.name

    weatherDesc.innerHTML = fetchedData[0].list[0].weather[0].description

    updateWeather()
    timeConversion()
    updateMainTemp()

  } else {
    console.error("City data is missing in fetchedData", fetchedData)
  }
}

//Update weather data
const updateWeather = () => {
  document.body.className = ''
  if (fetchedData[0].list[0].weather[0].main === "Clear") {
    document.body.classList.add("clear")
    weatherMain.innerHTML = `Get your sunnies on. ${fetchedData[0].city.name} is looking great today.`
    weatherIcon.innerHTML = `<img
          src="./img/clear.svg"
          alt="Sunglasses for clear weather"
          class="weatherIcon weatherIconClear"
        >`
  } else if (fetchedData[0].list[0].weather[0].main === "Clouds") {
    document.body.classList.add("cloud")
    weatherMain.innerHTML = `It's sweater weather in ${fetchedData[0].city.name} today. Get cosy!`
    weatherIcon.innerHTML = `<i class="fa-solid fa-cloud weatherIcon weatherIconCloud"></i>`
  } else if (fetchedData[0].list[0].weather[0].main === "Snow") {
    document.body.classList.add("snow")
    weatherMain.innerHTML = `It's snowing in ${fetchedData[0].city.name} today. Grab your sled!`
    weatherIcon.innerHTML = `<i class="fa-solid fa-snowflake weatherIcon weatherIconSnow"></i>`
  } else if (fetchedData[0].list[0].weather[0].main === "Rain") {
    document.body.classList.add("rain")
    weatherMain.innerHTML = `Don't forget your umbrella. It's wet in ${fetchedData[0].city.name} today.`
    weatherIcon.innerHTML = `<img
          src="./img/rain.svg"
          alt="An umbrella for rainy weather"
          class="weatherIcon weatherIconRain"
        >`
  } else {
    document.body.classList.add("")
  }
}

//Update main temperature
const updateMainTemp = () => {
  if (fetchedData[0].list[0].main.temp) {
    const tempInCelsius = fetchedData[0].list[0].main.temp - 273.15
    mainTemp.innerHTML = tempInCelsius.toFixed(0) + "°C"
  } else {
    console.error("Main temperature is missing in fetchedData", fetchedData)
  }
}

//Search city
const searchCity = () => {
  const inputElement = document.getElementById("searchInput") as HTMLInputElement;
  if (!inputElement) {
    alert("Search input element not found in the DOM");
    return;
  }

  const input = inputElement.value
  if (input.trim() === "") {
    alert("Please enter a city name")
    return
  }
  let searchURL = `https://api.openweathermap.org/data/2.5/forecast?q=${input}&appid=15a1790288c26c9ab80c3b6f2209e071`
  fetchData(searchURL)

  // Clear the input field after the search
  inputElement.value = "";
}

//Event listeners
searchButton.addEventListener("click", searchCity)

const nextCityClick = () => {
  if (fetchedData[0].city.name === "Stockholm") {
    fetchData(parURL)
  } else if (fetchedData[0].city.name === "Paris") {
    fetchData(barURL)
  } else {
    fetchData(defaultURL)
  }
}

nextCity.addEventListener("click", nextCityClick)

//Initial fetch
fetchData(defaultURL)