function CsvParser() {

	if (!(this instanceof CsvParser)) {
		return new CsvParser();
	}

	this.separator = ',';
}

CsvParser.prototype.parse = function(data, containsHeaders) {

	var headers = [];
	var getHeaders = containsHeaders;
	var rows = [];
	var quote = false;
	var currentChar, nextChar;

	for(var row = 0, col = 0, i = 0; i < data.length; i += 1) {

		currentChar = data[i];
		nextChar = data[i + 1];

		if (!getHeaders && !rows.hasOwnProperty(row)) {
			rows[row] = [];
		}

		if (!getHeaders && !rows[row].hasOwnProperty(col)) {
			rows[row][col] = '';
		}

		if (getHeaders && !headers.hasOwnProperty(col)) {
			headers[col] = '';
		}

		if (currentChar === '"' && quote && nextChar === '"') {
			if (getHeaders) {
				headers[col] += currentChar
			} else {
				rows[row][col] += currentChar;
			}
			i += 1; // skip a character
		} else if (currentChar === '"') {
			quote = !quote;
		} else if (currentChar === this.separator && !quote) {
			col += 1;
		} else if (currentChar === '\r' && nextChar === '\n' && !quote) {
			row += getHeaders ? 0 : 1;
			col = 0;
			i += 1; // skip a character
			getHeaders = false;
		} else if ((currentChar === '\n' || currentChar === '\r') && !quote) {
			row += getHeaders ? 0 : 1;
			col = 0;
			getHeaders = false;
		} else if (getHeaders) {
			headers[col] += currentChar.toLowerCase();
		} else {
			rows[row][col] += currentChar;
		}

	}

	return { headers: headers, rows: rows };

};

// #########################

function TsvParser() {

	if (!(this instanceof TsvParser)) {
		return new TsvParser();
	}

	this.separator = '\t';
}

TsvParser.prototype.parse = function(data, containsHeaders) {

	var headers = [];
	var getHeaders = containsHeaders;
	var rows = [];
	var currentChar, nextChar;

	for(var row = 0, col = 0, i = 0; i < data.length; i += 1) {

		currentChar = data[i];
		nextChar = data[i + 1];
		
		if (!getHeaders && !rows.hasOwnProperty(row)) {
			rows[row] = [];
		}

		if (!getHeaders && !rows[row].hasOwnProperty(col)) {
			rows[row][col] = '';
		}

		if (getHeaders && !headers.hasOwnProperty(col)) {
			headers[col] = '';
		}

		if (currentChar === this.separator) {
			col += 1;
		} else if (currentChar === '\r' && nextChar === '\n') {
			row += getHeaders ? 0 : 1;
			col = 0;
			i += 1; // skip a character
			getHeaders = false;
		} else if (currentChar === '\n' || currentChar === '\r') {
			row += getHeaders ? 0 : 1;
			col = 0;
			getHeaders = false;
		} else if (getHeaders) {
			headers[col] += currentChar.toLowerCase();
		} else {
			rows[row][col] += currentChar;
		}

	}

	return { headers: headers, rows: rows };

};

// #########################

function PatternParser(pattern) {

	if (!(this instanceof PatternParser)) {
		return new PatternParser(pattern);
	}

	if (!pattern) {
		throw new Error('Please provide a pattern.');
	}

	this.processor = PatternParser.createProcessor(pattern);
}

PatternParser.fn = {
	backtick: function(x) {
		return '`' + x + '`';
	},
	guid: function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0;
			var v = c === 'x' ? r : r & 0x3 | 0x8;
			return v.toString(16);
		});
	},
	indexOf: function(x, y) {
		return x.indexOf(y);
	},
	lastIndexOf: function(x, y) {
		return x.lastIndexOf(y);
	},
	lower: function(x) { 
		return x.toLowerCase(); 
	},
	quote: function(x) {
		return '"' + x + '"';
	},
	replace: function(x, y, z) {
		return x.replace(new RegExp(y), z);
	},
	random: function (min, max) {
		min = Math.ceil(min), max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min; 
	},
	reverse: function(x) {
		var output = '';
		for(var i = x.length - 1; i > -1; i -= 1) {
			output += x[i];
		}
		return output;
	},
	single: function(x) {
		return "'" + x + "'";
	},
	slice: function(x, y, z) {
		return x.slice(y, z);
	},
	substring: function(x, y, z) {
		return x.substr(y, z);
	},
	title: function(x) {
		return x.replace(/\b(\w+)\b/g, function(m) {
			return m[0].toUpperCase() + m.slice(1).toLowerCase();
		}); 
	},
	trim: function(x) {
		if (String.prototype.trim) {
			return x.trim();
		} else {
			return this.replace(/^\s+/, '').replace(/\s+$/, '');
		}
	},
	trimLeft: function(x) {
		if (String.prototype.trimLeft) {
			return x.trimLeft();
		} else if (String.prototype.trimStart) {
			return x.trimStart();
		} else {
			return this.replace(/^\s+/, '');
		}
	},
	trimRight: function(x) {
		if (String.prototype.trimRight) {
			return x.trimRight();
		} else if (String.prototype.trimEnd) {
			return x.trimEnd();
		} else {
			return this.replace(/\s+$/, '');
		}
	},
	upper: function(x) { 
		return x.toUpperCase(); 
	},
	urlDecode: function(x) {
		return decodeURI(x);
	},
	urlDecodeComponent: function(x) {
		return decodeURIComponent(x);
	},
	urlEncode: function(x) {
		return encodeURI(x);
	},
	urlEncodeComponent: function(x) {
		return encodeURIComponent(x);
	}
};

