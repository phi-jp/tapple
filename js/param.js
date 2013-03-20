

/*
 * constant
 */
var FRAME_RATE      = 30;
var SCREEN_WIDTH    = 480;
var SCREEN_HEIGHT   = 720;
var SCREEN_CENTER_X = SCREEN_WIDTH/2;
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;
var BOARD_COL   = 6;  // 行数
var BOARD_ROW   = 6;  // 列数
var PIECE_SIZE  = 75;
var PIECE_SPEED = 15;
var OFFSET_X    = (SCREEN_WIDTH-(BOARD_ROW*PIECE_SIZE))/2 + PIECE_SIZE/2;
var OFFSET_Y    = 160;

var COLOR_LIST = [
    "red",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink"
];
var SPRITE_SHEET = null;


/*
 * global
 */
var app = null;



/*
 *
 */
tm.preload(function() {
    tm.graphics.TextureManager.add("piece", "http://jsrun.it/assets/9/z/O/X/9zOX6.png");
    SPRITE_SHEET = tm.app.SpriteSheet({
        image: "piece",
        frame: {
            width: 64,
            height: 64,
            count: 64
        },
        animations: {
            "red"     : [0, 8, "red_r", 2],
            "yellow"  : [8, 16, "yellow_r", 2],
            "green"   : [16, 24, "green_r", 2],
            "blue"    : [24, 32, "blue_r", 2],
            "purple"  : [32, 40, "purple_r", 2],
            "pink"    : [40, 48, "pink_r", 2],
            "red_r"   : [7, 0, "red", 2],
            "yellow_r": [15, 8, "yellow", 2],
            "green_r" : [23, 16, "green", 2],
            "blue_r"  : [31, 24, "blue", 2],
            "purple_r": [39, 32, "purple", 2],
            "pink_r"  : [47, 40, "pink", 2],
        }
    });

    tm.sound.WebAudioManager.add("bgm", "sound/bgm.mp3");
    tm.sound.WebAudioManager.add("tap00", "sound/tap00.mp3");
    tm.sound.WebAudioManager.add("tap01", "sound/tap01.mp3");
    tm.sound.WebAudioManager.add("tap02", "sound/tap02.mp3");
    tm.sound.WebAudioManager.add("tap03", "sound/tap03.mp3");

    tm.util.ScriptManager.loadStats();
});
