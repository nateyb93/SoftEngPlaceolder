//background color "constants" to use as starting points for certain times during the day
var clickable = true;

var SUNRISE = 6;
var SOLARNOON = 12;
var SUNSET = 18;
var TWILIGHT = 24;

var SUNRISE_COLORS = [255, 161, 161];
var SOLARNOON_COLORS = [255, 255, 161];
var SUNSET_COLORS = SUNRISE_COLORS
var TWILIGHT_COLORS = [161, 161, 255];

var forecastText = [];

var map;

window.onload = function () {
    var color = calc_background();

    document.body.style.backgroundColor = color;

    initMap();
};

//initializes the map control on the page
function initMap() {
    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(35.8282, -97.5795)
    };

    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    google.maps.event.addListener(map, 'click', function (event) {
        mapClick(event.latLng.lat(), event.latLng.lng());
    });
}

//converts a number to its corresponding hex string representation.
function hex(val) {
    return val.toString(16);
}

//Calculates the background color based on the time of day
function calc_background() {
    var hour = new Date().getHours();
    var baseVector = [0, 0, 0];
    var addVector = [0, 0, 0];

    if (hour < SUNRISE) {
        baseVector = TWILIGHT_COLORS;
        //twilight through sunrise
        var amountChange = Math.floor(((6 - (SUNRISE - hour)) / 6) * 94);
        addVector = [amountChange, 0, -(amountChange)];

    } else if (hour < SOLARNOON) {
        baseVector = SUNRISE_COLORS;
        //sunrise through solar noon
        var amountChange = Math.floor(((6 - (SOLARNOON - hour)) / 6) * 94);
        addVector = [0, amountChange, 0];

    } else if (hour < SUNSET) {
        baseVector = SOLARNOON_COLORS;
        //solarnoon through sunset (previous but reversed
        var amountChange = Math.floor(((6 - (SUNSET - hour)) / 6) * 94);
        addVector = [0, -(amountChange), 0];

    } else {
        baseVector = SUNSET_COLORS;
        //sunset through twilight
        var amountChange = Math.floor(((6 - (TWILIGHT - hour)) / 6) * 94);
        addVector = [-(amountChange), 0, amountChange];
    }

    //calculate rgb using vector addition with base/xform vector
    var bgRgb = addTriVectors(baseVector, addVector);

    return "#" + hex(bgRgb[0]) + hex(bgRgb[1]) + hex(bgRgb[2]);
    
}

//helper for adding two 1x3 vectors together.
function addTriVectors(v1, v2) {
    v3 = [0, 0, 0];
    v3[0] = v1[0] + v2[0];
    v3[1] = v1[1] + v2[1];
    v3[2] = v1[2] + v2[2];

    return v3;
}

//handles conditions click
function conditionsclick() {
    var key = "898fac3520e03d7d";
    var hitemp = document.getElementById('hitemp');
    var lotemp = document.getElementById('lotemp');
    var pic = document.getElementById('pic');
    var info = document.getElementById('forecastdetail');
    var location = document.getElementById('location');

    var btnForecast = document.getElementById('forecastbutton');
    var btnCurrent = document.getElementById('conditionsbutton');

    var request = new XMLHttpRequest();
    request.open('GET', 'http://api.wunderground.com/api/e37a167f3d3d327a/geolookup/conditions/q/IA/97203.json', true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            pic.src = data["current_observation"]["icon_url"];
            hitemp.innerHTML = Math.floor(data["current_observation"]["temp_f"]).toString();
            lotemp.innerHTML = Math.floor(data["current_observation"]["temp_f"]).toString();
            info.innerHTML = data["current_observation"]["weather"];
            location.innerHTML = data["location"]["city"];
        } else {

        }
    };

    request.onerror = function () {
        pic.src = "http://d15uu3l1sro2ln.cloudfront.net/wp-content/uploads/2011/06/pip_boy_thumbs_up.jpg";
    }

    request.send();
}

//Handles the forecast click function call
function mapClick(lat, long) {
    if (!clickable) {
        return;
    }

    clickable = false;

    var zipText = document.getElementById('zipText');
    var zipCode = zipText.value;

    //buttons from the page
    var btnForecast = document.getElementById('forecastbutton');

    setTimeout(function () {
        clickable = true;
    }, 10000);

    sendWeatherRequest(lat + ',' + long);
    updateLocationText(lat, long);
}

//handles click function for zip code
function zipEntryClick() {
    var zipText = document.getElementById('zipText');
    var zipCode = zipText.value;

    //buttons from the page
    var btnForecast = document.getElementById('forecastbutton');

    //PREVENT API OVERUSAGE
    btnForecast.disabled = true;

    setTimeout(function () {
        btnForecast.disabled = false;
    }, 10000);

    sendWeatherRequest(zipCode);

}

