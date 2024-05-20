const letters = document.querySelectorAll('.letter');
const loadingDiv = document.querySelector('.info-bar');
const replayBtn = document.querySelector('.replay');
const answerLength = 5;
const rounds = 6;

async function init() {
    let currentGuess = ''
    let currentRow = 0;
    let isLoading = true;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1")
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split("");
    let done = false;
    setLoading(false);
    isLoading = false;

    function addLetter(letter) {
        if (currentGuess.length < answerLength) {
            // add letter to the end
            currentGuess += letter;
        } else {
            // replace last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[answerLength * currentRow + currentGuess.length -1].innerText = letter;
    }
    async function commit(){
        if (currentGuess.length !== answerLength) {
            // do nothing
            return;
        }


        // TODO validate word
        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({ word: currentGuess })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;

        isLoading = false;
        setLoading(false);

        if (!validWord) {
            markInvalid();
            return;
        }

        // TODO do all the marking as "correct" "close" or "wrong"

        const guessParts = currentGuess.split("");
        const map = makeMap(wordParts);


        for (let i =0; i< answerLength; i++) {
            // mark as correct
            if (guessParts[i] === wordParts[i]) {
                letters[currentRow * answerLength + i].classList.add("correct");
                map[guessParts[i]]--;
            }
        }

        for (let i = 0; i < answerLength; i++) {
            if (guessParts[i] === wordParts[i]) {
                // do nothing, we already did it
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
                //mark as close
                letters[currentRow * answerLength + i].classList.add("close");
                map[guessParts[i]]--;
            } else {
                letters[currentRow * answerLength + i].classList.add("wrong");
            }
        }
        // TODO did they win or lose?
        currentRow++

        if (currentGuess === word) {
            document.querySelector(".brand").classList.add("winner");
            done = true;
            return;
        } else if (currentRow === rounds) {
            alert('You lose, the word was '+ word + '.');
            done = true;
        }
        currentGuess = ''
    }

    function backspace(){
        currentGuess = currentGuess.substring(0, currentGuess.length -1)
        letters[answerLength * currentRow + currentGuess.length].innerText = ''
    }

    function markInvalid() {
        // alert("Not a valid word");


        for (let i = 0; i < answerLength; i++) {
            letters[currentRow * answerLength + i].classList.remove("invalid");

            setTimeout(function () {
                letters[currentRow * answerLength + i].classList.add("invalid"); 
            }, 10);
        }
    }

    document.addEventListener('keydown', function handleKeyPress(event) {
        if (done|| isLoading) {
            //do nothing
            return;
        }


        const action = event.key;

        if (action === 'Enter') {
            commit();
        }
        else if (action === "Backspace") {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase())
        } else {
            // do nothing
        }

    })
}

function isLetter(letter){
    return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
    loadingDiv.classList.toggle('show', isLoading);
}

function makeMap (array) {
    const obj = {};
    for (let i =0; i<array.length; i++) {
        const letter = array[i]
        if (obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }
    return obj;
}
init();