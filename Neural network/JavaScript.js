const canvas = document.getElementById("c1");
const ctx = canvas.getContext("2d");

canvas.onmousedown = function (event) {
    draw(event);
    canvas.onmousemove = draw
}

canvas.onmouseup = function (event) {
    canvas.onmousemove = null;
}

canvas.onmouseleave = function (event) {
    canvas.onmousemove = null;
}

function draw(event) {
    const size = 10; // 10 / 500 = 50, 50x50 пикселей сетка

    const x = Math.floor(event.offsetX / size);
    const y = Math.floor(event.offsetY / size);

    ctx.fillRect(x * size, y * size, size, size)
}