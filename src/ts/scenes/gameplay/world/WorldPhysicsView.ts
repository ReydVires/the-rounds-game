import { Assets } from "../../../library/AssetGameplay";
import { BaseView } from "../../../modules/core/BaseView";
import { CustomTypes } from "../../../../types/custom";
import { GameData } from "../game/GameData";
import { MatterSprite } from "../../../modules/gameobjects/MatterSprite";
import { Rectangle } from "../../../modules/gameobjects/Rectangle";
import { ScreenUtilController } from "../../../modules/screenutility/ScreenUtilController";
import { get } from "../../../helper/GeneralHelper";

type LevelData = typeof GameData.level[0];

export class WorldPhysicsView implements BaseView {

	event: Phaser.Events.EventEmitter;
	screenUtility: ScreenUtilController;

	eventName = {
		onCreateFinish: "onCreateFinish",
		onGetCoin: "onGetCoin",
		onCollidedBall: "onCollidedBall",
	};

	private _state = {
		INIT_POS: "INIT_POS",
	};

	private _data: CustomTypes.Gameplay.GeneralData;
	private _baseRect: Rectangle;

	constructor (private _scene: Phaser.Scene) {
		this.event = new Phaser.Events.EventEmitter();
		this.screenUtility = ScreenUtilController.getInstance();
	}

	create (data: CustomTypes.Gameplay.GeneralData): void {
		this._data = data;
		const BASE_GRAVITY = 0.005;
		const matterWorld = this._scene.matter.world;
		matterWorld.setGravity(0, 1, BASE_GRAVITY * data.screenRatio);
		matterWorld.setBounds(0, 0, undefined, undefined, 128 * data.screenRatio);

		matterWorld.on('collisionstart', (_: unknown, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
			const goA = get(() => bodyA.gameObject.name, "wall") as string;
			const goB = get(() => bodyB.gameObject.name, bodyB.id) as string;

			if (goA === "base_holder") {
				const gameObject = get(() => bodyB.gameObject, {}) as Phaser.GameObjects.GameObject;
				gameObject.setData("is_inside_base_holder", true);
			}

			if (goB === "ball_launcher") {
				this.event.emit(this.eventName.onCollidedBall);
			}

			if (bodyA.isSensor) {
				const bodyASensorName = get(() => bodyA.gameObject.name, bodyA.id) as string;
				const bodyBSensorName = get(() => bodyB.gameObject.name, bodyB.id) as string;
				if (bodyASensorName === "coin" || bodyBSensorName === "coin") {
					this.event.emit(this.eventName.onGetCoin, bodyA.gameObject);
				}
			}
		});

		matterWorld.on('collisionend', (_: unknown, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
			const goA = get(() => bodyA.gameObject.name, "wall") as string;
			// const goB = get(() => bodyB.gameObject.name, bodyB.id) as string;

			if (goA === "base_holder") {
				const gameObject = get(() => bodyB.gameObject, {}) as Phaser.GameObjects.GameObject;
				gameObject.setData("is_inside_base_holder", false);
			}
		});

		this.createHolder();
		this.createObstacles();
	}

	getCenterPos (): Required<Phaser.Types.Math.Vector2Like> {
		const { centerX, centerY } = this.screenUtility;
		const { data } = this._data;
		const { isPlacedCoin, coin } = data as LevelData;

		return isPlacedCoin
			? this._baseRect.gameObject.getData(this._state.INIT_POS)
			: {
				x: coin.pos.x * centerX,
				y: coin.pos.y * centerY
			};
	}

	private createHolder (): void {
		const { centerX, centerY } = this.screenUtility;
		const { screenRatio, data } = this._data;
		const levelData: LevelData = data;

		const addDegToRad = (deg: number): number => {
			return deg * (Math.PI / 180);
		};

		const RECT_COLOR = 0x1e1e1e;
		const STROKE_COLOR = 0xffffff;

		const STROKE_WIDTH = 8 * screenRatio;

		const baseSize = {
			width: (levelData.basePlatform.size.width * screenRatio),
			height: (levelData.basePlatform.size.height * screenRatio)
		};

		const sideSize = {
			width: (levelData.sidesPlatform.size.width * screenRatio),
			height: (levelData.sidesPlatform.size.height * screenRatio)
		};

		const setStrokeStyle = (shape: Phaser.GameObjects.Shape, color: number = STROKE_COLOR): void => {
			shape.setStrokeStyle(STROKE_WIDTH, color);
		};

		const posHolder = {
			x: centerX * levelData.basePlatform.pos.x,
			y: centerY * levelData.basePlatform.pos.y
		};

		const GREEN_COLOR = 0x2ecc71;

		this._baseRect = new Rectangle(this._scene, posHolder.x, posHolder.y, baseSize.width, baseSize.height, GREEN_COLOR, 1);
		setStrokeStyle(this._baseRect.gameObject, GREEN_COLOR);
		this._baseRect.gameObject.setName("base_holder").setOrigin(0.5, 1);
		this._baseRect.gameObject.setAngle(0);
		this._baseRect.gameObject.setData(this._state.INIT_POS, posHolder);

		const base = this._scene.matter.add.rectangle(posHolder.x, posHolder.y, baseSize.width, baseSize.height, { isStatic: true, angle: addDegToRad(this._baseRect.gameObject.angle)});
		this._scene.matter.alignBody(base, posHolder.x, posHolder.y, Phaser.Display.Align.BOTTOM_CENTER);
		base.gameObject = this._baseRect.gameObject;

		const posLeft = this._baseRect.gameObject.getBottomLeft();
		const rectLeft = this._scene.add.rectangle(posLeft.x, posLeft.y, sideSize.width, sideSize.height, RECT_COLOR, 1);
		setStrokeStyle(rectLeft);
		rectLeft.setName("base_holder_left").setOrigin(1, 1);

		const leftWall = this._scene.matter.add.rectangle(posLeft.x, posLeft.y, rectLeft.displayWidth, rectLeft.displayHeight, { isStatic: true });
		this._scene.matter.alignBody(leftWall, posLeft.x, posLeft.y, Phaser.Display.Align.BOTTOM_RIGHT);

		const posRight = this._baseRect.gameObject.getBottomRight();
		const rectRight = this._scene.add.rectangle(posRight.x, posRight.y, sideSize.width, sideSize.height, RECT_COLOR, 1);
		setStrokeStyle(rectRight);
		rectRight.setName("base_holder_right").setOrigin(0, 1);

		const rightWall = this._scene.matter.add.rectangle(posRight.x, posRight.y, rectRight.displayWidth, rectRight.displayHeight, { isStatic: true });
		this._scene.matter.alignBody(rightWall, posRight.x, posRight.y, Phaser.Display.Align.BOTTOM_LEFT);
	}

	private createObstacles (): void {
		const { centerX, centerY  } = this.screenUtility;
		const { screenRatio, data } = this._data;
		const { obstacles } = data as LevelData;
		obstacles.forEach((item: any) => {
			const { pos, type } = item;
			const { x, y } = pos;

			if (type === "circle") {
				const circle = new MatterSprite(this._scene, x * centerX, y * centerY, Assets.circle_shield.key, 0);
				circle.transform.setToScaleDisplaySize(screenRatio * item.ratio);

				circle.gameObject.setCircle(circle.transform.displayWidth / 2);
				circle.gameObject.setStatic(true);
			}
		});
	}

}