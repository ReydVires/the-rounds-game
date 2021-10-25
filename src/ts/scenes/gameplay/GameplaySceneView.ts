import { Assets } from "../../library/AssetGameplay";
import { BaseView } from "../../modules/core/BaseView";
import { FontAsset } from "../../library/AssetFont";
import { Image } from "../../modules/gameobjects/Image";
import { Rectangle } from "../../modules/gameobjects/Rectangle";
import { ScreenUtilController } from "../../modules/screenutility/ScreenUtilController";
import { TileSprite } from "../../modules/gameobjects/TileSprite";

/**
 * TODO
 * - Update shape type on GameData
 * - Turret Position can be custom
 * - New game after game over!
 */

export const enum EventNames {
	onClickRestart = "onClickRestart",
	onGameOver = "onGameOver",
	onCreateFinish = "onCreateFinish",
	onResetBall = "onResetBall",
	onClickNext = "onClickNext",
};

export class GameplaySceneView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	private _state = {
		LIFE: "LIFE",
		LIFE_WIDTH_ORIGIN: "LIFE_WIDTH_ORIGIN",
		LIFE_WIDTH_UPDATED: "LIFE_WIDTH_UPDATED",
	};

	private _restartKey: Phaser.Input.Keyboard.Key;
	private _screenRatio: number;
	private _UIContainer: Phaser.GameObjects.Container;
	private _UIPanelContainer: Phaser.GameObjects.Container;
	private _UITitleContainer: Phaser.GameObjects.Container;
	private _overlay: Rectangle;

	private _isGameOver: boolean;
	private _coin: number;
	private _skipTitle: boolean;

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
		this.event = new Phaser.Events.EventEmitter();
		this._isGameOver = false;
		this._coin = 0;
		this._skipTitle = false;
	}

	get restartKey (): Phaser.Input.Keyboard.Key {
		return this._restartKey;
	}

	get skipTitle (): boolean {
		return this._skipTitle;
	}

	get customScreenRatio (): number {
		return this._screenRatio;
	}

	get isGameOver (): boolean {
		return this._isGameOver;
	}

	get coinValue (): number {
		return this._coin;
	}

	get lifeValue (): number {
		const lifeUI = this._UIContainer.getByName("life_ui") as Phaser.GameObjects.TileSprite;
		return lifeUI.getData(this._state.LIFE);
	}

	create (props: any): void {
		const { centerX, centerY } = this.screenUtility;
		this._restartKey = this._scene.input.keyboard.addKey('R');
		this._coin = props.coin;
		this._skipTitle = props.isSkipTitle;

		this._UIContainer = this._scene.add.container(0, 0, []).setDepth(50);
		this._UIPanelContainer = this._scene.add.container(centerX, centerY, []);
		this._UITitleContainer = this._scene.add.container(centerX, centerY, []);

		this.createScreenSize();
		this.createHUD(props.life);
		this.createOverlay();
		this.createPanel();
		(!this._skipTitle) && this.createTitle();

		this.createNextEvent();

		this.event.emit(EventNames.onCreateFinish);
	}

	skipShowTitle (): void {
		this._skipTitle = true;
	}

	decreaseLife (): void {
		const lifeUI = this._UIContainer.getByName("life_ui") as Phaser.GameObjects.TileSprite;
		const currentLife = lifeUI.getData(this._state.LIFE) as number;

		const updateLife = currentLife - 1;
		if (updateLife < 0) return;

		lifeUI.setData(this._state.LIFE, updateLife);
		lifeUI.setData(this._state.LIFE_WIDTH_UPDATED, (lifeUI.width - lifeUI.getData(this._state.LIFE_WIDTH_ORIGIN)));

		if (updateLife === 0) {
			this._isGameOver = true;
			this.event.emit(EventNames.onGameOver);
		}
		else {
			this.event.emit(EventNames.onResetBall);
		}

		this._scene.tweens.addCounter({
			from: lifeUI.width,
			to: lifeUI.getData(this._state.LIFE_WIDTH_UPDATED),
			duration: 1000,
			ease: Phaser.Math.Easing.Expo.Out,
			onUpdate: (tween) => {
				const val = tween.getValue();
				lifeUI.width = val;
			}
		});
	}

	showPanel (title?: string, desc?: string, labelButton?: string): void {
		this._overlay.gameObject.setVisible(true).setActive(true);
		this._UIPanelContainer
			.setVisible(true)
			.setActive(true);

		this._scene.tweens.add({
			targets: this._UIPanelContainer,
			props: {
				scale: { getStart: () => 0.7, getEnd: () => 1 },
				alpha: { getStart: () => 0.3, getEnd: () => 1 }
			},
			duration: 600,
			ease: Phaser.Math.Easing.Back.Out,
		});

		if (title) {
			const gameObject = this._UIPanelContainer.getByName("title_panel") as Phaser.GameObjects.Text;
			gameObject.setText(title);
		}
		if (desc) {
			const gameObject = this._UIPanelContainer.getByName("desc_panel") as Phaser.GameObjects.Text;
			gameObject.setText(desc);
		}
		if (labelButton) {
			const gameObject = this._UIPanelContainer.getByName("btn_label_panel") as Phaser.GameObjects.Text;
			gameObject.setText(labelButton);
		}
	}

	updateCoin (): void {
		this._coin += 1;
		const coinText = this._UIContainer.getByName("coin_text_ui") as Phaser.GameObjects.Text;
		coinText.setText(`${this._coin} x`);
	}

	private createScreenSize (): void {
		const { width, height } = this.screenUtility;
		const MAX_WIDTH_DIMENSION = 1080;
		const MAX_HEIGHT_DIMENSION = 1920;
		const COLOR = 0xfafafa;
		const screenSize = new Rectangle(this._scene, 0, 0, MAX_WIDTH_DIMENSION, MAX_HEIGHT_DIMENSION, COLOR, 0);
		screenSize.transform.setMinPreferredDisplaySize(width, height);
		screenSize.gameObject.setOrigin(0);
		this._screenRatio = screenSize.transform.displayToOriginalWidthRatio;
		this._UIContainer.add(screenSize.gameObject);
	}

	private createOverlay (): void {
		const { width, height } = this.screenUtility;
		const MAX_WIDTH_DIMENSION = 1080;
		const MAX_HEIGHT_DIMENSION = 1920;
		const COLOR = 0x181818;
		this._overlay = new Rectangle(this._scene, 0, 0, MAX_WIDTH_DIMENSION, MAX_HEIGHT_DIMENSION, COLOR, 0.8);
		this._overlay.transform.setMinPreferredDisplaySize(width, height);
		this._overlay.gameObject
			.setDepth(100)
			.setOrigin(0)
			.setInteractive();
		
		this._skipTitle && this._overlay.gameObject.setVisible(false).setActive(false);
	}

	private createTitle (): void {
		const { centerY } = this.screenUtility;
		const titleText = this._scene.add.text(0, -centerY * 0.45, "THE ROUNDS", {
			fontFamily: FontAsset.sans.key,
			fontSize: `${135 * this._screenRatio}px`,
			align: 'center',
		} as Phaser.Types.GameObjects.Text.TextStyle);
		titleText.setOrigin(0.5);

		const watermark = this._scene.add.text(0, centerY * 0.9, "by Arsyel, Tokopedia Gamejam@2021", {
			fontFamily: FontAsset.sans.key,
			fontSize: `${32 * this._screenRatio}px`,
			align: 'center',
			fontStyle: 'italic',
			padding: {
				top: 8 * this._screenRatio,
			}
		} as Phaser.Types.GameObjects.Text.TextStyle);
		watermark.setOrigin(0.5, 0);

		const playBtn = new Image(this._scene, 0, centerY * 0.2, Assets.ui_btn.key);
		playBtn.transform.setToScaleDisplaySize(this._screenRatio * 0.8);

		const playTextRatio = playBtn.transform.displayToOriginalWidthRatio;
		const posPlayText = playBtn.transform.getDisplayPositionFromCoordinate(0.5, 0.5);
		const playText = this._scene.add.text(posPlayText.x, posPlayText.y - (8 * playTextRatio), "PLAY!", {
			fontFamily: FontAsset.sans.key,
			fontSize: `${72 * playTextRatio}px`,
			align: 'center',
			fontStyle: 'bold',
		} as Phaser.Types.GameObjects.Text.TextStyle);
		playText.setOrigin(0.5);

		const instructionTitleText = this._scene.add.text(0, -centerY * 0.3, "[Instruction]", {
			fontFamily: FontAsset.sans.key,
			fontSize: `${48 * this._screenRatio}px`,
			align: 'center',
		} as Phaser.Types.GameObjects.Text.TextStyle);
		instructionTitleText.setOrigin(0.5);

		const detailText = this._scene.add.text(0, instructionTitleText.getBottomCenter().y,
			"Tap & Hold the Turret\nWait for power, and BOOM!\nPlace Toped safety!",
		{
			fontFamily: FontAsset.roboto.key,
			fontSize: `${38 * this._screenRatio}px`,
			align: 'center',
			padding: {
				top: 16 * this._screenRatio,
			}
		} as Phaser.Types.GameObjects.Text.TextStyle);
		detailText.setOrigin(0.5, 0);

		this._UITitleContainer.add([
			titleText.setName("title_ui"),
			watermark,
			playBtn.gameObject.setName("play_btn_ui"),
			playText,
			instructionTitleText,
			detailText
		]).setDepth(200);
	}

	private createHUD (life: number): void {
		const lifeUIBack = new TileSprite(this._scene, 0, 0, Assets.toped.key, 0);
		lifeUIBack.transform.setToScaleDisplaySize(this._screenRatio * 0.115);
		lifeUIBack.gameObject.setOrigin(0).setAlpha(0.25);

		const lifeUI = new TileSprite(this._scene, 0, 0, Assets.toped.key, 0);
		lifeUI.transform.setToScaleDisplaySize(this._screenRatio * 0.115);
		lifeUI.gameObject.setOrigin(0);

		lifeUI.gameObject.setData(this._state.LIFE, life);
		lifeUI.gameObject.setData(this._state.LIFE_WIDTH_ORIGIN, lifeUI.gameObject.width - 1);

		lifeUIBack.gameObject.width = (life) * lifeUI.gameObject.width;
		lifeUI.gameObject.width = lifeUIBack.gameObject.width;

		const coinUI = new Image(this._scene, this.screenUtility.width, 0, Assets.coin.key, 0);
		coinUI.transform.setToScaleDisplaySize(this._screenRatio * 0.75);
		coinUI.gameObject.setOrigin(1, 0);
		const coinPadding = {
			top: 42 * this._screenRatio,
			right: 15 * this._screenRatio,
		};
		coinUI.gameObject
			.setX(coinUI.gameObject.x - coinPadding.right)
			.setY(coinUI.gameObject.y + coinPadding.top);

		const posCoinLabelText = coinUI.transform.getDisplayPositionFromCoordinate(0, 0.5);
		const coinLabelRatio = coinUI.transform.displayToOriginalWidthRatio;
		const coinLabelText = this._scene.add.text(posCoinLabelText.x, posCoinLabelText.y, `${this._coin} x`, {
			fontFamily: FontAsset.roboto.key,
			fontSize: `${81 * coinLabelRatio}px`,
			align: 'right',
			padding: {
				right: 16 * this._screenRatio,
			}
		} as Phaser.Types.GameObjects.Text.TextStyle);
		coinLabelText.setOrigin(1, 0.5);

		this._UIContainer.add([
			lifeUIBack.gameObject,
			lifeUI.gameObject.setName("life_ui"),
			coinUI.gameObject.setName("coin_ui"),
			coinLabelText.setName("coin_text_ui"),
		]);
	}

	private createPanel (): void {
		const panel = new Image(this._scene, 0, -this.screenUtility.centerY * 0.15, Assets.ui_panel.key, 0);
		panel.transform.setToScaleDisplaySize(this._screenRatio);

		const panelRatio = panel.transform.displayToOriginalWidthRatio;

		const posTitleText = panel.transform.getDisplayPositionFromCoordinate(0, 0);
		const titleText = this._scene.add.text(0, posTitleText.y, "NEXT LEVEL", {
			fontFamily: FontAsset.roboto.key,
			fontSize: `${80 * panelRatio}px`,
			fontStyle: 'bold',
			align: 'center',
			padding: {
				top: 120 * panelRatio
			},
		} as Phaser.Types.GameObjects.Text.TextStyle);
		titleText.setOrigin(0.5, 0);

		const posDescTitle = panel.transform.getDisplayPositionFromCoordinate(0, 0.55);
		const descText = this._scene.add.text(0, posDescTitle.y, "Selamat! Kuy lanjut level bos", {
			fontFamily: FontAsset.roboto.key,
			fontSize: `${48 * panelRatio}px`,
			align: 'center',
			padding: {
				top: 24 * panelRatio
			},
		} as Phaser.Types.GameObjects.Text.TextStyle);
		descText.setOrigin(0.5, 0);

		const posNextBtn = panel.transform.getDisplayPositionFromCoordinate(0, 1.2);
		const nextBtn = new Image(this._scene, 0, posNextBtn.y, Assets.ui_btn_gray.key);
		nextBtn.transform.setToScaleDisplaySize(panelRatio * 0.85);

		const btnRatio = nextBtn.transform.displayToOriginalWidthRatio;
		const btnLabel = nextBtn.transform.getDisplayPositionFromCoordinate(0, 0.5);
		const labelText = this._scene.add.text(0, btnLabel.y, "GO", {
			fontFamily: FontAsset.roboto.key,
			fontSize: `${64 * btnRatio}px`,
			align: 'center',
			color: "#1e1e1e",
			fontStyle: "bold",
		} as Phaser.Types.GameObjects.Text.TextStyle);
		labelText.setOrigin(0.5);

		this._UIPanelContainer.add([
			panel.gameObject.setName("panel"),
			titleText.setName("title_panel"),
			descText.setName("desc_panel"),
			nextBtn.gameObject.setName("next_btn_panel"),
			labelText.setName("btn_label_panel"),
		])
			.setDepth(150)
			.setVisible(false)
			.setActive(false);
	}

	private createNextEvent (): void {
		const nextBtn = this._UIPanelContainer.getByName("next_btn_panel") as Phaser.GameObjects.Image;
		nextBtn.setInteractive({ useHandCursor: true }).once('pointerdown', () => {
			this._scene.tweens.add({
				targets: this._UIPanelContainer,
				scale: 0.3,
				alpha: 0,
				duration: 600,
				ease: Phaser.Math.Easing.Back.In,
				onComplete: () => {
					this.event.emit(EventNames.onClickNext);
				}
			});
		});

		if (this._skipTitle) return;
		const playBtn = this._UITitleContainer.getByName("play_btn_ui") as Phaser.GameObjects.Image;
		playBtn.setInteractive({ useHandCursor: true }).once('pointerdown', () => {
			this._scene.tweens.add({
				targets: this._UITitleContainer,
				y: `-=${this.screenUtility.height}`,
				duration: 600,
				ease: Phaser.Math.Easing.Back.In,
				onComplete: () => {
					this._overlay.gameObject.setVisible(false).setActive(false);
				}
			});
		});
	}

}