
// Bra att veta
//http://www.webcal.fi/cal.php?id=230&format=json&start_year=2015&end_year=2021&tz=Europe%2FStockholm

//Namnsdagar
//http://www.webcal.fi/cal.php?id=99&format=json&start_year=2015&end_year=2021&tz=Europe%2FStockholm

//Veckodagar
//http://www.webcal.fi/cal.php?id=230&format=xml&start_year=2015&end_year=2021&tz=Europe%2FStockholm


// Faceregognition
// http://raufast.org/
// http://raufast.org/download/faceReco.cpp
// https://robidouille.wordpress.com/2013/10/19/raspberry-pi-camera-with-opencv/
// https://thinkrpi.wordpress.com/2013/05/22/opencv-and-camera-board-csi/


//Calendrar
//http://webcal.fi
//http://lifehacker.com/the-coolest-things-you-can-automatically-add-to-google-1562119291
//https://support.google.com/calendar/answer/6084659?hl=en&rd=1

//facebook födelsedagar
//https://www.facebook.com/help/152652248136178
//https://developers.facebook.com/docs/graph-api/reference/user
//http://icalshare.com/

//IFTTT


//Google Calendar API
// Here is your client ID: 546267729409-7i0pdo5s8rt2n7nflne89k1l78drdema.apps.googleusercontent.com
// Here is your client secret: LXRCJez9NAmoGohYVs-7yblX

// Overwrite the alert() method
window.alert = function(sMessage, title) {
	console.log('Alert!');
	console.log(sMessage);
	return false;
};


var debug = true;

$(function() {

	var news = [];
	var newstext = [];
	var newsIndex = 0;
	var eventList = [];
    moment.locale(lang);

	var now = moment().format('YYYY-MM-DD h:mm:ss');
	var lastCityChange = localStorage.getItem('lastCityChange') === null ? moment('2010-01-01') : moment(localStorage.getItem("lastCityChange"));
	var lastCity = localStorage.getItem("lastCity");

	var diffMs = (new Date(now) - new Date(lastCityChange));
	var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

	if (lastCity === null || diffMins > ufLocation) {
		if (navigator.geolocation) {
			var options = {
			  enableHighAccuracy: false,
			  timeout: 5000,
			  maximumAge: 0
			};
			navigator.geolocation.getCurrentPosition(geoApiSuccessFunction, geoApiErrorFunction, options);
		}
	}

	$('#currentCity').html(localStorage.getItem('lastCity'));

	if (updateTime) updateTime();
	if (includeWeather) updateCurrentWeather();
	if (includeWeatherForecast) updateWeatherForecast();
	if (includeCountyNews) fetchCountyNews();
	if (includeGoogleCal) updateCalendar();
	if (includeQuote) updateQuote();
getSchoolFood();
});


//Get the latitude and the longitude;
function geoApiSuccessFunction(position) {

  var lat = position.coords.latitude;
  var lng = position.coords.longitude;

  var result = codeLatLng(lat, lng);
}

function geoApiErrorFunction(err) {
	console.log('ERROR(' + err.code + '): ' + err.message);
	localStorage.setItem("lastCity", fallbackCity);
	localStorage.setItem("lastCityChange", moment().format('YYYY-MM-DD h:mm:ss'));
}

function codeLatLng(lat, lng) {

	var geocoder = new google.maps.Geocoder();
	var result;
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
         //alert(results[0].formatted_address)
            for (var i=0; i<results[0].address_components.length; i++) {
				for (var b=0;b<results[0].address_components[i].types.length;b++) {

				//there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
					if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
						//this is the object you are looking for
						result = results[0].address_components[i];
						break;
					}
				}
			}
			console.log(result);
			localStorage.setItem("lastCity", result.short_name);
			localStorage.setItem("lastCityChange", moment().format('YYYY-MM-DD h:mm:ss'));

        } else {
			console.warn('No results found');
        }
      } else {
		console.warn('Geocoder failed due to (' + status + '): ' );
      }
    });
 }




jQuery.fn.updateWithText = function(text, speed) {
	var dummy = $('<div/>').html(text);

	if ($(this).html() != dummy.html()) {
		$(this).fadeOut(speed/2, function() {
			$(this).html(text);
			$(this).fadeIn(speed/2, function() {
				//done
			});
		});
	}
}

jQuery.fn.outerHTML = function(s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};

function roundVal(temp) {
	return Math.round(temp * 10) / 10;
}

