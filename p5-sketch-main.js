const p5Main = new p5((sketch) => {
    const s = sketch

    s.setup = () => {
        s.createCanvas(800, 600)
    }

    s.draw = async () => {}
}, 'p5-main')

window.p5Main = p5Main;
