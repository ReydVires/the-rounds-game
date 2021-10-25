import { BaseView } from "../../modules/core/BaseView";
import { ScreenUtilController } from "../../modules/screenutility/ScreenUtilController";
import { Text } from "../../modules/gameobjects/Text";

export class LoadingSceneView implements BaseView {

	private _progressText: Text;

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	constructor (private _scene: Phaser.Scene) {
		this.screenUtility = ScreenUtilController.getInstance();
	}

	create (): void {
		this.createLoadingComponents();
	}

	private createLoadingComponents (): void {
		this._progressText = new Text(this._scene, this.screenUtility.centerX, this.screenUtility.centerY, '0%', {
			color: '#fafafa',
			fontStyle: 'bold',
			align: 'center'
		});

		this._progressText.gameObject
			.setOrigin(0.5, 0)
			.setFontSize(48 * this.screenUtility.screenPercentage);
	}

	updateLoading (value: number): void {
		const percent = Math.round(value * 100).toString() + " %";
		this._progressText.gameObject.setText(percent);
	}

}