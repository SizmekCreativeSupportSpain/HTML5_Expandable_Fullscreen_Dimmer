/*******************
VARIABLES
*******************/
var creativeId = "Banner"; //Use anything that uniquely identifies this creative
var creativeVersion = "0.0.1"; //0.0.1 during initial dev, 1.0.0 on release, x.x.x once released and receives updates
var lastModified = "2017-1-16";
var lastUploaded = "2017-1-16";

var templateVersion = "2.0.20";

var bannerDiv,
	spinBox,
	spinner,
	countDown,
	delayTime,
	countDownTime;

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
	//Workaround (from QB6573) for Async EB Load where Modernizr isn't properly initialized
	typeof Modernizr == "object" && (Modernizr.touch = Modernizr.touch || "ontouchstart" in window);

	initializeGlobalVariables();
	addEventListeners();
	setCreativeVersion();
}

function initializeGlobalVariables() {
	adId = EB._adConfig.adId;
	rnd = EB._adConfig.rnd;
	uid = EB._adConfig.uid;

	bannerDiv = document.getElementById("banner");
	spinBox = document.getElementById("spinBox");
	countDown = document.getElementById("countDown");
	spinner = document.getElementsByClassName("spinner")[0];
}

function addEventListeners() {
	spinBox.addEventListener("mouseenter", handleOver);
    spinBox.addEventListener("click",handleExpandButtonClick);
}

function getStyle(elem, styleName) {
	if (elem.currentStyle) {
		return elem.currentStyle[styleName];
	}
	else if (window.getComputedStyle) {
		return document.defaultView.getComputedStyle(elem, null).getPropertyValue(styleName);
	}
	else {
		return elem.style[styleName];
	}
}

function handleOver(e){
	setClass(spinBox, "hover");
	countDownFrom(3);
	spinBox.removeEventListener("mouseenter", handleOver);
	spinBox.addEventListener("mouseleave",resetCounter);
	delayTime = setTimeout(function(){
		resetCounter();
		handleExpandButtonClick();
		setTimeout(function(){
			spinBox.addEventListener("mouseenter", handleOver);
		},500);
	},3000);
}
function countDownFrom(number){
	countDown.style.visibility = 'visible';
	countDown.innerHTML = number;
	countDownTime = setTimeout(function(){
		countDownFrom(number-1);
	},1000);
}
function resetCounter(){
	spinBox.removeEventListener("mouseleave",resetCounter);
	spinBox.addEventListener("mouseenter", handleOver);
	removeClass(spinBox, "hover");
	clearTimeout(delayTime);
	clearTimeout(countDownTime);
	countDown.innerHTML = '3';
	countDown.style.visibility = 'hidden';
}

function setClass(e, c)
{
	var cc = null;
	if (typeof e.className === "undefined")
	{
		cc = e.getAttribute("class");
		if (cc.indexOf(c) < 0)
		{
			if (c.length > 0)
			{
				c = cc + " " + c;
			}
			e.setAttribute("class", c);
		}
	}
	else
	{
		cc = e.className;
		if (cc.indexOf(c) < 0)
		{
			if (c.length > 0)
			{
				c = cc + " " + c;
			}
			e.className = c;
		}
	}
}

function removeClass(e, c)
{
	var nc = null;
	var reg = new RegExp('(\\s|^)+'+c.replace("-","\\-")+'(\\s|$)+');
	if (typeof e.className === "undefined")
	{
		nc = e.getAttribute("class").replace(reg, ' ');
		e.setAttribute("class", nc);
	}
	else
	{
		e.className = e.className.replace(reg, ' ');
	}
}
/*******************
EVENT HANDLERS
*******************/
function handleExpandButtonClick() {
	EB.expand();
	resetCounter();
}

function setCreativeVersion() {
	EB._sendMessage("setCreativeVersion", {
		creativeId: creativeId,
		creativeVersion: creativeVersion,
		creativeLastModified: lastModified,
		uid: uid
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