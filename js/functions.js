"use strict";

function checkRequirements() {
	if (typeof window.localStorage === 'undefined') {
		console.log('The database is not supported.');
		navigator.notification.alert(
			'Your device does not support the database used by this app.',
			function(){},
			'Error'
		);
		return false;
	}
	return true;
}
/*
function updateIcons()
{
	if ($(window).width() > 480)
	{
		$('a[data-icon], button[data-icon]').each(function() {
			$(this).removeAttr('data-iconpos');
		});
	}
	else
	{
		$('a[data-icon], button[data-icon]').each(function() {
			$(this).attr('data-iconpos', 'notext');
		});
	}
}
*/
/**
 * Initialize the application
 */
function initApplication() {
	var settings = Settings.getSettings();
	window.current_lang = settings.lastLanguage || "en";
	window.appHistory = ["index"];
	window.current_page = "index";
	document.addEventListener("backbutton", appHistoryBack, true);
	loadContentInCurrentLanguage("index");
	$("body").on('click', 'a', function(event) {
		event.preventDefault();
		if($(this).attr("href") != "#") {
			loadContentInCurrentLanguage($(this).attr('href'));
		}
		return false;
	});
	$(document).on('online', updateContent);
/*
	if (checkRequirements() === false) {
		$('#submit-button').button('disable');
		return;
	}
*/
/*
	$('#submit-button').click(function(event) {
		event.preventDefault();
		// Convert the value
		var result = Currency.convert(
			$('#from-value').val(),
			$('#from-type').val(),
			$('#to-type').val()
		);
		// Localize the result
		navigator.globalization.numberToString(
			result,
			function(number)
			{
				$('#result').text(number.value);
			},
			function()
			{
				$('#result').text(result);
			}
		);
		// Update settings
		var settings = Settings.getSettings();
		if ($.isEmptyObject(settings))
			settings = new Settings();
	});
*/
/*
	$('#reset-button').click(function(event) {
		event.preventDefault();
		$('#from-value').val(0);
		$('#form-converter select').prop('selectedIndex', 0).selectmenu('refresh');
		$('#result').text(0);
	});
	$('#update-button').click(function(event) {
		event.preventDefault();
		if (navigator.network.connection.type === Connection.NONE)
		{
			console.log('The connection is off. Can\'t update exchange rates.');
			navigator.notification.alert(
				'Your device has the connections disabled. Can\'t update exchange rates.',
				function(){},
				'Error'
			);
		}
		else
			updateExchangeRates();
	});
*/
}

function translateCurrentPageTo(lang) {
	window.current_lang = lang;
	loadContentInCurrentLanguage(window.current_page);
}
function appHistoryBack() {
	if(window.appHistory.length > 1) {
		var last_page = window.appHistory.pop();
		window.current_page = last_page;
		loadContentInCurrentLanguage(last_page);
	}
}
function loadContentInCurrentLanguage(slug) {
	$("#content-box").html("...");
	Settings.saveSetting("lastLanguage", window.current_lang);
	$.get("contents/" + slug + ".html", function (template) {
		$.get("lang/" + window.current_lang + "/" + slug + ".txt", function(data) {
			template = $("<div>" + template + "</div>");
			var translations = YAML.parse(data);
			$.each(translations, function (key, value) {
				if(key == "page-title") {
					$("#page-title").html(value);
				} else if(key == "page-footer") {
					$("#page-footer").html(value);
				} else {
					template.find("#" + key).html(value);
				}
			});
			$("#content-box").html(template);
		});
	});
	if(window.current_page != slug) {
		window.appHistory.push(window.current_page);
		window.current_page = slug;
	}
}
/**
 * Open all the links as internals
 */
function openLinksInApp() {
	$("a[target=\"_blank\"]").on('click', function(event) {
		event.preventDefault();
		loadContentInCurrentLanguage($(this).attr('href'));
	});
}
function updateLastUpdate() {
	if (typeof Settings.getSettings().lastUpdate === 'undefined')
	{
		$('#last-update').text('-');
		return;
	}
	// Show the last time the rates have been updated
	navigator.globalization.dateToString(
		new Date(Settings.getSettings().lastUpdate),
		function (date)
		{
			$('#last-update').text(date.value);
		},
		function ()
		{
			$('#last-update').text('-');
		}
	);
}