function updateTime() {
	var now = moment();
	var date = now.format('LLLL').split(' ',4);
	date = date[0] + ' ' + date[1] + ' ' + date[2] + ' ' + date[3];

	$('.date').html(date);
	$('.time').html(now.format('HH') + ':' + now.format('mm') + '<span class="sec">'+now.format('ss')+'</span>');

	setTimeout(function() {
		updateTime();
	}, sekund);
};
function updateCurrentWeather() {

	var lastUpdate = localStorage.getItem('lastWeatherUpdate') === null ? moment('2010-01-01') : moment(localStorage.getItem("lastWeatherUpdate"));
	var diffMinutes = getDiffInMinutes(lastUpdate);

	if (diffMinutes < 30 && localStorage.getItem("lastWeatherData") != null) {
		setWeatherData(localStorage.getItem("lastWeatherData"));
		if (debug) console.log('less than 30 min ago, return cached data');
		return;
	}

	if (debug) console.log('more than 30 min ago, get new data');
	localStorage.removeItem("lastWeatherData");
	localStorage.removeItem("lastWeatherUpdate");

	$.getJSON(weatherUrl, weatherParams, function(json, textStatus) {
		json = JSON.stringify(json);
		setWeatherData(json);
		localStorage.setItem("lastWeatherUpdate", moment().format('YYYY-MM-DD h:mm:ss'));
		localStorage.setItem("lastWeatherData", json);
	});

	setTimeout(function() {
		console.log('refresh');
		updateCurrentWeather();
	}, 60000);
};


function setWeatherData(json) {

	json = JSON.parse(json);
	var temp = roundVal(json.main.temp);
	var temp_min = roundVal(json.main.temp_min);
	var temp_max = roundVal(json.main.temp_max);

	var wind = roundVal(json.wind.speed);

	var cloudiness = roundVal(json.clouds.all);
	var humidity = roundVal(json.main.humidity);
	var pressure = roundVal(json.main.pressure);
	var description = json.weather[0].description;

	var txtWeatherText = getWeatherText(json);
	$('#weatherText').updateWithText(txtWeatherText, 1000);

	var iconClass = iconTable[json.weather[0].icon];
	var icon = $('<span/>').addClass('icon').addClass('wi').addClass(iconClass);
	$('.temp').updateWithText(icon.outerHTML()+temp+'&deg;', 1000);

	var now = new Date();
	var sunrise = new Date(json.sys.sunrise*1000).toTimeString().substring(0,5);
	var sunset = new Date(json.sys.sunset*1000).toTimeString().substring(0,5);

	var windString = '<span class="wi wi-strong-wind"></span> ' + wind ;
	var sunString = '<span class="wi wi-sunrise"></span> ' + sunrise;
	if (json.sys.sunrise*1000 < now && json.sys.sunset*1000 > now) {
		sunString = '<span class="wi wi-sunset"></span> ' + sunset;
	}

	$('.windsun').updateWithText(windString+' '+sunString, 1000);
}

function updateWeatherForecast() {

	var lastUpdate = localStorage.getItem('lastWeatherForeCastUpdate') === null ? moment('2010-01-01') : moment(localStorage.getItem("lastWeatherForeCastUpdate"));
	var diffMinutes = getDiffInMinutes(lastUpdate);

	if (diffMinutes < 30 && localStorage.getItem("lastWeatherForecastData") != null) {
		if (debug) console.log('less than 30 min ago, return cached data');
		setWeatherForecastData(localStorage.getItem("lastWeatherForecastData"));
		return;
	}

	if (debug) console.log('more than 30 min ago, get new data');
	localStorage.removeItem("lastWeatherForecastData");
	localStorage.removeItem("lastWeatherForeCastUpdate");

	$.getJSON(weatherForecastUrl, weatherParams, function(json, textStatus) {
		json = JSON.stringify(json);
		setWeatherForecastData(json);
		localStorage.setItem("lastWeatherForeCastUpdate", moment().format('YYYY-MM-DD h:mm:ss'));
		localStorage.setItem("lastWeatherForecastData", json);

	});

	setTimeout(function() {
		updateWeatherForecast();
	}, 60000);
};


function setWeatherForecastData(json) {

	json = JSON.parse(json);
	var forecastData = {};

	for (var i in json.list) {
		var forecast = json.list[i];
		var dateKey  = forecast.dt;

		forecastData[dateKey] = {
			'timestamp':forecast.dt*1000,
			'icon':forecast.weather[0].icon,
			'temp_min':forecast.temp.night,
			'temp_max':forecast.temp.day
		};
	}

	var forecastTable = $('<table />').addClass('forecast-table');
	var opacity = 1;
	for (var i in forecastData) {
		var forecast = forecastData[i];
		var iconClass = iconTable[forecast.icon];
		var dt = new Date(forecast.timestamp);
		var row = $('<tr />').css('opacity', opacity);

		row.append($('<td/>').addClass('day small').html(moment.weekdaysShort(dt.getDay())));
		row.append($('<td/>').addClass('icon-small small').addClass('wi').addClass(iconClass));
		row.append($('<td/>').addClass('temp-max small').html(roundVal(forecast.temp_max)));
		row.append($('<td/>').addClass('temp-min small').html(roundVal(forecast.temp_min)));

		forecastTable.append(row);
		opacity -= 0.155;
	}

	$('.forecast').updateWithText(forecastTable, 1000);
}


function getDiffInMinutes(lastUpdate) {
	var now = moment().format('YYYY-MM-DD h:mm:ss');
	var diffMs = (new Date(now) - new Date(lastUpdate));
	var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
	return diffMins;
}

function fetchCountyNews()  {
	//var xml = loadDoc(newsParams.url);
	$.getJSON(domain + '/xml2json/xml2json.php', newsParams, function(json, textStatus) {
		news = [];
		newstext = [];
		for (var i in json.channel.item) {
			var item = json.channel.item[i];
			news.push(item.title);
			newstext.push(item.description);
		}
	});
	setTimeout(function() {
		fetchCountyNews();
	},uffetchNews);
};

