/**
 * jsVerb
 *   digital reverb
 * 
 * https://github.com/TGrif/jsVerb
 */

var irDirectory = '../ir/';
var irExtension = '.ogg';  // TODO function pour vérifier le format de l'audio et les codecs présents

var audioCtx = new (
        window.AudioContext
        || window.webkitAudioContext
        || window.mozAudioContext
        || window.oAudioContext
        || window.msAudioContext
    )() || console.warn('Audio Context not supported...');


var source = audioCtx.createBufferSource();

var dryGain = audioCtx.createGain();
var wetGain = audioCtx.createGain();

var convolver = audioCtx.createConvolver();
var analyser = audioCtx.createAnalyser();
  
  
  dryGain.gain.value = 0.25;
  wetGain.gain.value = 0.75;
  
  
var setList = []

var reverbSet = {}

$.getJSON('../jsVerb-config.json', function (config) {
  setList = Object.keys(config.reverbSet);
  $.each(config.reverbSet, function (set, bank) {
    reverbSet[set] = bank;
  });
});


var currentSet = 0;
var currentBank = 0;

var power = false;
var bypass = false;



function getDryGain() {
  // console.log('getting dry gain', dryGain.gain.value)
  return dryGain.gain.value;
}

function setDryGain(value) {
  // console.log('setting dry gain', dryGain.gain.value)
  dryGain.gain.value = value;
}

function getWetGain() {
  // console.log('getting wet gain', wetGain.gain.value)
  return wetGain.gain.value;
}

function setWetGain(value) {
  // console.log('setting wet gain', wetGain.gain.value)
  wetGain.gain.value = value;
}


    /* based on http://stackoverflow.com/questions/22525934 answer by Chris Wilson
       and https://github.com/web-audio-components/simple-reverb */

function computedReverb(duration, decay, reverse) {    
    
  var sampleRate = audioCtx.sampleRate;
  var length = audioCtx.sampleRate * duration;
  var nbChannel = 2;
      
  var impulse = audioCtx.createBuffer(nbChannel, length, sampleRate);
  var impulseL = impulse.getChannelData(0);
  var impulseR = impulse.getChannelData(1);

  for (var i = 0; i < length; i++) {
    var n = reverse ? length - i : i;
    impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
  }

  return impulse;

}


function loadReverb(reverbSet, setList, currentSet, currentBank) {

  if (setList[currentSet] !== 'computed') {  // ir reverb
    loadImpuseResponse(
	    convolver,
      irDirectory + setList[currentSet] + '/' + reverbSet[setList[currentSet]][currentBank] + irExtension
    );
  } else {  // computed reverb
    convolver.buffer = computedReverb(2, 2, false);
  }

}


function loadImpuseResponse(convolverNode, ir) {

  console.info('loading ir');

  try {
      
    var ajaxRequest = new XMLHttpRequest();

    ajaxRequest.open('GET', ir, true);
    ajaxRequest.responseType = 'arraybuffer';

    ajaxRequest.onload = function() {

      audioCtx.decodeAudioData(this.response, function (buffer) {
        convolverNode.buffer = buffer;
      }, function (err) {
        console.warn(err);
      });

    };

    ajaxRequest.send();

  } catch (e) {
    console.warn(e);
  }

}



  var 

      request = new XMLHttpRequest(),

      sampleSound = '../audio/sample.ogg';


      request.open("GET", sampleSound, true);
      request.responseType = 'arraybuffer';

      request.onload = function() {
        audioCtx.decodeAudioData(request.response, function(buff) {
          source.buffer = buff;
        }, function (err) {
          console.warn(err);
        });
      };  

      request.send();


  
    source.connect(analyser);
  
    source.connect(convolver);
    source.connect(dryGain);
    
    convolver.connect(wetGain);
    
    wetGain.connect(audioCtx.destination);
    dryGain.connect(audioCtx.destination);

    source.connect(audioCtx.destination);
        
   
    console.info('starting sound...');
    

   // source.start(0);


