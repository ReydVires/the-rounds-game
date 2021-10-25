import { BallView } from "./BallView";
import { CustomTypes } from "../../../../types/custom";

export class BallController {
	private _view: BallView;

	constructor (scene: Phaser.Scene) {
		this._view = new BallView(scene);
	}

	init (data: CustomTypes.Gameplay.GeneralData): void {
		this._view.create(data);
	}

	setSpawnPoint (pos: Required<Phaser.Types.Math.Vector2Like>, dir: Phaser.Geom.Point): void {
		this._view.lunchBall(pos, dir);
	}

	setSpeed (value: number): void {
		this._view.setSpeed(value);
	}

	reset (): void {
		this._view.resetBall();
	}

	update (time: number, dt: number): void {
		if (!this._view.isTopedAttachedBall) return;
		if (this._view.isBallStopMove) return;
		this._view.updateTopedPosition();
	}

	onStopMove (event: Function): void {
		this._view.event.on(this._view.eventName.onStopMove, event);
	}

	onNotPlacedSafe (event: Function): void {
		this._view.event.on(this._view.eventName.onNotPlacedSafe, event);
	}

	onPlacedSafe (event: Function): void {
		this._view.event.once(this._view.eventName.onPlacedSafe, event);
	}

}