

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		root.audioCtx = factory();
	}
}(this, function() {

	var audioCtx;

		try {

			audioCtx = new (
				window.AudioContext ||
			 	window.webkitAudioContext ||
			 	window.mozAudioContext ||
			 	window.oAudioContext ||
			 	window.msAudioContext)
			();


		} catch (e) {
			alert("AudioContext is not supported in your browser.");
			console.warn(e);
		}

	return audioCtx;

}));

