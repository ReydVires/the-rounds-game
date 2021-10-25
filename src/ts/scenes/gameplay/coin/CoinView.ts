import { Assets } from "../../../library/AssetGameplay";
import { BaseView } from "../../../modules/core/BaseView";
import { CustomTypes } from "../../../../types/custom";
import { MatterSprite } from "../../../modules/gameobjects/MatterSprite";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

export class CoinView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	private _data: CustomTypes.Gameplay.GeneralData;
	private _sprite: MatterSprite;

	private _idleTween: Phaser.Tweens.Tween;

	constructor (private _scene: Phaser.Scene) {
		this.event = new Phaser.Events.EventEmitter();
		this.screenUtility = ScreenUtilController.getInstance();
	}

	create (data: CustomTypes.Gameplay.GeneralData): void {
		this._data = data;
		this.createCoin();
	}

	coinDisappear (): void {
		// Disable collision checker
		this._sprite.gameObject.setCollisionCategory(0);

		this._scene.tweens.add({
			onStart: () => this._idleTween.stop(),
			targets: this._sprite.gameObject,
			props: {
				alpha: { getStart: () => 0.7, getEnd: () => 0 },
				y: {
					getStart: () => this._sprite.gameObject.y,
					getEnd: () => this._sprite.gameObject.y - (48 * this._data.screenRatio)
				},
			},
			duration: 500,
			// onComplete: () => this._sprite.gameObject.destroy(),
		});
	}

	private createCoin (): void {
		const { centerX, centerY } = this.screenUtility;
		const { screenRatio, initialPos } = this._data;
		const pos = initialPos || {
			x: centerX,
			y: centerY
		};
		this._sprite = new MatterSprite(this._scene, pos.x, pos.y, Assets.coin.key, 0, {
			isSensor: true,
			ignoreGravity: true,
		});
		this._sprite.transform.setToScaleDisplaySize(screenRatio);
		this._sprite.gameObject.setName("coin");

		const customPos = this._sprite.gameObject.getTopCenter().clone();
		this._sprite.gameObject.setY(customPos.y - this._sprite.gameObject.displayHeight / 2);

		this._idleTween = this._scene.tweens.create({
			targets: this._sprite.gameObject,
			y: `+=${16 * screenRatio}`,
			yoyo: true,
			duration: 800,
			repeat: -1,
		});
		this._idleTween.play();
	}

}