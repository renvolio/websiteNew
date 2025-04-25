let neuralNetwork = [];

fetch('neruo2.json')
    .then(res => res.json())
    .then(data => {
        neuralNetwork = data;
    });

function relu(x) {
    return x.map(val => Math.max(0, val));
}

function softmax(logits) {
    let maxValue = -Infinity;

    for (let i = 0; i < logits.length; i++) {
        if (logits[i] > maxValue) {
            maxValue = logits[i];
        }
    }
    // выравниваем значения
    let degrees = [];
    let probabilities = [];
    let sumDegrees = 0;
    for (let i = 0; i < logits.length; i++) {
        let number = Math.exp(logits[i] - maxValue);
        degrees.push(number);
        sumDegrees += number;
    }
    for (let i = 0; i < degrees.length; i++) {
        probabilities.push(degrees[i] / sumDegrees);
    }
    // счиатаем по формуле, через экспаненты.
    return probabilities;

}

function forward(input) {
    let output = input;

    for (let i = 0; i < neuralNetwork.length; i++) {
        let layer = neuralNetwork[i];

        if (layer.weights) {
            let weights = layer.weights;
            let biases = layer.biases[0];
            let nextOutput = [];

            for (let j = 0; j < weights[0].length; j++) {
                let sum = 0;

                for (let k = 0; k < weights.length; k++) {
                    sum += output[k] * weights[k][j];
                }
                nextOutput.push(sum + biases[j]);
            }
            // перемножили фотку на веса
            output = nextOutput;
        } else if (layer.activation === "ReLU") {
            output = relu(output);
        } else if (layer.activation === "Softmax") {
            output = softmax(output);
        }
        // иначе бомбим функции
    }
    return output;
}

//-------------------------------------------------------------------------------

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let isDrawing = false;


canvas.onmousedown = function (event) {
    isDrawing = true;
    draw(event);
};
canvas.onmouseup = function (event) {
    isDrawing = false;
};
canvas.onmouseleave = function (event) {
    isDrawing = false;
};
canvas.onmousemove = function (event) {
    if (isDrawing) {
        draw(event);
    }
};

function draw(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
}


const predictButton = document.getElementById('start');
predictButton.addEventListener('click', function () {
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = 28;
    smallCanvas.height = 28;
    const smallContext = smallCanvas.getContext('2d');
    smallContext.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
    const imageData = smallContext.getImageData(0, 0, smallCanvas.width, smallCanvas.height);
    //создаем массив малый
    const input = [];
    let i = 0;

    while (i < imageData.data.length) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        const average = (r + g + b) / 3;
        const normalized = average / 255;
        input.push(normalized);
        i = i + 4;
    }

    const probabilities = forward(input);

    let maxProbability = probabilities[0];
    let indexDigit = 0;

    for (let j = 1; j < probabilities.length; j++) {
        if (probabilities[j] > maxProbability) {
            maxProbability = probabilities[j];
            indexDigit = j;
        }
    }

    const resultElement = document.getElementById('result');
    resultElement.textContent = "Результат: " + indexDigit;


    let allProbabilitiesText = "";
    let k = 0;
    while (k < probabilities.length) {
        const percentage = (probabilities[k] * 100).toFixed(1);
        allProbabilitiesText += k + ": " + percentage + "%<br>";
        k = k + 1;
    }

    const probsElement = document.getElementById('probs');
    probsElement.innerHTML = allProbabilitiesText;
});

document.getElementById('clear').addEventListener('click', () => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const resultElement = document.getElementById('result');
    resultElement.textContent = "";

    const probsElement = document.getElementById('probs');
    probsElement.innerHTML = "";
});