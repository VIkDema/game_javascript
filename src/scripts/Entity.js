var Entity = {
    pos_x: 0,
    pos_y: 0,
    size_x: 0,
    size_y: 0,
    render_x: 0,
    extend: function (extendProto) {
        let object = Object.create(this);
        for (let property in extendProto) {
            if (this.hasOwnProperty(property) || typeof object[property] === "undefined") {
                object[property] = extendProto[property];
            }
        }
        return object;
    }
}
var Player = Entity.extend({
    lifetime: 100,
    move_x: 0,
    move_y: 0,
    move: 0,
    speed: 5,
    count_of_keys: 0,
    numberSprite: 1,
    vecLook: {x: 0, y: 1},
    draw: function (ctx) {
        let name_of_sprite = "Player";
        this.move_x = this.vecLook.x * this.move;
        this.move_y = this.vecLook.y * this.move;
        if (this.move_x === 0 && this.move_y === 0) {
            name_of_sprite += "Down1";
            spriteManager.drawSpriteOnMap(ctx, name_of_sprite, this.pos_x, this.pos_y);
            return;
        } else {
            if (this.move_x > 0) {
                if (this.move_x > Math.abs(this.move_y)) {
                    name_of_sprite += "Right";
                } else {
                    if (this.move_y > 0) {
                        name_of_sprite += "Down";
                    } else {
                        name_of_sprite += "Up";
                    }
                }
            } else {
                if (Math.abs(this.move_x) > Math.abs(this.move_y)) {
                    name_of_sprite += "Left";
                } else {
                    if (this.move_y > 0) {
                        name_of_sprite += "Down";
                    } else {
                        name_of_sprite += "Up";
                    }
                }
            }
        }
        name_of_sprite += this.numberSprite.toString();
        this.numberSprite = this.numberSprite % 4 + 1;
        spriteManager.drawSpriteOnMap(ctx, name_of_sprite, this.pos_x, this.pos_y);
    },
    update: function () {
        //   console.log("update1:",this.vecLook.x ,this.vecLook.y,this.move_x,this.move_y);
        this.move_x = this.vecLook.x * this.move;
        this.move_y = this.vecLook.y * this.move;
        // console.log("update2:",this.vecLook.x ,this.vecLook.y,this.move_x,this.move_y);
        physicManager.update(this);
    },
    onTouchEntity: function (obj) {
        if (obj.name === "Key") {
            this.count_of_keys++;
            obj.kill();
        }
        if (obj.name === "Chest") {
            obj.kill();
        }
        if (obj.name === "Life") {
            this.lifetime += 10;
            obj.kill();
        }
        if (obj.name === "Enimy") {
            if (obj.aggressive_mode===false) {
                obj.kill();
            } else {
                //убить
            }
        }
        if (obj.name === "Door") {
            if (gameManager.count_of_keys === this.count_of_keys)
                gameManager.next_level();
            else
                gameManager.sendMessage("Недостаточно ключей чтобы открыть дверь.")
        }
    },
    kill: function () {
    }
});

var Enimy = Entity.extend({
    lifetime: 100,
    move_x: 0, move_y: 0,
    aggressive_mode: false,
    draw: function (ctx) {
        if (this.aggressive_mode) {
            spriteManager.drawSpriteOnMap(ctx, "Enimy1", this.pos_x, this.pos_y);
        } else {
            spriteManager.drawSpriteOnMap(ctx, "Enimy2", this.pos_x, this.pos_y);
        }
    },
    update: function () {
        physicManager.update(this);
    },
    onTouchEntity: function (obj) {

    },
    render: function () {
        let distance = distance2Vec({x: gameManager.player.pos_x, y: gameManager.player.pos_y}, {
            x: this.pos_x,
            y: this.pos_y
        });
        if (this.aggressive_mode) {
            spriteManager.drawSpriteCoefBright(ctx, "Enimy1RC", this.render_x, canvas.height / 2 - Math.round(canvas.height / distance * 16) / 2, Math.round(canvas.height / distance * 16), distance / 600);
        } else {
            spriteManager.drawSpriteCoefBright(ctx, "Enimy2RC", this.render_x, canvas.height / 2 - Math.round(canvas.height / distance * 16) / 2, Math.round(canvas.height / distance * 16), distance / 600);
        }
    },
    kill: function () {
        gameManager.kill(this);
    }
});

var Chest = Entity.extend({
    draw: function (ctx) {
        spriteManager.drawSpriteOnMap(ctx, "Chest", this.pos_x, this.pos_y);
    },
    kill: function () {
        gameManager.kill(this);
    },
    render: function () {
        let distance = distance2Vec({x: gameManager.player.pos_x, y: gameManager.player.pos_y}, {
            x: this.pos_x,
            y: this.pos_y
        });
        spriteManager.drawSpriteCoefBright(ctx, "СhestRC", this.render_x, canvas.height / 2 - Math.round(canvas.height / distance * 16) / 2, Math.round(canvas.height / distance * 16), distance / 600);
    }
});
var Key = Entity.extend({
    draw: function (ctx) {
        spriteManager.drawSpriteOnMap(ctx, "Key", this.pos_x, this.pos_y);
    },
    kill: function () {
        gameManager.kill(this);
    },
    render: function () {
        let distance = distance2Vec({x: gameManager.player.pos_x, y: gameManager.player.pos_y}, {
            x: this.pos_x,
            y: this.pos_y
        });
        spriteManager.drawSpriteCoefBright(ctx, "KeyRC", this.render_x, canvas.height / 2 - Math.round(canvas.height / distance * 16) / 2, Math.round(canvas.height / distance * 16), distance / 600);
    }
});
var Life = Entity.extend({
    draw: function (ctx) {
        spriteManager.drawSpriteOnMap(ctx, "Life", this.pos_x, this.pos_y);
    },
    kill: function () {
        gameManager.kill(this);
    },
    render: function () {
        let distance = distance2Vec({x: gameManager.player.pos_x, y: gameManager.player.pos_y}, {
            x: this.pos_x,
            y: this.pos_y
        });
        spriteManager.drawSpriteCoefBright(ctx, "LifeRC", this.render_x, canvas.height / 2 - Math.round(canvas.height / distance * 16) / 2, Math.round(canvas.height / distance * 16), distance / 600);
    }
});
var Door = Entity.extend({
    draw: function (ctx) {
        spriteManager.drawSpriteOnMap(ctx, "Door", this.pos_x, this.pos_y);
    },
    kill: function () {
        gameManager.kill(this);
    },
    render: function () {
        let distance = distance2Vec({x: gameManager.player.pos_x, y: gameManager.player.pos_y}, {
            x: this.pos_x,
            y: this.pos_y
        });
        spriteManager.drawSpriteCoefBright(ctx, "DoorRC", this.render_x, canvas.height / 2 - Math.round(canvas.height / distance * 16) / 2, Math.round(canvas.height / distance * 16), distance / 600);
    }
});