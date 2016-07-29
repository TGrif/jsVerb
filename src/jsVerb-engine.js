

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['audioCtx'], factory);
	} else if (typeof module === 'object' && module.exports) {
		module.exports = factory(require('audioCtx'));
	} else {
		root.jsVerb = factory(root.audioCtx);
	}
}(this, function (audioCtx) {

	
	var jsVerb = {
			version: '1.2'
		},


		nbChannel = 2,
		sampleRate = audioCtx.sampleRate,

		irDirectory = 'ir/',
		irExtension = '.ogg',

		dryGain = audioCtx.createGain(),
        wetGain = audioCtx.createGain(),

		convolver = audioCtx.createConvolver();



		/* based on http://stackoverflow.com/questions/22525934 answer by Chris Wilson
           and https://github.com/web-audio-components/simple-reverb */
    jsVerb.computedReverb = function (duration, decay, reverse) {    
        
        var length = sampleRate * duration,            
            impulse = audioCtx.createBuffer(nbChannel, length, sampleRate),
            impulseL = impulse.getChannelData(0),
            impulseR = impulse.getChannelData(1);

        for (var i = 0; i < length; i++) {
            var n = reverse ? length - i : i;
            impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
            impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        }

        return impulse;
    }


	jsVerb.loadImpuseResponse = function (convolverNode, ir) { // TODO externaliser le loader audio
		
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


	jsVerb.loadReverb = function (reverbSet, setList, currentSet, currentBank) { // TODO simplifier
		
        if (setList[currentSet] !== 'computed') {  // ir reverb            
            loadImpuseResponse(
				convolver, irDirectory + setList[currentSet] + '/' + reverbSet[setList[currentSet]][currentBank] + irExtension
            );
        } else {  // computed reverb            
            convolver.buffer = computedReverb(2, 2, false);            
        }
		
    }


	return jsVerb;

}));


// TODO voir si c'est utile d'utiliser OfflineAudioContext
