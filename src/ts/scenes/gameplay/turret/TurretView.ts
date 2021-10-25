import { Assets } from "../../../library/AssetGameplay";
import { BaseView } from "../../../modules/core/BaseView";
import { CustomTypes } from "../../../../types/custom";
import { Image } from "../../../modules/gameobjects/Image";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";

const TIME_TICK_BASE = 0.3;
const MAX_SPEED_KOEF = 10;

export class TurretView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	eventName = {
		onCreateFinish: "onCreateFinish",
		onTap: "onTap",
		onAddPowerSpeed: "onAddPowerSpeed",
		onUpdatePowerShoot: "onUpdatePowerShoot",
	};

	private _state = {
		ANCHOR: "ANCHOR",
		ROTATION_SPEED: "ROTATION_SPEED",
		IS_SHOOTING: "IS_SHOOTING",
		IS_PRESSING_TURRET: "IS_PRESSING_TURRET",
		INIT_TURRET_POS: "INIT_TURRET_POS",
	};

	private _data: CustomTypes.Gameplay.GeneralData;
	private _turretContainer: Phaser.GameObjects.Container;
	private _headTurret: Image;

	private _powerDurationTick: number;
	private _powerSpeed: number;

	constructor (private _scene: Phaser.Scene) {
		this.event = new Phaser.Events.EventEmitter();
		this.screenUtility = ScreenUtilController.getInstance();
	}

	get headTurret (): Phaser.GameObjects.Image {
		return this._headTurret.gameObject;
	}

	get turretPosition (): void {
		return this._turretContainer.getData(this._state.INIT_TURRET_POS);
	}

	get headTurretAnchor (): Phaser.Math.Vector2 {
		return this._headTurret.gameObject.getData(this._state.ANCHOR);
	}

	get rotationSpeed (): number {
		return this._headTurret.gameObject.getData(this._state.ROTATION_SPEED);
	}

	get isShooting (): boolean {
		return this._headTurret.gameObject.getData(this._state.IS_SHOOTING);
	}

	get isPressingTurret (): boolean {
		return this._headTurret.gameObject.getData(this._state.IS_PRESSING_TURRET);
	}

	create (data: CustomTypes.Gameplay.GeneralData): void {
		this._data = data;
		this._powerDurationTick = 0;
		this._powerSpeed = 0;
		this.createTurret();
		this.setTurretEvent();
	}

	setTurretAngle (degrees: number): void {
		const dirChanger: number = -this._headTurret.gameObject.getData(this._state.ROTATION_SPEED);
		const thresholdDegrees = 70;
		if (degrees > thresholdDegrees || degrees < -thresholdDegrees) {
			this._headTurret.gameObject.setData(this._state.ROTATION_SPEED, dirChanger);
		}
		this._headTurret.gameObject.setAngle(degrees);
	}

	activateTurret (): void {
		this._headTurret.gameObject.setData(this._state.IS_SHOOTING, false);
	}

	updatePowerShoot (deltaTime: number): void {
		this._powerDurationTick -= deltaTime;
		const isMaxPowerSpeed = this._powerSpeed >= MAX_SPEED_KOEF;
		let chargedSpeed = this._powerSpeed / MAX_SPEED_KOEF;
		if (this._powerDurationTick <= 0 && !isMaxPowerSpeed) {
			this._powerDurationTick += TIME_TICK_BASE;
			this._powerSpeed += 1;
			this.event.emit(this.eventName.onAddPowerSpeed, chargedSpeed);
		}
		this.event.emit(this.eventName.onUpdatePowerShoot, chargedSpeed);
	}

	private resetPowerSpeed (): void {
		this._powerSpeed = 0;
		this.event.emit(this.eventName.onAddPowerSpeed, 0);
	}

	private createTurret (): void {
		const { screenRatio } = this._data;
		const { centerX, centerY } = this.screenUtility;

		const bodyTurret = new Image(this._scene, 0, 0, Assets.body_turret.key, 0);
		bodyTurret.transform.setToScaleDisplaySize(screenRatio);

		const headRatio = bodyTurret.transform.displayToOriginalWidthRatio;
		this._headTurret = new Image(this._scene, 0, 0, Assets.head_turret.key, 0);
		this._headTurret.gameObject.setOrigin(0.5, 0.8);
		this._headTurret.transform.setToScaleDisplaySize(headRatio);

		this._headTurret.gameObject.setData(
			this._state.ANCHOR,
			this._headTurret.transform.getDisplayPositionFromCoordinate(0.5, 0.8)
		);
		this._headTurret.gameObject.setData(
			this._state.ROTATION_SPEED,
			2/100
		);
		this._headTurret.gameObject.setData(
			this._state.IS_SHOOTING,
			false
		);
		this._headTurret.gameObject.setData(
			this._state.IS_PRESSING_TURRET,
			false
		);

		this._turretContainer = this._scene.add.container(centerX, centerY * 1.5, [
			bodyTurret.gameObject,
			this._headTurret.gameObject,
		]).setSize(
			bodyTurret.gameObject.displayWidth,
			bodyTurret.gameObject.displayHeight * 1.75
		);
		this._turretContainer.setData(this._state.INIT_TURRET_POS, {
			x: this._turretContainer.x,
			y: this._turretContainer.y,
		});
	}

	private setTurretEvent (): void {
		this._turretContainer.setInteractive().on('pointerdown', (p: Phaser.Input.Pointer) => {
			if (this._headTurret.gameObject.getData(this._state.IS_SHOOTING)) {
				return;
			}

			// console.log('Should not called when ball still active!');
			this._headTurret.gameObject.setData(this._state.IS_PRESSING_TURRET, true);
		});

		const onTapCallback = (): void => {
			if (!this._headTurret.gameObject.getData(this._state.IS_PRESSING_TURRET)) {
				return;
			}
			this._headTurret.gameObject.setData(this._state.IS_PRESSING_TURRET, false);

			const { x, y } = this._headTurret.gameObject.getTopCenter().clone();
			const { x: anchorX, y: anchorY } = this._headTurret.gameObject.getData(this._state.ANCHOR) as Phaser.Math.Vector2;

			const direction = new Phaser.Geom.Point(x - anchorX, y - anchorY);
			Phaser.Geom.Point.SetMagnitude(direction, 1);

			const turretPos = {
				x: this._turretContainer.x + x,
				y: this._turretContainer.y + y,
			};

			this._headTurret.gameObject.setData(this._state.IS_SHOOTING, true);
			this.event.emit(this.eventName.onTap, { pos: turretPos, direction });

			this.resetPowerSpeed();

			const ratioKnockback = 32 * this._data.screenRatio;
			const turretKnockbackTween = this._scene.tweens.create({
				targets: this._headTurret.gameObject,
				x: `-=${direction.x * ratioKnockback}`,
				y: `-=${direction.y * ratioKnockback}`,
				duration: 150,
				yoyo: true,
			});
			turretKnockbackTween.play();
		};

		this._turretContainer.setInteractive().on('pointerup', onTapCallback);
		this._turretContainer.setInteractive().on('pointerout', onTapCallback);
	}

}