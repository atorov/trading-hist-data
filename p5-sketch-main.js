const p5Main = new p5((sketch) => {
    const s = sketch

    const FRAME_RATE = 3

    const POINTER_OFFSET = 200 * 2

    // Must be less than POINTER_OFFSET / 2 and must be even number
    const HIST_DATA_CANDLES_CHUNK_WINDOW = 50

    let histData
    // let histDataMax
    // let histDataMin

    function drawSMA(data = [], win = 8, { strokeWeight = 1, color = [0, 127] } = {}) {
        let sma = []
        for (let i = 0; i < HIST_DATA_CANDLES_CHUNK_WINDOW; i++) {
            const chunk = i ? data.slice(-(i + win), -i) : data.slice(-(i + win))
            const element = chunk.reduce((acc, row) => acc + row[3], 0) / win
            sma = [element, ...sma]
        }
        // console.log(sma)

        for (let i = 0; i < sma.length; i++) {
            s.strokeWeight(strokeWeight)
            s.stroke(...color)
            s.noFill()
            s.line(
                i * (s.width / HIST_DATA_CANDLES_CHUNK_WINDOW) + (s.width / HIST_DATA_CANDLES_CHUNK_WINDOW / 2),
                (1 - sma[i]) * s.height,
                (i - 1) * (s.width / HIST_DATA_CANDLES_CHUNK_WINDOW) + (s.width / HIST_DATA_CANDLES_CHUNK_WINDOW / 2),
                (1 - sma[i - 1]) * s.height,
            )
        }
    }

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

        s.strokeWeight(1)
        s.stroke(0)
        s.noFill()
        s.rect(0, 0, s.width, s.height)

        // ---------------------------------------------------------------------
        s.noStroke()
        s.fill(127, 127, 127, 127)
        s.rect(s.width * (1 / 2), 0, s.width * (1 / 2), s.height)

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

                s.strokeWeight(1)
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

            // SMA -------------------------------------------------------------
            drawSMA(histDataChunk, 200, { strokeWeight: 8, color: [0, 127, 255, 63] })
            drawSMA(histDataChunk, 50, { strokeWeight: 5, color: [0, 127, 127, 63] })
            drawSMA(histDataChunk, 21, { strokeWeight: 3, color: [0, 63, 127, 63] })
            drawSMA(histDataChunk, 8, { strokeWeight: 2, color: [0, 127] })
            drawSMA(histDataChunk, 8, { strokeWeight: 2, color: [0, 127] })

            // Last known
            // TODO: ...

            // -----------------------------------------------------------------
            // s.noLoop()
        }
        else {
            s.noLoop()
        }
    }
}, 'p5-main')

window.p5Main = p5Main;
