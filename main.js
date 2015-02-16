// JavaScript source code
window.onload = function () {
    

    

};


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

function forecastclick() {
    var key = "898fac3520e03d7d";
    var hitemp = document.getElementById('hitemp');
    var lotemp = document.getElementById('lotemp');
    var pic = document.getElementById('pic');
    var info = document.getElementById('forecastdetail');
    var location = document.getElementById('location');

    var btnForecast = document.getElementById('forecastbutton');
    var btnCurrent = document.getElementById('conditionsbutton');

    var request = new XMLHttpRequest();
    request.open('GET', 'http://api.wunderground.com/api/e37a167f3d3d327a/forecast/q/CA/San_Francisco.json', true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            pic.src = data["forecast"]["simpleforecast"]["forecastday"][1]["icon_url"];
            hitemp.innerHTML = Math.floor(data["forecast"]["simpleforecast"]["forecastday"][1]["high"]["fahrenheit"]);
            lotemp.innerHTML = Math.floor(data["forecast"]["simpleforecast"]["forecastday"][1]["low"]["fahrenheit"]).toString();
            info.innerHTML = data["forecast"]["simpleforecast"]["simpleforecast"]["forecastday"][1]["conditions"];
            location.innerHTML = data["location"]["city"];
        } else {

        }
    }

    request.onerror = function () {
        pic.src = "http://d15uu3l1sro2ln.cloudfront.net/wp-content/uploads/2011/06/pip_boy_thumbs_up.jpg";
    }

    request.send();
}