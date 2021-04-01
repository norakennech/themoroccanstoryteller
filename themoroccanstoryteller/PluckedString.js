
var recorder;
var myNoise;
var context = new AudioContext();
var delay = context.createDelay();
var feedback = new GainNode(context);
var biquadFilter = context.createBiquadFilter();
var Tone = new OscillatorNode(context);
Tone.start();

  let output = new GainNode(context);
  output.connect(context.destination);


  context.audioWorklet.addModule('worklet.js').then(() => {
      myNoise = new AudioWorkletNode(context,'noise-generator');

    });



  //set up call backs from interface
  Decay.oninput = function() {
    DecayLabel.innerHTML = this.value ;
  }
  Delay.oninput = function() {
    DelayLabel.innerHTML = this.value ;
  }
  Width.oninput = function() {
    WidthLabel.innerHTML = this.value;
  }
  Freq.oninput = function() {
    FreqLabel.innerHTML = this.value;
  }
  Source.oninput = function() {
    Tone.type = this.value;
  }
  Play.onclick = function() {
    context.resume();
    Tone.frequency.value = 800;

    delay.delayTime.value = Delay.value/1000;
    //delay.delayTime.value = 5/1000; //set delay time to 5 miliseconds
    //feedback.gain.value = 0.3; //gain feedback between 0-1 in this case 0.3 equivalent to saying 30% of the signal
    feedback.gain.value = Decay.value; //get feedback gain from slider
     let now = context.currentTime; //create now variable for current time

     //delay
     delay.delayTime.setValueAtTime(delay.delayTime.value,now); //set delay

     //feedback
     feedback.gain.value = 0.3;// give feedback a value  so a small part of the delayed signal is fed back into the delay module
     //gain variation for sound burst
     output.gain.setValueAtTime(1.0, now);//output.gain.linearRampToValueAtTime(0, now+2/1000); //linearRamp, decay over 2 mil. seconds
     output.gain.linearRampToValueAtTime(0, now+Width.value/1000); //linearRamp goes from 0 to the width value in miliseconds


     //connections
     Tone.connect(output);//connect tone to gain output that is connected to the context destination
     output.connect(Tone); //connect gain to tone
     delay.connect(output); //connect delay to output
     output.connect(delay); //connect gain to delay
     myNoise.connect(output); //connect noise to gain
     myNoise.connect(delay); //connect noise to delay
     delay.connect(feedback); //connect delay to feedback
     feedback.connect(delay); //connect feedback to delay
     feedback.connect(biquadFilter);
     biquadFilter.connect(output);

     //lowpass biquadFilter
     biquadFilter.type = 'lowpass';
     biquadFilter.frequency.value = Freq.value;
     biquadfilter.Q.value = -3.01 ; //set Q to -3.01 to avoid the boost to the signal near the cut-off frequency



  }

  // Recording
  recorder = new Recorder(output);
  Start.onclick = function() { recorder.record() }
  Stop.onclick = function() {
    recorder.stop();
    recorder.exportWAV(function(blob) {// create WAV download link using audio data blob
      var hf = document.createElement('a');
      hf.href = URL.createObjectURL(blob);
      hf.innerHTML = hf.download = new Date().toISOString() + '.wav';
      recordings.appendChild(hf);
    });
    recorder.clear();
  }
