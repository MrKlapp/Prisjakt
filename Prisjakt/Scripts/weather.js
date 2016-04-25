

var debug = true;

var weatherForecastUrl = 'http://api.openweathermap.org/data/2.5/forecast/daily';
var weatherUrl = 'http://api.openweathermap.org/data/2.5/weather'
var weatherParams = {
    'q':'Varberg',
    'units':'metric',
    'lang':'sv',
	'cnt':'3', //number of forecast items
    'APPID':'39ac82ebfeaa6e234c5a15c2bbfb90be' //THIS SHOULD be changed
};


$(function() {

    moment.locale('sv');
		
	updateCurrentWeather();
	updateWeatherForecast();
		
});



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
	}, 1000);
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


function getWeatherText(weather) {
		
	var temp = roundVal(weather.main.temp);
	var wind = roundVal(weather.wind.speed);
	var cloudiness = roundVal(weather.clouds.all);
	var humidity = roundVal(weather.main.humidity);
	var pressure = roundVal(weather.main.pressure);
	var isRainy = (weather.weather[0].icon == '09d') || (weather.weather[0].icon == '10d') || (weather.weather[0].icon == '09n') || (weather.weather[0].icon == '10n') ? true: false;
	var description = weather.weather[0].description;
	
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
