//background color "constants" to use as starting points for certain times during the day
var TWILIGHT = 6;
var SUNRISE = 12;
var SOLARNOON = 18;
var SUNSET = 24;

var SUNRISE_COLORS = [255, 161, 161];
var SOLARNOON_COLORS = [255, 255, 161];
var SUNSET_COLORS = SUNRISE_COLORS
var TWILIGHT_COLORS = [161, 161, 255];

window.onload = function () {
    var color = calc_background();

    document.body.style.backgroundColor = "#a2a1ff";
};

function hex(val) {
    return val.toString(16);
}

function calc_background() {
    var hour = new Date().getHours();
    var baseVector = [0, 0, 0];
    var addVector = [0, 0, 0];

    if (hour < TWILIGHT) {
        baseVector = TWILIGHT_COLORS;
        //from twilight till sunrise, twilight colors act as base
        //and we need to alter R and B values between 161/255
        //R goes down and B goes up
        var amountChange = Math.floor(((TWILIGHT - hour) / TWILIGHT) * 94);
        addVector = [amountChange, 0, -(amountChange)];

    } else if (hour < SUNRISE) {
        baseVector = SUNRISE_COLORS;
        //sunrise through solar noon
        var amountChange = Math.floor(((SUNRISE - hour) / SUNRISE) * 94);
        addVector = [0, amountChange, 0];

    } else if (hour < SOLARNOON) {
        baseVector = SOLARNOON_COLORS;
        //solarnoon through sunset (previous but reversed
        var amountChange = Math.floor(((SOLARNOON - hour) / SOLARNOON) * 94);
        addVector = [0, -(amountChange), 0];

    } else {
        baseVector = SUNSET_COLORS;
        //sunset through twilight
        var amountChange = Math.floor(((SUNSET - hour) / SUNSET) * 94);
        addVector = [amountChange, 0, -(amountChange)];
    }

    //calculate rgb using vector addition with base/xform vector
    var bgRgb = addTriVectors(baseVector, addVector);

    return "#" + hex(bgRgb[0]) + hex(bgRgb[1]) + hex(bgRgb[2]);
    
}

function addTriVectors(v1, v2) {
    v3 = [0, 0, 0];
    v3[0] = v1[0] + v2[0];
    v3[1] = v1[1] + v2[1];
    v3[2] = v1[2] + v2[2];

    return v3;
}

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
function forecastclick() {
    //API Key
    var key = "898fac3520e03d7d";

    var zipText = document.getElementById('zipText');
    var zipCode = zipText.value;

    //buttons from the page
    var btnForecast = document.getElementById('forecastbutton');
    var btnCurrent = document.getElementById('conditionsbutton');

    //PREVENT API OVERUSAGE
    btnForecast.disabled = true;

    setTimeout(function () {
        btnForecast.disabled = false;
    }, 10000);

    var request = new XMLHttpRequest();
    request.open('GET', 'http://api.wunderground.com/api/e37a167f3d3d327a/forecast10day/q/' + zipCode + '.json', true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            
            //Removes all children from forecast div
            var forecastDiv = document.getElementById('forecastDiv');
            while (forecastDiv.hasChildNodes()) {
                forecastDiv.removeChild(forecastDiv.lastChild);
            }
            for (var i = 0; i < 7; i++) {
                populateForecastDay(data["forecast"]["simpleforecast"]["forecastday"][i]["date"]["weekday_short"],
                                    Math.floor(data["forecast"]["simpleforecast"]["forecastday"][i]["high"]["fahrenheit"]),
                                    Math.floor(data["forecast"]["simpleforecast"]["forecastday"][i]["low"]["fahrenheit"]),
                                    data["forecast"]["simpleforecast"]["forecastday"][i]["conditions"],
                                    data["forecast"]["simpleforecast"]["forecastday"][i]["qpf_allday"]["in"],
                                    data["forecast"]["simpleforecast"]["forecastday"][i]["icon_url"]);
            }
        } else {

        }
    }

    request.onerror = function () {
        pic.src = "http://d15uu3l1sro2ln.cloudfront.net/wp-content/uploads/2011/06/pip_boy_thumbs_up.jpg";
    }

    request.send();
}

//Populates one day of forecast display with the specified information
function populateForecastDay(day, hiTempText, loTempText, conditionsText, precip, imgSrc) {
    //get reference to content div
    var forecastDiv = document.getElementById('forecastDiv');

    var daySpan = document.createElement('span');
    daySpan.className = 'daySpan';

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
    forecastDetail.className = 'forecastDetail';

    var temps = document.createElement('div');
    temps.className = 'temps';

    var hiTemp = document.createElement('span');
    hiTemp.className = 'hiTemp';

    var loTemp = document.createElement('span');
    loTemp.className = 'loTemp';

    var precipitation = document.createElement('span');
    precipitation.className = 'precipitation';

    //set data
    daySpan.innerHTML = day;
    hiTemp.innerHTML = hiTempText;
    loTemp.innerHTML = loTempText;
    forecastDetail.innerHTML = conditionsText;
    precipitation.innerHTML = "Precipitation: \n" + precip + "in";
    pic.src = imgSrc;

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

    forecastDiv.appendChild(outerDiv);
}