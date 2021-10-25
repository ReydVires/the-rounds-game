import { EventNames, GameplaySceneView } from "./GameplaySceneView";

import { Assets } from "../../library/AssetGameplay";
import { AudioController } from "../../modules/audio/AudioController";
import { BallController } from "./ball/BallControler";
import { CoinController } from "./coin/CoinController";
import { DebugController } from "./debug/DebugController";
import { GameData } from "./game/GameData";
import { SceneInfo } from "../../info/SceneInfo";
import { TurretControler } from "./turret/TurretController";
import { WorldPhysicsController } from "./world/WorldPhysicsController";
import { get } from "../../helper/GeneralHelper";

type OnCreateFinish = (...args: unknown[]) => void;

export class GameplaySceneController extends Phaser.Scene {

	view: GameplaySceneView;
	audioController: AudioController;
	debugController: DebugController;

	worldController: WorldPhysicsController;
	turretController: TurretControler;
	ballController: BallController;
	coinController: CoinController;

	constructor () {
		super({key: SceneInfo.GAMEPLAY.key});
	}

	init (data: any): void {
		const currentLevel = get(() => data.level, 0) as number;
		const nextLevel = currentLevel + 1;
		const isFinishAllLevel = nextLevel >= GameData.level.length;

		this.view = new GameplaySceneView(this);
		this.audioController = AudioController.getInstance();
		this.debugController = new DebugController(this);
		this.worldController = new WorldPhysicsController(this);
		this.turretController = new TurretControler(this);
		this.ballController = new BallController(this);
		this.coinController = new CoinController(this);

		this.debugController.init();

		this.worldController.onCreateFinish((centerPos: any) => {
			this.coinController.init({
				screenRatio: this.view.customScreenRatio,
				initialPos: centerPos
			});
		});

		this.worldController.onCollidedBall(() => {
			this.audioController.playSFX(Assets.sfx_drop.key, { volume: Phaser.Math.FloatBetween(0.4, 0.65), rate: Phaser.Math.FloatBetween(0.7, 1) }, true);
		});

		this.turretController.onCreateFinish((initialPos: any) => {
			this.ballController.init({
				screenRatio: this.view.customScreenRatio,
				initialPos
			});
		});

		this.worldController.onGetCoin(() => {
			this.audioController.playSFX(Assets.sfx_collect_coin.key, { volume: Phaser.Math.FloatBetween(0.4, 0.65), rate: Phaser.Math.FloatBetween(0.9, 1) });
			this.coinController.collected();
			this.view.updateCoin();
		});

		this.turretController.onTap((data: any) => {
			this.audioController.playSFX(Assets.sfx_turret_shoot.key, { rate: Phaser.Math.FloatBetween(0.5, 1) });
			this.ballController.setSpawnPoint(data.pos, data.direction);
		});

		this.turretController.onAddPowerSpeed((speedCoef: number) => {
			// console.log('--> Check speed', speedCoef);
			
			this.ballController.setSpeed(speedCoef);
		});

		this.turretController.onUpdatePowerShoot((speedCoef: number) => {
			// console.log('Check shake', speedCoef);

			this.cameras.main.shake(100, 0.02 * speedCoef, false);
		});

		this.ballController.onStopMove(() => {
			if (this.view.isGameOver) return;
			this.turretController.enableMoveTurret();
		});

		this.ballController.onNotPlacedSafe(() => {
			this.view.decreaseLife();
		});

		this.ballController.onPlacedSafe(() => {
			if (!isFinishAllLevel) {
				this.view.showPanel(`GO TO LEVEL\n${nextLevel + 1}`, "Toped berhasil selamat!\nYuk lanjut level", "TAP TO NEXT");
				this.view.skipShowTitle();
				return;
			}

			this.view.showPanel(`YEAY SELESAI!`, "Semua tantangan telah\nberhasilkamu lewati!\nTotal Coin: " + this.view.coinValue.toString(), "RESTART");
		});

		this.onResetBall(() => {
			this.ballController.reset();
		});

		this.onGameOver(() => {
			this.view.showPanel("GAME OVER", "Yahh! Sayang sekali :(\nToped harus stay juga\ndi green area", "CONTINUE?");
		});

		this.onClickNext(() => {
			if (this.view.isGameOver) {
				this.scene.start(SceneInfo.GAMEPLAY.key, {});
				return;
			}

			if (isFinishAllLevel) {
				this.scene.start(SceneInfo.GAMEPLAY.key, {});
				return;
			}

			this.scene.start(SceneInfo.GAMEPLAY.key, {
				level: nextLevel,
				coin: this.view.coinValue,
				life: this.view.lifeValue,
				isSkipTitle: this.view.skipTitle,
			});
		});

		this.onClickRestart(() => {
			this.scene.start(SceneInfo.GAMEPLAY.key, {});
		});

		this.onCreateFinish((uiView) => {
			this.debugController.show(true);
			this.worldController.init({
				screenRatio: this.view.customScreenRatio,
				data: GameData.level[currentLevel],
			});
			this.turretController.init({ screenRatio: this.view.customScreenRatio });
		});
	}

	create (data: any): void {
		const coinValue = get(() => data.coin, 0) as number;
		const lifeValue = get(() => data.life, 5) as number;
		const isSkipTitle = get(() => data.isSkipTitle, false) as boolean;
		this.view.create({
			coin: coinValue,
			life: lifeValue,
			isSkipTitle,
		});
	}

	update (time: number, dt: number): void {
		if (this.view.restartKey.isDown) {
			this.view.event.emit(EventNames.onClickRestart);
		}
		this.turretController.update(time, dt);
		this.ballController.update(time, dt);
	}

	onClickRestart (event: Function): void {
		this.view.event.on(EventNames.onClickRestart, event);
	}

	onClickNext (event: Function): void {
		this.view.event.on(EventNames.onClickNext, event);
	}

	onResetBall (event: Function): void {
		this.view.event.on(EventNames.onResetBall, event);
	}

	onGameOver (event: Function): void {
		this.view.event.once(EventNames.onGameOver, event);
	}

	onCreateFinish (event: OnCreateFinish): void {
		this.view.event.once(EventNames.onCreateFinish, event);
	}

}