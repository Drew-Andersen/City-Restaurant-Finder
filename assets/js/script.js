const apiKey = `42eafdedee5b61f0ec122008b3e95a01`;
const numOfDays = 10;
const container = $('#container');
const inputCity = $('#city-input');
const submitBtn = $('#submit-btn');
const eventDiv = $('#event-div');
const cityDispaly = $('#city-display');
const historyDiv = $('#history-div');
let url;

function getCity() {
    const storedCity = JSON.parse(localStorage.getItem('city'));
    if (storedCity !== null) {
        return storedCity;
    } else {
        const emptyCity = [];
        return emptyCity;
    }
}

function saveCity(city) {
    const tempCities = getCity();
    if(!tempCities.includes(city)){
        tempCities.push(city);
    }
    const saveToStorage = localStorage.setItem('city' ,JSON.stringify(tempCities));
}

// Function to display the inputted city name
function displayName (city) {
    const cityName = $('<h1>').text(city).addClass('text-2xl font-bold text-white flex justify-center mb-2');
    console.log(city);
    cityDispaly.append(cityName);
}

// Nothing works when city is inputted

function getWeather(city){
   if(city === undefined){
    let cityName = inputCity.val();
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=imperial`;
   } else {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;
   }
    
   console.log(url);
    fetch(url)
    .then(function (response){
        return response.json();
    })
    .then(function (weather){
        container.empty();
        cityDispaly.empty();
        inputCity.val("");
        saveCity(weather.city.name);
        displayHistoryBtns();
        displayName(weather.city.name);
        let dayOffSet = 0;
        for (let i = 0; i < 5; i++) {
            // Create a div to hold the elements of the card
            const forcastCard = $('<div>');
            forcastCard.addClass('card border basis-1/5');
            // Added a date for the card
            const forcastDate = $('<p>');
            forcastDate.text(dayjs().add(i + 1, 'day').format('M/D/YYYY'));
            // Creating a weather icon
            const weatherIcon = $('<img>');
            console.log(weather); // Undefined
            const icon = weather.list[dayOffSet].weather[0].icon;
            weatherIcon.attr('src', `https://openweathermap.org/img/wn/${icon}@2x.png`);
            // Create temp
            const temp = weather.list[dayOffSet].main.temp;
            const tempDiv = $('<p>');
            tempDiv.text('Temp: ' + temp + '°F')
            // Create wind
            const wind = weather.list[dayOffSet].wind.speed;
            const windDiv = $('<p>');
            windDiv.text('Wind: ' + wind + 'mph');
            // Create humidity
            const humidity = weather.list[dayOffSet].main.humidity;
            const humidDiv = $('<p>');
            humidDiv.text('Humidity: ' + humidity + '%');
            // Sets it per day instead of every 3 hours
            dayOffSet = dayOffSet +8;
            // Append the elements to the screen
            forcastCard.append(forcastDate, weatherIcon, tempDiv, windDiv, humidDiv);
            container.append(forcastCard);
        };
        // pass coord to other function
        const lat = weather.city.coord.lat;
        const lon = weather.city.coord.lon;
        getEvents(lat, lon);
    })
    .catch(function (error){
        console.log(error);
    })
}

function getEvents(eLat,eLon){
    const urlKey = `AIzaSyAnTBaaKIz-lNvU-Ppy1JejTOO4AIdVyQM`;
    const url = `https://floating-headland-95050.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location=${eLat}%2C${eLon}&radius=1500&type=restaurant&key=${urlKey}`;
console.log(url);
    fetch(url)
    .then(function (response){
        return response.json();
    })
    .then(function (data) {
        eventDiv.empty(); 
        console.log(data);
        for (let i = 0; i < 3; i++) {
            // Add a <div> to hold the info
            const evetCard = $('<div>').addClass('card border');
            // Add a <div to hold info
            const contentDiv = $('<div>').addClass('border');
            // Add the image for the imgDiv
            // Add elements for the content div
            const eventName = $('<h2>').text(`Name: ${data.results[i].name}`);

            // If statement to see if its open or not
            function isItOpen(){
                if (data.results[i].opening_hours.open_now = true) {
                    return "Yes";
                } else {
                    return "No";
                }
            }
            // If statement to show the price of the resturant
            function price(){
                if (data.results[i].price_level === 1) {
                    return '$';
                }else if (data.results[i].price_level === 2){
                    return '$$';
                }else if (data.results[i].price_level === 3){
                    return '$$$';
                }else if (data.results[i].price_level === 4){
                    return '$$$$';
                }else if (data.results[i].price_level === 5){
                    return '$$$$$';
                }
            }

            const isOpen = $('<p>').text(`Open: ${isItOpen()}`);
            const address = $('<p>').text(`Address: ${data.results[i].vicinity}`);
            const ratings = $('<p>').text(`Rating: ${data.results[i].rating}`);
            const priceLevel = $('<p>').text(`Price: ${price()}`);

            // Append the elements to the page
            contentDiv.append(eventName, isOpen, address, ratings, priceLevel);
            evetCard.append(contentDiv);
            eventDiv.append(evetCard);
        }
    })
    .catch(function (error){
        console.log(error);
    })
}

function displayHistoryBtns () {
    historyDiv.empty();
    const tempCities = getCity();
    tempCities.forEach((city, i) => {
        const cityCard = $('<button>').addClass('histroy-btn text-white m-2 p-1.5 border rounded').attr('data-id', i);
        cityCard.text(city);
        historyDiv.append(cityCard);
    })
}

function handleSearch(event){
    getWeather();
    getEvents();
}

function handleHistorySearch() {
    let cityID = $(this).attr('data-id');
    let savedCities = getCity();
    console.log(cityID);
    console.log(savedCities);
    container.empty();
    eventDiv.empty();
    getWeather(savedCities[cityID]);
    getEvents(savedCities[cityID]);
}



inputCity.on("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById('submit-btn').click();
    }
  });
submitBtn.on('click', handleSearch);
historyDiv.on('click', '.histroy-btn', handleHistorySearch);

window.onload = displayHistoryBtns;

