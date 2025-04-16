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
    draw(context) {
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
    is_full() {
        return this.children.length === this.children_count;
    }
    is_leaf() {
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
        while (this.queue.length >= 1 && this.queue[0].is_full()) {
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
                nodes[i].rect.draw(context);
                this.bind(nodes[i].parent, nodes[i]); 
            }
        }
        context.closePath();
    }
    bind(node1, node2) {
        if (node1 && node2) {
            context.strokeStyle = "gray";
            context.lineWidth = 0.5;
            context.moveTo(node1.rect.centerBottom()[0], node1.rect.centerBottom()[1]);
            context.lineTo(node2.rect.centerTop()[0], node2.rect.centerTop()[1]);
            context.stroke();
            context.strokeStyle = "black";
            context.lineWidth = 1;
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



const sample = document.sample,
    textElement = sample.input,
    buttonSave = sample.save,
    buttonEdit = sample.edit;
buttonSave.onclick = buttonSaveClick;
buttonEdit.onclick = buttonEditClick;

function buttonSaveClick() {
    tree = new Tree();
    context.clearRect(0, 0, canvas.width, canvas.height);
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
    textElement2.disabled = 1;
    context.strokeStyle = "red";
    context.lineWidth = 2;
    const options = textElement2.value.split('\n');
    let node = tree.root;
    node.rect.draw(context);
    for (let i = 0; i < tree.lvls; i++) {
        const condition = options[i].split(',')[1];
        for (let child of node.children) {
            if (child.condition === condition) {
                child.rect.draw(context);
                node = child;
                break;
            }
        }
    }
    
}

function buttonEditClick2() {
    textElement2.disabled = 0;
}