function showCountyNews() {

	var newsItem = news[newsIndex];
	var newstextItem = newstext[newsIndex];
	$('.news').updateWithText(newsItem,2000);
	$('.newstext').updateWithText(newstextItem,2000);

	newsIndex--;
	if (newsIndex < 0) newsIndex = news.length - 1;
	setTimeout(function() {
		showNews();
	},ufshowNews);
};

function updateCalendar() {

	var calendarTable = $('<table />').addClass('calendar-table');
	$.getJSON(domain + '/gcal/index.php', calendarParams, function(json, textStatus) {
		for (var i in json) {
			var eventData = json[i];
			if (eventData.eventTimeStart != "") {
				var eventTime = ' <span class="xxsmall">(' + eventData.eventTimeStart + " - " + eventData.eventTimeEnd + ')</span>';
			} else {
				var eventTime = "";
			}
			var row = $('<tr />');
			row.append($('<td/>').addClass('small').html(eventData.eventDate));
			row.append($('<td/>').addClass('small').html(eventData.summary+eventTime));
			calendarTable.append(row);
		}
		$('.calendar').updateWithText(calendarTable, 1000);
	});
	setTimeout(function() {
		updateCalendar();
	},ufCalendar);
};

function getSchoolFood() {

	//var xml = loadDoc(quoteParams.url);
	var url = "http://skolmaten.se/lindbergs-skola/rss/";
	$.getJSON(domain + '/xml2json/xml2json.php', url, function(json, textStatus) {

			console.log(json);

		//$('.quote').updateWithText(json.channel.item.description,2);
		//$('.quoteauthor').updateWithText(json.channel.item.title,2);
	});
	setTimeout(function() {
		getSchoolFood();
	},ufSchoolFood);
};

function updateQuote() {

	//var xml = loadDoc(quoteParams.url);

	$.getJSON(domain + '/xml2json/xml2json.php', quoteParams, function(json, textStatus) {
		$('.quote').updateWithText(json.channel.item.description,2);
		$('.quoteauthor').updateWithText(json.channel.item.title,2);
	});
	setTimeout(function() {
		updateQuote();
	},ufQuote);
};

function getWeatherText(weather) {

	var temp = roundVal(weather.main.temp);
	var wind = roundVal(weather.wind.speed);
	var cloudiness = roundVal(weather.clouds.all);
	var humidity = roundVal(weather.main.humidity);
	var pressure = roundVal(weather.main.pressure);
	var isRainy = (weather.weather[0].icon == '09d') || (weather.weather[0].icon == '10d') || (weather.weather[0].icon == '09n') || (weather.weather[0].icon == '10n') ? true: false;
	var description = weather.weather[0].description;

	//ordspråk dagenscitat
	//namnsdag
	//solunar?
	//svenska helgdagar

	console.log(cloudiness);

	if (temp < 10 && isRainy && wind < 10) {
		return '<img src="/images/rain.png">';
	}
	else if (temp > 20) {
		return '<img src="/images/hot.png">';
	}
	else if (temp > 5 && temp < 20 && cloudiness < 50) {
		return '<img src="/images/nice.png">';
	}
	else if (wind > 10 && isRainy) {
		return '<img src="/images/rain_windy.png">';
	}
	else if (wind > 10) {
		return '<img src="/images/windy.png">';
	}
	else if (temp < -10) {
		return '<img src="/images/snow.png">';
	}
	else if (wind > 15 && cloudiness > 75 && isRainy) {
		return '<img src="/images/thunder.png">';
	}
	else {
		return '<img src="/images/nice.png">';
	}
};


var iconTable = {
	'01d':'wi-day-sunny',
	'02d':'wi-day-cloudy',
	'03d':'wi-cloudy',
	'04d':'wi-cloudy-windy',
	'09d':'wi-showers',
	'10d':'wi-rain',
	'11d':'wi-thunderstorm',
	'13d':'wi-snow',
	'50d':'wi-fog',
	'01n':'wi-night-clear',
	'02n':'wi-night-cloudy',
	'03n':'wi-night-cloudy',
	'04n':'wi-night-cloudy',
	'09n':'wi-night-showers',
	'10n':'wi-night-rain',
	'11n':'wi-night-thunderstorm',
	'13n':'wi-night-snow',
	'50n':'wi-night-alt-cloudy-windy'
}

var txtTable = {
	'01d':'Sol',
	'02d':'Lite moln',
	'03d':'Molnigt',
	'04d':'Blåsigt & molnigt',
	'09d':'Regnskurar',
	'10d':'Regn',
	'11d':'Åska',
	'13d':'Snö',
	'50d':'Dimma',
	'01n':'Klart',
	'02n':'Lite moln',
	'03n':'Molnigt',
	'04n':'Blåsigt & molnigt',
	'09n':'Regnskurar',
	'10n':'Regn',
	'11n':'Åska',
	'13n':'Snö',
	'50n':'Blåsigt'
}
