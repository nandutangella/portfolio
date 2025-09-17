$(document).ready(function(){

    function portfolio() {
    
    	// Blur images on mouse over
    	$(".work .hover").hover( function(){ 
    		$(this).animate({ opacity: 1 }, "fast"); 
    	}, function(){ 
    		$(this).animate({ opacity: 0 }, "fast"); 
    	}); 
    }
	
	function prettyphoto() {
    	// Initialize prettyPhoto plugin
    	$(".portfolio a[rel^='prettyPhoto']").prettyPhoto({
    		theme:'light_square', 
    		autoplay_slideshow: false, 
    		overlay_gallery: false, 
    		show_title: false
    	});
    }
    
    portfolio();
    prettyphoto();

	// Clone portfolio items to get a second collection for Quicksand plugin
	var $portfolioClone = $(".portfolio").clone();
	
	// Attempt to call Quicksand on every click event handler
	$(".filter a").click(function(e){
		
		$(".filter li").removeClass("current");	
		
		// Get the class attribute value of the clicked link
		var $filterClass = $(this).parent().attr("class");

		if ( $filterClass == "all" ) {
			var $filteredPortfolio = $portfolioClone.find("li");
		} else {
			var $filteredPortfolio = $portfolioClone.find("li[data-type~=" + $filterClass + "]");
		}
		
		// Call quicksand
		$(".portfolio").quicksand( $filteredPortfolio, { 
			duration: 800, 
			easing: 'easeInOutQuad' 
		}, function(){
            portfolio();
            prettyphoto();
		});


		$(this).parent().addClass("current");

		// Prevent the browser jump to the link anchor
		e.preventDefault();
	})
});