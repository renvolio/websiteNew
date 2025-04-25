const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let points = [];
let bestPath = [];
let bestLength = Infinity;
let isRunning = false;

// Обработка кликов и добавление точек
canvas.addEventListener('click', (e) => {
    if (isRunning) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    points.push({x, y});

    draw();
});

// Рисование точек
function drawPoints() {
    ctx.fillStyle = "red";
    for (const point of points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Рисование пути
function drawPath(path, color = "#3498db") {
    if (path.length === 0) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[path[0]].x, points[path[0]].y);

    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(points[path[i]].x, points[path[i]].y);
    }

    ctx.lineTo(points[path[0]].x, points[path[0]].y);
    ctx.stroke();
}

// Основная функция отрисовки
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPath(bestPath);
    drawPoints();

    if (bestPath.length > 0) {
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText(`Длина: ${bestLength.toFixed(2)}`, 20, 30);
    }
}

// Расстояние между точками
function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Вычисление длины пути
function calcPathLength(path) {
    let length = 0;
    for (let i = 0; i < path.length; i++) {
        const p1 = points[path[i]];
        const p2 = points[(i + 1) % path.length];
        length += distance(p1, p2);
    }
    return length;
}

// Матрица феромонов
let pheromones = [];
function initPheromones() {
    const n = points.length;
    pheromones = [];

    for (let i = 0; i < n; i++) {
        pheromones[i] = [];
        for (let j = 0; j < n; j++) {
            pheromones[i][j] = 1.0;
        }
    }
}

// Поиск пути муравьём
function antFindPath() {
    const path = [];
    const visited = [];

    const start = Math.floor(Math.random() * points.length);
    path.push(start);
    visited.push(start);

    while (visited.length < points.length) {
        const current = path[path.length - 1];
        const next = chooseNextPoint(current, visited);
        path.push(next);
        visited.push(next);
    }
    return path;
}

// Выбор следующей точки
function chooseNextPoint(current, visited) {
    let sum = 0;
    const probabilities = [];

    for (let i = 0; i < points.length; i++) {
        if (!visited.includes(i)) {
            const pheromone = pheromones[current][i];
            const dist = distance(points[current], points[i]);
            const attractivePoints = pheromone * (1 / dist);
            probabilities.push({index: i, attractivePoints});
            sum += attractivePoints;
        }
    }

    let random = Math.random() * sum;
    for (const p of probabilities) {
        if (random < p.attractivePoints) {
            return p.index;
        }
        random -= p.attractivePoints;
    }

    return probabilities[0]?.index || 0;
}

// Обновление феромонов
function updatePheromones(paths) {
    // Испарение феромонов
    for (let i = 0; i < pheromones.length; i++) {
        for (let j = 0; j < pheromones[i].length; j++) {
            pheromones[i][j] *= 0.5;
        }
    }

    // Добавление новых феромонов
    for (const path of paths) {
        const pathLength = calcPathLength(path);
        for (let i = 0; i < path.length; i++) {
            const from = path[i];
            const to = path[(i + 1) % path.length];
            pheromones[from][to] += 1 / pathLength;
            pheromones[to][from] += 1 / pathLength;
        }
    }
}

// Основная функция алгоритма
async function runACO(iterations = 100, antsCount = 10) {
    initPheromones();
    bestLength = Infinity;

    for (let i = 0; i < iterations; i++) {
        if (!isRunning) break;

        const paths = [];
        for (let ant = 0; ant < antsCount; ant++) {
            paths.push(antFindPath());
        }

        updatePheromones(paths);

        for (const path of paths) {
            const length = calcPathLength(path);
            if (length < bestLength) {
                bestLength = length;
                bestPath = path;
            }
        }

        draw();
        await new Promise(r => setTimeout(r, 50));
    }
}

// Обработчики кнопок
const startBtn = document.getElementById('start');
const clearBtn = document.getElementById('clear');

startBtn.addEventListener('click', () => {
    if (points.length < 3) {
        alert('Добавьте минимум 3 точки для запуска алгоритма!');
        return;
    }

    if (isRunning) {
        isRunning = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Старт';
    } else {
        isRunning = true;
        startBtn.innerHTML = '<i class="fas fa-stop"></i> Стоп';
        runACO().then(() => {
            isRunning = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Старт';
        });
    }
});

clearBtn.addEventListener('click', () => {
    isRunning = false;
    points = [];
    bestPath = [];
    bestLength = Infinity;
    pheromones = [];
    startBtn.innerHTML = '<i class="fas fa-play"></i> Старт';
    draw();
});