//Sends weather request to wunderground
function sendWeatherRequest(urlParam) {
    var key = "898fac3520e03d7d";
    var request = new XMLHttpRequest();

    request.open('GET', 'http://api.wunderground.com/api/' + key + '/forecast10day/q/' + urlParam + '.json', true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);

            //Removes all children from forecast div
            var forecastList = document.getElementById('forecastList');

            while (forecastList.hasChildNodes()) {
                forecastList.removeChild(forecastList.lastChild);
            }
            for (var i = 0; i < 7; i++) {
                var fullDate = prettyDate(data["forecast"]["simpleforecast"]["forecastday"][i]["date"]["weekday"],
                                          data["forecast"]["simpleforecast"]["forecastday"][i]["date"]["monthname"],
                                          data["forecast"]["simpleforecast"]["forecastday"][i]["date"]["day"],
                                          data["forecast"]["simpleforecast"]["forecastday"][i]["date"]["year"]);

                var forecastDetail = {};
                forecastDetail.Date = fullDate;
                forecastDetail.Text = data["forecast"]["txt_forecast"]["forecastday"][i * 2]["fcttext"];
                forecastDetail.Precipitation = data["forecast"]["simpleforecast"]["forecastday"][i]["qpf_allday"]["in"];
                
                forecastText[i] = forecastDetail;

                populateForecastDay(i, 
                                    fullDate,
                                    Math.floor(data["forecast"]["simpleforecast"]["forecastday"][i]["high"]["fahrenheit"]),
                                    Math.floor(data["forecast"]["simpleforecast"]["forecastday"][i]["low"]["fahrenheit"]),
                                    data["forecast"]["simpleforecast"]["forecastday"][i]["conditions"],
                                    data["forecast"]["txt_forecast"]["forecastday"][i * 2]["fcttext"],
                                    data["forecast"]["simpleforecast"]["forecastday"][i]["qpf_allday"]["in"],
                                    data["forecast"]["simpleforecast"]["forecastday"][i]["icon"]);
            }
        } else {

        }
    }

    request.onerror = function () {
        pic.src = "http://d15uu3l1sro2ln.cloudfront.net/wp-content/uploads/2011/06/pip_boy_thumbs_up.jpg";
        
    }

    request.send();
}

function updateLocationText(lat, long) {
    var geocoder = new google.maps.Geocoder();
    var latLng = new google.maps.LatLng(lat, long);

    geocoder.geocode({ 'latLng': latLng }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var locationText = document.getElementById('location');
            if (results[1]) {
                locationText.innerHTML = results[1].formatted_address;
            } else {
                locationText.innerHTML = lat + ', ' + long;
            }
            
        }
    });
}

//Returns a pretty-looking date for overlay
function prettyDate(weekday, month, day, year) {
    return weekday + " " + month + " " + day + ", " + year;
}

//Populates one day of forecast display with the specified information
function populateForecastDay(forId, date, hiTempText, loTempText, conditionsText, detailText, precip, imgSrc) {
    //get reference to content div
    var forecastList = document.getElementById('forecastList');

    var radioLabel = document.createElement('label');
    radioLabel.htmlFor = 'radio' + forId;

    var radio = document.createElement('input');
    radio.type = 'radio';
    radio.id = 'radio' + forId;
    radio.name = 'forecast';
    radio.onchange = function () {
        onForecastClick(forId);
    };
    

    var daySpan = document.createElement('span');
    daySpan.className = 'daySpan no-overflow';

    //initializes weather controls
    var outerDiv = document.createElement('div');
    outerDiv.className = 'outerDiv';

    var weatherImage = document.createElement('div');
    weatherImage.className = 'weatherImage';

    var pic = document.createElement('img');
    pic.className = 'pic';

    var weatherInfo = document.createElement('div');
    weatherInfo.className = 'weatherInfo';

    var forecastDetail = document.createElement('span');
    forecastDetail.className = 'forecastDetail no-overflow';

    var temps = document.createElement('div');
    temps.className = 'temps';

    var hiTemp = document.createElement('span');
    hiTemp.className = 'hiTemp';

    var loTemp = document.createElement('span');
    loTemp.className = 'loTemp no-overflow';

    var precipitation = document.createElement('span');
    precipitation.className = 'precipitation';

    //set data
    daySpan.innerHTML = date.substring(0,3);
    hiTemp.innerHTML = hiTempText;
    loTemp.innerHTML = loTempText;
    forecastDetail.innerHTML = conditionsText;
    pic.src = "Icons/" + imgSrc + ".svg";

    //build top-level structures
    temps.appendChild(hiTemp);
    temps.appendChild(loTemp);

    weatherInfo.appendChild(forecastDetail);
    weatherInfo.appendChild(temps);
    weatherInfo.appendChild(precipitation);

    weatherImage.appendChild(pic);


    outerDiv.appendChild(daySpan);
    outerDiv.appendChild(weatherImage);
    outerDiv.appendChild(weatherInfo);

    radioLabel.appendChild(radio);
    radioLabel.appendChild(outerDiv);
    
    forecastList.appendChild(radioLabel);

}


function onForecastClick(index) {
    setDetailView(forecastText[index]);
}

function setDetailView(wObj) {
    var fullDateSpan = document.getElementById('detailDate');
    fullDateSpan.innerHTML = wObj.Date;

    var weatherDetails = document.getElementById('detailText');
    weatherDetails.innerHTML = wObj.Text;

    var precipitation = document.getElementById('detailPrecipitation');
    precipitation.innerHTML = 'Precipitation: ' + wObj.Precipitation + 'in.';
}