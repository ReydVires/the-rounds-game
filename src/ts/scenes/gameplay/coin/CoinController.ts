import { CoinView } from "./CoinView";
import { CustomTypes } from "../../../../types/custom";

export class CoinController {

	private _view: CoinView;

	constructor (scene: Phaser.Scene) {
		this._view = new CoinView(scene);
	}

	init (data: CustomTypes.Gameplay.GeneralData): void {
		this._view.create(data);
	}

	collected (): void {
		this._view.coinDisappear();
	}

}