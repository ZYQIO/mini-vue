import { App } from './App.js'
import { createRenderer } from '../../lib/guide-mini-vue.esm.js'

console.log(PIXI);

const game = new PIXI.Application({
    width: 500,
    height: 500
});

console.log('game', game);

document.body.appendChild(game.view)

const renderer = createRenderer({
    createElement(type) {
        console.log('createElement-->', type);
        if (type === 'rect') {
            const rect = new PIXI.Graphics()
            rect.beginFill(0xff0000)
            rect.drawRect(0, 0, 100, 100)
            rect.endFill()

            return rect;
        }
    },
    patchProp(el, key, val) {
        el[key] = val
    },
    insert(el, parent) {
        parent.addChild(el)
    }
})

renderer.createApp(App).mount(game.stage)
