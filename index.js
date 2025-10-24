const canvas = document.querySelector("#canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 25;
const ctx = canvas.getContext('2d');

const tileWidth = 64;
const tileHeight = 32;
const cropWidth = 32;
const cropHeight = 64;
const halfWidth = tileWidth / 2;
const halfHeight = tileHeight / 2;
const gridMaxX = 20;
const gridMaxY = 20;
const offsetX = canvas.width / 2 - halfWidth;
const offsetY = canvas.height / 2 - (gridMaxY * tileHeight)/2;
const menuHeight = 90;
const menuItemWidth = 64;
const menuItemSpacing = 20;
const menuOffsetY = canvas.height - menuHeight - 5;

ctx.clearRect(0, 0, canvas.width, canvas.height);
const grassColor = "#208040";
const hoverColor = "#104020";
let highlighted;
let tiles = [];
let crops = [];
let logo;
let tree;
const grid = [];
let itemsToShow;
let menuIndex;
let selectedMenuIndex = 0;

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
        this.selected = false;
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

const screenToMenuIndex = (point, items) =>{
    let index = Math.floor((point.x - calcMenuOffsetX(items) - 12)/64);
    if(point.y >= menuOffsetY && point.y <= menuOffsetY + 90 && index >= 0 && index < items.length)
        return index;
    return -1;
};


let startTime = performance.now();

const update = () =>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(logo, 0, 0);
    drawMenu(crops);

    if(menuIndex !== -1){
        ctx.strokeStyle = "#80ff80";
        ctx.strokeRect(calcMenuOffsetX(crops) + menuIndex*64 + 11, menuOffsetY + 8, 64, 74);
    }

    for(let i = 0; i < gridMaxY; i++){
        for(let j = 0; j < gridMaxX; j++){
            let gridCoord = {x: j, y: i};
            let screenCoord = gridToScreen(gridCoord);
            if(highlighted !== undefined && highlighted.x === gridCoord.x && highlighted.y === gridCoord.y)
            {
                drawTile(tiles[4], screenCoord);
                const crop = itemsToShow[selectedMenuIndex];
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
    ctx.drawImage(tree, offsetX+5, offsetY-tileHeight/2 - 3);
    requestAnimationFrame(update);
};

canvas.addEventListener("mousemove", (e) =>{
    const point = screenToGrid({x: e.offsetX, y: e.offsetY});
    if(point.x >= 0 && point.x < gridMaxX && point.y >= 0 && point.y < gridMaxY){
        highlighted = point;
    }
    else
        highlighted = undefined;
    menuIndex = screenToMenuIndex({x: e.offsetX, y: e.offsetY}, itemsToShow);
});

canvas.addEventListener("click", (e) =>{
    const index = screenToMenuIndex({x: e.offsetX, y: e.offsetY}, itemsToShow);
    if(index !== -1)
    {
        itemsToShow[selectedMenuIndex].selected = false;
        selectedMenuIndex = index;
        itemsToShow[index].selected = true;
    }
});

const loadLogo = async (src) => {
    const image = new Image();
    image.src = "assets/crops-v2/crops.png";
    await image.decode();

    const result = await createImageBitmap(image, 0, 21*32, 11*32, 64);
    return result;
};

const loadTree = async (src) =>{
    const image = new Image();
    image.src = "assets/crops-v2/crops.png";
    await image.decode();

    const result = await createImageBitmap(image, 11*32, 20*32, 128, 160);
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
                    return createImageBitmap(image, j * cropWidth, i * cropHeight, cropWidth, cropHeight)
                })
            )
        }));
    return result;
};

const calcMenuWidth = (items) =>{
    return itemsToShow.length * menuItemWidth + menuItemSpacing;
};

const calcMenuOffsetX = (items) =>{
    return canvas.width / 2 - calcMenuWidth(items) / 2;
};

const drawMenu = (items) =>{
    const itemsToShow = items.slice(0, 26);
    const menuWidth = calcMenuWidth(items);
    const menuOffsetX = calcMenuOffsetX(items);
    ctx.lineWidth = 4;
    ctx.fillStyle = "#906060";
    ctx.strokeStyle = "#402020";
    ctx.strokeRect(menuOffsetX, menuOffsetY, menuWidth, menuHeight);
    ctx.fillRect(menuOffsetX, menuOffsetY, menuWidth, menuHeight);

    for(let i = 0; i < itemsToShow.length; i++){
        if(itemsToShow[i].selected)
            ctx.fillStyle = "#80ff80";
        else
            ctx.fillStyle = "#bb9090";

        ctx.strokeRect(menuOffsetX + i*64 + 11, menuOffsetY + 8, 64, 74);
        ctx.fillRect(menuOffsetX + i*64 + 11, menuOffsetY + 8, 64, 74);
        drawCrop(itemsToShow[i].images[3], {x: menuOffsetX + i*64 + 42, y: menuOffsetY + 68});
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
    const [t, c, l, t2] = await Promise.all([
        loadTiles(),
        loadCrops(),
        loadLogo(),
        loadTree()
    ]);
    tiles = Array.from(t);
    const cropImages = Array.from(c);
    transformCropsData(cropImages);
    logo = l;
    tree = t2;
    itemsToShow = crops.slice(0, 26)
    itemsToShow[selectedMenuIndex].selected = true;
    requestAnimationFrame(update);
};

start();
