# The Rounds Game

<p float="left">
<img src='https://img.shields.io/badge/Version-1.8.4-brightgreen'  alt="Version"/>
<img src='https://img.shields.io/badge/Status-Released-blue'  alt="Status: Released"/>
<img src='https://img.shields.io/badge/Contribution-Open-brightgreen'  alt="Contribution: Open"/>
<img src='https://img.shields.io/badge/Phaser-3.24.1-blue'  alt="Phaser: 3.24.1"/>
</p>

## Playable Link

<https://reydvires.itch.io/the-rounds>

## Quickstart

1. Download this repo
2. Install all your dependencies by run `npm install`
3. Run your dev server by `npm run dev`
4. Make changes under `LoadingSceneController.ts` if you want to load some assets
5. Make changes under `GameplaySceneController.ts` for your main gameplay script
6. Make changes under `src/index.ts` if you want to add new scene

## CLI

In `package.json` file and section `scripts` listed handy commands to help your development process. You can add more if needed.

| script | details |
| ------ | ------- |
| `npm run dev` | Start your development server in port 8080 (if available), also notice that folder `src/assets` is served as public static folder
| `npm run build` | Build your project into `dist/` folder
| `npm run dist` | Run static server from your `dist/` folder

## ESlint

For update [eslint rules](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin/docs/rules)
