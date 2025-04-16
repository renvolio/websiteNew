const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clusterButton = document.getElementById('clusterButton');
const clearButton = document.getElementById('clearButton');
const clusterCountInput = document.getElementById('clusterCount');
const pointSizeInput = document.getElementById('pointSize');

// Массив для хранения точек
let points = [];
let clusters = [];
let centroids = [];
let isClustered = false;


const clusterColors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#8AC24A',
    '#EA5F89'
];


canvas.addEventListener('click', (e) => {
    if (isClustered) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = parseInt(pointSizeInput.value);


    points.push({ x, y, size, cluster: null });


    drawPoint(x, y, size, '#333');
});


function drawPoint(x, y, size, color) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}


function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points = [];
    clusters = [];
    centroids = [];
    isClustered = false;
}




clearButton.addEventListener('click', clearCanvas);