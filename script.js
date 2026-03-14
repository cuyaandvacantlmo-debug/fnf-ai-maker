// Setup Audio Samplers
const bfVocal = new Tone.Sampler().toDestination();
const oppVocal = new Tone.Sampler().toDestination();
const backingBeat = new Tone.Player().toDestination();

// AI Effects: Bitcrusher makes voices sound like a digital game
const bitcrush = new Tone.BitCrusher(4).toDestination();
bfVocal.connect(bitcrush);
oppVocal.connect(bitcrush);

let recorder, chunks = [];

async function startRecording(target) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    chunks = [];
    
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        if(target === 'bf') {
            bfVocal.add("C4", url);
            document.getElementById('status-bf').innerText = "✅ LOADED";
        } else {
            oppVocal.add("C4", url);
            document.getElementById('status-opp').innerText = "✅ LOADED";
        }
    };
    
    recorder.start();
    document.getElementById(`status-${target}`).innerText = "🎤 RECORDING...";
    setTimeout(() => recorder.stop(), 1000); // 1 second recording
}

async function startAISong() {
    await Tone.start(); // Start audio context
    const genre = document.getElementById('genre').value;
    
    // Load the beat based on genre selection
    backingBeat.load(`./assets/sounds/${genre}.mp3`, () => {
        backingBeat.loop = true;
        backingBeat.start();
        
        // AI CHANGER: Generates a random pattern every 4th note
        Tone.Transport.scheduleRepeat((time) => {
            const scale = ["C4", "Eb4", "F4", "G4", "Bb4"]; // FNF Melodic Scale
            let randomNote = scale[Math.floor(Math.random() * scale.length)];
            
            if (Math.random() > 0.5) {
                bfVocal.triggerAttackRelease(randomNote, "8n", time);
            } else {
                oppVocal.triggerAttackRelease(randomNote, "8n", time);
            }
        }, "4n");
        
        Tone.Transport.start();
    });
}