PatternParser.allowedDigits = ['0','1','2','3','4','5','6','7','8','9'];

PatternParser.parseInt = function(str) {

	// this ensures if we include *anything* that isn't a digit, we return NaN immediately
	for(var i = 0; i < str.length; i += 1) {
		var c = str[i];
		if (i === 0 && (c === '-' || c === '+')) {
			continue;
		} else if (PatternParser.allowedDigits.indexOf(c) === -1) {
			return NaN;
		}
	}

	return parseInt(str, 10);
};

PatternParser.parseFloat = function(str) {

	// this ensures if we include *anything* that isn't a digit and a *single* period, we return NaN immediately
	var period = false;
	for(var i = 0; i < str.length; i += 1) {
		var c = str[i];
		if (i === 0 && (c === '-' || c === '+')) {
			continue;
		} else if (c === '.' && !period) {
			period = true;
		} else if (c === '.' && period) {
			return NaN;
		} else if (PatternParser.allowedDigits.indexOf(c) === -1) {
			return NaN;
		}
	}

	return parseFloat(str);
};

PatternParser.createProcessor = function(pattern) {

	var currentChar, nextChar;
	var funcs = [];
	var lparen = 0;
	var method = false;
	var methodName = '';
	var methodText = '';
	var methodArgs = [];
	var text = '';
	var variable = false;
	var variableText = '';

	// used to capture the current scoped value of text
	var addCurrentText = function() {
		var output = text.slice(0);	
		funcs.push(function() {
			return output;
		});
		text = '';
	};

	// start the state machine
	for(var i = 0; i < pattern.length; i += 1) {

		currentChar = pattern[i];
		nextChar = pattern[i + 1];

		if (currentChar === '$' && nextChar === '(') {
			i += 1; // skip a character
			lparen += 1;
			if (method) {
				methodText += '$(';
			} else {
				variable = true;
				addCurrentText();
			}
		} else if (currentChar === '@') {
			if (method) {
				methodText += '@';
			} else {
				method = true;
				addCurrentText();
			}
		} else if (method && currentChar === '(') {
			lparen += 1;
			if (lparen > 1) {
				methodText += '(';
			}
		} else if (method && lparen > 0 && currentChar === ',') {
			methodArgs.push(methodText.slice(0));
			methodText = '';
		} else if (currentChar === ')' && lparen === 1 && variable && !method) {

			(function() { // process the variable here
				var vtxt = variableText.slice(0).toLowerCase();
				var index = PatternParser.parseInt(vtxt);
				if (isNaN(index)) {
					funcs.push(function(headers, line) {
						var hidx = headers.indexOf(vtxt);
						return hidx >= 0 ? line[hidx] : 'ERR';
					});
				} else {
					funcs.push(function(headers, line) {
						return line[index];
					});
				}
			})();

			lparen -= 1;
			variable = false;
			variableText = '';

		} else if (variable && !method) {
			variableText += currentChar;
		} else if (currentChar === ')' && lparen > 1) {
			lparen -= 1;
			if (method) {
				methodText += ')';
			}
		} else if (currentChar === ')' && lparen === 1 && method) {

			if (methodArgs.length > 0) {
				methodArgs.push(methodText.slice(0));
			}

			if (PatternParser.fn.hasOwnProperty(methodName)) {

				(function() { // process the selected method
					var m = PatternParser.fn[methodName];
					var fn, args = [];

					if (methodArgs.length > 0) {
						
						for(var j = 0; j < methodArgs.length; j += 1) {
							args.push(PatternParser.createProcessor(methodArgs[j].slice(0)));
						}

						funcs.push(function(headers, line) {
							var results = [];
							for(var k = 0; k < args.length; k += 1) {
								results.push(args[k](headers, line));
							}
							return m.apply(null, results);
						});

					} else {
						fn = PatternParser.createProcessor(methodText);
						funcs.push(function(headers, line) {
							return m(fn(headers, line));
						});
					}
				})();
				
			} else {
				funcs.push(function() {
					return 'ERR';
				});
			}

			lparen -= 1;
			method = false;
			methodArgs = [];
			methodName = '';
			methodText = '';

		} else if (method && lparen > 0) {
			methodText += currentChar;
		} else if (method) {
			methodName += currentChar;
		} else {
			text += currentChar;
		}

	}

	if (text.length > 0) {
		addCurrentText();
	}

	return function(headers, line) { 
		var output = '';
		for(var i = 0; i < funcs.length; i += 1) {
			var fn = funcs[i];
			output += fn(headers, line);
		}
		return output;
	};

};

PatternParser.prototype.format = function(headers, lines, lineSeparator) {

	var output = '';
	var p = this.processor;

	for(var i = 0; i < lines.length; i += 1) {
		output += p(headers, lines[i]) + lineSeparator;
	}

	return output;
}

// #########################

onmessage = function(e) {
	var options = e.data;

	if (!options.pattern || !options.lines) {
		return postMessage(undefined);
	}

	var dataParser;	
	if (options.separator === 'tsv') {
		dataParser = new TsvParser();
	} else {
		dataParser = new CsvParser();
	}

	var csvData = dataParser.parse(options.lines, options.headers);

	var patternParser = new PatternParser(options.pattern);
	var parsedData = patternParser.format(csvData.headers, csvData.rows, '\n');
	
	return postMessage({ headers: options.headers, results: parsedData });
}