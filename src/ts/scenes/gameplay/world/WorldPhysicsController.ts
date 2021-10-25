import { CustomTypes } from "../../../../types/custom";
import { WorldPhysicsView } from "./WorldPhysicsView";

export class WorldPhysicsController {

	private _view: WorldPhysicsView;

	constructor (scene: Phaser.Scene) {
		this._view = new WorldPhysicsView(scene);
	}

	init (data: CustomTypes.Gameplay.GeneralData): void {
		this._view.create(data);
		this._view.event.emit(this._view.eventName.onCreateFinish, this._view.getCenterPos());
	}

	onCreateFinish (event: Function): void {
		this._view.event.once(this._view.eventName.onCreateFinish, event);
	}

	onGetCoin (event: Function): void {
		this._view.event.on(this._view.eventName.onGetCoin, event);
	}

	onCollidedBall (event: Function): void {
		this._view.event.on(this._view.eventName.onCollidedBall, event);
	}

}