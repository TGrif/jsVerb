/**
 * jsVerb
 *   JavaScript digital reverb
 *
 * @author TGrif 2015 - License MIT
 * https://github.com/TGrif/jsVerb
 */


class jsVerb {
  
  constructor (audioCtx) {
    
    this.audioCtx = audioCtx;
    
    this.irDirectory = '../ir/';
    this.irExtension = '.ogg';
    
    this.getIrConfig();
    
    
    this.dryGain = audioCtx.createGain();
    this.dryGain.gain.value = 0.25;
    
    this.wetGain = audioCtx.createGain();
    this.wetGain.gain.value = 0.75;
    
    this.convolver = audioCtx.createConvolver();
    
    this.analyser = audioCtx.createAnalyser();
    
    
    this.sampleRate = audioCtx.sampleRate;
    this.nbChannel = 2;
    this.nbChannelDispo = audioCtx.destination.channelCount;
    
    
    this.setList = [];
    this.reverbSet = {};
    
    this.currentSet = 0;
    this.currentBank = 0;
    
    this.computedReverse = false;
    
    this.power = false;
    this.bypass = false;
    
    this.destination = audioCtx.destination;
    
  }
  
  
  getIrConfig() {
    fetch(this.irDirectory + 'ir.json')
      .then(response => response.json())
      .then(config => {
        this.setList = Object.keys(config.reverbSet);
        this.reverbSet = config.reverbSet;
      }, err => console.error);
  }
  
  getCurrentSet() {
    if (!this.power) return;
    return this.setList[this.currentSet];
  }
  
  getSetLength() {
    return this.setList.length;
  }
  
  getCurrentSetLength() {
    return this.reverbSet[this.getCurrentSet()].length;
  }
  
  getCurrentBank() {
    if (!this.power) return;
    return this.reverbSet[this.getCurrentSet()][this.currentBank];
  }
  
  getDryGain() {
    return Math.round(this.dryGain.gain.value * 100);
  }
  
  setDryGain(value) {
    this.dryGain.gain.value = value / 100;
  }
  
  getWetGain() {
    return Math.round(this.wetGain.gain.value * 100);
  }
  
  setWetGain(value) {
    this.wetGain.gain.value = value / 100;
  }
  
  powerOnOff() {
    this.power = !this.power;
    if (this.power) this.loadReverb();
  }
  
  isPowered() {
    return this.power;
  }
  
  bypassOnOff() {
    if (!this.power) return;
    this.bypass = !this.bypass;
    if (this.bypass) {
      this.wetGain.disconnect();
    } else {
      this.wetGain.connect(this.destination);
    }
  }
  
  isBypassed() {
    return this.bypass;
  }
  
  preset() {  // TODO long press to save...
    if (!this.power) return;
    if (!window.localStorage)
      return console.error('Sorry, preset not supported.');
    var userPreset = window.localStorage.getItem('jsVerb');
    console.log('jsVerb - Loading userPreset:', userPreset);
  }
  
  isReversed() {
    return this.computedReverse;
  }
  
  reverse() {
    if (!this.power) return;
    this.computedReverse = !this.computedReverse;
    console.log('jsVerb - Reversed computed reverb:', this.computedReverse);
  }
  
  status() {  // TODO
    if (!this.power) return;
    var status = {
      set: this.getSetLength(),
      reversed: this.isReversed()
    }
    console.log('jsVerb - Status: ', status)
  }
  
  loadSet() {
    if (!this.power) return;
    this.currentBank = 0;
    if (this.setList.length - 1 == this.currentSet) {
      this.currentSet = 0;
    } else {
      this.setList[++this.currentSet];
    }
    this.loadReverb();
    console.info('jsVerb - Loading set:', this.getCurrentSet());
  }
  
  nextBank() {
    if (!this.power) return;
    if (this.getCurrentSetLength() === 1) return;
    if (this.currentBank === this.getCurrentSetLength() - 1) {
      this.currentBank = 0;
    } else {
      ++this.currentBank;
    }
    this.loadReverb();
    console.info('jsVerb - Loading next bank:', this.getCurrentBank())
  }
  
  previousBank() {
    if (!this.power) return;
    if (this.getCurrentSetLength() === 1) return;
    if (this.currentBank === 0) {
      this.currentBank = this.getCurrentSetLength() - 1;
    } else {
      --this.currentBank;
    }
    this.loadReverb();
    console.info('jsVerb - Loading previous bank:', this.getCurrentBank())
  }
  
  computedReverb(duration, decay) {  // https://stackoverflow.com/a/22538980/5156280
    
    var length = this.sampleRate * duration;
    
    var impulse = this.audioCtx.createBuffer(this.nbChannel, length, this.sampleRate);
    
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);

    for (var i = 0; i < length; i++) {
      var n = this.computedReverse ? length - i : i;  // TODO pas de diff sonore sur le reversed
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }

    return impulse;
  }

  loadImpuseResponse(file) {
    try {
      this.convolver.buffer = this.loadSound(this.convolver, file);
    } catch (err) {
      console.error(err);
    }
  }
  
  loadReverb() {
    if (!this.power) return;
    
    var currentSet = this.getCurrentSet();
    
      /* convolution reverb */
    if (currentSet !== 'computed') {
      
      var irFile = this.irDirectory + currentSet + '/' + this.getCurrentBank();
      
      fetch(irFile + '.ogg').then(response => {
        if (response.ok) {
          this.loadImpuseResponse(irFile + this.irExtension);
        } else {  // TODO best support for other formats
          fetch(irFile + '.wav').then(response => {
            this.loadImpuseResponse(irFile + '.wav');
          }, err => console.error);
        }
      }, err => console.error);
      
      /* computed reverb */
    } else {
      this.convolver.buffer = this.computedReverb(2, 2);
    }
    
  }
  
  loadSound(dest, file) {
    fetch(file)
      .then(response => response.arrayBuffer())
      .then(buffer => {
        this.audioCtx.decodeAudioData(buffer, data => {
          dest.buffer = data;
        }, err => console.error);
    });
  }
  
  plug(source, destination) {
    
    destination = destination || this.destination;
    
    source.connect(this.convolver);
    source.connect(this.analyser);
    source.connect(this.dryGain);
    
    this.convolver.connect(this.wetGain);
    
    this.dryGain.connect(destination);
    this.wetGain.connect(destination);
    
  }
  
}
