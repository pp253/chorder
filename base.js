/**
 * 純 = (可以省略)
 * 大 +
 * 小 -
 * 增 ++
 * 減 --
 * 倍增 +++
 * 倍減 ---
 * 例如小三度就是 `-3`，大三度是 `+3`。而純五度可以寫 `=5`，或直接寫成 `5`。
 */

const basicChords = {
  '': ['1', '+3', '5'],
  'm': ['1', '-3', '5'],
  '^7': ['1', '+3', '5', '-7'],
  'maj7': ['1', '+3', '5', '+7'],
  'm7': ['1', '-3', '5', '-7']
}

const musicInterval = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11,
  8: 0
}

const musicIntervalQuality = {
  '': 0,
  '=': 0,
  '+': 1,
  '++': 2,
  '+++': 3,
  '-': -1,
  '--': -2,
  '---': -3
}

/**
 * from 1~\infty to 1-12
 * @param {number} note A note Integer from 1 to \infty
 */
function toLegalNote (note) {
  return (note - 1) % 12 + 1
}

function toLegalNumber (num) {
  return (num - 1) % 7 + 1
}

function toNote (tone, degree) {
  const musicIntervalRegExp = /([=+-]*)(\d+)/
  let [_, quality, num] = musicIntervalRegExp.exec(degree)
  num = parseInt(num)
  let half = 0
  let qualityToHalf = musicIntervalQuality[quality]

  if (![1, 4, 5, 8].includes(toLegalNumber(num))) {
    if (qualityToHalf > 0) {
      qualityToHalf -= 1
    }
  }
  half = musicInterval[toLegalNumber(num)] + 12 * parseInt((num - 1) / 8) + qualityToHalf
  return toLegalNote(tone + half)
}

function equalNote (note, tone, degree) {
  return toLegalNote(note) === toNote(tone, degree)
}

// Try on ML
const initialWeightMatrix = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]
const learningRate = 0.05

function makeInitialWeightMatrix () {
  let newWeightMatrix = []
  for (let chord in basicChords) {
    for (let tone = 1; tone <= 12; tone++) {
      let newArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      newArray.chord = chord
      newArray.tone = tone
      newWeightMatrix.push(newArray)
    }
  }
  return newWeightMatrix
}

let weightMatrix = makeInitialWeightMatrix()

function toNoteArray (notes) {
  let newArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (let note of notes) {
    newArray[note - 1] = 1
  }
  return newArray
}

function toNoteArrayByChord (tone, chord) {
  let notes = []
  for (let degree of basicChords[chord]) {
    notes.push(toNote(tone, degree))
  }
  return toNoteArray(notes)
}

function getChordIndex (chord) {
  let chordIndex = 0
  for (let i in basicChords) {
    if (i === chord) {
      break
    }
    chordIndex++
  }
  return chordIndex
}

function toChordArray (tone, chord) {
  let newArray = []
  let chordIndex = 0
  for (let i in basicChords) {
    if (i === chord) {
      break
    }
    chordIndex++
  }
  newArray[(chordIndex * 12) + tone - 1] = 1
  return newArray
}

function learningChords (notes, tone, chord) {
  let expectedChordArray = toChordArray(tone, chord)
  let count = 0
  for (let weight of weightMatrix) {
    let nIn = 0
    for (let i = 0; i < 12; i++) {
      nIn += (0 + !!notes[i]) * (weight[i])
    }
    let nOut = 1 / (1 + Math.exp(-nIn))
    let y = expectedChordArray[count] ? 1 : 0
    for (let i = 0; i < 12; i++) {
      weight[i] = weight[i] - learningRate * (nOut - y) * notes[i]
    }
    count++
  }
}

function findChords (notes) {
  if (!notes) {
    return []
  }
  let predictChordArray = []
  for (let weight of weightMatrix) {
    let nIn = 0
    for (let i = 0; i < 12; i++) {
      nIn += (0 + !!notes[i]) * (weight[i])
    }
    let nOut = 1 / (1 + Math.exp(-nIn))
    predictChordArray.push(nOut)
  }
  return predictChordArray
}

function sortTheResult (predictChordArray) {
  let predictChordArrayWithText = []
  for (let chord in basicChords) {
    for (let tone = 1; tone <= 12; tone++) {
      predictChordArrayWithText.push({
        tone: tone,
        chord: chord,
        score: predictChordArray[getChordIndex(chord) * 12 + tone - 1]
      })
    }
  }
  predictChordArrayWithText.sort((a, b) => {
    return b.score - a.score
  })
  return predictChordArrayWithText
}

for (let k = 1; k <= 100; k++) {
  for (let tone = 1; tone <= 12; tone++) {
    for (let chord in basicChords) {
      learningChords(toNoteArrayByChord(tone, chord), tone, chord)
    }
  }
}

console.log(weightMatrix)

console.log('PREDICT!!')
for (let tone = 1; tone <= 12; tone++) {
  for (let chord in basicChords) {
    let predict = sortTheResult(findChords(toNoteArrayByChord(tone, chord)))
    console.log(tone + chord, predict[0].tone + predict[0].chord, predict[1].tone + predict[1].chord, predict[2].tone + predict[2].chord)
  }
}
