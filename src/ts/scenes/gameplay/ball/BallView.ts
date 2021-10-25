import { Assets } from "../../../library/AssetGameplay";
import { BaseView } from "../../../modules/core/BaseView";
import { CustomTypes } from "../../../../types/custom";
import { Image } from "../../../modules/gameobjects/Image";
import { MatterSprite } from "../../../modules/gameobjects/MatterSprite";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

export class BallView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;
	eventName = {
		onStopMove: "onStopMove",
		onNotPlacedSafe: "onNotPlacedSafe",
		onPlacedSafe: "onPlacedSafe",
	};

	private _state = {
		IS_ATTACH: "IS_ATTACH",
		SPEED: "SPEED",
		IS_INSIDE_SAFE: "is_inside_base_holder",
	};

	private _data: CustomTypes.Gameplay.GeneralData;
	private _circleShield: MatterSprite;
	private _toped: Image;

	private _speedBase: number;
	private _isStopMove: boolean;

	constructor (private _scene: Phaser.Scene) {
		this.event = new Phaser.Events.EventEmitter();
		this.screenUtility = ScreenUtilController.getInstance();
	}

	get isTopedAttachedBall (): boolean {
		return this._toped.gameObject.getData(this._state.IS_ATTACH);
	}

	get isBallStopMove (): boolean {
		return this._isStopMove;
	}

	create (data: CustomTypes.Gameplay.GeneralData): void {
		this._data = data;
		this._speedBase = 175 * data.screenRatio; // 70
		this._isStopMove = true;
		this.createBall();
		this.createToped();
	}

	resetBall (): void {
		const resetBallState = (): void => {
			const { initialPos } = this._data;
			const pos: Required<Phaser.Types.Math.Vector2Like> = initialPos!;

			this._circleShield.gameObject.setVelocity(0);
			this._circleShield.gameObject
				.setX(pos.x)
				.setY(pos.y)
				.setAngle(0)
				.setAlpha(1)
				.setIgnoreGravity(true);

			this._toped.gameObject
				.setX(pos.x)
				.setY(pos.y)
				.setAngle(0)
				.setAlpha(1);

			this.event.emit(this.eventName.onStopMove);
		};

		this._scene.tweens.add({
			targets: [ this._circleShield.gameObject, this._toped.gameObject ],
			alpha: 0,
			duration: 500,
			onComplete: resetBallState
		});
	}

	lunchBall (pos: Required<Phaser.Types.Math.Vector2Like>, dir: Phaser.Geom.Point): void {
		this._isStopMove = false;
		this._toped.gameObject
			.setX(pos.x)
			.setY(pos.y)
			.setVisible(true)
			.setData(this._state.IS_ATTACH, true);

		this._circleShield.gameObject
			.setX(pos.x)
			.setY(pos.y)
			.setVisible(true)
			.setActive(true)
			.setIgnoreGravity(false);

		const localSpeed = this._circleShield.gameObject.getData(this._state.SPEED) as number;
		const velocity = {
			x: dir.x * localSpeed,
			y: dir.y * localSpeed,
		};
		this._circleShield.gameObject
			.setVelocity(velocity.x, velocity.y);

		const angularVelocity = 0.01;
		this._circleShield.gameObject
			.setAngularVelocity(dir.x > 0 ? angularVelocity : -angularVelocity);
	}

	updateTopedPosition (): void {
		const { x, y, angle } = this._circleShield.gameObject;
		this._toped.gameObject.setX(x).setY(y).setAngle(angle);

		const angularVelocity = (this._circleShield.gameObject.body as any).angularVelocity * 1_000;
		
		const velocity = this._circleShield.gameObject.body.velocity;
		const sleepThreshold = 0.015;

		const isSleep = (Math.abs(velocity.x) + Math.abs(velocity.y)) / 2 <= sleepThreshold
			&& (angularVelocity <= sleepThreshold);
		
		if (isSleep) {
			this._isStopMove = true;

			const isInsideSafeZone = this._circleShield.gameObject.getData(this._state.IS_INSIDE_SAFE) as boolean;
			if (!isInsideSafeZone) {
				this.event.emit(this.eventName.onNotPlacedSafe);
				return;
			}
			this.event.emit(this.eventName.onPlacedSafe);
		}
	}

	setSpeed (speedCoef: number): void {
		const speedScale = this._speedBase * speedCoef;
		this._circleShield.gameObject.setData(this._state.SPEED, speedScale);
	}

	private createToped (): void {
		const { initialPos } = this._data;

		const pos: Required<Phaser.Types.Math.Vector2Like> = initialPos!;
		const topedRatio = this._circleShield.transform.displayToOriginalWidthRatio;
		this._toped = new Image(this._scene, pos.x, pos.y, Assets.toped.key, 0);
		this._toped.transform.setToScaleDisplaySize(topedRatio * 0.125);
		this._toped.gameObject.setData(this._state.IS_ATTACH, false);
	}

	private createBall (): void {
		const { screenRatio, initialPos } = this._data;

		const pos: Required<Phaser.Types.Math.Vector2Like> = initialPos!;
		this._circleShield = new MatterSprite(this._scene, pos.x, pos.y, Assets.circle_shield.key, 0, {
			friction: 0.05,
			frictionAir: 0.0005,
		});
		this._circleShield.transform.setToScaleDisplaySize(screenRatio * 0.825);

		const radius = this._circleShield.gameObject.displayHeight / 2;
		this._circleShield.gameObject.setCircle(radius);
		this._circleShield.gameObject.setBounce(0.7);
		this._circleShield.gameObject.setIgnoreGravity(true);

		this._circleShield.gameObject.setData(this._state.SPEED, 0);
		this._circleShield.gameObject.setData(this._state.IS_INSIDE_SAFE, false);
		this._circleShield.gameObject.setName('ball_launcher');
	}

}