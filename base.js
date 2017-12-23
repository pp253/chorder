const basicChords = {
  '': ['1', '+3', '5'],
  'm': ['1', '-3', '5'],
  '<sup>7</sup>': ['1', '+3', '5', '-7'],
  'maj<sup>7</sup>': ['1', '+3', '5', '+7'],
  'm<sup>7</sup>': ['1', '-3', '5', '-7']
}

const musicMode = {
  'Ionian': [1, 3, 5, 6, 8, 10, 12],
  'Dorian': [1, 3, 4, 6, 8, 10, 11],
  'Phrygian': [1, 2, 4, 6, 8, 9, 11],
  'Lydian': [1, 3, 5, 7, 8, 10, 12],
  'Mixolydian': [1, 3, 5, 6, 8, 10, 11],
  'Aeolian': [1, 3, 4, 6, 8, 9, 11],
  'Locrian': [1, 2, 4, 6, 7, 9, 11]
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

/**
 * How to notate a legal degree?
 * 例如小三度就是 `-3`，大三度是 `+3`。而純五度可以寫 `=5`，或直接寫成 `5`。
 * 純 = (可以省略)
 * 大 +
 * 小 -
 * 增 ++
 * 減 --
 * 倍增 +++
 * 倍減 ---
 */
const musicIntervalRegExp = /([=+-]*)(\d+)/

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
 * Transfer note (in half) that > 12 to 1 to 12.
 * @param {number} note A note Integer from 1 to \infty
 */
function toLegalNote (note) {
  if (typeof note !== 'number') {
    console.error('Note should be a number!')
  }
  return (note - 1) % 12 + 1
}

/**
 * Transfer degree that >= 8 to 1 to 7 degree.
 * @param {number} interval
 */
function toLegalInterval (interval) {
  if (typeof interval !== 'number') {
    console.error('Interval should be a number!')
  }
  return (interval - 1) % 7 + 1
}

/**
 * Get the note based on the tone and degree you gave.
 * @param {number} tone The tone of the music.
 * @param {string} degree The degree of the target note.
 */
function toNoteByDegree (tone, degree) {
  if (typeof tone !== 'number' || typeof degree !== 'string') {
    console.error('Tone should be a number and Degree should be a string!')
  }
  let [, quality, num] = musicIntervalRegExp.exec(degree)
  num = parseInt(num)
  let half = 0
  let qualityToHalf = musicIntervalQuality[quality]

  if (![1, 4, 5, 8].includes(toLegalInterval(num))) {
    if (qualityToHalf > 0) {
      qualityToHalf -= 1
    }
  }
  half = musicInterval[toLegalInterval(num)] + 12 * parseInt((num - 1) / 8) + qualityToHalf
  return toLegalNote(tone + half)
}

/**
 * Compare two notes whether they are the same.
 * Note that '#F' is equal to 'bG', and so on.
 * @param {number} note Note1
 * @param {number} tone Note2's tone
 * @param {string} degree Note2's degree
 */
function equalNote (note, tone, degree) {
  if (typeof note !== 'number') {
    console.error('Note should be a number!')
  }
  if (typeof tone !== 'number' || typeof degree !== 'string') {
    console.error('Tone should be a number and Degree should be a string!')
  }
  return toLegalNote(note) === toNoteByDegree(tone, degree)
}

/**
 * Get the half distance between Note1 and Note2.
 * Note that the distance will given in a range, for instance,
 * -13 will be given in -1 (-13 % 12).
 * @param {number} note1 Note1's pitch (in half)
 * @param {number} note2 Note2's pitch (in half)
 */
function noteHalfDistance (note1, note2) {
  if (typeof note1 !== 'number' || typeof note2 !== 'number') {
    console.error('Note1 and Note2 should be numbers!')
  }
  let k = note2 - note1
  if (k > 3) {
    return (k - 12) % 12
  } else if (k >= -3) {
    return k % 12
  } else {
    return (k + 12) % 12
  }
}

/**
 * Return the right signature (#, b) in abc notation by the given distance.
 * `1` will return `^`, `-2` will return `__` and `0` will return `=`.
 * @param {number} distance Distance between the flat note and the target note. From -3 to 3.
 */
function toSignature (distance) {
  if (typeof distance !== 'number') {
    console.error('Distance should be a number!')
  }
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

/**
 * Return the solfege of the given Note. The using of sharp or flat sign will depends
 * on the Ionian mode.
 * @param {*} tone Note's tone
 * @param {*} degree Note's degree
 * @returns {string} the abc notation of a note
 */
function toSolfege (tone, degree) {
  if (typeof tone !== 'number' || typeof degree !== 'string') {
    console.error('Tone should be a number and Degree should be a string!')
  }
  const modeFirstNote = {
    1: 'C',
    2: '^C',
    3: 'D',
    4: '_E',
    5: 'E',
    6: 'F',
    7: '^F',
    8: 'G',
    9: '_A',
    10: 'A',
    11: '_B',
    12: 'B'
  }
  let [, , toneSolfege] = solfegeRegExp.exec(modeFirstNote[tone])
  toneSolfege.toUpperCase()
  let [, , num] = musicIntervalRegExp.exec(degree)
  num = toLegalInterval(parseInt(num))

  let targetSolfege = musicSecondeSort[toLegalInterval(musicSecondeSort.indexOf(toneSolfege) + num) - 1]

  let noteShouldBe = musicSeconde[targetSolfege]
  let noteActuallyBe = toNoteByDegree(tone, degree)
  let targetSignature = toSignature(noteHalfDistance(noteShouldBe, noteActuallyBe))

  return targetSignature + targetSolfege
}

/**
 * Return the solfege of a given note by mapping.
 * @param {number} note Note
 */
function toSolfegeByNote (note) {
  if (typeof note !== 'number') {
    console.error('Note should be a number!')
  }
  const solfegeByNote = {
    1: 'C',
    2: '^C',
    3: 'D',
    4: '_E',
    5: 'E',
    6: 'F',
    7: '^F',
    8: 'G',
    9: '^G',
    10: 'A',
    11: '_B',
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

let weightMatrix = makeInitialWeightMatrix() // or `= initialWeightMatrix`

/**
 * For ML, return an array with the right corresponding index by the given notes.
 * @param {Array} notes An array of note.
 */
function toNoteArray (notes) {
  if (!(notes instanceof Array)) {
    console.error('Notes should be an array!')
  }
  let notesArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (let note of notes) {
    notesArray[toLegalNote(note) - 1] = 1
  }
  return notesArray
}

/**
 * For ML, return an array with the right corresponding index by the given tone and chord.
 * @param {number} tone
 * @param {string} chord
 */
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

/**
 * For ML, we need to know the index of a chord so as to make
 * a output matrix with right sorting.
 * @param {string} chord The name of a chord
 */
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

/**
 * For ML, to get a expected outcome array.
 * @param {number} tone The tone
 * @param {string} chord The name of a chord
 */
function toChordArray (tone, chord) {
  if (typeof tone !== 'number' || (typeof chord !== 'string')) {
    console.error('Tone should be a number and Chord should be a string!')
  }
  let chordArray = []
  chordArray[(getChordIndex(chord) * 12) + tone - 1] = 1
  return chordArray
}

/**
 * The core of the ML.
 * @param {[number]} notes
 * @param {number} tone
 * @param {string} chord
 */
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
    let nOut = 1 / (1 + Math.exp(-nIn)) // Sigmoid Function
    let y = expectedChordArray[count] ? 1 : 0
    for (let i = 0; i < 12; i++) {
      weight[i] = weight[i] - learningRate * (nOut - y) * notes[i] // Gradient descent
    }
    count++
  }
}

/**
 * Using the weight matrix to get the possible chords.
 * @param {[number]} notes The input notes
 */
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
    let nOut = 1 / (1 + Math.exp(-nIn)) // Sigmoid Function
    predictChordArray.push(nOut)
  }
  return predictChordArray
}

