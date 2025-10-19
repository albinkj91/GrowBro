const canvas = document.querySelector("#canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 25;
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
let tiles = [];
let crops = [];
let logo;
const grid = [];

const drawTile = (image, point) =>{
    ctx.drawImage(image, point.x - halfWidth, point.y - halfHeight);
};

const drawCrop = (image, point) =>{
    ctx.drawImage(image, point.x - halfWidth/2, point.y - 54);
};

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
    ctx.drawImage(logo, 0, 0);
    drawMenu([1, 2, 3, 4, 5, 6, 7]);
    for(let i = 0; i < gridMaxY; i++){
        for(let j = 0; j < gridMaxX; j++){
            let gridCoord = {x: j, y: i};
            let screenCoord = gridToScreen(gridCoord);
            if(highlighted !== undefined && highlighted.x === gridCoord.x && highlighted.y === gridCoord.y)
            {
                drawTile(tiles[4], screenCoord);
                drawCrop(crops[3][27], screenCoord);
            }
            else
                drawTile(tiles[1], screenCoord);
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

const loadLogo = async (src) => {
    const image = new Image();
    image.src = "assets/crops-v2/crops.png";
    await image.decode();

    const result = await createImageBitmap(image, 0, 21*32, 11*32, 64);
    return result;
};

const loadTiles = async (src) => {
    const image = new Image();
    image.src = "assets/sprite-sheet.png";
    await image.decode();

    const result = await Promise.all([
        createImageBitmap(image, 0, 12, 64, 128),
        createImageBitmap(image, 64, 88, 64, 128),
        createImageBitmap(image, 128, 8, 64, 128),
        createImageBitmap(image, 192, 88, 64, 128),
        createImageBitmap(image, 256, 88, 64, 128)
    ]);
    return result;
};

const loadCrops = async (src) => {
    const image = new Image();
    image.src = "assets/crops-v2/crops.png";
    await image.decode();

    const result = await Promise.all(
        Array.from({ length: 10 }, async (v, i) =>{
            return await Promise.all(
                Array.from({ length: 31 }, (v2, j) =>{
                    return createImageBitmap(image, j*32, i*64, 32, 64)
                })
            )
        }));
    return result;
};

const drawMenu = (items) =>{
    const width = items.length * 32;
    const height = 96;
    const offsetX = canvas.width / 2 - width/2;
    const offsetY = canvas.height - height - 5;
    ctx.fillStyle = "red";
    ctx.fillRect(offsetX, offsetY, width, height);
};

const start = async () =>{
    const [t, c, l] = await Promise.all([
        loadTiles(),
        loadCrops(),
        loadLogo()
    ]);
    tiles = Array.from(t);
    crops = Array.from(c);
    logo = l;
    requestAnimationFrame(updateGrid);
};

start();
