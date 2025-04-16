const canvas = document.getElementById('maze');
const ctx = canvas.getContext('2d');


const rows = 20;
const cols = 20;
const cellWidth = canvas.width / cols;
const cellHeight = canvas.height / rows;

let maze = Array(rows).fill().map(()=>Array(cols).fill(1));


let start = {x:0, y: 0};
let end = {x:cols - 1, y:rows - 1};


function generateMaze(){
    maze[start.y][start.x] = 0;

    let walls = [];
    if(start.y > 0)walls.push({x: start.x, y : start.y - 1});
    if(start.x > 0)walls.push({x : start.x - 1, y :start.y});
    if(start.y < rows - 1)walls.push({x:start.x, y: start.y + 1});
    if(start.x < cols - 1)walls.push({x : start.x + 1, y : start.y});

    while(walls.length > 0){
        let randomIndex = Math.floor(Math.random() * walls.length);
        let wall = walls.splice(randomIndex, 1)[0];

        let passageCount = 0;
        if(wall.y > 0 && maze[wall.y - 1][wall.x] ===0)passageCount++;
        if(wall.y < rows - 1 && maze[wall.y + 1][wall.x] === 0) passageCount++;
        if(wall.x > 0 && maze[wall.y][wall.x - 1] === 0)passageCount++;
        if(wall.x < cols - 1 && maze[wall.y][wall.x + 1] === 0)passageCount++;

        if (passageCount === 1){
            maze[wall.y][wall.x] = 0;
            if(wall.y > 0 && maze[wall.y - 1][wall.x] === 1) walls.push({x : wall.x, y:wall.y - 1});
            if(wall.y < rows - 1  && maze[wall.y + 1][wall.x] === 1)walls.push({x :wall.x, y : wall.y + 1});
            if(wall.x > 0 && maze[wall.y][wall.x - 1] === 1) walls.push({x:wall.x - 1,y:wall.y});
            if(wall.x < cols - 1  && maze[wall.y][wall.x + 1] === 1)walls.push({x: wall.x + 1, y:wall.y});

        }


    }


}

const borderColor = '#000000';
const fillColor = '#ffffff';
function drawGrid() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * cellWidth;
            const y = row * cellHeight;

            if (row === start.y && col === start.x) {
                ctx.fillStyle = "green";
            } else if (row === end.y && col === end.x) {
                ctx.fillStyle = "red";
            } else {
                ctx.fillStyle = maze[row][col] === 0 ? "white" : "black";
            }
            ctx.fillRect(x, y, cellWidth, cellHeight);

            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellWidth, cellHeight);


        }
    }

}

function regenerateMaze(){
    maze = Array(rows).fill().map(()=>Array(cols).fill(1));
    generateMaze();
    randomizeStartEnd();
    drawGrid();
}

regenerateMaze();

function getRandomCell() {
    let cell;
    do {
        cell = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
    } while (maze[cell.y][cell.x] === 1);
    return cell;
}

function randomizeStartEnd() {
    start = getRandomCell();
    end = getRandomCell();

    while (start.x === end.x && start.y === end.y) {
        end = getRandomCell();
    }
}
document.getElementById('generateLabirint').addEventListener('click', regenerateMaze);
document.getElementById('randomizePoints').addEventListener('click', function() {
    randomizeStartEnd();
    drawGrid();
});

function findPath(){
    let notUsedList = [];
    let usedList = [];


    function heuristic(start,finish){//эвристика
        return Math.abs(start.x - finish.x) + Math.abs(start.y - finish.y)// стическая оценка

    }
    let firstCell = {
        x:start.x,
        y:start.y,
        g:0,
        h:heuristic(start, end),
        f: 0 + heuristic(start, end),
        parent: null
    }
    notUsedList.push(firstCell);

    while(notUsedList.length > 0){
        let minCost = notUsedList.reduce((minCell,currentCell) => {
            return (currentCell.f < minCell.f) ? currentCell:minCell;
        });
        usedList.push(minCost);
        notUsedList = notUsedList.filter(cell => cell !== minCost);

        if(minCost.x === end.x && minCost.y === end.y){
            let nowCell = minCost;
            let Path = [];

            while(nowCell != null){
                Path.unshift({x:nowCell.x,y:nowCell.y});
                nowCell = nowCell.parent;
            }
            console.log("Путь найден" , Path);
            drowPath(Path);
            break;
        }

        let neighbors = [
            {x:minCost.x,y:minCost.y - 1},
            {x:minCost.x,y:minCost.y + 1},
            {x:minCost.x - 1,y:minCost.y},
            {x:minCost.x + 1,y:minCost.y},
        ];

        for(let neighbor of neighbors){
            if(neighbor.x >=0 && neighbor.x < cols && neighbor.y >= 0 && neighbor.y < rows){
                if(maze[neighbor.y][neighbor.x] === 0){
                    let g = minCost.g + 1;
                    let h = heuristic(neighbor,end);
                    let f = g + h;

                    if(!usedList.some(cell => cell.x === neighbor.x && cell.y === neighbor.y)){
                        let currentNeighbor = notUsedList.find(cell => cell.x === neighbor.x && cell.y === neighbor.y);
                        if(currentNeighbor){
                            if(f < currentNeighbor.f){
                                currentNeighbor.g = g;
                                currentNeighbor.h = h;
                                currentNeighbor.f = f;
                                currentNeighbor.parent = minCost;
                            }

                        }
                        else {
                            notUsedList.push({x:neighbor.x,y:neighbor.y,g:g,h:h,f:f,parent:minCost});
                        }
                    }

                }
            }
        }
    }
}

function drowPath(Path){
    ctx.fillStyle = "green";
    Path.forEach(cell => {
        const x = cell.x * cellWidth;
        const y = cell.y * cellHeight;
        ctx.fillRect(x, y, cellWidth, cellHeight);
    })
}

document.getElementById('findPath').addEventListener('click', function () {
    findPath();
});
canvas.addEventListener('click',function (event){
    const x = Math.floor(event.offsetX / cellWidth);
    const y = Math.floor(event.offsetY / cellHeight);

    if(maze[y][x] === 1){
        maze[y][x] = 0;
    }
    else {
        maze[y][x] = 1;
    }

    drawGrid();
});


