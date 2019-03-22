(function(ko, window, document) {
	"use strict";

	var canUseLocalStorage = 'localStorage' in window;
	var canUseCookie = 'cookie' in document;
	var inMemoryStore = {};
	var ws = /\s+/;

	ko.extenders.store = function(target, key) {

		if (typeof key !== 'string' || key.length === 0) {
			throw new Error('KO Store Extender: Please provide a string key.');
		}

		// check if the storage mechanism has a value and "restore" it if it exists
		// #########################

		var item;

		if (canUseLocalStorage) {
			item = window.localStorage.getItem(key);
			if (item) {
				item = JSON.parse(item);
			}
		} else if (canUseCookie) {
			item = getValueFromCookie(document.cookie, key);
			if (item) {
				item = JSON.parse(window.decodeURIComponent(item));
			}
		} else {
			item = inMemoryStore[key];
		}

		if (item !== undefined) {
			target(item);
		}

		// subscribe to changes in the observable and update the storage mechanism
		// #########################

		target.subscribe(function(value) {

			if (value !== undefined) {
				if (canUseLocalStorage) {
					window.localStorage.setItem(key, JSON.stringify(value));
				} else if (canUseCookie) {
					document.cookie = key + '=' + window.encodeURIComponent(JSON.stringify(value)) + '; max-age=31536000';
				} else {
					inMemoryStore[key] = value;
				}
			} else {
				if (canUseLocalStorage) {
					window.localStorage.removeItem(key);
				} else if (canUseCookie) {
					document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
				} else {
					delete inMemoryStore[key];
				}
			}

		});

	};

	function getValueFromCookie(cookie, keyToReturn) {

		if (!cookie || cookie.length === 0) {
			return;
		}

		var store = {};
		var key = '', value = '', isValue = false;
		var c;

		for(var i = 0; i < cookie.length; i += 1) {

			c = cookie[i];

			if (c === '=') {
				isValue = true;
			} else if (c === ';') {
				isValue = false;
				store[key] = value;
				key = '';
				value = '';
			} else if (ws.test(c)) {
				continue; // ignore whitespace
			} else if (isValue) {
				value += c;
			} else {
				key += c;
			}

		}

		if (key && value) {
			store[key] = value;
		}

		return store[keyToReturn];

	}

})(ko, window, document);