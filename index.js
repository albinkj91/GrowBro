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

const cropNames = [
    "Russet potatoes",
    "Gold potatoes",
    "Purple potatoes",
    "Sweet potatoes",
    "Cassava",
    "Daikon radish",
    "Carrots",
    "Parsnips",
    "Radishes",
    "Beets",
    "Turnips",
    "Rutabaga",
    "Garlic",
    "Yellow onion",
    "Red onion",
    "White onion",
    "Scallion",
    "Hot pepper",
    "Green bell pepper",
    "Red bell pepper",
    "Orange bell pepper",
    "Yellow bell pepper",
    "Chili peppers",
    "Watermelon",
    "Honeydew melon",
    "Cantaloupe melon",
    "Acorn squash",
    "Pumpkin",
    "Crookneck squash",
    "Butternut squash",
    "Corn",
    "Corn",
    "Asparagus",
    "Rhubarb",
    "Romaine lettuce",
    "Iceberg lettuce",
    "Kale",
    "Red cabbage",
    "Green cabbage",
    "Celery",
    "Bok choy",
    "Fennel bulb",
    "Brussels sprouts",
    "Cauliflower",
    "Broccoli",
    "Artichoke",
    "Leeks",
    "Kohlrabi",
    "Eggplant",
    "Zucchini",
    "Yellow squash",
    "Cucumber",
    "Strawberry",
    "Blackberries",
    "Raspberries",
    "Blueberries",
    "Red grapes",
    "Green grapes",
    "Cherry tomatoes",
    "Tomatoes",
    "Large tomatoes",
    "Sugar peas",
    "Hops",
    "Green beans",
    "Coffee",
    "Pineapple",
    "Kiwi"
];

class Crop{
    constructor(name, images){
        this.name = name;
        this.images = images;
        this.growthStage = 0;
    }
}

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


let startTime = performance.now();

const updateGrid = () =>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(logo, 0, 0);
    drawMenu(crops);

    for(let i = 0; i < gridMaxY; i++){
        for(let j = 0; j < gridMaxX; j++){
            let gridCoord = {x: j, y: i};
            let screenCoord = gridToScreen(gridCoord);
            if(highlighted !== undefined && highlighted.x === gridCoord.x && highlighted.y === gridCoord.y)
            {
                drawTile(tiles[4], screenCoord);
                const crop = crops[9];
                drawCrop(crop.images[crop.growthStage], screenCoord);
                const now = performance.now();
                if(now - startTime > 1000)
                {
                    crop.growthStage++;
                    startTime = now;
                }
                if(crop.growthStage > 3)
                    crop.growthStage = 0;
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
                Array.from({ length: 32 }, (v2, j) =>{
                    return createImageBitmap(image, j*32, i*64, 32, 64)
                })
            )
        }));
    return result;
};

const drawMenu = (items) =>{
    const itemsToShow = items.slice(0, 25);
    const width = itemsToShow.length * 64 + 20;
    const height = 90;
    const offsetX = canvas.width / 2 - width/2;
    const offsetY = canvas.height - height - 5;
    ctx.lineWidth = 4;
    ctx.fillStyle = "#906060";
    ctx.strokeStyle = "#402020";
    ctx.strokeRect(offsetX, offsetY, width, height);
    ctx.fillRect(offsetX, offsetY, width, height);

    ctx.fillStyle = "#bb9090";
    for(let i = 0; i < itemsToShow.length; i++){
        ctx.strokeRect(offsetX + i*64 + 18, offsetY + 8, 48, 74);
        ctx.fillRect(offsetX + i*64 + 18, offsetY + 8, 48, 74);
        drawCrop(itemsToShow[i].images[3], {x: offsetX + i*64 + 42, y: offsetY + 68});
    }
};

const transformCropsData = (cropImages) =>{
    for(let i = 0; i < cropImages.length; i += 5){
        for(let j = 0; j < cropImages[i].length; j++){
            crops.push(new Crop(cropNames[i*32/5 + j],
            [
                cropImages[i][j],
                cropImages[i+1][j],
                cropImages[i+2][j],
                cropImages[i+3][j],
                cropImages[i+4][j]
            ]));
        }
    }
};

const start = async () =>{
    const [t, c, l] = await Promise.all([
        loadTiles(),
        loadCrops(),
        loadLogo()
    ]);
    tiles = Array.from(t);
    const cropImages = Array.from(c);
    transformCropsData(cropImages);
    logo = l;
    requestAnimationFrame(updateGrid);
};

start();
