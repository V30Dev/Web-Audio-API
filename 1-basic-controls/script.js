//Element selection
const audio = document.querySelector('#audio');
const playButton = document.querySelector('#playButton')
const volumeControl = document.querySelector('#volume')

//WEB AUDIO API SETUP
//Create the audio context to use the web audio API
const audioCtx = new AudioContext();
//Pass the source to the context, now the sound is available for the API
const track = audioCtx.createMediaElementSource(audio);

//Modification Nodes
const gainNode = audioCtx.createGain()


//We must connect the track to the destination to return the sound after the processing
//Source -> Modification (nodes) -> Destination
track.connect(gainNode).connect(audioCtx.destination)

//EVENT LISTENERS
playButton.addEventListener( "click", () => {    
    if(audioCtx.state === "suspended"){
        audioCtx.resume();
    }

    if(playButton.dataset.playing === "false"){
        audio.play();
        playButton.dataset.playing = 'true'
        playButton.src = "../assets/icons/pause.png"
    } else if(playButton.dataset.playing === "true"){
        audio.pause();
        playButton.dataset.playing = 'false'
        playButton.src = "../assets/icons/play.png"
    }    
})

volumeControl.addEventListener('input', () => {
    gainNode.gain.value = volumeControl.value
})

audio.addEventListener('ended', () => {
    playButton.dataset.playing = 'false'
    playButton.src = "../assets/icons/play.png"    
})


//console.log(playButton);