class Rect {
    static width = 150;
    static height = 50;
    static margin = 30;
    start_x;
    start_y;
    textInside;
    textOutside;
    constructor(start_x, start_y, textInside, textOutside) {
        this.start_x = start_x;
        this.start_y = start_y;
        this.textInside = textInside;
        this.textOutside = textOutside;
    }
    center() {
        const x = this.start_x + Rect.width / 2;
        const y = this.start_y + Rect.height / 2;
        return [x,y];
    }
    centerTop() {
        const x = this.start_x + Rect.width / 2;
        const y = this.start_y;
        return [x,y];
    }
    centerBottom() {
        const x = this.start_x + Rect.width / 2;
        const y = this.start_y + Rect.height;
        return [x,y];
    }
    draw(context, color, lineWidth) {
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.strokeRect(this.start_x, this.start_y, Rect.width, Rect.height);
        context.fillStyle = "black";        
        context.fillText(this.textInside, this.center()[0], this.center()[1]);
        context.fillStyle = "red";
        context.fillText(this.textOutside, this.centerTop()[0], this.centerTop()[1] - Rect.margin / 2)
    }
}



class Node {
    value;
    condition;
    children;
    children_count;
    parent;
    lvl;
    rect;
    constructor(value, condition, children_count) {
        this.value = value;
        this.condition = condition;
        this.children = [];
        this.children_count = children_count;
        this.parent = null;
        this.lvl = 0;
        this.rect = null;
    }
    isFull() {
        return this.children.length === this.children_count;
    }
    isLeaf() {
        return this.children.length === 0;
    }
}



class Tree {
    root;
    queue;
    lvls;
    nodesOnEachLvls;
    breadth;
    constructor() {
        this.root = null;
        this.queue = [];
        this.lvls = 0;
        this.nodesOnEachLvls = [];
        this.breadth = 0;
    }
    push(value, condition, childrenCount) {
        while (this.queue.length >= 1 && this.queue[0].isFull()) {
            this.queue.shift();
        }
        const currNode = this.queue[0];
        const newNode = new Node(value, condition, childrenCount);
        this.queue.push(newNode);
        if (this.root === null) {
            this.root = newNode;
            this.nodesOnEachLvls[0] = [this.root];
            return;
        }
        const lvl = currNode.lvl + 1;
        newNode.lvl = lvl;
        this.lvls = lvl;
        if (!this.nodesOnEachLvls[lvl]) {
            this.nodesOnEachLvls[lvl] = [];
        }
        this.nodesOnEachLvls[lvl].push(newNode);
        for (let nodes of this.nodesOnEachLvls) {
            this.breadth = Math.max(this.breadth, nodes.length);
        }
        newNode.parent = currNode;
        currNode.children.push(newNode);
    }
    draw(context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        let x, y, step;
        const width = Rect.width + Rect.margin;
        const height = Rect.height + Rect.margin;
        for (let nodes of this.nodesOnEachLvls) {
            step = (this.breadth - nodes.length) * width / (nodes.length + 1);
            x = 0;
            for (let i = 0; i < nodes.length; i++) {
                x += step;
                y = height * nodes[i].lvl;
                nodes[i].rect = new Rect(x, y, nodes[i].value, nodes[i].condition);
                x += width;
                nodes[i].rect.draw(context, "black", 1);
                this.bind(nodes[i].parent, nodes[i]); 
            }
        }
        context.stroke();
        context.closePath();
    }
    bind(node1, node2) {
        if (node1 && node2) {
            context.strokeStyle = "black";
            context.lineWidth = 0.5;
            context.moveTo(node1.rect.centerBottom()[0], node1.rect.centerBottom()[1]);
            context.lineTo(node2.rect.centerTop()[0], node2.rect.centerTop()[1]);
        } 
    }
}



const canvas = document.getElementById("canvas");
canvas.width = document.getElementById("main container").offsetWidth;
canvas.height = document.getElementById("main container").offsetHeight;
const context = canvas.getContext("2d");
context.font = "16px Verdana";
context.textAlign = "center";
context.textBaseline = "middle";
context.lineJoin = "round";

let tree;



const sampleForm = document.sample,
    textElement = sampleForm.input,
    buttonSave = sampleForm.save,
    buttonEdit = sampleForm.edit;
buttonSave.onclick = buttonSaveClick;
buttonEdit.onclick = buttonEditClick;

function buttonSaveClick() {
    tree = new Tree();
    
    const nodes = textElement.value.split('\n');
    for (let node of nodes) {
        const value = node.split(',')[0],
              condition = node.split(',')[1],
              childrenCount = parseInt(node.split(',')[2]);
        tree.push(value, condition, childrenCount);
    }
    tree.draw(context);
    console.log(tree);
    textElement.disabled = 1;
}

function buttonEditClick() {
    textElement.disabled = 0;
}



const inputForm = document.inputForm,
    textElement2 = inputForm.input,
    buttonSave2 = inputForm.save,
    buttonEdit2 = inputForm.edit;
buttonSave2.onclick = buttonSaveClick2;
buttonEdit2.onclick = buttonEditClick2;

function buttonSaveClick2() {
    tree.draw(context);
    textElement2.disabled = 1;
    context.lineWidth = 2;
    const elems = textElement2.value.split('\n');
    let currNode = tree.root;
    currNode.rect.draw(context, "red", 2);
    for (let i = 0; i < tree.lvls; i++) {
        for (let elem of elems) {
            for (let child of currNode.children) {
                const value = elem.split(',')[0];
                const condition = elem.split(',')[1];
                if (currNode.value === value && child.condition === condition) {
                    child.rect.draw(context, "red", 2);
                    currNode = child;
                    elem = null;
                    break;
                }
            }
        }
    }
}

function buttonEditClick2() {
    textElement2.disabled = 0;
}