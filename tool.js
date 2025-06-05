let toolsArr = document.querySelectorAll(".tool");

let canvas = document.querySelector("#board");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let tool = canvas.getContext("2d");

let currentTool = "pencil";

for (let i = 0; i < toolsArr.length; i++) {
    toolsArr[i].addEventListener("click", function () {
        const toolName = toolsArr[i].id;
        if (toolName == "pencil") {
            currentTool = "pencil";
            tool.strokeStyle = "blue";
            tool.lineWidth = 5;
        } else if (toolName == "eraser") {
            currentTool = "eraser";
            tool.strokeStyle = "white";
            tool.lineWidth = 10;
        } else if (toolName == "sticky") {
            currentTool = "sticky";
            createSticky();
        } else if (toolName == "upload") {
            currentTool = "upload";
            uploadFile();
        } else if (toolName == "download") {
            currentTool = "download";
            downloadFN();
        } else if (toolName == "undo") {
            currentTool = "undo";
            undoFN();
        } else if (toolName == "redo") {
            currentTool = "redo";
            redoFN();
        }
    })
}

let undoStack = [];

let redoStack = [];

let isDrawing = false;

canvas.addEventListener("mousedown", function (e) {
    let sidx = e.clientX;
    let sidy = e.clientY;
    isDrawing = true;
    let toolBarHeight = getYDelta();
    tool.beginPath();
    tool.moveTo(sidx, sidy - toolBarHeight);
    let pointDesc = {
        desc: "md",
        x: sidx,
        y: sidy - toolBarHeight,
    }
    undoStack.push(pointDesc);
});

canvas.addEventListener("mousemove", function (e) {
    if (!isDrawing) return;
    let eidx = e.clientX;
    let eidy = e.clientY;
    let toolBarHeight = getYDelta();
    tool.lineTo(eidx, eidy - toolBarHeight);
    tool.stroke();
    tool.beginPath();
    tool.moveTo(eidx, eidy - toolBarHeight);
    let pointDesc = {
        desc: "mm",
        x: eidx,
        y: eidy - toolBarHeight,
    }
    undoStack.push(pointDesc);
});

canvas.addEventListener("mouseup", function () {
    isDrawing = false;
    tool.closePath();
});
let toolBar = document.querySelector(".toolbar");
function getYDelta() {
    let heightOfToolbar = toolBar.getBoundingClientRect().height;
    return heightOfToolbar;
}

function downloadFN() {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempContext = tempCanvas.getContext("2d");

    tempContext.fillStyle = "white";
    tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempContext.drawImage(canvas, 0, 0);

    addWatermark("Hironmoy Koley.", tempContext);

    const dataURL = tempCanvas.toDataURL("image/jpeg");

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "drawing.jpg";
    link.click();
}

function addWatermark(text, context) {

    const x = canvas.width * 0.50;
    const y = canvas.height * 0.5;

    context.translate(x, y);
    context.rotate(-0.4);

    context.font = "bold 30px Pacifico, cursive";
    context.fillStyle = "rgba(160, 160, 160, 0.4)";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText(text, 0, 0);
}

function createOuterShell() {
    let stickyDiv = document.createElement("div");
    let navDiv = document.createElement("div");
    let closeDiv = document.createElement("div");
    let minimizeDiv = document.createElement("div");

    stickyDiv.setAttribute("class", "sticky");
    navDiv.setAttribute("class", "nav");

    closeDiv.innerText = "X";
    minimizeDiv.innerText = "min";


    stickyDiv.appendChild(navDiv);
    navDiv.appendChild(minimizeDiv);
    navDiv.appendChild(closeDiv);

    document.body.appendChild(stickyDiv);

    closeDiv.addEventListener("click", function () {
        stickyDiv.remove();
    })

    isMinimize = false;
    minimizeDiv.addEventListener("click", function () {
        textArea.style.display = isMinimize == true ? "block" : "none";
        isMinimize = !isMinimize;
    })

    let isStickyDown = false;

    navDiv.addEventListener("mousedown", function (e) {
        initialX = e.clientX;
        initialY = e.clientY;
        isStickyDown = true;
    });

    navDiv.addEventListener("mousemove", function (e) {
        if (!isStickyDown) return;
        let finalX = e.clientX;
        let finalY = e.clientY;

        let dx = finalX - initialX;
        let dy = finalY - initialY;

        let { top, left } = stickyDiv.getBoundingClientRect();

        stickyDiv.style.top = top + dy + "px";
        stickyDiv.style.left = left + dx + "px";
        initialX = finalX;
        initialY = finalY;
    });

    navDiv.addEventListener("mouseup", function () {
        isStickyDown = false;
    });
    return stickyDiv;
}


function createSticky() {
    let stickyDiv = createOuterShell();
    let textArea = document.createElement("textarea");
    textArea.setAttribute("class", "text-area");
    stickyDiv.appendChild(textArea);
}

let inputTag = document.querySelector(".input-tag");

function uploadFile() {
    inputTag.click();
    inputTag.addEventListener("change", function () {
        let data = inputTag.files[0];
        let img = document.createElement("img");
        img.src = URL.createObjectURL(data);

        img.setAttribute("class", "upload-img");

        let stickyDiv = createOuterShell();
        stickyDiv.appendChild(img);
    })
}

function undoFN() {

    if (undoStack.length > 0) {
        tool.clearRect(0, 0, canvas.width, canvas.height);
        redoStack.push(undoStack.pop());

        for (let i = 0; i < undoStack.length; i++) {
            let { x, y, desc } = undoStack[i];
            if (desc == "md") {
                tool.beginPath();
                tool.moveTo(x, y);
            } else if (desc == "mm") {
                tool.lineTo(x, y);
                tool.stroke();
            }
        }
    }
}

function redoFN() {

    if (redoStack.length > 0) {
        tool.clearRect(0, 0, canvas.width, canvas.height);
        undoStack.push(redoStack.pop());

        for (let i = 0; i < undoStack.length; i++) {
            let { x, y, desc } = undoStack[i];
            if (desc == "md") {
                tool.beginPath();
                tool.moveTo(x, y);
            } else if (desc == "mm") {
                tool.lineTo(x, y);
                tool.stroke();
            }
        }
    }
}

let cross = document.querySelector(".cross");
let toolbarOptions = document.querySelector(".toolbar-options");

let toolbarVisible = true;


cross.addEventListener("click", function () {
    toolbarVisible = !toolbarVisible;
    toolbarOptions.style.visibility = toolbarVisible ? "visible" : "hidden";

    let icon = cross.querySelector("i");
    if (toolbarVisible) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");
    } else {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
    }
});

