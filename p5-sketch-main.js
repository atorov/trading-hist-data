const p5Main = new p5((sketch) => {
    const s = sketch

    const FRAME_RATE = 60

    const POINTER_OFFSET = 400

    // Must be less than POINTER_OFFSET and must be even number
    const HIST_DATA_CHART_CHUNK_WINDOW = 120

    let histData
    // let histDataMax
    // let histDataMin

    function drawSMA(data = [], win = 8, { strokeWeight = 1, color = [0, 127] } = {}) {
        const sma = []
        for (let i = 0; i < data.length; i++) {
            const element = data.slice(i - win + 1, i + 1).reduce((acc, row) => acc + row[3], null) / win
            sma.push(element)
        }
        // console.log(':::', sma)

        const idxOffset = sma.length - HIST_DATA_CHART_CHUNK_WINDOW
        for (let i = 0; i < HIST_DATA_CHART_CHUNK_WINDOW; i++) {
            s.strokeWeight(strokeWeight)
            s.stroke(...color)
            s.noFill()
            s.line(
                (i - 1) * (s.width / HIST_DATA_CHART_CHUNK_WINDOW) + (s.width / HIST_DATA_CHART_CHUNK_WINDOW / 2),
                (1 - sma[idxOffset + i - 1]) * s.height,
                i * (s.width / HIST_DATA_CHART_CHUNK_WINDOW) + (s.width / HIST_DATA_CHART_CHUNK_WINDOW / 2),
                (1 - sma[idxOffset + i]) * s.height,
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
        // console.log(':::', histData.length)

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
        const histDataPointer = s.frameCount - 1
        if (histDataPointer < histData.length - POINTER_OFFSET) {
            let histDataChunk = histData.slice(histDataPointer, histDataPointer + POINTER_OFFSET)
            const allChunkElements = histDataChunk.reduce((acc, val) => [...acc, ...val], [])
            const histDataChunkMin = Math.min(...allChunkElements)
            const histDataChunkMax = Math.max(...allChunkElements)
            // console.log(':::', histDataChunkMin, histDataChunkMax)
            histDataChunk = histDataChunk.map((row) => row.map((el) => (el - histDataChunkMin) / (histDataChunkMax - histDataChunkMin)))
            // console.log(':::', histDataChunk)

            // Candles ---------------------------------------------------------
            const histDataCandlesChunk = histDataChunk.slice(-HIST_DATA_CHART_CHUNK_WINDOW)
            // console.log(':::', histDataCandlesChunk)
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
            drawSMA(histDataChunk, 24, { strokeWeight: 3, color: [0, 63, 127, 63] })
            drawSMA(histDataChunk, 8, { strokeWeight: 2, color: [0, 127] })

            // Last known ------------------------------------------------------
            const lastKnownClosePointer = histDataChunk.length - HIST_DATA_CHART_CHUNK_WINDOW / 2 - 1
            // console.log(':::', lastKnownPointer)
            const lastKnownClose = histDataChunk[lastKnownClosePointer][3]
            // console.log('::: Last known close:', Math.round(lastKnownClose * 100) / 100)
            s.strokeWeight(1)
            s.stroke(255, 0, 127)
            s.line(
                0,
                (1 - lastKnownClose) * s.height,
                s.width / 2,
                (1 - lastKnownClose) * s.height,
            )

            // Past close average ----------------------------------------------
            const pastCloseAverage = histDataChunk
                .slice(lastKnownClosePointer - HIST_DATA_CHART_CHUNK_WINDOW / 2, lastKnownClosePointer)
                .reduce((acc, row) => acc + row[3], null) / (HIST_DATA_CHART_CHUNK_WINDOW / 2)
            // console.log('::: Past close average:', Math.round(pastCloseAverage * 100) / 100)
            s.strokeWeight(2)
            s.stroke(127, 0, 255, 127)
            s.line(
                0,
                (1 - pastCloseAverage) * s.height,
                s.width / 2,
                (1 - pastCloseAverage) * s.height,
            )

            // Future close average --------------------------------------------
            const futureCloseAverage = histDataChunk.slice(lastKnownClosePointer + 1).reduce((acc, row) => acc + row[3], 0) / (HIST_DATA_CHART_CHUNK_WINDOW / 2)
            // console.log('::: Future close average:', Math.round(futureCloseAverage * 100) / 100)
            s.strokeWeight(2)
            s.stroke(127, 0, 255, 127)
            s.line(
                s.width / 2,
                (1 - futureCloseAverage) * s.height,
                s.width,
                (1 - futureCloseAverage) * s.height,
            )

            // -----------------------------------------------------------------
            console.log('::: frame:', s.frameCount)
            // console.log('------------------------------------------------')
            // s.noLoop()
        }
        else {
            s.noLoop()
        }
    }
}, 'p5-main')

window.p5Main = p5Main;
