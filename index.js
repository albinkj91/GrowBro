const canvas = document.querySelector("#canvas");
const credit = document.querySelector("#credit");
const game = document.querySelector("#game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - credit.offsetHeight;
const ctx = canvas.getContext('2d');

// *********** Grid params **************
const tileWidth = 64;
const tileHeight = 32;
const cropWidth = 32;
const cropHeight = 64;
const halfWidth = Math.floor(tileWidth / 2);
const halfHeight = Math.floor(tileHeight / 2);
const gridMaxX = 3;
const gridMaxY = 3;
const offsetX = Math.floor(canvas.width / 2) - halfWidth;
const offsetY = Math.floor(canvas.height / 2) - Math.floor((gridMaxY * tileHeight)/2);

// *********** Item menu params **************
const margin = 5;
const border = 2;
const itemWidth = 150;
const itemHeight = 140;
const horizontalSpacing = itemWidth + margin;
const verticalSpacing = itemHeight + margin;
let menuWidth;
let menuHeight;
let menuOffsetX;
let menuOffsetY;
let rows;
let columns;

// ************ background params ***********

const backgroundRed = 0xff;
const backgroundGreen = 0xee;
const backgroundBlue = 0xaa;

const image = new Image();
image.src = "assets/crops-v2/crops.png";

let highlighted;
let tiles = [];
let crops = [];
let logo;
let trees = [];
let rocks = [];
let sun = {x: Math.floor(canvas.width/2), y: 0};
let itemsToShow;
let menuIndex;
let selectedMenuIndex = 0;
let money = 200;

// 1 = green tree
// 2 = orange tree
// 3 = single rock
// 4 = double rock
// 5 = tripple rock
// 6 = water
const grid = [
    [0,0,0],
    [0,0,0],
    [0,0,0]
];

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
    constructor(name, images, cost, growthStage = 0, selected = false){
        this.name = name;
        this.images = images;
        this.cost = cost;
        this.growthStage = 0;
        this.selected = false;
    }
}

const drawTile = (image, point) =>{
    ctx.drawImage(image, point.x - halfWidth, point.y - halfHeight);
};

const drawCrop = (image, point) =>{
    ctx.drawImage(image, point.x - Math.floor(halfWidth/2), point.y - 58);
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

const screenToMenuIndex = (point) =>{
    if(point.x > menuOffsetX + margin + border && point.x < menuOffsetX + menuWidth && point.y > menuOffsetY + margin + border && point.y < menuOffsetY + menuHeight){
        const x = Math.floor((point.x - menuOffsetX - margin) / (itemWidth + margin + border));
        const y = Math.floor((point.y - menuOffsetY - margin - border) / (itemHeight + margin + border));
        return x * rows + y;
    }else{
        return -1;
    }
};

const isWithinGrid = (point) =>{
    return point.x >= 0 && point.x < gridMaxX && point.y >= 0 && point.y < gridMaxY;
};

const tickSun = () =>{
    sun.x += 0.5;
    sun.y = 0.0005 * ((sun.x-Math.floor(canvas.width/2))*(sun.x-Math.floor(canvas.width/2))) + 100;
    const red = (1.5 - (sun.y/350)) * backgroundRed;
    const green = (1.5 - (sun.y/350)) * backgroundGreen;
    const blue = (1.55 - (sun.y/400)) * backgroundBlue;
    game.style.backgroundColor = "rgba(" + [red, green, blue, 1].join(",") + ")";

    if(sun.x >= canvas.width + 160){
        sun.x = -160;
        tickCrops();
    }
};

const tickCrops = () =>{
    for(let i = 0; i < grid.length; i++){
        for(let j = 0; j < grid[i].length; j++){
            if(typeof(grid[i][j]) == 'object' && grid[i][j].growthStage < 3)
                grid[i][j].growthStage++;
        }
    }
};

const drawSun = () =>{
    const gradient = ctx.createRadialGradient(sun.x, sun.y, 50, sun.x, sun.y, 80);
    gradient.addColorStop(0, "#ffcc30");
    gradient.addColorStop(0.8, "#ffee30");
    gradient.addColorStop(1, "white");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, 80, 0, Math.PI * 2);
    ctx.fill();
};

let startTime = performance.now();

