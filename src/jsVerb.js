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
    this.irExtensions = ['.ogg', '.wav'];
    
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
    this.persoBuffer = new ArrayBuffer();  // TODO
    
    this.bypass = false;
    
    this.presetState = 0;  // 0 -> load, 1 -> save  // TODO
    
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
    return this.setList[this.currentSet];
  }
  
  getSetLength() {
    return (this.setList.indexOf('perso') !== -1)
             ? this.setList.length - 1
             : this.setList.length;
  }
  
  getCurrentSetLength() {
    return this.reverbSet[this.getCurrentSet()].length;
  }
  
  getAllBankLength() {
    var nbBank = 0;
    for (var b in this.reverbSet) {
      if (b !== 'perso') {
        nbBank += this.reverbSet[b].length;
      }
    }
    return nbBank;
  }
  
  getCurrentBank() {
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
  
  bypassOnOff() {
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
  
  preset(userPreset) {  // TODO long press to save...
    // console.log(this.presetState);
    this.presetState < 1
      ? this.presetState++
      : this.presetState = 0;
      
  }
  
  loadBank(file) {
    console.info('jsVerb - Loading ir:', file.name);

    switch (file.type) {
      case 'audio/x-wav': break;
      case 'video/ogg': break;
      default: return console.info('Format non pris en charge:', file.type);
    }
    
    this.reverbSet['perso'] = [file.name];
    this.setList.push('perso');

    this.currentSet = this.setList.indexOf('perso');
    this.currentBank = 0;
    
    var reader = new FileReader();
    reader.onload = el => {
      this.persoBuffer = el.target.result;
      this.loadReverb();
    }
    reader.readAsArrayBuffer(file);  //TODO sharedArrayBuffer   https://github.com/WebAudio/web-audio-api/issues/1175
                                    // ou supprimer la banque perso lors du changement de set
  }
  
  status() {
    var status = {
      set: this.getSetLength(),
      bank: this.getAllBankLength()
    }
    console.info('jsVerb - Status:', status.set, 'sets,', status.bank, 'banks');
    return status;
  }
  
  panic() {
    console.info('jsVerb - Panic');
    this.audioCtx.suspend();
    // this.audioCtx.resume();  // TODO voir si resume clear audiocontext
  }
  
  loadSet() {
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
    if (this.getCurrentSetLength() === 1) return;
    if (this.currentBank === this.getCurrentSetLength() - 1) {
      this.currentBank = 0;
    } else {
      ++this.currentBank;
    }
    if (this.setList[this.currentSet] === 'computed') {
      this.computedReverse = !this.computedReverse;
    }
    this.loadReverb();
    console.info('jsVerb - Loading next bank:', this.getCurrentBank());
    
  }
  
  previousBank() {
    if (this.getCurrentSetLength() === 1) return;
    if (this.currentBank === 0) {
      this.currentBank = this.getCurrentSetLength() - 1;
    } else {
      --this.currentBank;
    }
    if (this.setList[this.currentSet] === 'computed') {
      this.computedReverse = !this.computedReverse;
    }
    this.loadReverb();
    console.info('jsVerb - Loading previous bank:', this.getCurrentBank());
  }
  
  computedReverb(duration, decay) {  // https://stackoverflow.com/a/22538980/5156280
    
    var length = this.sampleRate * duration;
    
    var impulse = this.audioCtx.createBuffer(this.nbChannel, length, this.sampleRate);
    
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);

    for (var i = 0; i < length; i++) {
      var n = this.computedReverse ? length - i : i;  // FIXME pas de diff sonore sur le reversed
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }

    return impulse;
  }

  loadImpuseResponse(file) {
    try {
      /*this.convolver.buffer = */this.loadSound(this.convolver, file);
    } catch (err) {
      console.error(err);
    }
  }
  
  loadReverb(perso_buffer) {
    
    var currentSet = this.getCurrentSet();
    
      /* computed reverb */
    if (currentSet === 'computed') {
      this.convolver.buffer = this.computedReverb(2, 2);
      
      /* perso reverb */
    } else if (currentSet === 'perso') {
      console.log('jsVerb - Loading perso reverb.')
      
        // TODO sauvegarder perso_buffer
      this.audioCtx.decodeAudioData(this.persoBuffer, data => {
        this.convolver.buffer = data;
      })
      
      /* convolution reverb */
    } else {
      
      var irFile = this.irDirectory + currentSet + '/' + this.getCurrentBank();
    
      for (let i in this.irExtensions) {
        let file = irFile + this.irExtensions[i];
        if (this.checkImpulseType(file)) {
          return this.loadImpuseResponse(file);
        }
      }
      
    }
    
  }
  
  checkImpulseType(file) {
    var http = new XMLHttpRequest();
    http.open('HEAD', file, false);
    http.send();
    return http.status != 404;
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
