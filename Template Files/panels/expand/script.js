/*******************
VARIABLES
*******************/
var lastModified = "2017-1-16";
var lastUploaded = "2017-1-16";

var templateVersion = "2.0.20";

var expansion;
var panelContainer;
var videoContainer;
var video;
var audioButton,controlButton;
var videoTrackingModule;
var adId, rnd, uid;

/*******************
INITIALIZATION
*******************/

function checkIfAdKitReady(event) {
	try {
		if (window.localPreview) {
			window.initializeLocalPreview(); //in localPreview.js
			initializeCreative();
			return;
		}
	}
	catch (e) {}

	adkit.onReady(initializeCreative);
}

function initializeCreative(event) {
	initializeGlobalVariables();
	initializeVideoTracking();
	addEventListeners();
}

function initializeGlobalVariables() {
	adId = EB._adConfig.adId;
	rnd = EB._adConfig.rnd;
	uid = EB._adConfig.uid;
	sdkData = EB.getSDKData();

	expansion = document.getElementById("expansion");
	panelContainer = document.getElementById("panel-container");
	videoContainer = document.getElementById("video-container");
	video = document.getElementById("video");
	audioButton = document.getElementById("audioBtn");
	controlButton = document.getElementById("controlBtn");
}

function initializeVideoTracking() {
	videoTrackingModule = new EBG.VideoModule(video);

	controlButton.addEventListener("click", handleControlsButtonClick);
	audioButton.addEventListener("click", handleAudioButtonClick);
	
	video.addEventListener('play',setControlImage);
    video.addEventListener('pause',setControlImage);
    video.addEventListener('ended',onVideoEnd);
    video.addEventListener('volumechange',setAudioImage);
	
    setAudioImage();
    setControlImage();

    videoTrackingModule.playVideo(false);
}

function setAudioImage(){
	if(video.muted){
		audioButton.style.backgroundImage = "url(images/audioOff.png)";
	}else{
		audioButton.style.backgroundImage = "url(images/audioOn.png)";
	}
}
function setControlImage(){
	if(video.paused){
		controlButton.style.backgroundImage = "url(images/play.png)";
	}else{
		controlButton.style.backgroundImage = "url(images/pause.png)";
	}
}

function onVideoEnd(){
	controlButton.style.backgroundImage = "url(images/replay.png)";
	video.load();
}

function handleAudioButtonClick() {
	video.muted = !video.muted;
}

function handleControlsButtonClick() {
	if(video.paused){
		video.play();
	}else{
		video.pause();
	}
	setControlImage();
}

function addEventListeners() {
	document.getElementById('closeBtn').addEventListener('click',function(){
		EB.collapse();
	});
	document.getElementById('videoClickBtn').addEventListener('click',function(){
		EB.clickthrough();
	});
	document.getElementById('clickBtn').addEventListener('click',function(){
		EB.clickthrough();
	});
}

/*********************************
HTML5 Event System - Do Not Modify
*********************************/
var listenerQueue;
var creativeIFrameId;

function addCustomScriptEventListener(eventName, callback, interAd) {
	listenerQueue = listenerQueue || {};
	var data = {
		uid: uid,
		listenerId: Math.ceil(Math.random() * 1000000000),
		eventName: eventName,
		interAd: !!(interAd),
		creativeIFrameId: creativeIFrameId
	};
	EB._sendMessage("addCustomScriptEventListener", data);
	data.callback = callback;
	listenerQueue[data.listenerId] = data;
	return data.listenerId;
}

function dispatchCustomScriptEvent(eventName, params) {
	params = params || {};
	params.uid = uid;
	params.eventName = eventName;
	params.creativeIFrameId = creativeIFrameId;
	EB._sendMessage("dispatchCustomScriptEvent", params);
}

function removeCustomScriptEventListener(listenerId) {
	var params = {
		uid: uid,
		listenerId: listenerId,
		creativeIFrameId: creativeIFrameId
	};

	EB._sendMessage("removeCustomScriptEventListener", params);
	if (listenerQueue[listenerId])
		delete listenerQueue[listenerId];
}

function eventManager(event) {
	var msg = JSON.parse(event.data);
	if (msg.type && msg.data && (!uid || (msg.data.uid && msg.data.uid == uid))) {
		switch (msg.type) {
			case "sendCreativeId":
				creativeIFrameId = msg.data.creativeIFrameId;
				if (creativeContainerReady)
					creativeContainerReady();
				break;
			case "eventCallback": // Handle Callback
				var list = msg.data.listenerIds;
				var length = list.length;
				for (var i = 0; i < length; i++) {
					try {
						var t = listenerQueue[list[i]];
						if (!t) continue;
						t.callback(msg.data);
					}
					catch (e) {}
				}
				break;
		}
	}
}

window.addEventListener("message", function() {
	try {
		eventManager.apply(this, arguments);
	}
	catch (e) {}
}, false);
/*************************************
End HTML5 Event System - Do Not Modify
*************************************/

window.addEventListener("load", checkIfAdKitReady);