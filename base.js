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
  '7': ['1', '+3', '5', '-7'],
  'maj7': ['1', '+3', '5', '+7'],
  'm7': ['1', '-3', '5', '-7']
}

const musicMode = {
  'Iolian': [1, 3, 5, 6, 8, 10, 12]
}

const musicSeconde = {
  'C': 1,
  'D': 3,
  'E': 5,
  'F': 6,
  'G': 8,
  'A': 10,
  'B': 12
}

const musicSecondeSort = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

const musicSignature = {
  '': 0,
  '=': 0,
  '^': 1,
  '^^': 2,
  '^^^': 3,
  '_': -1,
  '__': -2,
  '___': -3
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
  if (typeof note !== 'number') {
    console.error('Note should be a number!')
  }
  return (note - 1) % 12 + 1
}

function toLegalNumber (num) {
  if (typeof num !== 'number') {
    console.error('Number should be a number!')
  }
  return (num - 1) % 7 + 1
}

const musicIntervalRegExp = /([=+-]*)(\d+)/

function toNoteByDegree (tone, degree) {
  if (typeof tone !== 'number' || typeof degree !== 'string') {
    console.error('Tone should be a number and Degree should be a string!')
  }
  let [, quality, num] = musicIntervalRegExp.exec(degree)
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
  if (typeof note !== 'number') {
    console.error('Note should be a number!')
  }
  return toLegalNote(note) === toNoteByDegree(tone, degree)
}

function noteHalfDistance (note1, note2) {
  let k = note2 - note1
  if (k > 3) {
    return (k - 12) % 12
  } else if (k >= -3) {
    return k % 12
  } else {
    return (k + 12) % 12
  }
}

function toSignature (distance) {
  if (distance >= 0) {
    return {
      0: '=',
      1: '^',
      2: '^^',
      3: '^^^'
    }[distance]
  } else {
    return {
      1: '_',
      2: '__',
      3: '___'
    }[-distance]
  }
}

const solfegeRegExp = /([=_^]*)([A-Ga-g])/
function toSolfege (tone, degree) {
  const modeFirstNote = {
    1: 'C',
    2: '^C',
    3: 'D',
    4: '_E',
    5: 'E',
    6: 'F',
    7: '_G',
    8: 'G',
    9: '_A',
    10: 'A',
    11: '_B',
    12: 'B'
  }
  let [, toneSignature, toneSolfege] = solfegeRegExp.exec(modeFirstNote[tone])
  toneSolfege.toUpperCase()
  let [, quality, num] = musicIntervalRegExp.exec(degree)
  num = toLegalNumber(parseInt(num))

  let targetSolfege = musicSecondeSort[toLegalNumber(musicSecondeSort.indexOf(toneSolfege) + num) - 1]

  let noteShouldBe = musicSeconde[targetSolfege]
  let noteActuallyBe = toNoteByDegree(tone, degree)
  let targetSignature = toSignature(noteHalfDistance(noteShouldBe, noteActuallyBe))
  /*
  let toneHalf = toLegalNote(musicSeconde[toneSolfege] + musicSignature[toneSignature])
  let modeHalf = toneHalf + musicMode['Iolian'][num - 1] - 1
  console.log('noteHalfDistance', noteHalfDistance(noteShouldBe, noteActuallyBe))
  console.log('num:', num, musicSecondeSort.indexOf(toneSolfege), toLegalNumber(7 + num + musicSecondeSort.indexOf(toneSolfege)) - 1)
  console.log(modeHalf, noteActuallyBe, noteShouldBe)
  */
  return targetSignature + targetSolfege
}

function toSolfegeByNote (note) {
  if (typeof note !== 'number') {
    console.error('Note should be a number!')
  }
  const solfegeByNote = {
    1: 'C',
    2: '^C',
    3: 'D',
    4: '^D',
    5: 'E',
    6: 'F',
    7: '^F',
    8: 'G',
    9: '^G',
    10: 'A',
    11: '^A',
    12: 'B'
  }
  return solfegeByNote[toLegalNote(note)]
}

