//Interface?
interface FetchedData {
  city:{
    name: string
    sunrise: number
    sunset: number
  }
  list: {
    main: {
      temp: number
    }
    weather: {
      main: string
      description: string
    }[]
  }[]
}

//DOM Elements
const defaultURL:string = "https://api.openweathermap.org/data/2.5/forecast?lat=59.334591&lon=18.063240&appid=15a1790288c26c9ab80c3b6f2209e071" //Default Stockholm

const cityName = document.getElementById("cityName") as HTMLSpanElement
const weatherDesc = document.getElementById("weatherDesc") as HTMLSpanElement
const sunrise = document.getElementById("sunrise") as HTMLSpanElement
const mainTemp = document.getElementById("mainTemp") as HTMLSpanElement
const weatherIcon = document.getElementById("weatherIcon") as HTMLDivElement
const searchButton = document.getElementById("inputBtn") as HTMLButtonElement

let fetchedData: FetchedData[] = []

const fetchData = async (url:string) => {
  try {
    const response = await fetch(url)
    //console.log(url)

    if (!response.ok) {
      throw new Error(`Status ${response.status}`)
    }

    const data = await response.json()

    fetchedData = data
    console.log(fetchedData)

    updateCity()
  } catch (error) {
    alert("There was an error, please try again later: " + error)
    console.error("Error fetching data:", error)
  }
}

const timeConversion = () => {
  const timestamps: {sunrise: number; sunset: number} = {
    sunrise: fetchedData[0].city.sunrise,
    sunset: fetchedData[0].city.sunset,
  };

  (Object.entries(timestamps) as [key: "sunrise" | "sunset", value: number][]).forEach(([key, value]) => {
    const date = new Date(value * 1000)

    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    console.log(`test ${key}: ${hours}:${minutes}:${seconds}`)

    // Update the respective HTML elements
    // Safely update the respective HTML elements
    const element = document.getElementById(key);
    if (element) {
      element.innerHTML = `${hours}:${minutes}`;
    } else {
      console.warn(`Element with id '${key}' not found in the DOM.`)
    }
  })
}

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


const updateWeather = () => {
  document.body.className = ''; // Remove all classes
  if (fetchedData[0].list[0].weather[0].main === "Clear") {
    document.body.classList.add("clear")
    weatherIcon.innerHTML = `<i class="weatherIcon fa-solid fa-glasses"></i>`
  } else if (fetchedData[0].list[0].weather[0].main === "Clouds") {
    document.body.classList.add("cloud")
    weatherIcon.innerHTML = `<i class="weatherIcon fa-solid fa-cloud"></i>`
  } else if (fetchedData[0].list[0].weather[0].main === "Rain") {
    document.body.classList.add("rain")
    weatherIcon.innerHTML = `<i class="weatherIcon fa-solid fa-umbrella"></i>`
  } else {
    document.body.classList.add("default")
  }
}

const updateMainTemp = () => {
  if (fetchedData[0].list[0].main.temp) {
    const tempInCelsius = fetchedData[0].list[0].main.temp - 273.15
    mainTemp.innerHTML = tempInCelsius.toFixed(0) + "°C"
  } else {
    console.error("Main temperature is missing in fetchedData", fetchedData)
  }
}

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
}

searchButton.addEventListener("click", searchCity)

fetchData(defaultURL)