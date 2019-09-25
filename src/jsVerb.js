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
    this.persoBuffer = new ArrayBuffer();  // TODO
    
    this.power = false;
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
    // if (!this.power) return;  // TODO déplacer la logique de power on sur la démo, jsVerb always on...
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
    // if (!this.power) return;
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
    // if (!this.power) return;
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
    // if (!this.power) return;
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
  
  isReversed() {  // TODO à supprimer
    return this.computedReverse;
  }
  
  reverse() {  // TODO à supprimer
    // if (!this.power) return;
    this.computedReverse = !this.computedReverse;
    console.log('jsVerb - Reversed computed reverb:', this.computedReverse);
  }
  
  status() {
    // if (!this.power) return;
    var sl = this.getSetLength();
    var bl = this.getAllBankLength();
    console.info('jsVerb - Status:', sl, 'sets,', bl, 'banks');
    return {
      set: sl,
      bank: bl,
      reversed: this.isReversed()  // pas utile car affichage reversed sur ce presset TODO
    }
  }
  
  loadSet() {
    // if (!this.power) return;
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
    // if (!this.power) return;
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
    // if (!this.power) return;
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
  
  loadReverb(perso_buffer) {
    // if (!this.power) return;
    
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
      
      fetch(irFile + '.ogg').then(response => {
        if (response.ok) {
          this.loadImpuseResponse(irFile + this.irExtension);
        } else {  // TODO best support for other formats
          fetch(irFile + '.wav').then(response => {
            this.loadImpuseResponse(irFile + '.wav');
          }, err => console.error);
        }
      }, err => console.error);
      
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
