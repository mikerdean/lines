(function(ko) {

    var svgNamespace = 'http://www.w3.org/2000/svg';
    var xlinkNamespace = 'http://www.w3.org/1999/xlink';

    function formatThemeName(name) {
        if (name.indexOf('icon-') !== 0) {
            return 'icon-' + name;
        } else {
            return name;
        }
    }

    ko.bindingHandlers.icon = {
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            
            var href = ko.unwrap(valueAccessor());
            if (!href) {
                element.style.display = 'none';
            }

            if (href.indexOf('#') !== 0) {
                href = '#' + href;
            }

            var svg = document.createElementNS(svgNamespace, 'svg');
            var className = 'icon';
            
            var options = allBindings.get('iconOptions') || {};
            if (options) {
                if (typeof options === 'string') {
                    className += ' ' + formatThemeName(options.theme);
                } else if (typeof options === 'object') {
                    if (options.theme) {
                        className += ' ' + formatThemeName(options.theme);
                    }
                }
            }

            svg.setAttribute('class', className);

            var svgUse = document.createElementNS(svgNamespace, 'use');
            svgUse.setAttributeNS(xlinkNamespace, 'href', href);

            svg.appendChild(svgUse);

            element.parentNode.replaceChild(svg, element);

        }
    };

})(ko);