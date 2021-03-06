import { LoadingSceneView } from "./LoadingSceneView";
import { LoaderHelper } from "../../helper/LoaderHelper";
import { Assets as LoadingAsset } from "../../library/AssetLoading";
import { Assets as GameplayAsset } from "../../library/AssetGameplay";
import { CustomTypes } from "../../../types/custom";
import { SceneInfo } from "../../info/SceneInfo";
import { CONFIG } from "../../info/GameInfo";

export class LoadingSceneController extends Phaser.Scene {

	view: LoadingSceneView;

	constructor () {
		super({key:SceneInfo.LOADING.key});
	}

	init (): void {
		this.view = new LoadingSceneView(this);
	}

	preload (): void {
		this.loadBootResources();
	}

	create (): void {}

	loadBootResources (): void {
		this.load.once('complete', this.onCompleteLoadBoot.bind(this));
		LoaderHelper.LoadAssets(this, LoadingAsset as CustomTypes.Asset.ObjectAsset);
		this.load.start(); // Execute: onCompleteLoadBoot
	}

	onCompleteLoadBoot (): void {
		this.view.create();
		this.load.on('progress', (value: number) => this.view.updateLoading(value));
		this.loadResources();
	}

	loadResources (): void {
		this.load.once('complete', this.onCompleteLoad.bind(this));

		// LOAD ALL GAME FILE HERE!
		LoaderHelper.LoadAssets(this, GameplayAsset as CustomTypes.Asset.ObjectAsset);

		this.load.start(); // Execute: onCompleteLoad
	}

	onCompleteLoad (): void {
		this.load.removeAllListeners();
		if (CONFIG.ON_DEBUG) this.scene.launch(SceneInfo.DEBUG.key);
		this.scene.start(SceneInfo.GAMEPLAY.key);
	}

}