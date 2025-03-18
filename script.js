const URL = "https://api.openweathermap.org/data/2.5/forecast?lat=59.334591&lon=18.063240&appid=15a1790288c26c9ab80c3b6f2209e071" //Default Stockholm
let lat = []
let lon = []
let fetchedData = []

// console.log(URL)

const fetchData = async () => {
  try{
    const response = await fetch (URL)
    console.log(URL)

    if (!response.ok) {
      throw new Error(`Status ${response.status}`)
    }

    const data = await response.json()

    fetchedData = data.list
    console.log(fetchedData)

        
  }
  catch (error){
    alert("There was an error, please try agein later" + error)
    console.error("Error fetching data:", error)
  }

}

fetchData()