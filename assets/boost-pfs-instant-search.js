// Override Settings
var boostPFSInstantSearchConfig = {
  search: {
    //suggestionMode: 'test'
    //suggestionPosition: 'left'
  }
};

(function() { // Add this
  BoostPFS.inject(this); // Add this

  /* some code */
  // Customize style of Suggestion box
  SearchInput.prototype.customizeInstantSearch = function(suggestionElement, searchElement, searchBoxId) {};

  InstantSearch.prototype.beforeInit = function(id) {
    // Remove the default Instant Search of the theme
    jQ('.live-search-form, .site-header-search-form').removeAttr('data-live-search-form').removeAttr('data-live-search-flydown');
    jQ('input[name="q"]').removeAttr('data-live-search-input');
    jQ('.search-flydown').hide();
    jQ('button.site-header-search-button.button-primary').prop("type", "submit");
    jQ('button.live-search-button.button-primary').prop("type", "submit");
    jQ(document).ready(function() {
      jQ('.live-search-form, .site-header-search-form').off(".search-form");
      if (typeof bcHeaderSearch !== 'undefined') bcHeaderSearch.unload();
    });
  };
  
  // control URL
  const url = window.location.href;

  if(url.includes('&grid_list=') && url.includes('%2B') && url.includes('%2C')) {
    const newUrl = url.replace(/%2B/g, '+').replace(/%2C/g, ',');
      window.location.replace(newUrl);
  } else if (url.includes('&grid_list=') && url.includes('%2B')) {
  	const newUrl = url.replace(/%2B/g, '+');
      window.location.replace(newUrl);
  } else if (url.includes('&grid_list=') && url.includes('%2C')) {
  	const newUrl = url.replace(/%2C/g, ',');
      window.location.replace(newUrl);
  }
 

})();