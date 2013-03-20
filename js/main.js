/*
 * phi
 */



/*
 *
 */
tm.main(function() {
	app = tm.app.CanvasApp("#world");
	app.fps = FRAME_RATE;
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    app.fitWindow();

    app.enableStats();

    app.replaceScene(GameScene());

    app.run();
});
