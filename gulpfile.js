const { dest, parallel, src, watch } = require('gulp');

const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const path = require('path');
const sass = require('gulp-sass');
const svgSprite = require('gulp-svg-sprite');
const uglifyjs = require('gulp-uglify');

const iconNameFormatter = /^[0-9]+[-]/;

function css() {
	return src(['./src/scss/index.scss'])
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('index.css'))
		.pipe(autoprefixer())
		.pipe(cleanCss({
			level: {
				1: {
					specialComments: false
				}
			}
		}))
		.pipe(dest('./dist/css/'));
}

function icons() {
	return src('./src/icons/*.svg')
        .pipe(svgSprite({
			shape: {
				id: {
					generator: function(name, file) {
						var fname = path.parse(name).name;
                        return fname.replace(iconNameFormatter, '');
					}
				}
			},
            mode: {
                symbol: {
                    dest: '',
                    sprite: 'icons.svg'
                }
            }
        }))
        .pipe(dest('./dist/icons'));
}

const js = parallel(jsIndex, jsWorker);

function jsIndex() {
	return src([
			'./node_modules/mousetrap/mousetrap.js',
			'./node_modules/knockout/build/output/knockout-latest.js',
			'./node_modules/knockout-secure-binding/dist/knockout-secure-binding.js',
			'./src/js/ko.bindingHandlers.*.js',
			'./src/js/ko.extenders.*.js',
			'./src/js/icons.js',
			'./src/js/index.js'
		])
		.pipe(concat('index.js'))
		.pipe(dest('./dist/js'))
		.pipe(uglifyjs())
		.pipe(rename('index.min.js'))
		.pipe(dest('./dist/js'));
}

function jsWorker() {
	return src(['./src/js/worker.js'])
		.pipe(dest('./dist/js'))
		.pipe(uglifyjs())
		.pipe(rename('worker.min.js'))
		.pipe(dest('./dist/js'));
}

exports.default = parallel(css, js, icons);

exports.watch = function() {

	watch('./src/js/*.js', { }, js);
	watch('./src/scss/*.scss', { }, css);
	watch('./src/icons/*.svg', { }, icons);

};