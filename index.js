document.addEventListener("DOMContentLoaded", function () {
  function getIp() {
    accessToken = "85cf430545fec4";
    ipUrl = "https://ipinfo.io/json?token=";

    fetch(ipUrl + accessToken).then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          storeIp(data);
        });
      }
    });
  }
  getIp();

  function storeIp(ip) {
    var uWeather = {
      homeLocation: {
        city: "",
        state: "",
        lat: "",
        lon: "",
      },
      savedLocations: [],
    };

    var location = JSON.stringify(ip.loc);
    var city = JSON.stringify(ip.city);
    var state = JSON.stringify(ip.region);

    city = city.replace('"', "");
    city = city.replace('"', "");
    uWeather.homeLocation.city = city;

    state = state.replace('"', "");
    state = state.replace('"', "");
    uWeather.homeLocation.state = state;

    var partOne = location.slice(0, location.length / 2);
    var partTwo = location.slice(location.length / 2, location.length);
    var partTwoCut = partTwo.replace(",", "");

    // Slice Lat
    if (partOne[1] === "-") {
      var newLat = partOne.slice(1, 7);
    } else {
      var newLat = partOne.slice(1, 6);
    }
    uWeather.homeLocation.lat = newLat;

    // Slice Lon
    if (partTwoCut.startsWith("-")) {
      var newLon = partTwoCut.slice(0, 6);
    } else if (partTwoCut.startsWith(",")) {
      var newLon = partTwoCut.slice(1, 6);
    } else {
      var newLon = partTwoCut.slice(0, 5);
    }
    uWeather.homeLocation.lon = newLon;
    localStorage.setItem("uweather", JSON.stringify(uWeather));
    fetchWeather();
  }

  function fetchWeather() {
    var uWeather = JSON.parse(localStorage.getItem("uweather"));
    // Getting lat and lon from localstorage to send into weather Api request
    var Latitude = uWeather.homeLocation.lat;
    var Longitude = uWeather.homeLocation.lon;

    // Fetch for the weather Api fill lat and lon
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
        Latitude +
        "&lon=" +
        Longitude +
        "&appid=0f14b0df581c6adeaefe66badf8a8ffd&units=imperial"
    ).then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          renderWeather(data);
        });
      }
    });
  }

  // Function to apply all data to the html
  function renderWeather(weather) {
    var uWeather = JSON.parse(localStorage.getItem("uweather"));

    var date = dayjs().format("dddd, MMMM D, YYYY");
    var dateTag = document.getElementById("date");
    dateTag.textContent = date;

    var cityName = document.getElementById("city1");
    cityName.textContent =
      uWeather.homeLocation.city + ", " + uWeather.homeLocation.state + ".";

    var temp = document.getElementById("temp");
    temp.textContent = weather.main.temp + "°F";

    var humidity1 = document.getElementById("humidity1");
    humidity1.textContent = weather.main.humidity + "%";

    var windSpeed1 = document.getElementById("windspeed");
    windSpeed1.textContent = weather.wind.speed + " Mph";
  }

  var searchButton = document.getElementById("button");

  searchButton.addEventListener("click", function (event) {
    event.preventDefault();
    var clickSubmit = event.target.id;
    var cityinput = document.getElementById("buttons").value;

    if (clickSubmit === "button") {
      if (!cityinput) {
        alert("Try Again");
      } else {
        checkState();
      }
    }
  });

  function checkState() {
    var cityInput = document.getElementById("buttons").value;
    var string = cityInput.toString();
    var split = string.split(",");

    var city = split[0];
    var state = split[1];

    var uWeather = JSON.parse(localStorage.getItem("uweather"));

    if (city && state) {
      uWeather.homeLocation.city = city;
      uWeather.homeLocation.state = state;
      localStorage.setItem("uweather", JSON.stringify(uWeather));
      fetchSearchLocation(city, state);
    } else {
      return;
    }
  }

  function fetchSearchLocation(city, state) {
    var uWeather = JSON.parse(localStorage.getItem("uweather"));

    fetch(
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
        city +
        "," +
        state +
        "," +
        "US&appid=a68ad8fbcadf849a4a00973e9e0219b0"
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.length < 1) {
          alert("Did not work!");
        } else {
          uWeather.homeLocation.city = city;
          uWeather.homeLocation.state = state;
          uWeather.homeLocation.lat = data[0].lat;
          uWeather.homeLocation.lon = data[0].lon;
          localStorage.setItem("uweather", JSON.stringify(uWeather));
          fetchWeather();
          getWeather();
        }
      });
  }

  getWeather();

  function getWeather() {
    var uWeather = JSON.parse(localStorage.getItem("uweather"));

    var Latitude = uWeather.homeLocation.lat;
    var Longitude = uWeather.homeLocation.lon;

    fetch(
      "https://api.openweathermap.org/data/2.5/forecast?lat=" +
        Latitude +
        "&lon=" +
        Longitude +
        "&appid=0f14b0df581c6adeaefe66badf8a8ffd&units=imperial&cnt=5"
    ).then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          renderweather2(data);
        });
      }
    });
  }

  function renderweather2(weather) {
    console.log(weather);
    var update = document.getElementById("forecast");

    for (var i = 0; i < weather.list.length; i++) {
      var div = document.createElement("div");
      div.className = "forecast-day";

      var h3 = document.createElement("h3");
      h3.textContent = weather.list[i].dt_txt;
      div.appendChild(h3);

      var temp = document.createElement("p");
      temp.textContent = "Temperature: " + weather.list[i].main.temp + "°F";
      div.appendChild(temp);

      var humidity = document.createElement("p");
      humidity.textContent = "Humidity: " + weather.list[i].main.humidity + "%";
      div.appendChild(humidity);

      var wind = document.createElement("p");
      wind.textContent = "Wind Speed: " + weather.list[i].wind.speed + " MPH";
      div.appendChild(wind);

      update.appendChild(div);
    }
  }
});
