const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d"); 
context.textAlign = "center";
context.textBaseline="middle";
context.font = "18px Calibri";
context.lineWidth = 2;

const buttonStart = document.getElementById("start");
const buttonClear = document.getElementById("clear");

let matrix = [];
let nodesList = [];
let mouseButtonActive = true;



canvas.addEventListener("mouseup", function(e) {
    if (!mouseButtonActive) {
        return;
    }
    const x = e.pageX - this.offsetLeft;
    const y = e.pageY - this.offsetTop;
    const circle = new Circle(x, y, 15, nodesList.length + 1);
    circle.draw(context);
    nodesList.push(circle);
});

buttonStart.addEventListener("click", function(e) {
    if (!mouseButtonActive) {
        return;
    }
    mouseButtonActive = false;
    for (let i = 0; i < nodesList.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < nodesList.length; j++) {
            matrix[i][j] = Math.floor(distance(nodesList[i], nodesList[j]));
        }
    }
    const evolution = new Evolution(nodesList.length);
    evolution.start();
});

buttonClear.addEventListener("click", function(e) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    matrix = [];
    nodesList = [];
    mouseButtonActive = true;
});



class Evolution {
    static MAX_POP_SIZE = 10;
    static GENERATIONS = 50000;
    population;
    nodesCount;
    
    constructor(nodesCount) {
        this.nodesCount = nodesCount;
        this.population = [];
    }
    
    start() {
        const queue = [];
        const gens = new Set();
        this.genStartPop();
        for (let i = 0; i < Evolution.GENERATIONS; i++) {
            this.crossover(this.population.length);
            this.population.sort(comparator);
            this.deleteSame();
            this.mutation();
            this.population.sort(comparator);
            this.population = this.population.slice(0, Evolution.MAX_POP_SIZE);
            if (!gens.has(this.population[0].length)) {
                gens.add(this.population[0].length);
                queue.push(this.population[0]);
            }
        }
        console.log(gens);

        let drawPaths;
        drawPaths = setInterval(function(queue) {
            if (queue.length <= 1) {
                clearInterval(drawPaths);
            }
            const chromo = queue.shift();
            drawPath(chromo.path);
            drawLength(chromo.length);
        }, 100, queue);
    }

    genStartPop() {
        let path = [];
        for (let i = 0; i < this.nodesCount; i++) {
            path[i] = i;
        }
        this.population.push(new Chromo(path));
        
        for (let i = 1; i < Evolution.MAX_POP_SIZE; i++) {
            path = this.population[i - 1].path.slice(0);
            const replaces = randint(this.nodesCount / 2) + 1;
            for (let j = 0; j < replaces; j++) {
                const node1 = randint(this.nodesCount - 1) + 1;
                const node2 = randint(this.nodesCount - 1) + 1;
                swap(path, node1, node2)
            }
            this.population.push(new Chromo(path));
        }
    }

    crossover(popSize) {
        for (let k = 0; k < Math.floor(popSize / 2); k++) {
            const parent1 = this.population[k].path;
            const parent2 = this.population[popSize - k - 1].path;
            const child1 = [];
            const child2 = [];
            const pivot = randint(this.nodesCount - 1) + 1;
            
            let i = 0, j = pivot, cache = [];
            for (; i < pivot; i++) {
                child1.push(parent1[i]);
                cache[parent1[i]] = 1;
            }
            for (; j < this.nodesCount; j++) {
                if (cache[parent2[j]] !== 1) {
                    child1.push(parent2[j]);
                    cache[parent2[j]] = 1;
                }
            }
            for (; i < this.nodesCount; i++) {
                if (cache[parent1[i]] !== 1) {
                    child1.push(parent1[i]);
                    cache[parent1[i]] = 1;
                }
            }
        
            i = 0, j = pivot, cache = [];
            for (; i < pivot; i++) {
                child2.push(parent2[i]);
                cache[parent2[i]] = 1;
            }
            for (; j < this.nodesCount; j++) {
                if (cache[parent1[j]] !== 1) {
                    child2.push(parent1[j]);
                    cache[parent1[j]] = 1;
                }
            }
            for (; i < this.nodesCount; i++) {
                if (cache[parent2[i]] !== 1) {
                    child2.push(parent2[i]);
                    cache[parent2[i]] = 1;
                }
            }
        
            this.population.push(new Chromo(child1));
            this.population.push(new Chromo(child2));
        }
    }

    deleteSame() {
        let begin = 0;
        for (let i = 1; i < this.population.length; i++) {
            if (this.population[i - 1].length !== this.population[i].length) {
                this.population.splice(begin + 1, i - begin - 1);
                begin = i;
            }
        }
    }

    mutation() {
        for (let i = Math.floor(this.population.length / 2); i < this.population.length; i++) {
            const range1 = randint(this.nodesCount - 1) + 1;
            const range2 = randint(this.nodesCount - 1) + 1;
            const left = range1 < range2 ? range1 : range2;
            const right = range1 > range2 ? range1 : range2;
            reverse(this.population[i].path, left, right);
            this.population[i].calcLen();
        }
    }
}



class Chromo {
    path;
    length;
    constructor(path) {
        this.path = path;
        this.calcLen();
    }
    calcLen() {
        this.length = 0;
        for (let i = 0; i < this.path.length - 1; i++) {
            this.length += matrix[this.path[i]][this.path[i + 1]]
        }
        this.length += matrix[this.path[this.path.length - 1]][this.path[0]];
    }
}



class Circle {
    x;
    y;
    radius;
    text;
    constructor(x, y, radius, text) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.text = text;
    }
    draw(context) {
        context.save();
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        context.lineWidth = 0.5;
        context.strokeStyle = "black";
        context.fillStyle = "#fc8c03";
        context.fill();
        context.closePath();
        context.stroke();
        context.fillStyle = "black";
        context.fillText(this.text, this.x, this.y);
        context.restore();
    }
}



function drawLength(length) {
    context.save();
    context.textAlign = "left";
    context.textBaseline="top";
    context.font = "20px Calibri";
    context.fillText("Длина: " + length, 5, 5);
    context.restore();
}

function drawPath(path) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.strokeStyle = "#575757";
    for (let i = 0; i < path.length; i++) {
        const node1 = nodesList[path[i]];
        const node2 = i + 1 < path.length ? nodesList[path[i + 1]] : nodesList[0];
        context.moveTo(node1.x, node1.y);
        context.lineTo(node2.x, node2.y);
    }
    context.stroke();
    for (let node of nodesList) {
        node.draw(context);
    }
}

function distance(circle1, circle2) {
    const x1 = circle1.x, x2 = circle2.x,
          y1 = circle1.y, y2 = circle2.y;
    return ((x1 - x2)**2 + (y1 - y2)**2)**0.5;
}

function randint(max) {
    return Math.floor(Math.random() * max);
}

function swap(arr, ind1, ind2) {
    const x = arr[ind1];
    arr[ind1] = arr[ind2];
    arr[ind2] = x;
}

function reverse(arr, left, right) {
    while (left < right) {
        swap(arr, left, right);
        left++;
        right--;
    }
}

function comparator(chromo1, chromo2) {
    if (chromo1.length < chromo2.length) {
        return -1;
    }
    if (chromo1.length > chromo2.length) {
        return 1;
    }
    return 0;
}