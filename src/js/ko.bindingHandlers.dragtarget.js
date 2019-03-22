(function(ko) {

	function DragDropEvent(name, addClass) {
		this.addClass = addClass;
		this.className = 'drag-target';
		this.name = name;
	}

	DragDropEvent.prototype.createEvent = function(data, fn) {

		var css = this.addClass; // scope
		var cssName = this.className;

		return function(e) {

			e.preventDefault();

			ko.utils.toggleDomNodeCssClass(e.target, cssName, css);

			if (typeof fn === 'function') {
				fn(data, e);
			}

		};
	};

	var dragevents = [ 
		new DragDropEvent('dragover', true), 
		new DragDropEvent('dragenter', true), 
		new DragDropEvent('dragleave', false), 
		new DragDropEvent('dragend', false)
	];

	var dropevent = new DragDropEvent('drop', false);

	ko.bindingHandlers.dragtarget = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

			var dragging = valueAccessor();
			if (typeof dragging !== 'function') {
				throw new Error('Please provide a function for this binding.');
			}

			var i, ev;
			
			for(i = 0; i < dragevents.length; i += 1) {
				ev = dragevents[i];
                ko.utils.registerEventHandler(element, ev.name, ev.createEvent(bindingContext.$data, allBindings.get(ev.name)));
			}

			// add explicit drop event
            ko.utils.registerEventHandler(element, dropevent.name, dropevent.createEvent(bindingContext.$data, dragging));

		}
	};

})(ko);