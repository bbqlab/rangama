//sound object works close to the same in appMobi and HTML5

function ObjSound(soundFilePath) {
	this.path = soundFilePath;
	this.tag = document.createElement("audio");
	this.tag.setAttribute("preload","auto");
	this.appMobiEnabled = false;
	
	this.init = function() {
		try {
			AppMobi.device.appmobiversion;
			this.appMobiEnabled = true;
			console.log("appMobi multisound enabled");
		}catch(e) { this.appMobiEnabled = false; console.log("HTML5 sound tag started"); }
	
		if (this.path != null) {
			this.load(soundFilePath);
		}
	
	}
	
	this.play = function() {
		if (this.path != null) {
			if (this.appMobiEnabled == true) {
				AppMobi.player.playSound(this.path); 
			} else {
				this.tag.play();
			}
		}
	}
	
	this.stop = function() {
		this.tag.pause();
		try { this.tag.currentTime=0; } catch(e) {}	
	}
	
	this.load = function(soundFilePath) {
		//preload the sound
		console.log("loading sound " + soundFilePath);
		this.path=soundFilePath;
		if (this.appMobiEnabled == true)
		{
			AppMobi.player.loadSound(this.path, 5); 
		} else {
			this.tag.src=this.path;
			this.tag.load();
		}
	}
	


}
