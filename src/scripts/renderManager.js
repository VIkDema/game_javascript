renderManager = {
    tickForHands: 0,
    entities: new Set()
    ,
    draw(canvas, posVec, dirPos, size, angle) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let rayDirVec = rotate2d(dirPos, 90);
        let pX = posVec.x - mapManager.view.x + mapManager.tSize.x / 2;
        let pY = posVec.y - mapManager.view.y + mapManager.tSize.x / 2;
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(pX, pY);
        ctx.lineTo(pX + dirPos.x * size, pY + dirPos.y * size);
        ctx.stroke();
        ctx.strokeStyle = 'yellow';
        let firstVec = rotate2d(dirPos, angle);
        ctx.beginPath();
        ctx.moveTo(pX, pY);
        ctx.lineTo(pX + firstVec.x * size, pY + firstVec.y * size);
        ctx.stroke();
        ctx.strokeStyle = 'green';
        let secondVec = rotate2d(dirPos, -angle);
        ctx.beginPath();
        ctx.moveTo(pX, pY);
        ctx.lineTo(pX + secondVec.x * size, pY + secondVec.y * size);
        ctx.stroke();
        ctx.strokeStyle = 'black';
        for (let i = 0; i < canvas.width; i++) {
            let cameraX = 2 * i / canvas.width - 1;
            let coef = Math.cos(angle) * lengthVec(firstVec) / lengthVec(dirPos);
            let newDirPos = multiply(dirPos, coef);
            let rayDir = sum(newDirPos, multiply(sum(firstVec, {x: -newDirPos.x, y: -newDirPos.y}), cameraX));
            rayDir = multiply(rayDir, 16);
            let mapCordVec = {x: Math.round(posVec.x), y: Math.round(posVec.y)};
            let deltaDistVec = {x: Math.abs(1 / rayDir.x), y: Math.abs(1 / rayDir.y)};
            let stepVec = {x: 0, y: 0};
            let sideDistVec = {x: 0, y: 0};
            let hit = 0;
            let side = 0;
            if (rayDir.x < 0) {
                stepVec.x = -1;
                sideDistVec.x = (posVec.x - mapCordVec.x) * deltaDistVec.x;
            } else {
                stepVec.x = 1;
                sideDistVec.x = (mapCordVec.x + 1 - posVec.x) * (deltaDistVec.x);
            }
            if (rayDir.y < 0) {
                stepVec.y = -1;
                sideDistVec.y = (posVec.y - mapCordVec.y) * deltaDistVec.y;
            } else {
                stepVec.y = 1;
                sideDistVec.y = (mapCordVec.y + 1 - posVec.y) * (deltaDistVec.y);
            }
            let count = 0;
            while (hit === 0 && count < 170) {
                if (sideDistVec.x < sideDistVec.y) {
                    sideDistVec.x += deltaDistVec.x;
                    mapCordVec.x += stepVec.x;
                    side = 0;
                } else {
                    sideDistVec.y += deltaDistVec.y;
                    mapCordVec.y += stepVec.y;
                    side = 1;
                }
                if (mapManager.getTilesetIdx(mapCordVec.x, mapCordVec.y) < 20) {
                    //  console.log(mapCordVec.x, mapCordVec.y, mapManager.getTilesetIdx(mapCordVec.x, mapCordVec.y));
                    hit += 1;
                }
                for (let m = 0; m < gameManager.entities.length; m++) {
                    if (mapCordVec.x === Math.round(gameManager.entities[m].pos_x) && mapCordVec.y === Math.round(gameManager.entities[m].pos_y)) {
                        gameManager.entities[m].render_x = i;
                        this.entities.add(gameManager.entities[m]);
                    }
                }
                count++;
            }
            let perpWallDist = 0;
            if (side === 0) perpWallDist = (sideDistVec.x - deltaDistVec.x);
            else perpWallDist = (sideDistVec.y - deltaDistVec.y);
            let lineHeight = Math.round(canvas.height / perpWallDist);
            let drawStart = -lineHeight / 2 + canvas.height / 2;
            if (drawStart < 0) drawStart = 0;
            //calculate value of wallX
            let wallX; //where exactly the wall was hit
            if (side === 0) wallX = posVec.y / 16 + perpWallDist * rayDir.y / 16;
            else wallX = posVec.x / 16 + perpWallDist * rayDir.x / 16;
            wallX -= Math.floor(wallX);
            //x coordinate on the texture
            let texWidth = 24;
            let texHeight = 21;
            //console.log(wallX);
            let texX = Math.floor(wallX * texWidth);
            if (side === 0 && rayDir.x > 0) texX = texWidth - texX - 1;
            if (side === 1 && rayDir.y < 0) texX = texWidth - texX - 1;
            ctx.fillStyle = '#4d494d';
            ctx.fillRect(i, drawStart + lineHeight, 1, canvas.height - drawStart + lineHeight);
            ctx.globalCompositeOperation = 'hard-light';
            let gradient = ctx.createLinearGradient(i, drawStart + lineHeight, i, canvas.height);
            gradient.addColorStop(0, "rgb(0,0,0)");
            gradient.addColorStop(1, "rgba(208,107,9,0.48)");
            ctx.fillStyle = gradient;
            ctx.fillRect(i, drawStart + lineHeight - 1, 1, canvas.height - drawStart + lineHeight);
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'black';
            if (hit === 1) {
                spriteManager.drawLineSprite(ctx, "TextureWall", texX, lineHeight, i, drawStart, (perpWallDist / 16));
            }

        }
        let n;
        let flag = false;
        let min_distance_enimy = null;
        for (n of this.entities) {
            n.render();
            if (n.name === "Enimy") {
                if (min_distance_enimy === null) {
                    min_distance_enimy = n;
                } else {
                    if (distance2Vec({
                            x: min_distance_enimy.x,
                            y: min_distance_enimy.y
                        }, {
                            x: gameManager.player.x,
                            y: gameManager.player.y
                        }) >=
                        distance2Vec({
                            x: n.x,
                            y: n.y
                        }, {
                            x: gameManager.player.x,
                            y: gameManager.player.y
                        })) {
                        min_distance_enimy = n;
                    }
                }
                flag = true;
            }
        }
        if (flag) {
            gameManager.start_enemy_mode();
            gameManager.nearest = min_distance_enimy;
        } else {
            gameManager.end_enemy_mode();
        }
        this.entities.clear();
        this.drawThingInHands(canvas);
        this.drawInfoPlayer(canvas);
    },
    drawThingInHands(canvas) {
        this.tickForHands += 0.5;
        this.tickForHands %= (Math.PI * 2);
        let ctx = canvas.getContext('2d');
        spriteManager.drawSprite(ctx, 'candle', canvas.width * 0.8, canvas.height * 0.6 + 10 * Math.cos(this.tickForHands));
    },
    drawInfoPlayer(canvas) {
        let ctx = canvas.getContext('2d');
        ctx.font = "48px serif";
        let prev = ctx.fillStyle;
        ctx.fillStyle = '#ff0000';
        ctx.fillText("Name: " + localStorage["course_work.username"], canvas.width * 0.8, 50);
        ctx.fillText("Health: " + gameManager.player.lifetime, canvas.width * 0.8, 100);
        ctx.fillText("Keys: " + gameManager.player.count_of_keys + "/" + gameManager.count_of_keys, canvas.width * 0.8, 150);
        ctx.fillText("Time: " + gameManager.score, canvas.width * 0.8, 200);
        ctx.fillStyle = prev;
    }, drawTable(ctx, table) {
    ctx.fillStyle = '#ff0000';
    // ctx.fillRect(450, 250, canvas.width - 900, canvas.height - 500);
    ctx.fillStyle = '#000000';
    //ctx.fillRect(450 + 5, 250 + 5, canvas.width - 900 - 10, canvas.height - 500 - 10);
    for (let i = 0; i < 6; i++) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(450, 250 + i * (canvas.height - 500) / 5, canvas.width - 900, 5);
    }
    ctx.fillRect(450, 250, 5, canvas.height - 500);
    ctx.fillRect(450 + canvas.width - 900, 250, 5, canvas.height - 500);
    for (let i = 0; i < table.length; i++) {
        ctx.fillStyle = '#fff000';
        ctx.fillText("№" + (i + 1) + " Name: " + table[i].name + "  Score: " + table[i].score, 450 + 25, 250 + 55 + i * (canvas.height - 500) / 5);
    }
}
}