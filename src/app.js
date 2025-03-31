document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "1e247c768bb5ebd8ad5cca511a9a4f51";
  const API_BASE_URL = "https://api.openweathermap.org/data/2.5/";

  const mainContainer = document.querySelector(".main");
  const searchInput = document.getElementById("search");
  const searchButton = document.getElementById("searchBtn");
  const useCurrentLocation = document.getElementById("currentLocation");
  const recentSearchesContainer = document.querySelector(
    ".recent-searches-container"
  );
  const recentSearchesDropdown = document.getElementById("recentSearches");
  const weatherSection = document.querySelector(".weather-container");
  const weatherContainer = document.getElementById("currentWeather");
  const forecastContainer = document.getElementById("forecastWeather");
  const notification = document.querySelector(".notification");

  const errorCode = (msg) =>
    `<div class="display-loader display-error">
        <div class="error-icon">!</div>
        <div class="left-text">
            <p class="err-label">Try Again!</p>
            <p>${msg}</p>
        </div> 
    </div>`;

  const loader = `<div class="display-loader"> 
                    <div class="loader"></div>
                    <p> Loading . . . </p>
                </div>`;

  // Getting current Weather Data with search input
  async function getCurrentWeatherData(city) {
    if (!weatherSection.classList.contains("hide")) {
      weatherSection.classList.add("hide");
    }
    if (mainContainer.classList.contains("display-grid"))
      mainContainer.classList.remove("display-grid");
    notification.innerHTML = loader;

    try {
      if (city === "") throw new Error("City name can't be empty");
      const response = await fetch(
        `${API_BASE_URL}weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) throw new Error("Enter a valid city name");
      const data = await response.json();
      notification.innerHTML = "";
      weatherSection.classList.remove("hide");
      if (!weatherSection.classList.contains("display-grid")) {
        mainContainer.classList.add("display-grid");
      }
      displayCurrentWeatherData(data);
      storeRecentSearches(city);
      getForecastData(city);
    } catch (error) {
      notification.innerHTML = errorCode(error.message);
    }
  }

  // Fetch 5-day Forecast Data
  async function getForecastData(city) {
    forecastContainer.innerHTML = loader;
    try {
      const response = await fetch(
        `${API_BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) throw new Error("Forecast not available");
      const data = await response.json();
      displayForecastData(data.list);
    } catch (error) {
      forecastContainer.innerHTML = errorCode(error.message);
    }
  }

  // Displaying current weather data
  function displayCurrentWeatherData(data) {
    const { name, main, sys, weather, wind } = data;
    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    weatherContainer.innerHTML = `
        <div class='today-weather'>
            <div class="left-text">
                <p class='location-nam'>${name}, ${sys.country}</p> 
                <p class='location-date'>${currentDate}</p> 
                <h2 class="temp"> ${main.temp}°<small>C</small></h2>
                <p class="wind-humidity"> <strong>Wind Speed: </strong> ${wind.speed} m/s <br> <strong>Humidity: </strong> ${main.humidity}%</p>

            </div>
            <div class="weather-icon-description">
                <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].main}" class='weather-img' />
                <p>${weather[0].description}</p>
            </div>

        </div>
    `;
  }

  // Displaying 5-day forecast data
  function displayForecastData(forecastData) {
    let dailyForecasts = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    forecastData.forEach((entry) => {
      const forecastDate = new Date(entry.dt_txt);

      forecastDate.setHours(0, 0, 0, 0);

      if (forecastDate > today) {
        const dateStr = forecastDate.toISOString().split("T")[0];
        if (!dailyForecasts[dateStr] || entry.dt_txt.includes("12:00:00")) {
          dailyForecasts[dateStr] = entry;
        }
      }
    });

    const finalForecast = Object.values(dailyForecasts).slice(0, 5);

    forecastContainer.innerHTML = finalForecast
      .map((day) => {
        const formattedDate = new Date(day.dt_txt).toLocaleDateString(
          undefined,
          {
            weekday: "long",
            day: "numeric",
            month: "long",
          }
        );

        return `    
            <div class="forecast-card">
                <div class="forecast-textcard">
                    <p class="forecast-date">${formattedDate}</p>
                    <p><i class="fa-solid fa-temperature-three-quarters fa-xl"></i> ${day.main.temp}°C</p>
                    <p><strong>Wind Speed: </strong> ${day.wind.speed} m/s</p>
                    <p><strong>Humidity: </strong> ${day.main.humidity}%</p>
                </div>
                <div class="forecast-img-description">
                    <img class="forecast-img" src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].main}"/>
                    <p>${day.weather[0].description}</p>
                </div>
            </div>
        `;
      })
      .join("");
  }

  // Save and Load Recent Searches
  function storeRecentSearches(city) {
    let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    if (!searches.includes(city)) searches.unshift(city);
    localStorage.setItem(
      "recentSearches",
      JSON.stringify(searches.slice(0, 10))
    );
    getRecentSearches(city);
  }

  function getRecentSearches(active = null) {
    let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    if (searches?.length > 0) {
      recentSearchesContainer.classList.remove("hidden");
    } else {
      if (!recentSearchesContainer.classList.includes("hidden")) {
        recentSearchesContainer.classList.add("hidden");
      }
    }

    recentSearchesDropdown.innerHTML = `<option value="" disabled selected>Select City</option>`;
    recentSearchesDropdown.innerHTML += searches
      .map(
        (city) => `
        <option value="${city}">${city}</option>
    `
      )
      .join("");
    recentSearchesDropdown.value = active;
  }

  //Getting current Weather data with Current Location
  function getCurrentLocationWeatherData() {
    if (!weatherSection.classList.contains("hide")) {
        weatherSection.classList.add("hide");
    }
    if (mainContainer.classList.contains("display-grid"))
        mainContainer.classList.remove("display-grid");
    notification.innerHTML = loader;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `${API_BASE_URL}weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                    );
                    if (!response.ok) throw new Error("Location not found");
                    const data = await response.json();
                    notification.innerHTML = "";
                    weatherSection.classList.remove("hide");
                    if (!weatherSection.classList.contains("display-grid")) {
                        mainContainer.classList.add("display-grid");
                    }
                    displayCurrentWeatherData(data);
                    storeRecentSearches(data.name);
                    getForecastData(data.name);
                } catch (error) {
                    notification.innerHTML = errorCode(error.message);
                }
            },
            () => {
                notification.innerHTML = errorCode("Unable to get loacation.");
            }
        );
    } else {
        notification.innerHTML = errorCode("Geolocation is not supported");
    }
}


  searchButton.addEventListener("click", () =>
    getCurrentWeatherData(searchInput.value)
  );
  useCurrentLocation.addEventListener("click", getCurrentLocationWeatherData);
  recentSearchesDropdown.addEventListener("change", (e) =>
    getCurrentWeatherData(e.target.value)
  );

  //getting Recent searches data
  getRecentSearches("");
});
