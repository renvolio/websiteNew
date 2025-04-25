const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const points = [];

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    points.push({ x, y });
    drawPoints();
});

function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
    });
}

document.getElementById('start').addEventListener('click', (e) => {
    const k = parseInt(document.getElementById('kValue').value);
    if (k > 0 && points.length >= k) {
        const clusters = kMeans(points, k);

        drawClusters(clusters);
    } else {
        alert('Нужно ввести корректтное K!');
    }
});

function drawClusters(clusters) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    clusters.forEach((cluster, clusterIndex) => {
        const clusterColor = getClusterColor(clusterIndex);

        cluster.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = clusterColor;
            ctx.fill();
        });
    });
}

function getClusterColor(index) {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#A633FF'];
    return colors[index % colors.length];
}

function kMeans(points, k,) {
    let centroids = [];
    let usedIndices = {};

    while (centroids.length < k) {
        let i = Math.floor(Math.random() * points.length);
        if (!usedIndices[i]) {
            centroids.push({ x: points[i].x, y: points[i].y });
            usedIndices[i] = true;
        }
    }

    let clusters = [];
    let maxIterations = 10;

    for (let iter = 0; iter < maxIterations; iter++) {
        clusters = Array.from({ length: k }, () => []);

        for (let point of points) {
            let closestIndex = 0;
            let minDist = distance(point, centroids[0]);

            for (let j = 1; j < k; j++) {
                let dist = distance(point, centroids[j]);
                if (dist < minDist) {
                    minDist = dist;
                    closestIndex = j;
                }
            }

            clusters[closestIndex].push(point);
        }

        for (let i = 0; i < k; i++) {
            const cluster = clusters[i];
            let sumX = 0, sumY = 0;

            for (let point of cluster) {
                sumX += point.x;
                sumY += point.y;
            }

            if (cluster.length > 0) {
                centroids[i].x = sumX / cluster.length;
                centroids[i].y = sumY / cluster.length;
            }
        }
    }

    return clusters;
}

function distance(p1, p2) {

    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);

}

document.getElementById('clear').addEventListener('click', () => {
    points.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
