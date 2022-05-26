// global variables
var CODE_SHOPIFY = 'CA'; // remove "-AL" to enable custom logic

var californiaProducts = [
  // Products
  '1301634908275', // Bye Bye Bloat
  '1301637070963', // Lights Out
  '3866743930995', // Metabolove
  '4162245132403', // Sparkle Fiber
  // Kit Products
  '1846562488435', // New You Kit
  '1359910502515', // Gut Goodness Kit
  '1359932162163', // Healthy Body Kit
  '1359870984307', // Balanced Cycle Kit
  '1359939338355', // Glowing Skin Kit
  '4369556471923', // Core Basics Kit ---> The Lo Bosworth Kit
  '4369557225587', // Best Gut Ever Kit ---> The Bloating Kit
  '4369557979251', // Balanced Body Kit
];

var universalTemplate = `
  <div class="lw-california-proposition">
    <h3>California Proposition 65 Warning</h3>
    <div class="lw-california-flex">
      <div>
        <img src="https://cdn.shopify.com/s/files/1/1288/3849/t/136/assets/lw-triangle-warning.png?v=1577103525" style="width:20px;">
      </div>
      <div>
        <span>WARNING:</span> Cancer and Reproductive Harm - 
        <a target="_blank" rel="noreferrer noopener" href="https://www.p65warnings.ca.gov/products/food">www.P65Warnings.ca.gov/food</a>.
      </div>
    </div>
    <span>Under California law, we are required to give you this warning for the following products:</span>
    <div class="lw-california-products"></div>
  </div>
`;

// products warning
var byeByeBloat = `<h5>Bye, Bye Bloat</h5>`;
var lightsOut = `<h5>Lights Out</h5>`;
var metaboLove = `<h5>Metabolove</h5>`;
var sparkleFiber = `<h5>Sparkle Fiber</h5>`;

// Handle Shopify Checkout
function california65ShopifyCheckout() {
  var cartProducts = collectCartProductsShopify();
  var intersectedProducts = intersectArrays(californiaProducts, cartProducts);

  // warning content
  var warningContent = intersectedProducts.map(prepareWarningContent);
  var mergedWarningContent = [].concat.apply([], warningContent);
  var warningContentString = [...new Set(mergedWarningContent)];
  warningContentString = [...warningContentString].join('');

  if (mergedWarningContent.length === 0) return;

  // show warning on state change event
  $('#checkout_shipping_address_province').change(function () {
    // get vars
    var chosenState = $(this).children('option:selected').val();
    var zipCode = jQuery('#checkout_shipping_address_zip').val();

    var isBlockedZip = checkZipCode(zipCode);

    if (chosenState === CODE_SHOPIFY && isBlockedZip) {
      $('.step__sections').append(universalTemplate);
      $('.lw-california-products').html(warningContentString);
    } else {
      $('.lw-california-proposition').remove();
    }
  });

  // zip code change handler
  $('#checkout_shipping_address_zip').keyup(function () {
    // get vars
    var zipCode = jQuery(this).val();
    var chosenState = jQuery('#checkout_shipping_address_province').children('option:selected').val();

    var isBlockedZip = checkZipCode(zipCode);

    if (chosenState === CODE_SHOPIFY && isBlockedZip) {
      if (jQuery('.lw-california-proposition').length == 0) {
        $('.step__sections').append(universalTemplate);
        $('.lw-california-products').html(warningContentString);
      }
    } else {
      $('.lw-california-proposition').remove();
    }
  });

  // show warning on load time
  setTimeout(function () {
    // get vars
    var chosenStateLoadTime = $('#checkout_shipping_address_province').children('option:selected').val();
    var chosenZipCode = $('#checkout_shipping_address_zip').val();

    var isBlockedZip = checkZipCode(chosenZipCode);

    if (chosenStateLoadTime === CODE_SHOPIFY && isBlockedZip) {
      $('.step__sections').append(universalTemplate);
      $('.lw-california-products').html(warningContentString);
    } else {
      $('.lw-california-proposition').remove();
    }
  }, 500);
}

// Helper: Check Starting Character of Zipcode
function checkZipCode(zipCode) {
  var firstChar = zipCode.charAt(0);
  if (firstChar == 9) {
    return true;
  } else {
    return false;
  }
}

// Helper: Collect Products in Cart for Shopify Checkout
function collectCartProductsShopify() {
  var cartProducts = [];
  var productsEl = jQuery('.order-summary__sections table.product-table tbody tr');
  productsEl.each(function () {
    var productId = jQuery(this).attr('data-product-id');
    cartProducts.push(productId);
  });

  return cartProducts;
}

// Helper: Prepare Warning Content
function prepareWarningContent(productId) {
  var warningContent = [];

  /*
   * This was based on this Kits products list:
   * https://docs.google.com/spreadsheets/d/1GGqtXV2gI5oXBNHPpPEqWdwHOhYGiRu-ejsm5frQHOE/edit#gid=0
   * Date: 2019-12-20
   */

  // Bye Bye Bloat
  if (productId === '1301634908275') {
    warningContent.push(byeByeBloat);
  }

  // Lights Out
  if (productId === '1301637070963') {
    warningContent.push(lightsOut);
  }

  // Metabo Love
  if (productId === '3866743930995') {
    warningContent.push(metaboLove);
  }

  // Sparkle Fiber
  if (productId === '4162245132403') {
    warningContent.push(sparkleFiber);
  }

  // New You Kit
  if (productId === '1846562488435') {
    warningContent.push(byeByeBloat);
    warningContent.push(lightsOut);
    warningContent.push(metaboLove);
  }

  // Gut Goodness Kit
  if (productId === '1359910502515') {
    warningContent.push(byeByeBloat);
  }

  // Healthy Body Kit
  if (productId === '1359932162163') {
    warningContent.push(byeByeBloat);
    warningContent.push(lightsOut);
    warningContent.push(metaboLove);
  }

  // Balanced Cycle Kit
  if (productId === '1359870984307') {
    warningContent.push(byeByeBloat);
  }

  // Glowing Skin Kit
  if (productId === '1359939338355') {
    warningContent.push(lightsOut);
  }

  // Core Basics Kit
  if (productId === '4369556471923') {
    warningContent.push(lightsOut);
    warningContent.push(metaboLove);
    warningContent.push(sparkleFiber);
  }

  // Best Gut Ever Kit
  if (productId === '4369557225587') {
    warningContent.push(byeByeBloat);
    warningContent.push(sparkleFiber);
  }

  // Balanced Body Kit
  if (productId === '4369557979251') {
    warningContent.push(byeByeBloat);
    warningContent.push(metaboLove);
  }

  return warningContent;
}

// Helper: Get Interesection of arrays
function intersectArrays(a, b) {
  return [...new Set(a)].filter((x) => new Set(b).has(x));
}

// Init
setTimeout(function () {
  california65ShopifyCheckout();
}, 500);
