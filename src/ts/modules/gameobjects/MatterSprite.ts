import { Transform } from "./components/Transform";

export class MatterSprite {

	private _gameObject: Phaser.Physics.Matter.Sprite;
	private _transform: Transform;

	constructor (private _scene: Phaser.Scene, x: number, y: number, texture: string, frame = 0, options?: Phaser.Types.Physics.Matter.MatterBodyConfig) {
		this._gameObject = _scene.matter.add.sprite(x, y, texture, frame, options);
		this._transform = new Transform(_scene, this._gameObject);
	}

	get gameObject (): Phaser.Physics.Matter.Sprite { return this._gameObject; }

	get transform (): Transform { return this._transform; }

}