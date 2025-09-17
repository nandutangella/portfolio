
/*
jQuery.fn.anchorAnimate = function(settings) {
 	settings = jQuery.extend({
		speed : 1100
	}, settings);	
	
	return this.each(function(){
		var caller = this
		$(caller).click(function (event) {	
console.debug('clicked ');								  
			event.preventDefault()
			var locationHref = window.location.href
			var elementClick = $(caller).attr("href")
			
			var destination = $(elementClick).offset().top;
			$("html:not(:animated),body:not(:animated)").animate({ scrollTop: destination}, settings.speed, function() {
				window.location.hash = elementClick
			});
		  	return false;
		})
	})
}
*/
var firebug = (typeof console!='undefined')?console:{debug:function(){},log:function(){}};
function ClassIGroupScroll(){
	this.intCurrentPos = 1;
	//SPEED
	//SPEED
	//SPEED
	this.ultimateSpeed = 750;//note: lower is faster, I recommend slowest be 1000. Fastest 400
	
	
	this.init = function(){
		var objInst = this;
		$("a.scrollIGroup").bind("click",{objInst:objInst},function(e){		
			if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
			  var $target = $(this.hash);
			  $target = $target.length && $target || $('[name=' + this.hash.slice(1) +']');
			  if ($target.length) {
				var targetOffset = ($target.offset().top - 28);//28 is the padding. 
				var objThis = $(this);
				
				var objLi = objThis.parent();
				var objUL = objLi.parent();
				var intNewPos = (objUL.find("li").index(objLi[0]) + 1);
				var intTopSpeed = e.data.objInst.getSpeed(intNewPos,objInst.ultimateSpeed);//note: lower is faster 1000 is slowest marker i recommend

				firebug.debug("intNewPos = "+intNewPos);
				firebug.debug("intTopSpeed = "+intTopSpeed);
				
				$('html,body').animate({scrollTop: targetOffset}, intTopSpeed);			   			
			  }		
			}	
			$("a.scrollIGroup").removeClass("on");		
			$(this).addClass("on");
			return false;	
		});
	}
	this.getSpeed = function(intNewPos,intTopSpeed){
		//default
		var intSpeed = intTopSpeed;		
		var intCurrentPos = this.intCurrentPos;
		intVariation = (intCurrentPos > intNewPos)?(intCurrentPos - intNewPos):(intNewPos - intCurrentPos);		
		if(!isNaN(intNewPos)){
			var intVariableSpeed = (intTopSpeed * intVariation);
			var intMaxSpeed = (intTopSpeed * 4);
			//overrides speed depending on location of hash
			intSpeed = (intVariableSpeed > intMaxSpeed)?intMaxSpeed:intVariableSpeed;			
		}else{
			firebug.debug("intNewPos is not a number = " + intNewPos);
		}

		this.intCurrentPos = intNewPos;
		return intSpeed;	
	}
	this.init();
}

$(document).ready(function() {
	//$("a.scrollIGroup").anchorAnimate()
	var objIGroupScroll = new ClassIGroupScroll();	
});