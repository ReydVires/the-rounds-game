export const GameData = {
	level: [
		{
			basePlatform: {
				pos: { x: 1, y: 1.95 },
				size: {
					width: 512,
					height: 48
				}
			},
			sidesPlatform: {
				size: {
					width: 32,
					height: 170
				}
			},
			isPlacedCoin: true,
			coin: {
				pos: { x: 0, y: 0 },
			},
			obstacles: []
		},
		{
			basePlatform: {
				pos: { x: 1 * 1.25, y: 1 * 0.85 },
				size: {
					width: 335,
					height: 48
				}
			},
			sidesPlatform: {
				size: {
					width: 32,
					height: 190
				}
			},
			isPlacedCoin: true,
			coin: {
				pos: { x: 0, y: 0 },
			},
			obstacles: []
		},
		{
			basePlatform: {
				pos: { x: 1 * 1.25, y: 1 },
				size: {
					width: 250,
					height: 48
				}
			},
			sidesPlatform: {
				size: {
					width: 32,
					height: 130
				}
			},
			isPlacedCoin: false,
			coin: {
				pos: { x: 1 * 0.75, y: 1 * 1.15 },
			},
			obstacles: [
				{
					type: "circle",
					pos: { x: 1 * 0.3, y: 1 * 0.25 },
					ratio: 1
				},
				{
					type: "circle",
					pos: { x: 1 * 1.6, y: 1 * 0.55 },
					ratio: 0.85
				},
				{
					type: "circle",
					pos: { x: 1 * 0.15, y: 1 * 1.25 },
					ratio: 0.5
				},
			]
		},
		{
			basePlatform: {
				pos: { x: 1 * 0.4, y: 1.2 },
				size: {
					width: 250,
					height: 48
				}
			},
			sidesPlatform: {
				size: {
					width: 32,
					height: 180,
				}
			},
			isPlacedCoin: true,
			coin: {
				pos: { x: 0, y: 0 },
			},
			obstacles: [
				{
					type: "circle",
					pos: { x: 1 * 0.35, y: 1 * 0.25 },
					ratio: 0.5
				},
				{
					type: "circle",
					pos: { x: 1 * 1.35, y: 1 * 1.15 },
					ratio: 0.8
				},
			]
		},
		
		{
			basePlatform: {
				pos: { x: 1.2, y: 0.7 },
				size: {
					width: 500,
					height: 32
				}
			},
			sidesPlatform: {
				size: {
					width: 32,
					height: 100,
				}
			},
			isPlacedCoin: false,
			coin: {
				pos: { x: 1, y: 1.95 },
			},
			obstacles: [
				{
					type: "circle",
					pos: { x: 1 * 0.35, y: 1 * 0.25 },
					ratio: 0.5
				},
				{
					type: "circle",
					pos: { x: 1 * 1.35, y: 1 * 0.5 },
					ratio: 0.5
				},
				{
					type: "circle",
					pos: { x: 1 * 1.4, y: 1 * 1.15 },
					ratio: 0.7
				},
			]
		}
	],
};