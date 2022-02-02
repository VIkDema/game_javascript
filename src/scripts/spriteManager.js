var spriteManager = {
    image: [],
    sprites: [],
    imgLoaded: false,
    jsonLoaded: false,
    loadAtlas(atlasJson, atlasImg) {
        this.imgLoaded = false;
        this.jsonLoaded = false;
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                spriteManager.parseAtlas(request.responseText);
            }
        }
        request.open("GET", atlasJson, true);
        request.send();
        this.loadImg(atlasImg);
    },
    loadImg(imgName) {
        this.image.push(new Image());
        this.image[this.image.length - 1].onload = function () {
            spriteManager.imgLoaded = true;
        };
        this.image[this.image.length - 1].src = imgName;
    },
    parseAtlas(atlasJson) {
        let atlas = JSON.parse(atlasJson);
        this.sprites.push([]);
        for (let name in atlas.frames) {
            let frame = atlas.frames[name].frame;
            this.sprites[this.sprites.length - 1].push({name: name, x: frame.x, y: frame.y, w: frame.w, h: frame.h});
        }
        this.jsonLoaded = true;
    },
    drawSpriteOnMap(ctx, name, x, y) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(function () {
                spriteManager.drawSpriteOnMap(ctx, name, x, y);
            }, 100);
        } else {
            var sprite = this.getSprite(name);
            if (!mapManager.isVisible(x, y, sprite["sprite"].w, sprite["sprite"].h)) {
                return;
            }
            x -= mapManager.view.x;
            y -= mapManager.view.y;
            ctx.drawImage(this.image[sprite["imageInd"]], sprite["sprite"].x, sprite["sprite"].y, sprite["sprite"].w, sprite["sprite"].h, x, y, sprite["sprite"].w, sprite["sprite"].h);
        }
    },
    drawSprite(ctx, name, x, y) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(function () {
                spriteManager.drawSpriteOnMap(ctx, name, x, y);
            }, 100);
        } else {
            var sprite = this.getSprite(name);
            ctx.drawImage(this.image[sprite["imageInd"]], sprite["sprite"].x, sprite["sprite"].y, sprite["sprite"].w, sprite["sprite"].h, x, y, sprite["sprite"].w, sprite["sprite"].h);
        }
    },
    drawSpriteCoefBright(ctx, name, x, y, h, brightness) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(function () {
                spriteManager.drawSpriteOnMap(ctx, name, x, y);
            }, 100);
        } else {
            var sprite = this.getSprite(name);
            ctx.globalAlpha = 1 - brightness;
            let w = h / sprite["sprite"].h * sprite["sprite"].w;
            ctx.drawImage(this.image[sprite["imageInd"]], sprite["sprite"].x, sprite["sprite"].y, sprite["sprite"].w, sprite["sprite"].h, x - w / 2, y, w, h);
            ctx.globalAlpha = 1;
        }
    },
    drawLineSprite(ctx, name, x_image, h, x, y, brightness) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(function () {
                spriteManager.drawSpriteOnMap(ctx, name, x, y);
            }, 100);
        } else {
            var sprite = this.getSprite(name);
            ctx.globalAlpha = 1 - brightness;
            ctx.drawImage(this.image[sprite["imageInd"]], x_image, 0, 1, sprite["sprite"].h, x, y, 1, h);
            ctx.globalAlpha = 1;
            //  ctx.globalCompositeOperation = 'luminosity';
            // ctx.color = "rgba(0,0,0," + brightness.toFixed(2).toString() + ")"
            let cl = Math.floor(255 * brightness);
            //  ctx.fillRect(x, y, 1, h);
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'black';
        }
    },
    getSprite(name) {
        for (let j = 0; j < this.sprites.length; j++) {
            for (let i = 0; i < this.sprites[j].length; i++) {
                let s = this.sprites[j][i];
                if (s.name === name) {
                    return {sprite: s, imageInd: j};
                }
            }
        }
        return null;
    },
    drawText(ctx, text, x, y, size) {
        let prevColor = ctx.fillStyle;
        ctx.fillStyle = 'red';
        ctx.font = size + 'px serif';
        ctx.fillText(text, x, y);
        ctx.fillStyle = prevColor;
    }
}