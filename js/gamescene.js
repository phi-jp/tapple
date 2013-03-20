/*
 * phi
 */

tm.define("GameScene", {
	superClass: "tm.app.Scene",

    init: function() {
        this.superInit();

        // bgm
        tm.sound.WebAudioManager.get("bgm").setLoop(true).play();

        // BOARD_COL*BOARD_ROW の配列を作成
        this.board = [];
        for (var i=0; i<BOARD_ROW; ++i) {
            var row = this.board[i] = [];
            for (var j=0; j<BOARD_COL; ++j) {
                row[j] = null;
            }
        }

        // button
        var button = tm.app.GlossyButton(200, 60, "blue", "RESET").addChildTo(this);
        button.setPosition(150, SCREEN_HEIGHT-40);
        button.onpointingstart = function() {
            this.removePieceAll();
        }.bind(this);

        // ゲージ
        this.gauge = tm.app.Gauge(SCREEN_WIDTH, 40, "rgb(160, 180, 255)", "left").addChildTo(this);
        this.gauge.y = SCREEN_HEIGHT - 110;
        this.gauge.shadowColor = "rgb(160, 180, 255)";
        this.gauge.shadowBlur = 16;

        // tap 間隔
        this.tapIntervalTime = 0;
        this.tapLevel = 0;
    },
    
    
    update: function(app) {
        // n フレームごとに piece を生成
        if (app.frame % 4 == 0) {
            this.pushPiece(Math.rand(0, BOARD_ROW-1));
        }

        // tap interval update
        ++this.tapIntervalTime;
        if (this.tapIntervalTime > 30) {
            this.tapIntervalTime = 0;
            this.tapLevel = 0;
        }

        this.gauge.percent -= 0.5;
    },
    
    /*
     * ピースを追加
     */
    pushPiece: function(xIndex) {
        var self = this;
        
        // 下から開いている場所を検索
        for (var i=BOARD_COL-1; 0<=i; --i) {
            var elm = this.getPieceByIndex(xIndex, i);
            if (elm == null) {
                var colorIndex = Math.rand(0, COLOR_LIST.length-1);
                var elm = Piece(colorIndex).addChildTo(this);
                elm.onpointingstart = function() {
                    if (!this.isDrop()) {
                        self.ontouchpiece(this);
                    }
                };
                this.setPieceByIndex(xIndex, i, elm);
                break;
            }
        }
    },
    
    /*
     * ピースの回りに同じ色がないかチェック
     * rst には同じ色だったピースを追加していく
     */
    check: function(piece, rst) {
        this.checkDirection(piece, -1, 0, rst);
        this.checkDirection(piece,  1, 0, rst);
        this.checkDirection(piece,  0,-1, rst);
        this.checkDirection(piece,  0, 1, rst);
        
        return (rst.length > 0);
    },
    
    /*
     * 方向指定チェック
     */
    checkDirection: function(piece, x, y, rst) {
        var target = this.getPieceByIndex(piece.xIndex+x, piece.yIndex+y);
        
        if (target == null || target.removeFlag == true || target.isDrop()) return ;
        
        if (piece.colorIndex === target.colorIndex) {
            rst.push(target);
            piece.removeFlag  = true;
            target.removeFlag = true;
            
            this.checkDirection(target, x, y, rst);
            this.checkDirection(target, y*-1, x, rst); //-90 回転
            this.checkDirection(target, y, x*-1, rst); // 90 回転
        }
    },

    /*
     * ピースタッチ時の処理
     */
    ontouchpiece: function(piece) {
        var rst = [];
        
        if (this.check(piece, rst)) {
            rst.push(piece);

            for (var i=0,len=rst.length; i<len; ++i) {
                this.removePiece(rst[i].xIndex, rst[i].yIndex);
            }

            tm.sound.WebAudioManager.get("tap0" + this.tapLevel).play();

            if (this.tapIntervalTime < 30) {
                this.tapLevel = Math.min(this.tapLevel + 1, 3);
            }
            this.tapIntervalTime = 0;

            this.gauge.percent += this.tapLevel*10;

        }
        else {
//            tm.sound.WebAudioManager.get("tap").play();
        }
    },
    
    getPieceByIndex: function(xIndex, yIndex) {
        return (this.board[yIndex]) ? this.board[yIndex][xIndex] : null;
    },
    
    setPieceByIndex: function(xIndex, yIndex, piece) {
        this.board[yIndex][xIndex] = piece;
        
        if (piece) piece.setIndex(xIndex, yIndex);
    },

    movePieceByIndex: function(xIndex, yIndex) {
        
    },
    
    removePiece: function(xIndex, yIndex) {
        console.log(xIndex, yIndex);
        var piece = this.getPieceByIndex(xIndex, yIndex);

        // 削除
        piece.remove();
        this.setPieceByIndex(xIndex, yIndex, null);

        // エフェクト
        var effect = PieceEffect(piece.colorIndex).addChildTo(this);
        effect.x = piece.x;
        effect.y = piece.y;
        
        // 下に詰める
        for (var i=yIndex; 1<=i; --i) {
            var elm = this.getPieceByIndex(xIndex, i-1);
            if (elm) {
                this.setPieceByIndex(xIndex, i-1, null)
                this.setPieceByIndex(xIndex, i, elm);
            }
            else {
                break;
            }
        }
        
    },

    // 下に詰める
    dropPieceByIndex: function(xIndex, yIndex) {

    },

    removePieceAll: function() {
        for (var i=0; i<BOARD_ROW; ++i) {
            var row = this.board[i];
            for (var j=0; j<BOARD_COL; ++j) {
                if (row[j]) {
                    row[j].remove();
                    row[j] = null;
                }
            }
        }
    },
});




tm.define("Piece", {
	superClass: "tm.app.AnimationSprite",

    init: function(colorIndex) {
        this.superInit(PIECE_SIZE, PIECE_SIZE, SPRITE_SHEET);
        
        this.gotoAndStop(COLOR_LIST[colorIndex]);
        
        this.colorIndex = colorIndex;
        
        this.interaction.boundingType = "circle";
        this.interaction.enabled = true;
    },
    
    /*
     * row 行
     * col 列
     */
    setIndex: function(xIndex, yIndex) {
        this.xIndex = xIndex;
        this.yIndex = yIndex;
        
        this.x = this.xIndex*PIECE_SIZE + OFFSET_X;
        this.targetY = this.yIndex*PIECE_SIZE + OFFSET_Y;
    },
    
    update: function() {
        if (this.y < this.targetY) {
            this.y += PIECE_SPEED;
        }
        else {
            this.y = this.targetY;
        }
//        if (this.y !== this.targetY) this.y +=10;
    },
    isDrop: function() {
        return this.y != this.targetY;
    },

});



tm.define("PieceEffect", {
    superClass: "tm.app.AnimationSprite",

    init: function(colorIndex) {
        this.superInit(PIECE_SIZE, PIECE_SIZE, SPRITE_SHEET);
        
        this.gotoAndPlay(COLOR_LIST[colorIndex]);
        this.animation.scale(3, 500).fadeOut(500);

        this.blendMode = "lighter";
    },

    onanimationend: function() {
        this.remove();
    }
});




