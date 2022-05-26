var boostPFSIntegrationTemplate = {
   compileTemplate: {
     reviews: "var itemReviewHtml = '<div class=\"grid-view-item__reviews\"><div class=\"yotpo bottomLine\" data-appkey=\".......\" data-domain=\"' + Utils.escape(boostPFSConfig.shop.domain) + '\" data-product-id=\"' + data.id + '\" data-product-models=\"' + data.id + '\" data-name=\"' + data.title + '\" data-url=\"{{itemUrl}}\" data-image-url=\"{{itemThumbUrl}}\" data-description=\"{{itemDescription}}\" data-bread-crumbs=\"{{itemTags}}\"></div></div>'; itemHtml = itemHtml.replace(/{{itemReviews}}/g, itemReviewHtml); var itemDescription = data.description; itemDescription = itemDescription.substr(0, itemDescription.indexOf('##highlights##')); itemHtml = itemHtml.replace(/{{itemDescription}}/g, itemDescription); itemHtml = itemHtml.replace(/{{itemTags}}/g, Utils.escape(data.tags.join(';')));"
   },
   call3rdFunction: {
     reviews: "if (typeof Yotpo !== 'undefined') {  var api = new Yotpo.API(yotpo);  api.refreshWidgets();}"
   }
 };