import { CustomTypes } from "../../../../types/custom";
import { TurretView } from "./TurretView";

export class TurretControler {

	private _view: TurretView;

	constructor (scene: Phaser.Scene) {
		this._view = new TurretView(scene);
	}

	init (data: CustomTypes.Gameplay.GeneralData): void {
		this._view.create(data);
		this._view.event.emit(this._view.eventName.onCreateFinish, this._view.turretPosition);
	}

	enableMoveTurret (): void {
		this._view.activateTurret();
	}

	update (time: number, dt: number): void {
		if (this._view.isShooting) return;

		const gameObject = this._view.headTurret;
		const centerPos = this._view.headTurretAnchor;
		const rotationSpeed = this._view.rotationSpeed;

		Phaser.Actions.RotateAroundDistance([gameObject], centerPos, rotationSpeed, 1);
		const angleDeg = Math.atan2(gameObject.y - centerPos.y, gameObject.x - centerPos.x) * (180 / Math.PI);
		this._view.setTurretAngle(angleDeg);

		if (this._view.isPressingTurret) {
			const deltaTime = dt / 1_000;
			this._view.updatePowerShoot(deltaTime);
		}
	}

	onCreateFinish (event: Function): void {
		this._view.event.once(this._view.eventName.onCreateFinish, event);
	}

	onTap (event: Function): void {
		this._view.event.on(this._view.eventName.onTap, event);
	}

	onAddPowerSpeed (event: Function): void {
		this._view.event.on(this._view.eventName.onAddPowerSpeed, event);
	}

	onUpdatePowerShoot (event: Function): void {
		this._view.event.on(this._view.eventName.onUpdatePowerShoot, event);
	}

}