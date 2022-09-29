const EventEmitter = require('events');
const { create, all } = require('./math.js');

const math = create(all);

class Utils {
	static validateName(name) {
		return name.match(/^[^*]+$/i);
	}

	static generateId(prefix, name) {
		name = prefix + '_' + name.trim();
		let hash = 0, i, chr;
		if (name.length === 0) {
			throw new Error('invalid name');
		}
		for (i = 0; i < name.length; i++) {
			chr = name.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0;
		}
		return Math.abs(hash).toString() + '_' + name.toLowerCase().replace(/[^a-z0-9_]/g, '');
	}

	static calculateDuration(time, unit) {
		let parsedTime = parseFloat(time);
		if (isNaN(parsedTime)) {
			throw new Error('invalid time');
		}

		switch (unit) {
			case 'milliseconds':
				return parsedTime;
			case 'seconds':
				return 1e3 * parsedTime;
			case 'minutes':
				return 1e3 * parsedTime * 60;
			case 'hours':
				return 1e3 * parsedTime * 60 * 60;
			case 'days':
				return 1e3 * parsedTime * 60 * 60 * 24;
			default:
				throw new Error('invalid unit');
		}
	}

	static roundDurationForProperties(time) {
		let _parsedTime = parseFloat(time);
		if (isNaN(_parsedTime)) {
			throw new Error('invalid time');
		}
		if (_parsedTime > 1e3 * 60 * 60 * 60 * 24) return parseInt(_parsedTime / (1e3 * 60 * 60 * 60 * 24)); //days
		if (_parsedTime > 1e3 * 60 * 60 * 60) return parseFloat(parseFloat(_parsedTime / (1e3 * 60 * 60 * 60)).toFixed(3)); // hours
		if (_parsedTime > 1e3 * 60 * 60) return parseFloat(parseFloat(_parsedTime / (1e3 * 60 * 60)).toFixed(2)); //minutes
		if (_parsedTime > 1e3 * 60) return parseFloat(parseFloat(_parsedTime / (1e3 * 60)).toFixed(1)); //seconds
		if (_parsedTime > 1e3) return parseInt(parseFloat(_parsedTime / 1e3));
		return parseFloat(parseFloat(_parsedTime / (1e3)).toFixed(1));
		/*
		let _parsedTimeMS = _parsedTime % 1e3;
		let _parsedTimeS = parseInt(_parsedTime / 1e3) % 60;
		let _parsedTimeM = parseInt(_parsedTime / (1e3 * 60)) % 60;
		let _parsedTimeH = parseInt(_parsedTime / (1e3 * 60 * 60)) % 60;
		let _parsedTimeD = parseInt(_parsedTime / (1e3 * 60 * 60 * 60)) % 24;
		if (_parsedTimeD > 0) return (_parsedTimeD + "-" + _parsedTimeH < 10 ? "0" + _parsedTimeH : _parsedTimeH).toString();
		if (_parsedTimeH > 0) return (_parsedTimeH + ":" + _parsedTimeM < 10 ? "0" + _parsedTimeM : _parsedTimeM).toString();
		if (_parsedTimeM > 0) return (_parsedTimeM + ":" + _parsedTimeS < 10 ? "0" + _parsedTimeS : _parsedTimeS).toString();
		if (_parsedTimeS > 0) return (_parsedTimeS + "." + parseInt(_parsedTimeMS / 100)).toString();
		return ("0." + _parsedTimeMS).toString();
		*/
	}

	static wildcardToRegExp(string) {
		var regExpEscape = function (string) {
			return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
		}

		return new RegExp('^' + string.split(/\*+/).map(regExpEscape).join('.*') + '$');
	}

	static evalTime(time) {
		try {
			// Make sure time is a string.
			time = "" + time;

			// If there are no alphanumeric characters in the time string, all comma's are
			// replaced with dots to support old cards.
			time = time.replace(/^\s*([0-9]+),([0-9]+)\s*$/, '$1.$2');

			// Remove redundant spaces. This also removes any non-standard whitespace characters
			// that are sometimes inserted when using tokens.
			time = time.replace(/\s{1,}/g, ' ');

			// We allow upper-, lower- or mixed case functions and spaces on either side of the
			// expression.
			time = time.toLowerCase().trim();

			// Only a subset of mathjs' functions are supported.
			if (!time.match(/^[0-9\*\/\+\-\%\^\,\.\(\)\s(abs|ceil|floor|round|random|min|max|pick)]+$/)) {
				return false;
			}

			// The random pick method of mathjs is simplified for our use case.
			time = time.replace(/pick\s*\((\s*([0-9]+\s*(\,?\s*)){1,}\s*)\)/g, 'pickRandom([$1])');

			return parseFloat(math.evaluate(time));
		} catch (error) {
			return false;
		}
	}

	static beautifyName(name) {
		return name
			.replace(/([a-z]+)/gi, '$1 ')
			.replace(/^./, str => str.toUpperCase())
			.replace(/([0-9]+)/gi, '$1 ')
			.replace(/\s+/gi, ' ')
			.trim()
			;
	}
}

class ExtendedEventEmitter extends EventEmitter {
	mon(eventName, listener) {
		let callbacks = {};
		eventName.forEach((name) => {
			let callback = (...args) => {
				args.unshift(name);
				listener.apply(null, args);
			};
			this.on(name, callback);
			callbacks[name] = callback;
		});
		return callbacks;
	}
}

let ChronographType = {
	TIMER: 'Timer',
	STOPWATCH: 'Stopwatch',
	TRANSITION: 'Transition'
}

let LogLevel = {
	DEBUG: 1,
	INFO: 2,
	WARNING: 3,
	ERROR: 4
}

module.exports = { Utils, ExtendedEventEmitter, ChronographType, LogLevel };
