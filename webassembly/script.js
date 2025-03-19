import init from './data_processor.js';

google.charts.load('current', {
	packages: ['gauge', 'table']
});
google.charts.setOnLoadCallback(drawCharts);

// Here I define how the Google gauge and table charts will be displayed
let totalGauge, countGauge, dataTable;
let totalData, countData, tableData;
let totalOptions = {
	width: 200,
	height: 200,
	redFrom: 800,
	redTo: 1000,
	yellowFrom: 600,
	yellowTo: 800,
	minorTicks: 5,
	max: 1000,
	animation: {
		duration: 1500,
		easing: 'out'
	}
};
let countOptions = {
	width: 200,
	height: 200,
	redFrom: 80,
	redTo: 100,
	yellowFrom: 60,
	yellowTo: 80,
	minorTicks: 5,
	max: 100,
	animation: {
		duration: 1500,
		easing: 'out'
	}
};
let tableOptions = {
	width: '100%',
	showRowNumber: true,
	cssClassNames: {
		headerRow: 'table-header',
		tableRow: 'table-row',
		oddTableRow: 'table-row-odd',
		hoverTableRow: 'table-row-hover'
	}
};

// This function initializes the Google gauge and table charts
function drawCharts() {
	totalData = google.visualization.arrayToDataTable([
		['Label', 'Value'],
		['Total', 0]
	]);
	totalGauge = new google.visualization.Gauge(document.getElementById('total-gauge'));
	totalGauge.draw(totalData, totalOptions);

	countData = google.visualization.arrayToDataTable([
		['Label', 'Value'],
		['Count', 0]
	]);
	countGauge = new google.visualization.Gauge(document.getElementById('count-gauge'));
	countGauge.draw(countData, countOptions);

	tableData = new google.visualization.DataTable();
	dataTable = new google.visualization.Table(document.getElementById('data-table'));
	dataTable.draw(tableData, tableOptions);
}

// This function processes the uploaded file and updates the charts
const fileInput = document.getElementById('file-input');
const processBtn = document.getElementById('process-btn');
const status = document.getElementById('status');
const btnText = processBtn.querySelector('.btn-text');
const btnSpinner = processBtn.querySelector('.spinner-border');

// Emscripten Module is loaded asynchronously
async function run() {
	const Module = await init();
	const processExcel = Module.cwrap('processUploadedExcel', 'string', ['array', 'number']);

	// A button click event listener is added to process the uploaded file
	processBtn.addEventListener('click', async () => {
		const file = fileInput.files[0];
		if (!file) {
			status.textContent = 'Please upload a file!';
			status.style.color = '#dc3545';
			return;
		}

		// Here I show the processing status and disable the button
		status.textContent = 'Processing...';
		status.style.color = '#007bff';
		btnText.classList.add('d-none');
		btnSpinner.classList.remove('d-none');
		processBtn.disabled = true;

		let numbers = [];
		let rawData = null;
		// This caters for the user uploading a JSON file
		if (file.name.endsWith('.json')) {
			const text = await file.text();
			rawData = JSON.parse(text);
			numbers = extractNumbers(rawData);
			// This caters for the user uploading an Excel file
		} else if (file.name.endsWith('.xlsx')) {
			const arrayBuffer = await file.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);
			const result = processExcel(uint8Array, uint8Array.length);
			// Report to the user if there was an error processing the Excel file
			if (result.startsWith('Error loading Excel')) {
				status.textContent = result;
				status.style.color = '#dc3545';
				btnText.classList.remove('d-none');
				btnSpinner.classList.add('d-none');
				processBtn.disabled = false;
				return;
			}
			// Parse the result that were returned from the C++ / Wasm executable and extract the numbers
			try {
				rawData = JSON.parse(result);
				numbers = extractNumbers(rawData);
			} catch (e) {
				status.textContent = 'Error processing Excel: Invalid response from Wasm';
				status.style.color = '#dc3545';
				btnText.classList.remove('d-none');
				btnSpinner.classList.add('d-none');
				processBtn.disabled = false;
				return;
			}
		}

		if (numbers.length === 0) {
			status.textContent = 'No numeric data found!';
			status.style.color = '#dc3545';
			btnText.classList.remove('d-none');
			btnSpinner.classList.add('d-none');
			processBtn.disabled = false;
			return;
		}
		// Here I just add the data to the Google gauge and table charts
		const sum = numbers.reduce((a, b) => a + b, 0);
		animateGauge(totalData, 0, 1, Math.min(sum, 1000), totalGauge, totalOptions);
		animateGauge(countData, 0, 1, Math.min(numbers.length, 100), countGauge, countOptions);
		drawTable(rawData);

		// This is for animating the status text (for a better user experience)
		animateStatus(sum, numbers.length);

		// This is to show the user that the processing is complete (button changes color to `success`)
		btnText.classList.remove('d-none');
		btnSpinner.classList.add('d-none');
		processBtn.classList.remove('btn-primary');
		processBtn.classList.add('btn-success');
		processBtn.disabled = false;
		setTimeout(() => { // Reset button after 2 seconds
			processBtn.classList.remove('btn-success');
			processBtn.classList.add('btn-primary');
		}, 2000);
	});
}
// This is a function that extracts numbers from a JSON object
function extractNumbers(obj) {
	let numbers = [];
	if (Array.isArray(obj)) {
		obj.forEach(item => numbers = numbers.concat(extractNumbers(item)));
	} else if (typeof obj === 'object' && obj !== null) {
		for (let key in obj) {
			if (typeof obj[key] === 'number') {
				numbers.push(obj[key]);
			} else if (typeof obj[key] === 'string' && !isNaN(parseFloat(obj[key]))) {
				numbers.push(parseFloat(obj[key]));
			} else if (typeof obj[key] === 'object') {
				numbers = numbers.concat(extractNumbers(obj[key]));
			}
		}
	}
	return numbers;
}
// This is a helper function that draws a table from a JSON object
function drawTable(data) {
	tableData = new google.visualization.DataTable();
	if (!Array.isArray(data) || data.length === 0) return;

	const columns = Object.keys(data[0]);
	columns.forEach(col => tableData.addColumn('string', col));
	data.forEach(row => {
		const rowData = columns.map(col => row[col] || '');
		tableData.addRow(rowData);
	});

	dataTable.draw(tableData, tableOptions);
}
// This is a helper function that animates the Google gauge charts (I deliberately slowed it down for a better user experience)
function animateGauge(data, row, col, target, gauge, options) {
	let current = 0;
	const step = target / 50;
	const interval = setInterval(() => {
		current += step;
		if (current >= target) {
			current = target;
			clearInterval(interval);
		}
		data.setValue(row, col, Math.round(current));
		gauge.draw(data, options);
	}, 30);
}
// Also more animation for user feedback/experience
function animateStatus(sum, count) {
	let currentSum = 0,
		currentCount = 0;
	const sumStep = sum / 50,
		countStep = count / 50;
	const interval = setInterval(() => {
		currentSum += sumStep;
		currentCount += countStep;
		if (currentSum >= sum && currentCount >= count) {
			currentSum = sum;
			currentCount = count;
			clearInterval(interval);
		}
		status.textContent = `Processed! Sum: ${Math.round(currentSum)}, Data Points: ${Math.round(currentCount)}`;
		status.style.color = '#28a745';
	}, 30);
}

run();