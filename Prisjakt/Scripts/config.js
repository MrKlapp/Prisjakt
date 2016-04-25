
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Need to change/customize this part
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// language
var lang = 'sv';

var domain = 'http://mirror1.mrklapp.se/';

//First try to get location from navigator.geolocation
var fallbackCity = 'Varberg';

var includeTime = true;
var includeWeather = true;
var includeWeatherForecast = true;
var includeWeatherText = true;
var includeQuote = true;
var includeCountyNews = true;
var includeGoogleCal = false;

// News County
var newsCounty = 'Halland';

// Weather
var weatherForecastUrl = 'http://api.openweathermap.org/data/2.5/forecast/daily';
var weatherUrl = 'http://api.openweathermap.org/data/2.5/weather'
var weatherParams = {
    'q':localStorage.getItem('lastCity'),
    'units':'metric',
    'lang':lang,
	'cnt':'3', //number of forecast items
    'APPID':'39ac82ebfeaa6e234c5a15c2bbfb90be' //THIS SHOULD be changed
};

// Calendar
var calendarParams = {
    'maxResults':'10',
	'Email_address':'magnus.klappe@gmail.com', //THIS SHOULD be changed
	'key_file_location':'Mirror1-9d8aba399b59.p12', //THIS SHOULD be changed
	'targetCalendar':'magnus.klappe@gmail.com' //THIS SHOULD be changed
};


// News
var newsParams = {
	'url':'http://www.svt.se/nyheter/lokalt/' + newsCounty + '/rss.xml'
};

// Quote
var quoteParams = {
	'url':'http://www.dagenscitat.nu/rss.xml'
};


//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


// Update frequency
var sekund = 1000;
var minut = 60000;
var timme = 3600000;
var ufQuote = timme;
var ufWeather = minut*10;
var ufForecast = timme;
var ufSchoolFood = timme*24;
var uffetchNews = minut*30;
var ufshowNews = sekund*15;
var ufCalendar = minut*10;
var ufLocation = 60; //min
