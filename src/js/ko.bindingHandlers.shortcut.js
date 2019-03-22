(function(ko, Mousetrap) {
	"use strict";

	var elementAttributeId = '__shortcut_binding';

	ko.bindingHandlers.shortcut = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

			ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
				var shortcut = element[elementAttributeId];
				if (shortcut) {
					Mousetrap.unbind(shortcut);
				}
			});

		},
		update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

			var fn = allBindings.get('click');
			if (!fn) {
				throw new Error('KO Shortcut: Please ensure this element has a "click" binding.');
			}

			var shortcut = ko.unwrap(valueAccessor());
			var storedShortcut = element[elementAttributeId];
			if (storedShortcut && shortcut !== storedShortcut) {
				Mousetrap.unbind(storedShortcut);
			}

			if (shortcut) {
				element[elementAttributeId] = shortcut;
				Mousetrap.bind(shortcut, fn);
			} else {
				delete element[elementAttributeId];
			}
		}
	};
	
})(ko, Mousetrap);