if (typeof boostPFSThemeConfig !== 'undefined') {
	// Override Settings
  var boostPFSFilterConfig = {
    general: {
      limit: boostPFSConfig.custom.products_per_page,
      /* Optional */
      loadProductFirst: false,
      numberFilterTree: 2,
      showLimitList: '24,36,48'
    },
    selector: {
      breadcrumb: '.breadcrumbs-container'
    }
  };
}

(function() {
  BoostPFS.inject(this);

  /************************** BUILD PRODUCT LIST **************************/

  // Build Product Grid Item
  ProductGridItem.prototype.compileTemplate = function (data, index, totalProduct) {
    if (!data) data = this.data;
    if (!index) index = this.index;
    if (!totalProduct) totalProduct = this.totalProduct;
    /*** Prepare data ***/
    var images = data.images_info;
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    var hasSubscription = data.tags.includes('Has Subscription') // Check a product can be subscribed to
    var subscription_base_price = data.price_min;

    if (data.compare_at_price_min !== null) {
      subscription_base_price = data.compare_at_price_min;
    }

    var discountDecimal = boostPFSConfig.custom.subscription_discount_decimal;
    var customDiscount = data.metafields.find(function (metafield) {
      return metafield.key === "custom_sale_discount_amount";
    });
    if (customDiscount) {
      discountDecimal = customDiscount.value;
    }

    var customImageBadges = data.metafields.find(function (metafield) {
      return metafield.key === 'image_badges';
    });

    var customTextBadges = data.metafields.find(function (metafield) {
      return metafield.key === 'text_badges';
    });

    var subtitle = data.metafields.find(function (metafield) {
      return metafield.key === "sub_title";
    });

    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (Utils.getParam('variant') !== null && Utils.getParam('variant') != '') {
      var paramVariant = data.variants.filter(function (e) { return e.id == Utils.getParam('variant'); });
      if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
      for (var i = 0; i < data['variants'].length; i++) {
        if (data['variants'][i].available) {
          firstVariant = data['variants'][i];
          break;
        }
      }
    }
    /*** End Prepare data ***/

    // Get Template
    var itemHtml = boostPFSTemplate.productGridItemHtml;

    // Add quickBtn
    var itemActionsHtml = buildActions(data, firstVariant);
    itemHtml = itemHtml.replace(/{{itemActions}}/g, itemActionsHtml);

    // Add custom class
    var customClass = 'imagestyle--' + boostPFSConfig.custom.product_grid_image_style;
    if (onSale) customClass += ' productitem--sale';
    if (boostPFSConfig.custom.emphasize_price) customClass += ' productitem--emphasis';
    if (boostPFSConfig.custom.atc_display == 'always' || boostPFSConfig.custom.quick_shop_display == 'always') customClass += ' show-actions--mobile';
    itemHtml = itemHtml.replace(/{{customClass}}/g, customClass);

    var itemImages = '';
    if (images.length > 0) {
      if (images.length > 1 && boostPFSConfig.custom.product_grid_show_second_image) {
        itemImages += buildImage(images[1], '512x', 'productitem--image-alternate');
      }
      itemImages += buildImage(images[0], '512x', 'productitem--image-primary');
    } else {
      itemImages += buildImage(null, '512x', 'productitem--image-primary');
    }
    itemHtml = itemHtml.replace(/{{itemImages}}/g, itemImages);

    // Add Thumbnail
    var itemThumbUrl = images.length > 0 ? Utils.optimizeImage(images[0]['src'], '512x') : boostPFSConfig.general.no_image_url;
    itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);

    // Add Label
    var itemLabelsHtml = '';
    if (soldOut) {
      itemLabelsHtml += '<span class="productitem__badge productitem__badge--soldout">' + boostPFSConfig.label.sold_out + '</span>';
    } else {
      if (onSale && boostPFSConfig.custom.product_sales_badge) {
        var savePrice = data.compare_at_price_min - data.price_min;
        var percentSavePrice = Math.round(savePrice * 100 / data.compare_at_price_max);
        var percentSavePriceHtml = '<span data-price-percent-saved>' + percentSavePrice + '</span>';
        itemLabelsHtml += '<span class="productitem__badge productitem__badge--sale" data-badge-sales';
        if (!onSale) itemLabelsHtml += 'style="display: none;"';
        itemLabelsHtml += '>';
        itemLabelsHtml += '<span data-badge-sales-range>';
        switch (boostPFSConfig.custom.product_sales_badge_style) {
          case 'percent':
            if (priceVaries) {
              itemLabelsHtml += boostPFSConfig.label.sale_percentage_range_html.replace(/{{ savings }}/g, percentSavePriceHtml);
            } else {
              itemLabelsHtml += boostPFSConfig.label.sale_percentage_single_html.replace(/{{ savings }}/g, percentSavePriceHtml);
            }
            break;
          case 'money':
            if (priceVaries) {
              itemLabelsHtml += boostPFSConfig.label.sale_money_range_html.replace(/{{ savings }}/g, Utils.formatMoney(savePrice));
            } else {
              itemLabelsHtml += boostPFSConfig.label.sale_money_single_html.replace(/{{ savings }}/g, Utils.formatMoney(savePrice));
            }
            break;
          default: itemLabelsHtml += boostPFSConfig.label.sale; break;
        }
        itemLabelsHtml += '</span></span>';
      }

      if (customImageBadges) {
        let badgeObject = JSON.parse(customImageBadges.value);

        if (badgeObject && badgeObject.length) {

          itemLabelsHtml += '<div class="badges-images badges-images--productitem">';
          for (let i = 0; i < badgeObject.length; i++) {
            itemLabelsHtml += '<img class="badges-images__item" src="' + badgeObject[i].badge_image + '" alt="' + badgeObject[i].alt_text + '" />';
          }
          itemLabelsHtml += '</div>';
        }
      }

      if (customTextBadges) {
        let badgeObject = JSON.parse(customTextBadges.value);

        if (badgeObject && badgeObject.length) {
          itemLabelsHtml += '<div class="badges-texts badges-texts--productitem">';
          for (let i = 0; i < badgeObject.length; i++) {
            itemLabelsHtml += `<span class="badges-texts__item" ${badgeObject[i].badge_color ? 'style="background-color:#' + badgeObject[i].badge_color + '"' : ''}>${badgeObject[i].badge_text}</span>`;

          }
          itemLabelsHtml += '</div>';
        }

      }
    }
    itemHtml = itemHtml.replace(/{{itemLabels}}/g, itemLabelsHtml);

    // Add Swatches
    var swatchHtml = buildSwatch(data);
    itemHtml = itemHtml.replace(/{{itemSwatch}}/g, swatchHtml);

    // Add Price
    var priceHtml = '';
    var classVaries = priceVaries ? 'price--varies' : '';
    var visibleClass = onSale || boostPFSConfig.custom.emphasize_price ? 'visible' : '';

    if (boostPFSConfig.custom.show_subscription_price) {
      priceHtml += '<div class="productitem__subscription-price">';
      if (hasSubscription && !onSale) {
        priceHtml += '<div class="subscription-price__item subscription-price__item--subscription">';
        priceHtml += '<span class="subscription-price__price subscription-price__price--subscription price">';
        priceHtml += Utils.formatMoney(subscription_base_price * discountDecimal);
        priceHtml += '</span>';
        priceHtml += '<span class="subscription-price__label">'+ boostPFSConfig.label.subscription_price_label +'</span>';
        priceHtml += '</div>';
      } else if (hasSubscription && onSale){
        priceHtml += '<div class="subscription-price__item subscription-price__item--subscription">';
        priceHtml += '<span class="subscription-price__price subscription-price__price--subscription price">';
        priceHtml += Utils.formatMoney(data.price_min);
        priceHtml += '</span>';
        priceHtml += '<span class="subscription-price__label">'+ boostPFSConfig.label.subscription_price_label +'</span>';
        priceHtml += '</div>';
      }

      priceHtml += '<div class="subscription-price__item">';
      priceHtml += '<span class="subscription-price__price price">'+Utils.formatMoney(data.price_min)+'</span>';
      priceHtml += '<span class="subscription-price__label">'+ boostPFSConfig.label.one_time_price_label + '</span>';
      priceHtml += '</div>';
      priceHtml += '</div>';
    }
    else {
    priceHtml += '<div class="price productitem__price ' + classVaries + '">';
    priceHtml += '<div class="price__compare-at ' + visibleClass + '" data-price-compare-container>';
    var compare_at_price_html = '<span class="visually-hidden">' + boostPFSConfig.label.price_original + '</span><span class="money price__compare-at--single" data-price-compare>' + Utils.formatMoney(data.compare_at_price_min) + '</span>';
    if (onSale) {
      var compare_at_price_range_html = '';
      if (boostPFSConfig.custom.price_range_format == 'default') {
        compare_at_price_range_html = '<span class="visually-hidden">' + boostPFSConfig.label.price_original + '</span>' +
          '<span class="money price__compare-at--min" data-price-compare-min>' + Utils.formatMoney(data.compare_at_price_min) + '</span>' +
          '-' +
          '<span class="visually-hidden">' + boostPFSConfig.label.price_original + '</span>' +
          '<span class="money price__compare-at--min" data-price-compare-max>' + Utils.formatMoney(data.compare_at_price_max) + '</span>';
      } else {
        compare_at_price_range_html = boostPFSConfig.label.range_html.replace(/{{ price }}/g, compare_at_price_html);
      }
    }

    if (priceVaries && onSale && boostPFSConfig.custom.show_original && boostPFSConfig.custom.show_range) {
      priceHtml += compare_at_price_range_html;
    } else if (onSale && boostPFSConfig.custom.show_original) {
      priceHtml += compare_at_price_html;
    } else if (boostPFSConfig.custom.emphasize_price && boostPFSConfig.custom.include_spacer) {
      priceHtml += '<span class="price__spacer"></span>';
    } else if (boostPFSConfig.custom.show_original) {
      priceHtml += '<span class="money price__original" data-price-original></span>';
    }
    priceHtml += '</div>';

    if (boostPFSConfig.custom.include_hidden_price) {
      priceHtml += '<div class="price__compare-at--hidden" data-compare-price-range-hidden>';
      if (boostPFSConfig.custom.price_range_format == 'range') {
        priceHtml += '<span class="visually-hidden">' + boostPFSConfig.label.price_original + '</span>' +
          '<span class="money price__compare-at--min" data-price-compare-min>' + Utils.formatMoney(data.compare_at_price_min) + '</span>' +
          '-' +
          '<span class="visually-hidden">' + boostPFSConfig.label.price_original + '</span>' +
          '<span class="money price__compare-at--min" data-price-compare-max>' + Utils.formatMoney(data.compare_at_price_max) + '</span>';
      } else {
        priceHtml += boostPFSConfig.label.range_html.replace(/{{ price }}/g, compare_at_price_html);
      }
      priceHtml += '<div class="price__compare-at--hidden" data-compare-price-hidden>' +
        '<span class="visually-hidden">' + boostPFSConfig.label.price_original + '</span>' +
        '<span class="money price__compare-at--single" data-price-compare>' + Utils.formatMoney(data.compare_at_price_min) + '</span>'
      '</div>';
      priceHtml += '</div>';
    }

    priceHtml += '<div class="price__current ';
    if (boostPFSConfig.custom.emphasize_price) {
      priceHtml += 'price__current--emphasize ';
    }
    if (onSale) {
      priceHtml += 'price__current--on-sale ';
    }
    priceHtml += '"';
    priceHtml += ' data-price-container>';
    var price_html = Utils.formatMoney(data.price_min);
    var current_price_range_html = '';
    if (priceVaries) {
      if (boostPFSConfig.custom.price_range_format == 'range') {
        current_price_range_html += '<span class="money price__current--min" data-price-min>' + Utils.formatMoney(data.price_min) + '</span>' +
          '-' +
          '<span class="money price__current--min" data-price-max>' + Utils.formatMoney(data.price_max) + '</span>';
      } else {
        current_price_range_html += boostPFSConfig.label.range_html.replace(/{{ price }}/g, price_html);
      }
    }
    var current_price_html = '';
    if (onSale && boostPFSConfig.custom.show_original) {
      current_price_html += '<span class="visually-hidden">' + boostPFSConfig.label.price_current + '</span>';
    }
    current_price_html += price_html;
    if (boostPFSConfig.custom.show_range && priceVaries) {
      priceHtml += current_price_range_html;
    } else {
      priceHtml += current_price_html;
    }
    priceHtml += '</div>';

    if (boostPFSConfig.custom.include_unit_price) {
      var total_quantity = '<span class="productitem__total-quantity" data-total-quantity>' + firstVariant.unit_price_measurement.quantity_value + firstVariant.unit_price_measurement.quantity_unit + '</span>';
      var unit_price = '<span class="productitem__unit-price--amount money" data-unit-price-amount>' + Utils.formatMoney(firstVariant.price) + '</span>';
      var unit_measure = '<span class="productitem__unit-price--measure" data-unit-price-measure>';
      if (firstVariant.unit_price_measurement.reference_value !== 1) {
        unit_measure += firstVariant.unit_price_measurement.reference_value;
      } else {
        unit_measure += firstVariant.unit_price_measurement.reference_unit;
      }
      unit_measure += '</span>';
      priceHtml += '<div class="productitem__unit-price ';
      if (!firstVariant.unit_price_measurement) {
        priceHtml += 'hidden';
      }
      priceHtml += '">';
      priceHtml += boostPFSConfig.label.price_per_unit_html.replace(/{{ total_quantity }}/g, total_quantity).replace(/{{ unit_price }}/g, unit_price).replace(/{{ unit_measure }}/g, unit_measure);
      priceHtml += '</div>';
    }

    priceHtml += '</div>';

  }

    // Add emphasize price
    var emphasizePriceHtml = '';
    var noEmphasizePriceHtml = '';
    if (boostPFSConfig.custom.emphasize_price) {
      emphasizePriceHtml += priceHtml;
    } else {
      noEmphasizePriceHtml += priceHtml;
    }
    itemHtml = itemHtml.replace(/{{emphasizePrice}}/g, emphasizePriceHtml);
    itemHtml = itemHtml.replace(/{{noEmphasizePrice}}/g, noEmphasizePriceHtml);

    // Add vendor
    var itemVendorHtml = '';
    if (boostPFSConfig.custom.show_vendor && data.vendor !== '') {
      itemVendorHtml += '<span class="productitem--vendor"><a href="' + boostPFSConfig.shop.url + '/collections/vendors?q=' + Utils.encodeURIParamValue(data.vendor) + '">' + data.vendor + '</a></span>';
    }
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

    // Add Reviews
    if (typeof Integration === 'undefined' || !Integration.hascompileTemplate('reviews')) {
      var itemReviewsHtml = '';
      if (boostPFSConfig.custom.product_ratings_reviews && boostPFSConfig.custom.product_ratings_star_display == 'all') {
        itemReviewsHtml +=  '<div class="productitem--ratings">' +
                    '<span class="shopify-product-reviews-badge" data-id="{{itemId}}">' +
                      '<span class="spr-badge">' +
                        '<span class="spr-starrating spr-badge-starrating">' +
                          '<i class="spr-icon spr-icon-star-empty"></i>' +
                          '<i class="spr-icon spr-icon-star-empty"></i>' +
                          '<i class="spr-icon spr-icon-star-empty"></i>' +
                          '<i class="spr-icon spr-icon-star-empty"></i>' +
                          '<i class="spr-icon spr-icon-star-empty"></i>' +
                        '</span>' +
                      '</span>' +
                    '</span>' +
                  '</div>';
      }
      itemHtml = itemHtml.replace(/{{itemReviews}}/g, itemReviewsHtml);
    }

    // Add description
    var itemDescriptionHtml = jQ('<div></div>').html(data.body_html).text().replace(/<.*?>/g, ''); // Strips html tags
    if (itemDescriptionHtml.length > 150) {
      let truncatedText = itemDescriptionHtml.substring(0, 150) + '...';
      itemDescriptionHtml = `<p>${truncatedText}</p>`;
      itemDescriptionHtml += '<a href="' + Utils.buildProductItemUrl(data) + '" class="productitem--link" data-product-page-link>' + boostPFSConfig.label.view_details + '</a>';
    }
    itemDescriptionHtml = '<div class="productitem--description">' + itemDescriptionHtml + '</div>';
    itemHtml = itemHtml.replace(/{{itemDescription}}/g, itemDescriptionHtml);

    // Add main attribute (Always put at the end of this function)
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);

    if (subtitle && subtitle.value !== '') {
      itemHtml = itemHtml.replace(/{{itemSubTitle}}/g, `<p class="productitem--subtitle">${subtitle.value }</p>`);
    }
    else {
      itemHtml = itemHtml.replace(/{{itemSubTitle}}/g, '');
    }


    itemHtml = itemHtml.replace(/{{itemUrl}}/g, Utils.buildProductItemUrl(data));

    var itemQuickShopSettings = '';
    if (boostPFSConfig.custom.atc_display !== 'disabled') {
      itemQuickShopSettings += '<script type="application/json" data-quick-buy-settings>';
      itemQuickShopSettings += '{';
      itemQuickShopSettings += '"cart_redirection": ' + boostPFSConfig.custom.cart_redirect + ','
      itemQuickShopSettings += '"money_format": "' + boostPFSConfig.custom.money_format + '"'
      itemQuickShopSettings += '}'
      itemQuickShopSettings += '</script>';
    }
    itemHtml = itemHtml.replace(/{{itemQuickShopSettings}}/g, itemQuickShopSettings);

    var itemDataSha256 = sha256(JSON.stringify(data.id));
    itemHtml = itemHtml.replace(/{{itemDataSha256}}/g, itemDataSha256);

    if (typeof Utils.compileShopifyProductVariables == 'function') {
      itemHtml = Utils.compileShopifyProductVariables(data, itemHtml);
    }

    if (typeof Utils.compileShopifyProductMetafield == 'function') {
      itemHtml = Utils.compileShopifyProductMetafield(data, itemHtml);
    }

    return itemHtml;
  };

  //   var orgProductGridItemcompileTemplateFn = ProductGridItem.prototype.compileTemplate;

  //   ProductListItem.prototype.compileTemplate = function(data, index, totalProduct){
  //     return orgProductGridItemcompileTemplateFn.call(this, data, index, totalProduct);
  //   }

  function buildImage(imageInfo, size, className) {
    if (!imageInfo) {
      imageInfo = {
        src: boostPFSConfig.general.no_image_url,
        width: 480,
        height: 480,
        aspect_ratio: 1
      }
    }

    var width = size.split('x')[0];
    var height = 0;
        if (!imageInfo && imageInfo.aspect_ratio) {
          height = width * imageInfo.aspect_ratio;
        } else {
          height = 512;
        }
    var srcset = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='X' height='Y'></svg>";
    srcset = srcset.replace('X', width).replace('Y', height).replace(/ /g, '%20');

    var html = '<img ' +
      'src="' + Utils.optimizeImage(imageInfo.src, size) + '" ' +
      'class="' + className + '" ' +
      'alt="{{itemTitle}}" ' +
      'data-rimg="lazy" ' +
      'data-rimg-scale="1" ' +
      'data-rimg-template="' + Utils.optimizeImage(imageInfo.src, '{size}') + '" ' +
      'data-rimg-max="' + imageInfo.width + 'x' + imageInfo.height + '" ' +
      'data-rimg-crop ' +
      '>';

    html += '<div data-rimg-canvas></div>';
    return html;
  }

  function buildActions(data, firstVariant) {
    var actionsHtml = '';
    var has_variants = firstVariant['option_title'] == 'Default Title' ? false : true;
    if (boostPFSConfig.custom.atc_display !== 'disabled' || boostPFSConfig.custom.quick_shop_display !== 'disabled') {
      var quick_look_text = boostPFSConfig.label.quick_look_text;
      var quick_buy_text = boostPFSConfig.label.quick_buy_text;
      var learn_more_text = boostPFSConfig.label.learn_more_text;

      var quick_look_classes = 'productitem--action-trigger button-secondary';
      var quick_buy_classes = 'productitem--action-trigger productitem--action-atc button-secondary';
      if (has_variants) {
        quick_buy_text = boostPFSConfig.label.quick_choose_options;
      }
      if (!data.available) {
        quick_buy_text = boostPFSConfig.label.sold_out;
        quick_buy_classes = quick_buy_classes + ' disabled';
      }
      actionsHtml += '<div class="productitem--actions" data-product-actions>';
      if (boostPFSConfig.custom.grid_list) {
        actionsHtml += '<div class="productitem--listview-price">{{noEmphasizePrice}}</div>';
        actionsHtml += '<div class="productitem--listview-badge">{{itemLabels}}</div>';
      }
      if (boostPFSConfig.custom.quick_shop_display !== 'disabled') {
        if (boostPFSConfig.custom.enable_quickshop) {
        actionsHtml += '<div class="productitem--action quickshop-button ';
        if (boostPFSConfig.custom.quick_shop_display == 'desktop') actionsHtml += 'productitem-action--desktop';
        actionsHtml += '">';
        actionsHtml += '<button class="' + quick_look_classes + '" data-quickshop-full ';
        if (boostPFSConfig.custom.gallery_thumbnail_position == 'left') actionsHtml += 'data-thumbs-left';
        actionsHtml += ' data-id="{{itemId}}" type="button" tabindex="1">' + quick_look_text + '</button>';
        actionsHtml += '</div>';
        }
        else {
          actionsHtml += '<div class="productitem--action">';
          actionsHtml += '<a class="productitem--action-trigger button-primary" href="'+Utils.buildProductItemUrl(data)+'">';
          actionsHtml += learn_more_text + '<span class="visually-hidden">about '+data.title+'</span>';
          actionsHtml += '</a>';
          actionsHtml += '</div>';

        }
      }
      if (boostPFSConfig.custom.atc_display !== 'disabled') {
        if (!has_variants) {
          var temp = ' data-quick-buy ';
        } else {
          var temp = ' data-quickshop-slim ';
        }
        actionsHtml += '<div class="productitem--action atc--button ';
        if (boostPFSConfig.custom.atc_display == 'desktop') actionsHtml += 'productitem-action--desktop';
        actionsHtml += '">' +
          '<button class="' + quick_buy_classes + '" tabindex="1" type="button" aria-label="' + quick_buy_text + '"' +
          temp + 'data-variant-id="' + data.variants[0].id + '"';
        if (!data.available) {
          actionsHtml += ' disabled';
        }
        actionsHtml += '>';
        actionsHtml += '<span class="atc-button--text">' + quick_buy_text + '</span>';
        actionsHtml += '<span class="atc-button--icon">';
        actionsHtml += '<svg aria-hidden="true" focusable="false" role="presentation" width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" > <g fill-rule="nonzero" fill="currentColor"> <path d="M13 26C5.82 26 0 20.18 0 13S5.82 0 13 0s13 5.82 13 13-5.82 13-13 13zm0-3.852a9.148 9.148 0 1 0 0-18.296 9.148 9.148 0 0 0 0 18.296z" opacity=".29"/><path d="M13 26c7.18 0 13-5.82 13-13a1.926 1.926 0 0 0-3.852 0A9.148 9.148 0 0 1 13 22.148 1.926 1.926 0 0 0 13 26z"/> </g> </svg>';
        actionsHtml += '</span>';
        actionsHtml += '</button>';
        actionsHtml += '</div>';
      }

      actionsHtml += '</div>';
    }
    return actionsHtml;
  }

  function buildSwatch(data) {
    var html = '';
    var swatches = [];
    var swatchValues = [];
    var swatchOptionIndex = 1;
    if (boostPFSConfig.custom.swatches_enable && boostPFSConfig.custom.swatch_trigger) {
      var customColors = boostPFSConfig.custom.swatches_custom_colors.split('\n');
      data.variants.forEach(function(variant) {
        var swatchValue = '';
        variant.options = variant.merged_options; // Use for theme function
        variant.merged_options.forEach(function(merged_option, index) {
          var key = merged_option.split(':')[0].trim();
          var value = merged_option.split(':')[1].trim();
          if (key.toLowerCase() == boostPFSConfig.custom.swatch_trigger && swatchValues.indexOf(value.toLowerCase()) == -1) {
            swatchValue = value;
            swatchValues.push(value.toLowerCase());
            swatchOptionIndex = index + 1;
          }
        })
        if (swatchValue) {
          var swatch = '<label>' +
            '<input class="productitem--swatches-input" type="radio" name="swatch" value="{{swatchValue}}">' +
            '<div class="productitem--swatches-swatch-wrapper" data-swatch-tooltip="{{swatchValue}}" data-swatch>' +
            '<div class="productitem--swatches-swatch">' +
            '<div class="productitem--swatches-swatch-inner" ' +
            'style="background-color:{{backgroundColor}}; background-color:{{customColor}}; background-image:url({{backgroundImage}}); background-size:cover"></div>' +
            '</div>' +
            '</div>' +
            '</label>';
          var customColor = '';
          customColors.forEach(function(color) {
            if (color.split(':').length == 2) {
              var customColorName = color.split(':')[0].trim().toLowerCase();
              var customColorValue = color.split(':')[1].trim().toLowerCase();
              if (customColorName == swatchValue.toLowerCase()) {
                customColor = customColorValue;
              }
            }
          })

          var slugifyValue = Utils.slugify(swatchValue);
          var backgroundColor = slugifyValue.split('-').pop();
          var backgroundImage = '';
          if (boostPFSConfig.custom.swatches_option_style == "variant_image" && variant.image) {
            backgroundImage = Utils.optimizeImage(variant.image, '50x');
          } else {
            backgroundImage = boostPFSAppConfig.general.file_url.split('?')[0] + slugifyValue + '.png';
          }

          swatch = swatch.replace(/{{swatchValue}}/g, swatchValue);
          swatch = swatch.replace(/{{backgroundColor}}/g, backgroundColor);
          swatch = swatch.replace(/{{backgroundImage}}/g, backgroundImage);
          swatch = swatch.replace(/{{customColor}}/g, customColor);
          swatches.push(swatch);
        }
      })

      if (swatchValues.length > 0) {
        var html = '<div class="productitem--swatches {{swatchClass}}" data-swatches>' +
          '<script type="application/json" data-swatch-data>' +
          '{' +
          '"hash": "{{itemDataSha256}}",' +
          '"swatchOptionKey": "{{swatchOptionKey}}",' +
          '"variants": {{variantsJson}}' +
          '}' +
          '</script>' +
          '<form class="productitem--swatches-container" data-swatches-container>' +
          swatches.join(' ') +
          '</form>' +
          '<button class="productitem--swatches-count-wrapper" data-swatch-count-wrapper>' +
          '<div class="productitem--swatches-count" data-swatch-count>+</div>' +
          '</button>' +
          '</div>';

        var swatchClass = boostPFSConfig.custom.swatches_shape == 'square' &&
          boostPFSConfig.custom.swatches_option_style == 'variant_image' ?
          'swatches-variant-images-square' : '';

        html = html.replace(/{{swatchClass}}/g, swatchClass);
        html = html.replace(/{{swatchOptionKey}}/g, 'option' + swatchOptionIndex);
        html = html.replace(/{{variantsJson}}/g, JSON.stringify(data.variants));
      }
    }

    return html;
  }

  /************************** END BUILD PRODUCT LIST **************************/

  // Build Pagination
  ProductPaginationDefault.prototype.compileTemplate = function(totalProduct) {
    if (!totalProduct) totalProduct = this.totalProduct;
    // Get page info
    var currentPage = parseInt(Globals.queryParams.page);
    var totalPage = Math.ceil(totalProduct / Globals.queryParams.limit);

    if (totalPage > 1) {
      var paginationHtml = boostPFSTemplate.paginateHtml;

      // Build Previous
      var previousHtml = (currentPage > 1) ? boostPFSTemplate.previousActiveHtml : boostPFSTemplate.previousDisabledHtml;
      previousHtml = previousHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage - 1));
      paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

      // Build Next
      var nextHtml = (currentPage < totalPage) ? boostPFSTemplate.nextActiveHtml : boostPFSTemplate.nextDisabledHtml;
      nextHtml = nextHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage + 1));
      paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

      // Create page items array
      var beforeCurrentPageArr = [];
      for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
        beforeCurrentPageArr.unshift(iBefore);
      }
      if (currentPage - 4 > 0) {
        beforeCurrentPageArr.unshift('...');
      }
      if (currentPage - 4 >= 0) {
        beforeCurrentPageArr.unshift(1);
      }
      beforeCurrentPageArr.push(currentPage);

      var afterCurrentPageArr = [];
      for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
        afterCurrentPageArr.push(iAfter);
      }
      if (currentPage + 3 < totalPage) {
        afterCurrentPageArr.push('...');
      }
      if (currentPage + 3 <= totalPage) {
        afterCurrentPageArr.push(totalPage);
      }

      // Build page items
      var pageItemsHtml = '';
      var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
      for (var iPage = 0; iPage < pageArr.length; iPage++) {
        if (pageArr[iPage] == '...') {
          pageItemsHtml += boostPFSTemplate.pageItemRemainHtml;
        } else {
          pageItemsHtml += (pageArr[iPage] == currentPage) ? boostPFSTemplate.pageItemSelectedHtml : boostPFSTemplate.pageItemHtml;
        }
        pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
        pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, pageArr[iPage]));
      }
      paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);
      return paginationHtml;
    }

    return '';
  };

  /************************** BUILD TOOLBAR **************************/

  // Build Sorting
  ProductSorting.prototype.compileTemplate = function() {
    if (boostPFSTemplate.hasOwnProperty('sortingHtml')) {

      var sortingArr = Utils.getSortingList();
      if (sortingArr) {
        // Build content
        var sortingItemsHtml = '';
        for (var k in sortingArr) {
          sortingItemsHtml += '<option value="' + k + '">' + sortingArr[k] + '</option>';
        }
        var html = boostPFSTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
        return html;
      }
      return '';
    }
  };

  // Build Show Limit
  ProductLimit.prototype.compileTemplate = function() {
    if (boostPFSTemplate.hasOwnProperty('showLimitHtml')) {

      var numberList = Settings.getSettingValue('general.showLimitList');
      if (numberList != '') {
        // Build content
        var showLimitItemsHtml = '';
        var arr = numberList.split(',');
        for (var k = 0; k < arr.length; k++) {
          if (arr[k] == Globals.queryParams.limit) {
            showLimitItemsHtml += '<li><a class="utils-showby-item active" href="' + arr[k] + '">' + arr[k] + '</a></li>';
          } else {
            showLimitItemsHtml += '<li><a class="utils-showby-item" href="' + arr[k] + '">' + arr[k] + '</a></li>';
          }
        }
        var html = boostPFSTemplate.showLimitHtml.replace(/{{showLimitItems}}/g, showLimitItemsHtml);
        return html;
      }
    }
    return '';
  };

  ProductLimit.prototype.bindEvents = function() {
    var _this = this;
    jQ(Selector.topShowLimit + ' li a').click(function(e) {
      event.preventDefault();
      Globals.internalClick = true;
      FilterApi.setParam('limit', jQ(this).attr('href'));
      FilterApi.applyFilter();
    })
  };

  // Build Breadcrumb
  Breadcrumb.prototype.compileTemplate = function(colData, apiData) {
    if (!colData) colData = this.collectionData;
    if (typeof colData !== 'undefined' && colData.hasOwnProperty('collection')) {
      var colInfo = colData.collection;
      var delimiter = '<span class="breadcrumbs-delimiter" aria-hidden="true"><svg aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5"><path fill="currentColor" fill-rule="evenodd" d="M1.002.27L.29.982l3.712 3.712L7.714.982 7.002.27l-3 3z"/></svg></span>';
      var breadcrumbHtml = '<a href="/">' + boostPFSConfig.label.breadcrumb_home + '</a> ';
      breadcrumbHtml += delimiter;
      breadcrumbHtml += ' <span>' + colInfo.title + '</span>';
      return breadcrumbHtml;
    }
    return '';
  };

  /************************** END BUILD TOOLBAR **************************/

  // Add additional feature for product list, used commonly in customizing product list
  ProductList.prototype.afterRender = function(data, eventType) {
    // if (jQ(Selector.products + ' [data-rimg="lazy"]').length > 0) {
    //   jQ(Selector.products + ' [data-rimg="lazy"]').attr('data-rimg', 'loaded');
    // }
  };

  // Build additional elements
  FilterResult.prototype.afterRender = function(data, eventType) {
    /**
    In empire.js.liquid:
    - Add "var bcInitEmpire;" to the begining
    - Go to the end, add "bcInitEmpire = Empire_initEmpire;" before the 2 brackets close:

         (some codes here...)
         bcInitEmpire = Empire_initEmpire;
         })
         });
         (end of file)
    */

    if (window.bcInitEmpire && typeof bcInitEmpire == 'function') {
      // Don't reinit the recently viewed block
      if (jQ('[data-section-type="static-recently-viewed"]').length > 0) {
        jQ('[data-section-type="static-recently-viewed"]').attr('data-section-type', 'bc-static-recently-viewed');
      }
      // Don't reinit the header
      if (jQ('[data-section-type="static-header"]').length > 0) {
        jQ('[data-section-type="static-header"]').attr('data-section-type', 'bc-static-header');
      }
      // Reinit theme
      bcInitEmpire();
      if (jQ('[data-section-type="bc-static-recently-viewed"]').length > 0) {
        jQ('[data-section-type="bc-static-recently-viewed"]').attr('data-section-type', 'static-recently-viewed');
      }
      if (jQ('[data-section-type="bc-static-header"]').length > 0) {
        jQ('[data-section-type="bc-static-header"]').attr('data-section-type', 'static-header');
      }
    }
  };

  // sha256 of a string and display its hex digest
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    };

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length'
    var i, j; // Used as a counter across the whole file
    var result = ''

    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;

    //* caching results is optional - remove/add slash from front of this line to toggle
    // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
    // (we actually calculate the first 64, but extra values are just ignored)
    var hash = sha256.h = sha256.h || [];
    // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    var k = sha256.k = sha256.k || [];
    var primeCounter = k[lengthProperty];
    /*/
    var hash = [], k = [];
    var primeCounter = 0;
    //*/

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80' // Append Ƈ' bit (plus zero padding)
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00' // More zero padding
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return; // ASCII check: only accept characters in range 0-255
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength)

    // process each chunk
    for (j = 0; j < words[lengthProperty];) {
      var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
      var oldHash = hash;
      // This is now the undefinedworking hash", often labelled as variables a...g
      // (we have to truncate as well, otherwise extra entries at the end accumulate
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        var i2 = i + j;
        // Expand the message into 64 words
        // Used below if
        var w15 = w[i - 15],
          w2 = w[i - 2];

        // Iterate
        var a = hash[0],
          e = hash[4];
        var temp1 = hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
          +
          ((e & hash[5]) ^ ((~e) & hash[6])) // ch
          +
          k[i]
          // Expand the message schedule if needed
          +
          (w[i] = (i < 16) ? w[i] : (
            w[i - 16] +
            (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) // s0
            +
            w[i - 7] +
            (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) // s1
          ) | 0);
        // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
          +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

        hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : '') + b.toString(16);
      }
    }
    return result;
  };
  
  /* start-boost-custom */
  /* #boost-109707: Customize refine by item */
  FilterRefineBy.prototype.afterRender = function() {
    var filterOption = '';
    
    for (var item of this.refineByItems) {
      var label = item.filterOption.label;
      item.$element.find('.refine-by-option').hide();
      
      if (label === filterOption) continue;
      
      var html = '<div class="refine-by-option" data-label="' + label + '">' + label + '</div>';
      jQ(html).insertBefore(item.$element);   
      
      filterOption = label;
    }
  }

  /* A duplicare of ProductGridItem.js events/actions after render */
  ProductList.prototype.afterRender = function (data) {
    if (!data) data = this.data;

    // Dispatch a custom event to use in StaticCollection
    window.dispatchEvent(new CustomEvent('boostItemsRenders'));

  }
  /* end-boost-custom */
})();