/**
 * Sort the predict chord array by the score of each tone-chord.
 * @param {[number]} predictChordArray
 */
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

// DOM Handling

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

  document.getElementById(`chord-name-${id}`).innerHTML = name
  document.getElementById(`chord-notes-${id}`).innerHTML = ''
  window.ABCJS.renderAbc(document.getElementById(`chord-notes-${id}`), abcstring, null, engraverParams)
}

function toReadableChordName (tone, chord) {
  if (tone.includes('^')) {
    tone = '<sup>♯</sup>' + tone.replace('^', '')
  } else if (tone.includes('_')) {
    tone = '<sup>♭</sup>' + tone.replace('_', '')
  } else if (tone.includes('=')) {
    tone = tone.replace('=', '')
  }
  return tone + chord
}

function toReadableSolvege (solfege) {
  return solfege.replace(/=/, '')
}

function drawChord (id, tone, chord) {
  let chordString = ''
  for (let degree of basicChords[chord]) {
    chordString += toReadableSolvege(toSolfege(tone, degree))
  }

  drawNotes(id, toReadableChordName(toSolfege(tone, '1'), chord), chordString)
}

function triggerFind (notes) {
  let st = Date.now()
  let predict = sortTheResult(findChords(toNoteArray(notes)))
  let et = Date.now()
  console.log('Sort the result:', et - st, 'ms')
  for (let i = 0; i < 3; i++) {
    drawChord(i + 1, predict[i].tone, predict[i].chord)
  }
}

function updateUserChord (notes) {
  let chordString = ''
  for (let note of notes) {
    chordString += toSolfegeByNote(note)
  }
  drawNotes('user', 'You played', chordString)
}

function main () {
  // Learning
  let startTime = Date.now()
  for (let k = 1; k <= 100; k++) {
    for (let tone = 1; tone <= 12; tone++) {
      for (let chord in basicChords) {
        learningChords(toNoteArrayByChord(tone, chord), tone, chord)
      }
    }
  }
  let endTime = Date.now()

  console.log('Supported Chords:', basicChords)
  console.log('Learning Rate:', learningRate)
  console.log('Learning Times:', 100, 'round')
  console.log('Learning Duration:', endTime - startTime, 'ms')
}
main()

let userNotes = []

$.when($.ready).then(() => {
  $('#help-input').click(function () {
    $('#help-section').toggle()
    $(this).text(function (_, text) {
      return text === 'HELP' ? 'CLOSE' : 'HELP'
    })
  })

  $('#clear-input').click(() => {
    userNotes = []
    updateUserChord(userNotes)
  })

  $('#delete-input').click(() => {
    userNotes.pop()
    triggerFind(userNotes)
    updateUserChord(userNotes)
  })

  let list = ['c', 'c-sharp', 'd', 'd-sharp', 'e', 'f', 'f-sharp', 'g', 'g-sharp', 'a', 'a-sharp', 'b']
  for (let i = 0; i < 12; i++) {
    $(`#piano-key-${list[i]}`).click(function () {
      if (!userNotes.includes(i + 1)) {
        userNotes.push(i + 1)
        triggerFind(userNotes)
        updateUserChord(userNotes)
      }
    })
  }
})
