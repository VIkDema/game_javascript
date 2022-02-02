var mapManager = {
    mapData: null,
    tLayer: null,
    xCount: 0,
    yCount: 0,
    tSize: {x: 16, y: 16},
    mapSize: {x: 10, y: 10},
    tilesets: [],
    imgLoaded: false,
    jsonLoaded: false,
    imgLoadCount: 0,
    view: {x: 0, y: 0, w: 288, h: 288},
    parseMap(tilesJSON) {
        this.mapData = JSON.parse(tilesJSON);
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;
        if (this.tSize.x * this.mapSize.x < this.view.w) {
            this.view.w = this.tSize.x * this.mapSize.x;
        }
        if (this.tSize.y * this.mapSize.y < this.view.h) {
            this.view.h = this.tSize.y * this.mapSize.y;
        }
        this.mapSize.x = this.xCount * this.tSize.x;
        this.mapSize.y = this.yCount * this.tSize.y;
        for (let i = 0; i < this.mapData.tilesets.length; i++) {
            //let img = new Image();
            var img = document.createElement("img");
            img.onload = function () {
                console.log("test");
                mapManager.imgLoadCount++;
                if (mapManager.imgLoadCount === mapManager.mapData.tilesets.length) {
                    mapManager.imgLoaded = true;
                }
            };
            img.onerror = function (event) {
                console.log("not test" + img.error);
            };

            img.src = this.mapData.tilesets[i].image;
            let t = this.mapData.tilesets[i];
            let ts = {
                firstgid: t.firstgid,
                image: img,
                name: t.name,
                xCount: Math.floor(t.imagewidth / mapManager.tSize.x),
                yCount: Math.floor(t.imageheight / mapManager.tSize.y),
            };
            this.tilesets.push(ts);
        }
        this.jsonLoaded = true;
    },
    draw(ctx) {
        if (!mapManager.imgLoaded || !mapManager.jsonLoaded) {
            setTimeout(function () {
                mapManager.draw(ctx);
            }, 100);
        } else {
            if (this.tLayer === null) {
                for (let id = 0; id < this.mapData.layers.length; id++) {
                    let layer = this.mapData.layers[id];
                    if (layer.type === "tilelayer") {
                        this.tLayer = layer;
                        break;
                    }
                }
            }
            for (let i = 0; i < this.tLayer.data.length; i++) {
                if (this.tLayer.data[i] !== 0) {
                    let tile = this.getTile(this.tLayer.data[i]);
                    let pX = (i % this.xCount) * this.tSize.x;
                    let pY = Math.floor(i / this.xCount) * this.tSize.y;
                    if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y)) {
                        continue;
                    }
                    pX -= this.view.x;
                    pY -= this.view.y;
                    ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x, this.tSize.y, pX, pY, this.tSize.x, this.tSize.y);
                }
            }
        }
    }
    ,
    drawShadow(x, y, ctx, angle, vec, size) {
        //let firstVec = multiply(rotate2d(vec, angle), size);
        //let secondVec = multiply(rotate2d(vec, -angle), size);
        let pX = x - this.view.x + this.tSize.x / 2;
        let pY = y - this.view.y + this.tSize.x / 2;
        //нужно оптимизировать
        return;
        for (let i = 0; i < this.view.h + 16; i += 2) {
            for (let j = 0; j < this.view.w + 16; j += 2) {
                let dist = distance2Vec({x: i, y: j}, {x: pX, y: pY})
                if ((dist > size ||
                    Math.abs(angle2Vec({x: i - pX, y: j - pY}, vec)) > angle) && dist >= 20) {
                    ctx.fillRect(i, j, 2, 2);
                }
            }
        }
    },
    isVisible(x, y, width, height) {
        return !(x + width < this.view.x || y + height < this.view.y || x > this.view.x + this.view.w || y > this.view.y + this.view.h);
    }
    ,
    getTile(tileIndex) {
        var tile = {
            img: null,
            px: 0, py: 0
        }
        var tileset = this.getTileset(tileIndex);
        tile.img = tileset.image;
        var id = tileIndex - tileset.firstgid;
        var x = id % tileset.xCount;
        var y = Math.floor(id / tileset.xCount);
        tile.px = x * mapManager.tSize.x;
        tile.py = y * mapManager.tSize.y;
        return tile;
    }
    ,
    getTileset(tileIndex) {
        for (var i = mapManager.tilesets.length - 1; i >= 0; i--) {
            if (mapManager.tilesets[i].firstgid <= tileIndex) {
                return mapManager.tilesets[i];
            }
        }

    }
    ,
    loadMap(path) {
        this.mapData = null;
        this.tLayer = null;
        this.xCount = 0;
        this.yCount = 0;
        this.tSize = {x: 16, y: 16};
        this.mapSize = {x: 10, y: 10};
        this.tilesets = [];
        this.imgLoaded = false;
        this.jsonLoaded = false;
        this.imgLoadCount = 0;
        this.view = {x: 0, y: 0, w: 288, h: 288};
        var request = new XMLHttpRequest();//создание ajax-запроса
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                mapManager.parseMap(request.responseText);
            }
        }
        request.open("GET", path, true);
        request.send();
    }
    ,
    parseEntities() {
        if (!mapManager.imgLoaded || !mapManager.jsonLoaded) {
            setTimeout(function () {
                mapManager.parseEntities()
            }, 100);
        } else {
            gameManager.entities = [];
            for (let j = 0; j < this.mapData.layers.length; j++) {
                if (this.mapData.layers[j].type === 'objectgroup') {
                    const entities = this.mapData.layers[j];
                    for (let i = 0; i < entities.objects.length; i++) {
                        const e = entities.objects[i];
                        try {
                            var obj = Object.create(gameManager.factory[entities["name"]]);
                            obj.name = entities["name"];
                            obj.pos_x = e.x;
                            obj.pos_y = e.y;
                            obj.size_x = e.width;
                            obj.size_y = e.height;
                            gameManager.entities.push(obj);
                            if (obj.name === "Player")
                                gameManager.initPlayer(obj);
                            if (obj.name === "Key")
                                gameManager.addKeyForFinish();
                        } catch (ex) {
                            console.log("Error while creating:[" + e.gid + "} " + e.type + ", " + ex);
                        }
                    }
                }
            }
        }
    }
    ,
    getTilesetIdx(x, y) {
        var wX = x;
        var wY = y;
        var idx = Math.floor(wY / this.tSize.y) * this.xCount + Math.floor(wX / this.tSize.x);
        return this.tLayer.data[idx];
    }
    ,
    centerAt(x, y) {
        if (x < this.view.w / 2) {
            this.view.x = 0;
        } else {
            if (x > this.mapSize.x - this.view.w / 2)
                this.view.x = this.mapSize.x - this.view.w - 16;
            else
                this.view.x = x - Math.floor((this.view.w) / 2);
        }
        if (y < this.view.h / 2) {
            this.view.y = 0;
        } else {
            if (y > this.mapSize.y - this.view.h / 2) {
                this.view.y = this.mapSize.y - this.view.h - 16;
            } else {
                this.view.y = y - Math.floor((this.view.h) / 2);
            }
        }
    }
}



