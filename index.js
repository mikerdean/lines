const express = require('express');
const app = express();

const port = 4555;

app.use(express.static('dist'));

app.get('/', function(request, response) {
	return response.render('index');
});

app.listen(port, function() {
	console.log(`Listening on port ${port}`);
});