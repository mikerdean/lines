(function(document, ko, Worker) {
	"use strict";

	function Splitter(id, description) {
		this.id = id;
		this.description = description;
	}

	function Sort(name, value) {
		this.name = name;
		this.value = ko.observable(value);
	}

	// #########################

	function LinesViewModel() {
		var self = this;

		var url;
		var worker = new Worker('js/worker.js');

		self.allowedExtensions = ['.txt','.csv','.log'];
		self.error = ko.observable();
		self.hasHeaders = ko.observable(false).extend({ store: 'lines.data.headers' });
		self.lines = ko.observable().extend({ store: 'lines.data.lines' });
		self.linesFocus = ko.observable(false);
		self.maximumSize = 1024 * 1024 * 3;
		self.menuOpen = ko.observable(false).extend({ store: 'lines.data.menu' });
		self.output = ko.observable();
		self.pattern = ko.observable().extend({ store: 'lines.data.pattern' });
		self.patternFocus = ko.observable(true);
		self.processing = ko.observable(false);
		self.saving = ko.observable(false);
		self.separator = ko.observable().extend({ store: 'lines.data.separator' });
		self.sortOptions = ko.observableArray();

		self.allowSave = ko.pureComputed(function() {
			var saving = ko.unwrap(self.saving);
			var output = ko.unwrap(self.output);
			return !saving && output && output.length > 0;
		});

		self.choices = {
			column: [
				new Splitter('csv', 'Comma'),
				new Splitter('tsv', 'Tab')
			]
		};

		// ###############
		// computed

		// ###############
		// methods

		self.clear = function() {
			self.lines(undefined);
			self.output(undefined);
			self.pattern(undefined);
			self.linesFocus(true);
			return false;
		};

		self.createError = function(message, timeout) {
			self.error(message);
			if (timeout) {
				setTimeout(function() {
					self.error(undefined);
				}, timeout);
			}
		};

		self.menu = function() {
			self.menuOpen(!self.menuOpen());
			return false;
		};

		self.openData = function() {
			document.getElementById('openFileData').click();
			return false;
		};

		self.openPattern = function() {
			document.getElementById('openFilePattern').click();
			return false;
		};

		self.open = function(model, e) {

			var element = e.target;
			var files;
			
			if (e.type === 'change') {
				files = element.files;
			} else if (e.type === 'drop') {
				files = e.dataTransfer.files;
			}

			var name;
			if (element.id === 'openFileData' || element.id === 'lines') {
				name = 'lines';
			} else if (element.id === 'openFilePattern' || element.id === 'pattern') {
				name = 'pattern';
			}

			if (!files || files.length === 0 || !name) {
				return;
			}
			
			if (files.length > 1) {
				return self.createError('You provided more than one file to upload.', 3750);
			}
			
			var file = files[0];
			if (file.size > self.maximumSize) {
				return self.createError('The file you provided has exceeded the file size limit: ' + file.size, 3750);
			}

			var extension = file.name.slice(file.name.lastIndexOf('.'));
			if (self.allowedExtensions.indexOf(extension) === -1) {
				return self.createError('The file type you provided is not allowed: ' + extension, 3750);
			}

			self.processing(true);

			var fr = new FileReader();

			fr.addEventListener('load', function(e) {
				self[name](e.target.result);
				setTimeout(function() {
					self.processing(false);
					document.getElementById('openFile').reset();
				}, 0);
			});

			fr.addEventListener('error', function(e) {
				self.createError(e, 3750);
				self.processing(false);
				document.getElementById('openFile').reset();
			});

			self[name](undefined);
			fr.readAsText(file, 'utf8');

		};

		self.process = function() {

			self.processing(true);

			worker.postMessage({
				headers: self.hasHeaders.peek(),
				lines: self.lines.peek(),
				pattern: self.pattern.peek(),
				separator: self.separator.peek()
			});

			return false;

		};

		self.savePattern = function() {
			return self.save(self.pattern.peek(), 'pattern.txt');
		};

		self.saveResults = function() {
			return self.save(self.output.peek(), 'results.txt');
		};

		self.save = function(contents, filename) {

			if (url) {
				URL.revokeObjectURL(url);
				url = null;
			}
			
			var blob = new Blob([contents], { type: 'text/plain' });
			url = URL.createObjectURL(blob);
			
			var link = document.createElement('a');
			link.setAttribute('download', filename);
			link.setAttribute('href', url);
			link.click();

			return false;

		};

		(function() {

			worker.onmessage = function(e) {

				if (e.data.headers && e.data.headers.length > 0) {

				} else {

				}

				self.output(e.data.results);

				setTimeout(function() {
					self.processing(false);
					self.patternFocus(true);
				}, 0);

			};

			worker.onerror = function(e) {
				self.processing(false);
				self.patternFocus(true);
			};

		})();

	}

	ko.options.deferUpdates = true;
	ko.options.useOnlyNativeEvents = true;

	ko.bindingProvider.instance = new ko.secureBindingsProvider({ attribute: "data-bind" });

	ko.applyBindings(new LinesViewModel(), document.getElementById('lines'));

})(document, ko, Worker);