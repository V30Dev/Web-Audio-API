// 1) ELEMENT SELECTION AND VARIABLES
const song = document.querySelector("#song");
const playButton = document.querySelector("#playButton");
const volumeControl = document.querySelector("#volume");
const canvas = document.querySelector("#canvas");
const songSelection = document.querySelector("#songselector");
let isAnimating = false; //To pause the animation

// 2) CANVAS API SETUP
const ctx = canvas.getContext('2d');

// 3) WEB AUDIO API SETUP
const audioCtx = new AudioContext(); //Create new audio context
const track = audioCtx.createMediaElementSource(song); //Add source into context
const analyser = audioCtx.createAnalyser(); //Helps to get data from our track

// 4) ANALYSER SETUP (to create graphics)
analyser.fftSize = 2048; //Fourier fast transform (# of samples)
const bufferLength = analyser.frequencyBinCount; //usually is half of the # of samples 
const dataArray = new Uint8Array(bufferLength);

// 5) MODIFICATION NODES (optional)
const gainNode = audioCtx.createGain() //Node to manage the volume

// 6) NODES CONNECTION
//We must connect the track to the destination to return the sound after transformations
//Source -> Modification (nodes) -> Destination
track.connect(analyser).connect(gainNode).connect(audioCtx.destination)

// 7) EVENT LISTENERS
//Play and pause feature
playButton.addEventListener("click", ()=>{

    if(playButton.dataset.playing === 'false'){
        gainNode.gain.value = volumeControl.value; //Adjust gain before play song
        song.play();        
        playButton.src = "../assets/icons/pause.png";
        playButton.dataset.playing = 'true';
    }else{
        song.pause();
        playButton.src = "../assets/icons/play.png";
        playButton.dataset.playing = 'false';        
    }

})

//Volume control feature
volumeControl.addEventListener('input', () => {
    gainNode.gain.value = volumeControl.value; //Adjust volume with gain node
})

//Reset some values and images when song ends
song.addEventListener('ended', () => {
    playButton.dataset.playing = 'false'
    playButton.src = "../assets/icons/play.png"    
})

//
song.addEventListener('pause', () => {
    isAnimating = false;
})

//
song.addEventListener('play', () => {
    audioCtx.resume().then(()=> {
        isAnimating = true;
        //draw();
        //drawWave();
        drawCircles();
        //bouncingBall();
    })
})

// 7) ANIMATIONS

//Ball variables
let xball = 40;
let yball = 50;
let xspeed = 5;
let yspeed = 5;
let rball = 35;

const bouncingBall = () => {
    if(!isAnimating) return;
    //ctx.clearRect(0, 0, canvas.width, canvas.height); //Clear the canvas

    ctx.beginPath() //to initialize a path;
    ctx.arc(xball, yball, rball, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "#aaf"
    ctx.fill();

    if(xball > canvas.width || xball < 0){
        xspeed*=(-1);        
    }
    if(yball > canvas.height || yball < 0){
        yspeed*=(-1);        
    }

    xball += xspeed;
    yball += yspeed;



    requestAnimationFrame(bouncingBall)

}

const draw = () => {
    if(!isAnimating) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //analyser.getByteTimeDomainData(dataArray)
    analyser.getByteFrequencyData(dataArray);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for(let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i] + 25;
        
        const red = 50;
        const green = Math.min(255, barHeight + 50);
        const blue = Math.max(50, 255 - barHeight);

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight/2);

        x += barWidth+1
    }

    requestAnimationFrame(draw);
}

const drawCircles = () => {
    if(!isAnimating) return;
    ctx.clearRect(0,0, canvas.width, canvas.height);

    analyser.getByteFrequencyData(dataArray);

    const centerX = canvas.width/2;
    const centerY = canvas.height/2;

    for(let i = 0; i < bufferLength; i++){
        const radius = dataArray[i] + 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius / 2, 0, 2 * Math.PI);

        ctx.fillStyle = `rgb(${radius}, 50, 150)`;
        ctx.fill();
    }

    requestAnimationFrame(drawCircles);
}

const drawWave = () => {
    if(!isAnimating) return;
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

