const canvas = document.querySelector("#canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const tileWidth = 64;
const tileHeight = 32;
const halfWidth = tileWidth / 2;
const halfHeight = tileHeight / 2;
const gridMaxX = 20;
const gridMaxY = 20;
const offsetX = canvas.width / 2;
const offsetY = canvas.height / 2 - (gridMaxY * tileHeight)/2;

ctx.clearRect(0, 0, canvas.width, canvas.height);
const grassColor = "#208040";
const hoverColor = "#104020";
let highlighted = undefined;
let sprites = undefined;

const drawTile = (image, point) =>{
    ctx.drawImage(image, point.x - halfWidth, point.y - halfHeight);
};

const loadSpriteSheet = () =>{
    const image = new Image();
    image.src = "assets/sprite-sheet.png";
    image.onload = () => {
        Promise.all([
            createImageBitmap(image, 0, 50, 64, 128),
            createImageBitmap(image, 64, 88, 64, 128),
            createImageBitmap(image, 128, 8, 64, 128),
            createImageBitmap(image, 192, 88, 64, 128)
        ]).then(results => {
            sprites = results;
            updateGrid(grid);
        })
    };
}


const createGrid = () =>{
    const grid = [];
    for(let i = 0; i < gridMaxY; i++){
        grid[i] = new Array();
        for(let j = 0; j < gridMaxX; j++){
            grid[i][j] = 0;
        }
    }
    return grid;
};

const screenToGrid = (point) =>{
    return {
        x: Math.floor(0.5 * ((point.x - (offsetX + halfWidth))/halfWidth + (point.y - (offsetY + halfHeight))/halfHeight) + 0.5),
        y: Math.floor(0.5 * ((point.y - (offsetY + halfHeight))/halfHeight - (point.x - (offsetX + halfWidth))/halfWidth) + 0.5)
    };
};

const gridToScreen = (point) =>{
    return {
        x: (offsetX + halfWidth) + halfWidth * (point.x - point.y),
        y: (offsetY + halfHeight) + halfHeight * (point.x + point.y)
    };
};

const updateGrid = (grid) =>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < gridMaxY; i++){
        for(let j = 0; j < gridMaxX; j++){
            let gridCoord = {x: j, y: i};
            let screenCoord = gridToScreen(gridCoord);
            if(highlighted !== undefined && highlighted.x === gridCoord.x && highlighted.y === gridCoord.y)
                drawTile(sprites[3], screenCoord);
            else
                drawTile(sprites[1], screenCoord);
        }
    }
};

canvas.addEventListener("mousemove", (e) =>{
    const point = screenToGrid({x: e.offsetX, y: e.offsetY});
    if(point.x >= 0 && point.x < gridMaxX && point.y >= 0 && point.y < gridMaxY){
        highlighted = point;
    }
    else
        highlighted = undefined;
    updateGrid(grid, sprites);
});

loadSpriteSheet();
let grid = createGrid();
