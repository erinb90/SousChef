
		var audioContext =  new initAudioContext();
		var audioPlayer = new AudioPlayer(audioContext); // For the play audio command

		function initAudioContext()
		{
			var AudioContext = window.AudioContext || window.webkitAudioContext;
			if (!AudioContext)
			{
				throw "No WebAudio Support in this Browser";
			}
			navigator.getUserMedia = navigator.getUserMedia
					|| navigator.webkitGetUserMedia
					|| navigator.mozGetUserMedia
					|| navigator.msGetUserMedia;
			if (!navigator.getUserMedia)
			{
				console.log("No getUserMedia Support in this Browser");
			}
			return new AudioContext();
		}

		function AudioPlayer(audioContext)
		{
			var isPlaying = false;
			var context = audioContext;
			var source = null;

			this.isPlaying = function ()
			{
				return isPlaying;
			};

			this.play = function (audio)
			{
				var audioToPlay = new Int16Array(audio);
				source = context.createBufferSource();
				var audioBuffer = context.createBuffer(1, audioToPlay.length, 8000);
				var channelData = audioBuffer.getChannelData(0);
				for (var i = 0; i < channelData.length; ++i)
				{
					channelData[i] = audioToPlay[i] / 32768.0;
				}
				source.buffer = audioBuffer;
				source.connect(context.destination);
				if (source.start) {
					source.start(0);
				}
				else {
					source.noteOn(0);
				}
				isPlaying = true;

				source.onended = function ()
				{
					isPlaying = false;
				};
			};

			this.stop = function ()
			{
				if (source != null) {
					source.stop();
					isPlaying = false;
				}
			}
		}


		/*
		 *  The audio recorder uses promises (deferred object) from the Q.js library
		 */
		function AudioRecorder(audioContext)
		{
			var context = audioContext;
			var mediaStream;
			var def;
			
			var desiredSampleRate = 8000;
			var audioInput;
			var analyserNode;
			var recordingNode;
			
			var resampler = new Resampler(context.sampleRate, desiredSampleRate, 1, 8192);

			this.start = function () {
				def = Q.defer();

				console.log("context.sampleRate = " + context.sampleRate);
				
				navigator.getUserMedia(
						
						{audio: true},
				
						function (stream) {
							mediaStream = stream;
							
							audioInput = context.createMediaStreamSource(stream);
							analyserNode = context.createAnalyser();
							recordingNode = context.createScriptProcessor(8192, 1, 2);
							recordingNode.onaudioprocess = function (evt) {

								var ch = resampler.resampler(evt.inputBuffer.getChannelData(0));

								var ampArray = new Uint8Array(analyserNode.frequencyBinCount);
								analyserNode.getByteTimeDomainData(ampArray);

								var encodedSpx = new Int16Array(ch.length);
								for (var i = 0; i < ch.length; ++i) {
									var s = Math.max(-1, Math.min(1, ch[i]));
									encodedSpx[i] = s <= -1.0 ? 0x8000 : (s >= 1.0 ? 0x7FFF : s * 0x8000);
								}

								def.notify([encodedSpx, ampArray]);
							};

							audioInput.connect(analyserNode);
							analyserNode.connect(recordingNode);
							recordingNode.connect(context.destination);
						},
						
						def.reject);

				return def.promise;
			};

			this.stop = function () {
				mediaStream.getTracks().forEach(function (track) {
					track.stop();
				});

				def.resolve();
			};
		}
	
		function tts () {
			var text = document.getElementById("text").value;
			if (text.length == 0) {
				return;
			}
			var url     = "https://pumpout.anyhowstep.com/tts/"+encodeURIComponent(text);
			var request = new XMLHttpRequest();
			request.open("GET", url, true);
			request.responseType = "arraybuffer";
			request.send();
			request.onreadystatechange = function (event) {
				if (request.readyState === 4 && request.status === 200) {
					var arrayBuffer = request.response;
					if (arrayBuffer) {
						audioPlayer.play(arrayBuffer);
					}
				}
			};
		}

