const canvas = document.getElementById('mainArea');
let ctx = canvas.getContext('2d');

var gameManager = {
    factory: {},
    entities: [],
    laterKill: [],
    player: null,
    gameLoop: null,
    count_of_keys: 0,
    level_names: [],
    curr_level: 0,
    message: "",
    need_message: 0,
    need_screamer: 0,
    enemy_mode: false,
    enemy_mode_aggressive: false,
    enemy_mode_intervals: null,
    enemy_mode_timeout: null,
    enemy_mode_timeout_init: null,
    score: 0,
    score_interval: null,
    nearest: null,
    initPlayer: function (obj) {
        this.player = obj;
    },
    start_enemy_mode() {
        if (this.enemy_mode === true) {
            return;
        }
        this.enemy_mode = true;
        this.enemy_mode_aggressive = false;
        soundManager.play("../sound/sound1.mp3", {looping: false, volume: 0.6});
        this.enemy_mode_timeout_init = setTimeout(function () {
            gameManager.enemy_mode_aggressive = true;
        }, 6000);
        this.enemy_mode_intervals = setInterval(function () {
            gameManager.enemy_mode_aggressive = false;
            soundManager.play("../sound/sound1.mp3", {looping: false, volume: 0.6});
            gameManager.enemy_mode_timeout = setTimeout(function () {
                gameManager.enemy_mode_aggressive = true;
            }, 6000);
        }, 8400);
    },
    end_enemy_mode() {
        if (!this.enemy_mode) {
            return;
        }
        clearTimeout(this.enemy_mode_timeout);
        clearTimeout(this.enemy_mode_timeout_init);
        clearInterval(this.enemy_mode_intervals);
        this.enemy_mode = false;
        this.enemy_mode_aggressive = false;
        soundManager.stopAll();
        soundManager.play("../sound/background-sound.mp3", {looping: true});
    },
    update: function () {
        if (this.player === null) {
            return;
        }
        this.player.move_x = 0;
        this.player.move_y = 0;
        this.player.move = 0;
        if (eventsManager.action["up"]) {
            this.player.move = 1;
        }
        if (eventsManager.action["down"]) {
            this.player.move = -1;
        }
        if (eventsManager.action["left"]) {
            this.player.vecLook = rotate2d(this.player.vecLook, -0.12);
        }
        if (eventsManager.action["right"]) {
            this.player.vecLook = rotate2d(this.player.vecLook, 0.12);
        }
        let need_screamer_flag = false;
        if ((eventsManager.action["up"] || eventsManager.action["down"]) && this.enemy_mode_aggressive) {
            this.need_screamer = 6;
            this.player.lifetime -= 40;
            need_screamer_flag = true;
            if (this.player.lifetime <= 0) {
                this.lose();
                return;
            }
        }
        this.entities.forEach(function (e) {
            try {
                if (e.name === "Enimy") {
                    if (gameManager.enemy_mode === true) {
                        e.aggressive_mode = gameManager.enemy_mode_aggressive;
                    } else {
                        e.aggressive_mode = false;
                    }
                }
                e.update();
            } catch (ex) {
            }
        });
        if (need_screamer_flag === true && gameManager.nearest !== null) {
            gameManager.laterKill.push(gameManager.nearest);
            gameManager.nearest = null;
        }
        for (let i = 0; i < this.laterKill.length; i++) {
            var idx = this.entities.indexOf(this.laterKill[i]);
            if (idx > -1)
                this.entities.splice(idx, 1);
        }
        if (this.laterKill.length > 0)
            this.laterKill.length = 0;
        renderManager.draw(canvas, {
            x: this.player.pos_x,
            y: this.player.pos_y
        }, this.player.vecLook, 150, Math.PI * 0.3);
        mapManager.draw(ctx);
        mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        this.draw(ctx);
        mapManager.drawShadow(this.player.pos_x, this.player.pos_y, ctx, Math.PI * 0.3, this.player.vecLook, 150);
        if (this.need_message > 0) {
            spriteManager.drawText(ctx, this.message, 300, 150, 30);
            this.need_message--;
        }
        if (this.need_screamer > 0) {
            spriteManager.drawSpriteCoefBright(ctx, "Enimy1RC", canvas.width / 2, canvas.height / 6, canvas.height * 2, 0);
            gameManager.need_screamer--;
        }
        if (eventsManager.action["capslock"]) {
            renderManager.drawTable(ctx, table.data);
        }
    },
    draw: function (ctx) {
        for (let e = 0; e < this.entities.length; e++) {
            this.entities[e].draw(ctx);
        }
    },
    loadAll: function () {
        spriteManager.loadAtlas("../sprites/sprites.json", "../sprites/Entities.png");
        spriteManager.loadAtlas("../sprites/candle.json", "../sprites/candle.png");
        spriteManager.loadAtlas("../sprites/TextureWall.json", "../sprites/TextureWall.png");
        spriteManager.loadAtlas("../sprites/EntitiesRayCast.json", "../sprites/EntitiesRayCast.png");
        gameManager.factory['Player'] = Player;
        gameManager.factory['Enimy'] = Enimy;
        gameManager.factory['Key'] = Key;
        gameManager.factory['Chest'] = Chest;
        gameManager.factory['Life'] = Life;
        gameManager.factory['Door'] = Door;
        this.init_levels(["../levels/level1.json", "../levels/level2.json"]);
        mapManager.draw(ctx);
        eventsManager.setup(canvas);
    }
    ,
    play: function () {
        if (!mapManager.imgLoaded || !mapManager.jsonLoaded) {
            setTimeout(function () {
                gameManager.play()
            }, 100);
        } else {
            this.gameLoop = setInterval(function () {
                gameManager.update();
            }, 100);
            this.score_interval = setInterval(function () {
                gameManager.score++;
            }, 1000);
        }
    }
    ,
    kill: function (obj) {
        this.laterKill.push(obj);
    }
    ,
    addKeyForFinish() {
        this.count_of_keys++;
    }
    ,
    startLevel(level) {
        mapManager.loadMap(level);
        mapManager.parseEntities();
    }
    ,
    init_levels(levels_names) {
        this.level_names = levels_names;
        this.startLevel(levels_names[0]);
    }
    ,
    win() {
        clearInterval(this.score_interval);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        spriteManager.drawText(ctx, "You win!", 200, 200, 120);
        spriteManager.drawText(ctx, "Your time: " + gameManager.score, 200, 340, 60);
        table.addRecord({name: localStorage["course_work.username"], score: gameManager.score});
    },
    lose() {
        clearInterval(this.score_interval);
        clearInterval(this.gameLoop);
        this.end_enemy_mode();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        spriteManager.drawText(ctx, "Game over!", 200, 200, 120);
    }
    ,
    sendMessage(message) {
        this.message = message;
        this.need_message = 10;
    }
    , next_level() {
        clearInterval(this.gameLoop);
        if (this.curr_level + 1 === this.level_names.length) {
            setTimeout(function () {
                    gameManager.win();
                }
            )
            return;
        }
        mapManager.loadMap(this.level_names[this.curr_level + 1]);
        this.count_of_keys = 0;
        this.curr_level++;
        mapManager.parseEntities();
        mapManager.draw(ctx);
        this.play();
    }
}
table.load();
gameManager.loadAll();
gameManager.play();
soundManager.init();
soundManager.loadArray(["../sound/background-sound.mp3", "../sound/sound1.mp3"]);
soundManager.play("../sound/background-sound.mp3", {looping: true})