/**
 * Update the exchange rates using the ECB web service
 */
function updateContent() {
	if (navigator.network.connection.type !== Connection.NONE) {
		update_message = (window.current_lang == "en" ? "Updating content..." : "actualización de contenidos...");
		$.mobile.loading( 'show',
			{
				text: update_message,
				textVisible: true
			}
		);
		update_url = Settings.getSetting("updateURL");
		$.get(
			update_url,
			null,
			function(data)
			{
				var $currenciesElements = $(data).find('Cube[currency]');
				// The EURO is the default currency, so it isn't in the retrieved data
				var currencies = [new Currency('EUR', '1')];
				var i;
				for(i = 0; i < $currenciesElements.length; i++)
				{
					currencies.push(
						new Currency(
							$($currenciesElements[i]).attr('currency'),
							$($currenciesElements[i]).attr('rate')
						)
					);
				}
				currencies.sort(Currency.compare);
				// Store the data
				for(i = 0; i < currencies.length; i++)
					currencies[i].save();
				// Update settings
				var settings = Settings.getSettings();
				if ($.isEmptyObject(settings))
					settings = new Settings();
				settings.lastUpdate = new Date();
				settings.save();
				fillCurrenciesSelection();
				updateLastUpdate();
				$('#submit-button').button('enable');
			},
			'XML'
		)
		.error(function() {
			console.log('Unable to retrieve exchange rates from the provider.');
			navigator.notification.alert(
				'Unable to retrieve exchange rates from the provider.',
				function(){},
				'Error'
			);
			if (Currency.getCurrencies().length === 0)
				$('#submit-button').button('disable');
		})
		.complete(function() {
			$.mobile.loading('hide');
		});
	}
	// Check if there are data into the local storage
	else if (Currency.getCurrencies().length === 0)
	{
		console.log('The connection is off and there aren\'t rates previously stored.');
		navigator.notification.alert(
			'Your device has the connection disabled and there aren\'t rates previously stored.\n' +
			'Please turn on your connection.',
			function(){},
			'Error'
		);
		$('#submit-button').button('disable');
	}
}
/*
function updateExchangeRates()
{
	if (navigator.network.connection.type !== Connection.NONE)
	{
		$.mobile.loading(
			'show',
			{
				text: 'Updating rates...',
				textVisible: true
			}
		);
		$.get(
			'http://www.ecb.int/stats/eurofxref/eurofxref-daily.xml',
			null,
			function(data)
			{
				var $currenciesElements = $(data).find('Cube[currency]');
				// The EURO is the default currency, so it isn't in the retrieved data
				var currencies = [new Currency('EUR', '1')];
				var i;
				for(i = 0; i < $currenciesElements.length; i++)
				{
					currencies.push(
						new Currency(
							$($currenciesElements[i]).attr('currency'),
							$($currenciesElements[i]).attr('rate')
						)
					);
				}
				currencies.sort(Currency.compare);
				// Store the data
				for(i = 0; i < currencies.length; i++)
					currencies[i].save();
				// Update settings
				var settings = Settings.getSettings();
				if ($.isEmptyObject(settings))
					settings = new Settings();
				settings.lastUpdate = new Date();
				settings.save();
				fillCurrenciesSelection();
				updateLastUpdate();
				$('#submit-button').button('enable');
			},
			'XML'
		)
		.error(function() {
			console.log('Unable to retrieve exchange rates from the provider.');
			navigator.notification.alert(
				'Unable to retrieve exchange rates from the provider.',
				function(){},
				'Error'
			);
			if (Currency.getCurrencies().length === 0)
				$('#submit-button').button('disable');
		})
		.complete(function() {
			$.mobile.loading('hide');
		});
	}
	// Check if there are data into the local storage
	else if (Currency.getCurrencies().length === 0)
	{
		console.log('The connection is off and there aren\'t rates previously stored.');
		navigator.notification.alert(
			'Your device has the connection disabled and there aren\'t rates previously stored.\n' +
			'Please turn on your connection.',
			function(){},
			'Error'
		);
		$('#submit-button').button('disable');
	}
}
*/