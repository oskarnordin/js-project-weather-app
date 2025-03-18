const URL = "https://api.openweathermap.org/data/2.5/forecast?lat=59.334591&lon=18.063240&appid=15a1790288c26c9ab80c3b6f2209e071" //Default Stockholm

let lat = []
let lon = []
let fetchedData = []
let cityName = document.getElementById("cityName")
let weatherDesc = document.getElementById("weatherDesc")
let sunrise = document.getElementById("sunrise")

const fetchData = async () => {
  try {
    const response = await fetch(URL)
    console.log(URL)

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
  const timestamps = {
    sunrise: fetchedData.city.sunrise,
    sunset: fetchedData.city.sunset
  }

  Object.entries(timestamps).forEach(([key, value]) => {
    const date = new Date(value * 1000)

    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    console.log(`${key}: ${hours}:${minutes}:${seconds}`)

    // Update the respective HTML elements
    document.getElementById(key).innerHTML = `${hours}:${minutes}`
  })
}

const updateCity = () => {
  if (fetchedData.city && fetchedData.city.name) {
    cityName.innerHTML = fetchedData.city.name

    timeConversion()
    
  } else {
    console.error("City data is missing in fetchedData", fetchedData)
  }
}



fetchData()
// timeConversion()