const update = () =>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tickSun();
    drawSun();
    ctx.drawImage(logo, 0, 0);
    drawMenu(itemsToShow);
    drawHud();

    if(menuIndex !== -1){
        ctx.strokeStyle = "#80ff80";
        const y = menuOffsetY + Math.floor(menuIndex % rows) * (itemHeight + margin + border) + margin + border;
        const x = menuOffsetX + Math.floor(menuIndex / rows) * (itemWidth + margin + border) + margin;
        ctx.strokeRect(x, y, itemWidth, itemHeight);
    }

    for(let i = 0; i < gridMaxY; i++){
        for(let j = 0; j < gridMaxX; j++){
            let gridCoord = {x: j, y: i};
            let screenCoord = gridToScreen(gridCoord);
            switch(grid[i][j]){
                case 0:
                    drawTile(tiles[1], screenCoord);
                    break;
                case 1:
                    drawTile(tiles[1], screenCoord);
                    ctx.drawImage(trees[1], screenCoord.x - halfWidth, screenCoord.y - 115);
                    break;
                case 2:
                    drawTile(tiles[1], screenCoord);
                    ctx.drawImage(trees[0], screenCoord.x - halfWidth - 7, screenCoord.y - 97);
                    break;
                case 3:
                    drawTile(tiles[1], screenCoord);
                    ctx.drawImage(rocks[2], screenCoord.x - 14, screenCoord.y - 20);
                    break;
                case 4:
                    drawTile(tiles[1], screenCoord);
                    ctx.drawImage(rocks[0], screenCoord.x - 14, screenCoord.y - halfHeight - 2);
                    break;
                case 5:
                    drawTile(tiles[1], screenCoord);
                    ctx.drawImage(rocks[1], screenCoord.x - 16, screenCoord.y - 24);
                    break;
                case 6:
                    drawTile(tiles[3], screenCoord);
                    break;
                default:
                    drawTile(tiles[4], screenCoord);
                    const crop = grid[i][j];
                    drawCrop(crop.images[crop.growthStage], screenCoord);
            }
            if(highlighted !== undefined && highlighted.x === gridCoord.x && highlighted.y === gridCoord.y)
            {
                drawTile(tiles[4], screenCoord);
                const crop = itemsToShow[selectedMenuIndex];
                drawCrop(crop.images[0], screenCoord);
            }
        }
    }
    requestAnimationFrame(update);
};

canvas.addEventListener("mousemove", (e) =>{
    const point = screenToGrid({x: e.offsetX, y: e.offsetY});
    if(isWithinGrid(point))
        highlighted = point;
    else
        highlighted = undefined;
    menuIndex = screenToMenuIndex({x: e.offsetX, y: e.offsetY});
});

canvas.addEventListener("click", (e) =>{
    const point = screenToGrid({x: e.offsetX, y: e.offsetY});
    if(menuIndex !== -1){
        itemsToShow[selectedMenuIndex].selected = false;
        selectedMenuIndex = menuIndex;
        itemsToShow[menuIndex].selected = true;
    }else if(isWithinGrid(point)){
        const tmp = crops[selectedMenuIndex];
        grid[point.y][point.x] = new Crop(tmp.name, tmp.images, tmp.cost);
    }
});

const loadLogo = async () =>{
    return await createImageBitmap(image, 0, 21*32, 11*32, 64);
};

const loadTrees = async () =>{
    return await Promise.all([
        createImageBitmap(image, 11*32, 20*32+16, 80, 112),
        createImageBitmap(image, 13*32+16, 20*32, 64, 128)
    ]);
};

const loadTiles = async () =>{
    const image = new Image();
    image.src = "assets/sprite-sheet.png";
    await image.decode();

    return await Promise.all([
        createImageBitmap(image, 0, 12, 64, 128),
        createImageBitmap(image, 64, 88, 64, 128),
        createImageBitmap(image, 128, 8, 64, 128),
        createImageBitmap(image, 192, 88, 64, 128),
        createImageBitmap(image, 256, 88, 64, 128)
    ]);
};

const loadCrops = async () =>{
    return await Promise.all(
        Array.from({ length: 10 }, async (v, i) =>{
            return await Promise.all(
                Array.from({ length: 32 }, (v2, j) =>{
                    return createImageBitmap(image, j * cropWidth, i * cropHeight, cropWidth, cropHeight)
                })
            )
        }));
};

const loadRocks = async () =>{
    const image = new Image();
    image.src = "assets/crops-v2/crops.png";
    await image.decode();

    const result = await Promise.all([
        createImageBitmap(image, 0, 23*32, 32, 32),
        createImageBitmap(image, 32, 23*32, 32, 32),
        createImageBitmap(image, 64, 23*32, 32, 32)
    ]);
    return result
};

