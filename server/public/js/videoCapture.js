// 'video/webm;codecs=h264'
var mimeType = 'video/webm;codecs=vp9';

app.factory('videoCapture', function($timeout, $interval) {

	var saveVideo = function(assetSources, openFile, done){
		/*
			#FIXME: Something wrong in video result.
			scrolling in raw webm file doesn't immediately allow scrolling through video.
		*/
		var ruinedVideo = false;
		var recordingVideo = false;
		var canvas = assetSources.canvas.original;
		var video = assetSources.video.original;

		var canvasStream = canvas.captureStream(30);
		var inputStream = video.captureStream(30);

		var options = {
			mimeType: mimeType
		};
		var recordedBlobs = [];
		var newStream = new MediaStream();
		newStream.addTrack(inputStream.getAudioTracks()[0]);
		newStream.addTrack(canvasStream.getVideoTracks()[0]);
		mediaRecorder = new MediaRecorder(newStream, options);
		mediaRecorder.ondataavailable = function (event) {
			if (event.data && event.data.size > 0) {
				recordedBlobs.push(event.data);
			}
		}

		mediaRecorder.onstop = function (event){
			if(!ruinedVideo){
				var blob = new Blob(recordedBlobs, {type: mimeType});
				var url = window.URL.createObjectURL(blob);
				done({blob:blob, ruinedVideo:ruinedVideo});
				if(openFile){
					var downloadLink = document.createElement("a");
					downloadLink.download = 'video.webm';
					downloadLink.href = url;
					$(downloadLink).html('<span class="okbutton glyphicon glyphicon-ok"></span>'+
					' Click here to download video');
					$('#shareLinks').html(downloadLink);
					downloadLink.click();
				}
			}
			else{
				done({blob:undefined, ruinedVideo:ruinedVideo});
				var downloadLink = document.createElement("a");
				$(downloadLink).html('<span class="removebutton glyphicon glyphicon-remove"></span>'+
				' Window was unfocused, please keep this window open');
				$('#shareLinks').html(downloadLink);
				downloadLink.click();
			}
		};


		video.currentTime = 0;
		video.play();
		mediaRecorder.start(100); 

		var renderTime = 0;

		var interval = $interval(function() {
			renderTime++;
			var percentage = 100*renderTime/24;
			$('.progress-bar').css('width', percentage + '%');
			$('.progress-bar').text(Math.floor(percentage) + '%');
		}, 1000, 24);

		var stopRecording = function(){
			video.pause();
			video.currentTime = 0;
			video.load();
			mediaRecorder.stop();
			newStream.getTracks().forEach(track => track.stop());
			$('.progress-bar').css('width', 0 + '%');
			$('.progress-bar').text('0%');
			$interval.cancel(interval);
		};

		var stopPlayTimeout = $timeout(function(){ 
			stopRecording();
			document.removeEventListener("visibilitychange", visibilityChangeEvent); 
		}, 24000);

		var visibilityChangeEvent = function(){
			if(document.hidden && mediaRecorder.state == 'recording') {
				document.removeEventListener("visibilitychange", visibilityChangeEvent); 
				ruinedVideo = true;
				$timeout.cancel(stopPlayTimeout);
				stopRecording();
			} else {
			  // the page is visible
			}
		}

		document.addEventListener("visibilitychange", visibilityChangeEvent, {once:true});

	};

	return{
		saveVideo
	}
});