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
const offsetX = canvas.width / 2 - halfWidth;
const offsetY = canvas.height / 2 - (gridMaxY * tileHeight)/2;

ctx.clearRect(0, 0, canvas.width, canvas.height);
const grassColor = "#208040";
const hoverColor = "#104020";
let highlighted;
let sprites = [];
const grid = [];

const drawTile = (image, point) =>{
    ctx.drawImage(image, point.x - halfWidth, point.y - halfHeight);
};

const drawCrop = (image, point) =>{
    ctx.drawImage(image, point.x - halfWidth/2.0, point.y - halfHeight/2.0 - halfHeight);
};

            //createImageBitmap(image, 0, 50, 64, 128)
            //createImageBitmap(image, 64, 88, 64, 128),
            //createImageBitmap(image, 128, 8, 64, 128),
            //createImageBitmap(image, 192, 88, 64, 128)

//image.onload = () =>{
//    const image = new Image();
//    image.src = "assets/crops-v2/crops.png";
//    Promise.all([
//        createImageBitmap(image, 0, 32, 32, 32),
//        createImageBitmap(image, 0, 2*32, 32, 32),
//        createImageBitmap(image, 0, 3*32, 32, 32),
//        createImageBitmap(image, 0, 4*32, 32, 32)
//    ]).then(results => {
//        sprites.push(results);
//    });
//};


const createGrid = () =>{
    for(let i = 0; i < gridMaxY; i++){
        grid[i] = new Array();
        for(let j = 0; j < gridMaxX; j++){
            grid[i][j] = 0;
        }
    }
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

const updateGrid = () =>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < gridMaxY; i++){
        for(let j = 0; j < gridMaxX; j++){
            let gridCoord = {x: j, y: i};
            let screenCoord = gridToScreen(gridCoord);
            if(highlighted !== undefined && highlighted.x === gridCoord.x && highlighted.y === gridCoord.y)
            {
                drawTile(sprites[0][1], screenCoord);
                drawCrop(sprites[1][3], screenCoord);
            }
            else
                drawTile(sprites[0][1], screenCoord);
        }
    }
    requestAnimationFrame(updateGrid);
};

canvas.addEventListener("mousemove", (e) =>{
    const point = screenToGrid({x: e.offsetX, y: e.offsetY});
    if(point.x >= 0 && point.x < gridMaxX && point.y >= 0 && point.y < gridMaxY){
        highlighted = point;
    }
    else
        highlighted = undefined;
});

const loadSpriteSheet1 = async (src) => {
    const image = new Image();
    image.src = "assets/sprite-sheet.png";
    await image.decode();

    const result = await Promise.all([
        createImageBitmap(image, 0, 50, 64, 128),
        createImageBitmap(image, 64, 88, 64, 128),
        createImageBitmap(image, 128, 8, 64, 128),
        createImageBitmap(image, 192, 88, 64, 128)
    ]);
    return result;
};

const loadSpriteSheet2 = async (src) => {
    const image = new Image();
    image.src = "assets/crops-v2/crops.png";
    await image.decode();

    const result = await Promise.all([
        createImageBitmap(image, 0, 32, 32, 32),
        createImageBitmap(image, 0, 3*32, 32, 32),
        createImageBitmap(image, 0, 5*32, 32, 32),
        createImageBitmap(image, 0, 7*32, 32, 32)
    ]);
    return result;
};

const start = async () =>{
    const [tiles, crops] = await Promise.all([
        loadSpriteSheet1(),
        loadSpriteSheet2()
    ]);
    sprites.push(tiles);
    sprites.push(crops);
    requestAnimationFrame(updateGrid);
};

start();