const drawMenuItem = (item, x, y) =>{
    if(item.selected)
        ctx.fillStyle = "#80ff80";
    else
        ctx.fillStyle = "#bb9090";

    ctx.fillRect(x, y, itemWidth, itemHeight);
    ctx.strokeRect(x, y, itemWidth, itemHeight);

    const centerX = Math.floor(itemWidth / 2);
    const centerY = Math.floor(itemHeight / 2);
    const imageX = x + centerX - Math.floor(item.images[3].width / 2);
    const imageY = y + centerY + - Math.floor(item.images[3].height / 2);
    ctx.drawImage(item.images[3], imageX, imageY);

    if(item.selected)
        ctx.fillStyle = "#000000";
    else
        ctx.fillStyle = "#ffffff";
    ctx.font = "24px Silkscreen";
    ctx.textAlign = "center";
    const maxTextWidth = itemWidth - 4;
    displayCost = `💰${item.cost}`;
    ctx.fillText(displayCost, x + centerX, y + centerY - 40, maxTextWidth);
    ctx.font = "14px Silkscreen";
    ctx.fillText(item.name, x + centerX, y + centerY + 50, maxTextWidth);
};

const drawMenu = (items) =>{
    rows = Math.floor(canvas.height / itemHeight) - 1;
    columns = Math.floor(items.length / rows);
    columns += items.length % rows > 0 ? 1 : 0;
    menuWidth = columns * (itemWidth + margin + border) + margin;
    menuHeight = rows * (itemHeight + margin + border) + margin;
    menuOffsetX = canvas.width - menuWidth - 10;
    menuOffsetY = Math.floor(canvas.height / 2) - Math.floor(menuHeight / 2) + 10;
    ctx.fillStyle = "#906060";
    ctx.strokeStyle = "#402020";
    ctx.lineWidth = border;
    ctx.fillRect(menuOffsetX - border, menuOffsetY, menuWidth + border, menuHeight + border);
    ctx.strokeRect(menuOffsetX - border, menuOffsetY, menuWidth + border, menuHeight + border);

    for(let i = 0; i < columns; i++){
        for(let j = 0; j < rows; j++){
            if(i*rows+j > items.length-1) return;
            drawMenuItem(items[i*rows + j],
                menuOffsetX + margin + (itemWidth + margin + border) * i,
                menuOffsetY + margin + 2 + (itemHeight + margin + border) * j);
        }
    }
};

const drawHud = () =>{
    const moneyString = `💰${money}`;
    const width = moneyString.length * 20;
    const height = 40;
    const hudOffsetX = (canvas.width / 1.3) - Math.floor(width / 2);
    const hudOffsetY = 1;
    ctx.fillStyle = "#906060";
    ctx.strokeStyle = "#402020";
    ctx.lineWidth = 2;
    ctx.fillRect(hudOffsetX, hudOffsetY, width, height);
    ctx.strokeRect(hudOffsetX, hudOffsetY, width, height);

    ctx.fillStyle = "#bb9090";
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Silkscreen";
    ctx.textAlign = "center";
    ctx.fillText(moneyString, hudOffsetX + Math.floor(width/2), hudOffsetY + Math.floor(height/2) + 6);
};

const transformCropsData = (cropImages) =>{
    for(let i = 0; i < cropImages.length; i += 5){
        for(let j = 0; j < cropImages[i].length; j++){
            console.log(i*5 + j);
            crops.push(new Crop(cropNames[i*5 + j],
            [
                cropImages[i][j],
                cropImages[i+1][j],
                cropImages[i+2][j],
                cropImages[i+3][j],
                cropImages[i+4][j]
            ], i * cropImages.length + j * j * 10 + 10));
        }
    }
};

const load = async () =>{
    await image.decode();
    const [t, c, l, t2, r] = await Promise.all([
        loadTiles(),
        loadCrops(),
        loadLogo(),
        loadTrees(),
        loadRocks(),
    ]);
    tiles = Array.from(t);
    rocks = Array.from(r);
    const cropImages = Array.from(c);
    transformCropsData(cropImages);
    trees = Array.from(t2);
    logo = l;
    itemsToShow = crops.slice(0, 15)
    console.log(crops);
    itemsToShow[selectedMenuIndex].selected = true;
};

const main = async () =>{
    await load();
    requestAnimationFrame(update);
};

main();