// Try on ML
const initialWeightMatrix = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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
  if (!(notes instanceof Array)) {
    console.error('Notes should be an array!')
  }
  let newArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (let note of notes) {
    newArray[note - 1] = 1
  }
  return newArray
}

function toNoteArrayByChord (tone, chord) {
  if (typeof tone !== 'number' || (typeof chord !== 'string')) {
    console.error('Tone should be a number and Chord should be a string!')
  }
  let notes = []
  for (let degree of basicChords[chord]) {
    notes.push(toNoteByDegree(tone, degree))
  }
  return toNoteArray(notes)
}

function getChordIndex (chord) {
  if (typeof chord !== 'string') {
    console.error('Chord should be a string!')
  }
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
  if (typeof tone !== 'number' || (typeof chord !== 'string')) {
    console.error('Tone should be a number and Chord should be a string!')
  }
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
  if (!(notes instanceof Array)) {
    console.error('Notes should be an array!')
  }
  if (typeof tone !== 'number' || (typeof chord !== 'string')) {
    console.error('Tone should be a number and Chord should be a string!')
  }
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
  if (!(notes instanceof Array)) {
    console.error('Notes should be an array!')
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
  if (!(predictChordArray instanceof Array)) {
    console.error('PredictChordArray should be and array!')
  }
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

function drawNotes (id, name = 'input', chordString) {
  let engraverParams = {}
  engraverParams.add_classes = true
  engraverParams.staffwidth = 90
  engraverParams.paddingtop = 0
  engraverParams.paddingright = 0
  engraverParams.paddingbottom = 0
  engraverParams.paddingleft = 0

  let abcstring = `X: 1
  L:1/1
  [${chordString}]`

  document.getElementById(`chord-name-${id}`).innerText = name
  document.getElementById(`chord-notes-${id}`).innerHTML = ''
  window.ABCJS.renderAbc(document.getElementById(`chord-notes-${id}`), abcstring, null, engraverParams)
}

function toReadableChordName (tone, chord) {
  return tone.replace('=', '').replace('^', '♯').replace('_', '♭') + chord
}

function drawChord (id, tone, chord) {
  let chordString = ''
  for (let degree of basicChords[chord]) {
    chordString += toSolfege(tone, degree)
  }

  drawNotes(id, toReadableChordName(toSolfege(tone, '1'), chord), chordString)
}

function triggerFind (notes) {
  let predict = sortTheResult(findChords(toNoteArray(notes)))
  for (let i = 0; i < 4; i++) {
    drawChord(i + 1, predict[i].tone, predict[i].chord)
  }
}

function main () {
  let startTime = Date.now()
  for (let k = 1; k <= 100; k++) {
    for (let tone = 1; tone <= 12; tone++) {
      for (let chord in basicChords) {
        learningChords(toNoteArrayByChord(tone, chord), tone, chord)
      }
    }
  }
  let endTime = Date.now()
  console.log('Learning Time:', endTime - startTime, 'ms')

  console.log('PREDICT!!')
  for (let tone = 1; tone <= 12; tone++) {
    for (let chord in basicChords) {
      let predict = sortTheResult(findChords(toNoteArrayByChord(tone, chord)))
      console.log(tone + chord, predict[0].tone + predict[0].chord, predict[1].tone + predict[1].chord, predict[2].tone + predict[2].chord)
    }
  }

  console.log('SOLVEGE!!')
  for (let tone = 1; tone <= 12; tone++) {
    let str = ''
    for (let degree = 1; degree <= 8; degree++) {
      str += toSolfege(tone, String(degree)) + ' '
    }
    console.log(tone, str)
  }
}
main()

let userNotes = []

$.when($.ready).then(() => {
  $('#clear-input').click(() => {
    userNotes = []
  })

  let list = ['c', 'c-sharp', 'd', 'd-sharp', 'e', 'f', 'f-sharp', 'g', 'g-sharp', 'a', 'a-sharp', 'b']
  for (let i = 0; i < 12; i++) {
    $(`#piano-key-${list[i]}`).click(function () {
      if (!userNotes.includes(i + 1)) {
        userNotes.push(i + 1)
        triggerFind(userNotes)
        console.log(userNotes)
      }
    })
  }
})
