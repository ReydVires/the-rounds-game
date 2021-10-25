/// <reference path="../node_modules/phaser/types/phaser.d.ts" />

import '../src/css/index.css';

import { CONFIG } from './ts/info/GameInfo';
import { SceneList } from "./ts/info/SceneInfo";

if (CONFIG.ENABLE_LOG) console.log("[CONFIG]", CONFIG);

type CalculateScreenType = {
	width: number;
	height: number;
	zoom: number;
};

const smallResolution = (): boolean => {
	return window.innerWidth < 480;
};

const toEven = (val: number): number => {
	const result = Math.round(val);
	return result + (result % 2);
};

const calculateScreen = (): CalculateScreenType => {
	const dprModifier = (smallResolution() ? window.devicePixelRatio : 1);
	return {
		width: toEven(window.innerWidth * dprModifier),
		height: toEven(window.innerHeight * dprModifier),
		zoom: 1 / dprModifier
	};
};

const portraitConversion = (config: CalculateScreenType): CalculateScreenType => {
	let width = config.width;
	let height = config.height;
	let isLandscape = width > height;

	width = !isLandscape ? width : height * (9 / 16);

	return {
		width: toEven(width),
		height: toEven(height),
		zoom: config.zoom
	};
};

const meta = document.createElement("meta");
meta.name = "viewport";
meta.content = "initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no";
document.head.appendChild(meta);

const screenProfile = portraitConversion(calculateScreen());

const isFirefox = /Firefox/i.test(navigator.userAgent);

// Set to WebGL in Firefox, using Canvas in Firefox somehow create performance / lagging issues
const renderType = isFirefox ? Phaser.WEBGL : Phaser.AUTO;

const gameConfig: Phaser.Types.Core.GameConfig = {
	version: CONFIG.VERSION,
	banner: { hidePhaser: !CONFIG.ENABLE_LOG },
	type: renderType,
	parent: 'game',
	backgroundColor: (CONFIG.ON_DEBUG) ? '#3498db' : '#1e1e1e',
	scale: {
		mode: Phaser.Scale.NONE,
		width: screenProfile.width,
		height: screenProfile.height,
		zoom: screenProfile.zoom,
		autoRound: true,
	},
	seed: [((+new Date()).toString(16) + (Math.random() * 100000000 | 0).toString(16))],
	scene: SceneList(),
	input: { activePointers: 2 },
	physics: {
		default: 'matter',
		matter: {
			debug: (CONFIG.ON_DEBUG),
			velocityIterations: 6,
			constraintIterations: 3,
		}
	},
	dom: {
		createContainer: true
	},
	render: {
		antialias: true,
		pixelArt: false,
		roundPixels: false,
	},
	autoFocus: true,
};

const game = new Phaser.Game(gameConfig);

// Resize is better to be registered after loaded
window.addEventListener("load", () => {

	// Register resize event
	let execResize: NodeJS.Timeout;
	const resizeEndEvent = new Event("resizeEnd");
	const EXEC_DELAY = 380;
	window.addEventListener("resize", () => {
		clearTimeout(execResize);
		execResize = setTimeout(() => window.document.dispatchEvent(resizeEndEvent), EXEC_DELAY);
	}, false);

	window.document.addEventListener("resizeEnd", (e) => {
		const { width, height, zoom } = portraitConversion(calculateScreen());
		game.scale.resize(width, height);
		game.scale.setZoom(zoom);
	});

});
