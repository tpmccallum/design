google.charts.load('current', { packages: ['gauge'] });
google.charts.setOnLoadCallback(drawGauges);

let speedGauge, powerGauge;
let speedData, powerData;
let speedOptions = {
    width: 200, height: 200,
    redFrom: 160, redTo: 200,
    yellowFrom: 120, yellowTo: 160,
    minorTicks: 5, max: 200
};
let powerOptions = {
    width: 200, height: 200,
    redFrom: 80, redTo: 100,
    yellowFrom: 60, yellowTo: 80,
    minorTicks: 5, max: 100
};

function drawGauges() {
    speedData = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Speed', 100]
    ]);
    speedGauge = new google.visualization.Gauge(document.getElementById('speed-gauge'));
    speedGauge.draw(speedData, speedOptions);

    powerData = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Power', 50]
    ]);
    powerGauge = new google.visualization.Gauge(document.getElementById('power-gauge'));
    powerGauge.draw(powerData, powerOptions);
}

const speedSlider = document.getElementById('speed-slider');
const powerSlider = document.getElementById('power-slider');

speedSlider.addEventListener('input', function() {
    speedData.setValue(0, 1, parseInt(this.value));
    speedGauge.draw(speedData, speedOptions);
});

powerSlider.addEventListener('input', function() {
    powerData.setValue(0, 1, parseInt(this.value));
    powerGauge.draw(powerData, powerOptions);
});