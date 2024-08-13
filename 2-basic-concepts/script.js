//Element selection
const audio = document.querySelector('#audio');
const playButton = document.querySelector('#playButton')
const volumeControl = document.querySelector('#volume')
const canvas = document.querySelector('#canvas')

//CANVAS API SETUP
//Create Canvas context
const ctx = canvas.getContext("2d")


//WEB AUDIO API SETUP
//1. Create the audio context
const audioCtx = new AudioContext();
//2. Put the source inside the context
const track = audioCtx.createMediaElementSource(audio)
//3. Create an analyser for our context to extract data
const analyser = audioCtx.createAnalyser();

analyser.fftSize = 1024;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength)

//Modification Nodes
const gainNode = audioCtx.createGain()

//We must connect the track to the destination to return the sound after the processing
//Source -> Modification (nodes) -> Destination
track.connect(analyser).connect(gainNode).connect(audioCtx.destination)



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

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //analyser.getByteTimeDomainData(dataArray)
    analyser.getByteFrequencyData(dataArray);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for(let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i];
        
        ctx.fillStyle = `rgb(${barHeight + 100}, 0, 150)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight/2);

        x += barWidth+1
    }

    requestAnimationFrame(draw);
}

const drawWave = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    analyser.getByteTimeDomainData(dataArray)

    ctx.lineWidth = 3;    

    ctx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for(let i = 0; i < bufferLength; i++){
        const v = dataArray[i] / 128.0;
        const y = (v*canvas.height) / 2

        ctx.strokeStyle = `rgb(${ dataArray[i] + 50}, 0, 200)`

        if(i === 0){
            ctx.moveTo(x,y)
        }else{
            ctx.lineTo(x,y)
        }

        x += sliceWidth
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    requestAnimationFrame(drawWave)
}

audio.addEventListener('play', () => {
    audioCtx.resume().then(()=> {
        //draw()
        drawWave()
    })
})