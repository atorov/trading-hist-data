const p5Main = new p5((sketch) => {
    const s = sketch

    const FRAME_RATE = 0.60

    const POINTER_OFFSET = 200 * 2

    const HIST_DATA_CANDLES_CHUNK_WINDOW = 84 // Must be less than POINTER_OFFSET / 2

    let histData
    // let histDataMax
    // let histDataMin

    s.preload = () => {
        histData = window.histDataString
            .split('\n')
            .map(
                (row) => row.split(';')
                    .filter((col, colIdx) => colIdx && colIdx !== 5)
                    .map((el) => +el),
            )
        // console.log(':::', histData)

        // const allElements = histData.reduce((acc, val) => [...acc, ...val], [])
        // histDataMin = Math.min(...allElements)
        // histDataMax = Math.max(...allElements)
        // console.log(':::', histDataMin, histDataMax)

        // histData = histData.map((row) => row.map((el) => (el - histDataMin) / (histDataMax - histDataMin)))
        // console.log(':::', histData)
    }

    s.setup = () => {
        s.createCanvas(1200, 800)
        s.frameRate(FRAME_RATE)
    }

    s.draw = async () => {
        // ---------------------------------------------------------------------
        s.background(255)

        s.stroke(0)
        s.noFill()
        s.rect(0, 0, s.width, s.height)

        // ---------------------------------------------------------------------
        s.noStroke()
        s.fill(127, 127, 127, 127)
        s.rect(s.width * (3 / 4), 0, s.width * (1 / 4), s.height)

        // ---------------------------------------------------------------------
        const histDataPointer = s.frameCount + POINTER_OFFSET
        if (histDataPointer < histData.length - POINTER_OFFSET) {
            let histDataChunk = histData.slice(histDataPointer, histDataPointer + POINTER_OFFSET)
            const allChunkElements = histDataChunk.reduce((acc, val) => [...acc, ...val], [])
            const histDataChunkMin = Math.min(...allChunkElements)
            const histDataChunkMax = Math.max(...allChunkElements)
            // console.log(histDataChunkMin, histDataChunkMax)
            histDataChunk = histDataChunk.map((row) => row.map((el) => (el - histDataChunkMin) / (histDataChunkMax - histDataChunkMin)))
            // console.log(histDataChunk)

            // Candles ---------------------------------------------------------
            const histDataCandlesChunk = histDataChunk.slice(-HIST_DATA_CANDLES_CHUNK_WINDOW)
            // console.log(histDataCandlesChunk)
            for (let i = 0; i < histDataCandlesChunk.length; i++) {
                const open = histDataCandlesChunk[i][0]
                const high = histDataCandlesChunk[i][1]
                const low = histDataCandlesChunk[i][2]
                const close = histDataCandlesChunk[i][3]

                const color = open > close ? [255, 0, 0] : [0, 255, 0]

                s.stroke(127)
                s.line(
                    i * (s.width / histDataCandlesChunk.length) + (s.width / histDataCandlesChunk.length / 2),
                    (1 - low) * s.height,
                    i * (s.width / histDataCandlesChunk.length) + (s.width / histDataCandlesChunk.length / 2),
                    (1 - high) * s.height,
                )

                s.fill(...color)
                s.rect(
                    i * (s.width / histDataCandlesChunk.length) + (s.width / histDataCandlesChunk.length / 8),
                    (1 - open) * s.height,
                    s.width / histDataCandlesChunk.length - (s.width / histDataCandlesChunk.length / 4),
                    (open - close) * s.height,
                )
            }

            // SMA 200 ---------------------------------------------------------
            // const sma200 = histDataChunk
            // .slice()
            // .reduce((acc, row) => acc + row[3], 0) / POINTER_OFFSET
            // console.log(sma200)
        }
        else {
            s.noLoop()
        }
    }
}, 'p5-main')

window.p5Main = p5Main;
