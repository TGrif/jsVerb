/**
 * jsVerb
 *   digital reverb
 * 
 * https://github.com/TGrif/jsVerb
 */


    var

            audioCtx = new (
                window.AudioContext
                    || window.webkitAudioContext
             )(),


        source = audioCtx.createBufferSource(),

        dryGain = audioCtx.createGain(),
        wetGain = audioCtx.createGain(),

        convolver = audioCtx.createConvolver(),
        
        analyser = audioCtx.createAnalyser(),
        
        
            irDirectory = 'ir/',                    
            irExtension = '.ogg';
    


        
        /* based on http://stackoverflow.com/questions/22525934 answer by Chris Wilson
           and https://github.com/web-audio-components/simple-reverb */

    function computedReverb(duration, decay, reverse) {    
        
        var
                sampleRate = audioCtx.sampleRate,
                length = audioCtx.sampleRate * duration,
                nbChannel = 2,
            
            impulse = audioCtx.createBuffer(nbChannel, length, sampleRate),
            impulseL = impulse.getChannelData(0),
            impulseR = impulse.getChannelData(1);

                for (var i = 0; i < length; i++) {
                    var n = reverse ? length - i : i;
                    impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
                    impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
                }

        return impulse
    }



    function loadReverb(reverbSet, setList, currentSet, currentBank) {
		
        if (setList[currentSet] !== 'computed') {  // ir reverb            
            loadImpuseResponse(
				convolver, irDirectory + setList[currentSet] + '/' + reverbSet[setList[currentSet]][currentBank] + irExtension
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
                    }, function(err) {
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

        sampleSound = 'audio/sample.ogg';


        request.open("GET", sampleSound, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            audioCtx.decodeAudioData(request.response, function(buff) {                
                source.buffer = buff;
            }, function(err) {
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
    

//    source.start(0);



