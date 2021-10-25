import { Transform } from "./components/Transform";

export class TileSprite {

	private _gameObject: Phaser.GameObjects.TileSprite;
	private _transform: Transform;

	constructor (private _scene: Phaser.Scene, x: number, y: number, texture: string, frame = 0) {
		this._gameObject = _scene.add.tileSprite(x, y, 0, 0, texture, frame);
		this._transform = new Transform(_scene, this._gameObject);
	}

	get gameObject (): Phaser.GameObjects.TileSprite { return this._gameObject; }

	get transform (): Transform { return this._transform; }

}