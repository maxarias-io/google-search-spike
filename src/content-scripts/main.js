import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api';
// import { sendMessageToBackground } from '../utils/extension-messenger';
import DiscountRibbon from '../components/DiscountRibbon.vue';

import '../assets/main.css';

Vue.use(VueCompositionAPI);

console.log('init content script');

// const SHOW_ALL_MATCHES = false;

// // These are Ads that look like search results, on top of the regular search results
// const decorateTopAds = () => {
//   document.querySelectorAll('#tads a[data-pcu]').forEach((element) => {
//     const searchResultItemHref = element.parentElement.getAttribute('href');

//     sendMessageToBackground('LOOK_UP_MERCHANT', searchResultItemHref).then((merchant) => {
//       const discount = generateDiscount({
//         element,
//         url: searchResultItemHref,
//         merchant,
//       });

//       // Append after the element, as a sibling
//       if (discount) {
//         element.parentNode.insertBefore(discount, element.nextSibling);
//       }
//     });
//   });
// };

// Regular search results.
const decorateSearchResults = () => {
  document.querySelectorAll('#search a > h3').forEach((element) => {
    const searchResultItemHref = element.parentElement.getAttribute('href');

    const anchorElement = element.closest('a');
    const div = document.createElement('div');
    div.classList.add('sc-promo');
    div.dataset.discountUrl = searchResultItemHref;

    anchorElement.parentNode.insertBefore(div, anchorElement.nextSibling);

    // sendMessageToBackground('LOOK_UP_MERCHANT', searchResultItemHref).then((merchant) => {
    //   const discount = generateDiscount({
    //     element,
    //     url: searchResultItemHref,
    //     merchant,
    //   });

    //   // Append after the element, as a sibling
    //   if (discount) {
    //     const anchorElement = element.closest('a');

    //     anchorElement.parentNode.insertBefore(discount, anchorElement.nextSibling);
    //   }
    // });
  });
};

// // These are offers that show up on the right sidebar
// const decorateOrganicOffers = () => {
//   document.querySelectorAll('#kp-wp-tab-overview div[data-attrid="organic_offers_grid"] > div a').forEach((element) => {
//     const itemHref = element.getAttribute('href');

//     sendMessageToBackground('LOOK_UP_MERCHANT', itemHref).then((merchant) => {
//       const discount = generateDiscount({
//         element,
//         url: itemHref,
//         merchant,
//       });

//       if (discount) {
//         element.append(discount);
//       }
//     });
//   });
// };

// // These are an Ad that sit at the top of the page of the searched product
// const decorateRichResults = () => {
//   document.querySelectorAll('.cu-container .pla-unit').forEach((element) => {
//     const clickableTarget = element.querySelector('.pla-unit-single-clickable-target');

//     if (clickableTarget) {
//       const richResultHref = clickableTarget.getAttribute('href');

//       sendMessageToBackground('LOOK_UP_MERCHANT', richResultHref).then((merchant) => {
//         const discount = generateDiscount({
//           element,
//           url: richResultHref,
//           merchant,
//         });

//         if (discount) {
//           discount.classList.add('sc-promo-absolute');
//           clickableTarget.nextElementSibling.append(discount);
//         }
//       });
//     }
//   });
// };

// const decorateShoppingAdResults = () => {
//   document.querySelectorAll('.sh-sr__shop-result-group .sh-np__click-target').forEach((element) => {
//     const shoppingItemHref = `${window.location.origin}/${element.getAttribute('href')}`;

//     sendMessageToBackground('DECODE_GOOGLE_URL', shoppingItemHref).then((decodedUrl) => {
//       if (decodedUrl) {
//         sendMessageToBackground('LOOK_UP_MERCHANT', decodedUrl).then((merchant) => {
//           const discount = generateDiscount({
//             element,
//             url: decodedUrl,
//             merchant,
//           });

//           const sellerContainer = element.querySelector('.sh-np__seller-container');

//           if (discount) {
//             sellerContainer.append(discount);
//           }
//         });
//       }
//     });
//   });
// };

// const decorateShoppingResults = () => {};

// const decorateShoppingBestResult = () => {
//   document.querySelectorAll('.sh-pr__product-results .sh-dp__cont .pspo-fade .shntl').forEach((element) => {
//     const bestResultItemHref = `${window.location.origin}/${element.getAttribute('href')}`;

//     sendMessageToBackground('DECODE_GOOGLE_URL', bestResultItemHref).then((decodedUrl) => {
//       if (decodedUrl) {
//         sendMessageToBackground('LOOK_UP_MERCHANT', decodedUrl).then((merchant) => {
//           const discount = generateDiscount({
//             element,
//             url: decodedUrl,
//             merchant,
//           });

//           // Append after the Anchor
//           if (discount) {
//             element.parentNode.insertBefore(discount, element.nextSibling);
//           }
//         });
//       }
//     });
//   });
// };

// const decorateShoppingOtherResults = () => {
//   document.querySelectorAll('.sh-pr__product-results .sh-dlr__list-result .shntl').forEach((element) => {
//     const bestResultItemHref = `${window.location.origin}/${element.getAttribute('href')}`;

//     sendMessageToBackground('DECODE_GOOGLE_URL', bestResultItemHref).then((decodedUrl) => {
//       if (decodedUrl) {
//         sendMessageToBackground('LOOK_UP_MERCHANT', decodedUrl).then((merchant) => {
//           const discount = generateDiscount({
//             element,
//             url: decodedUrl,
//             merchant,
//           });

//           if (discount) {
//             element.append(discount);
//           }
//         });
//       }
//     });
//   });
// };

// const decorateShoppingBottomAds = () => {
//   document.querySelectorAll('#bottomads a[data-pcu]').forEach((element) => {
//     const searchResultItemHref = element.getAttribute('href');

//     sendMessageToBackground('LOOK_UP_MERCHANT', searchResultItemHref).then((merchant) => {
//       const discount = generateDiscount({
//         element,
//         url: searchResultItemHref,
//         merchant,
//       });

//       if (discount) {
//         element.parentNode.insertBefore(discount, element.nextSibling);
//       }
//     });
//   });
// };

// // Generates the discount Div
// const generateDiscount = (item) => {
//   if (!SHOW_ALL_MATCHES && !item.merchant?.bestPercentOff > 0) {
//     return;
//   }

//   const div = document.createElement('div');
//   div.classList.add('sc-promo');

//   // TODO: Should we get "bestCode"?
//   // const merchantDiscountText = merchantDiscount(item.merchant);

//   if (item.merchant?.bestPercentOff > 0) {
//     // TODO: Send this data to the Vue component
//     div.dataset.discount = `Up to ${item.merchant.bestPercentOff}% off`;
//     // div.append(`Up to ${item.merchant.bestPercentOff}% off`);
//   }

//   if (SHOW_ALL_MATCHES && !item.merchant?.bestPercentOff > 0) {
//     // div.append(`No Code - ${item.merchant?.name || 'N/A'}`);
//     div.classList.add('no-code');
//   }

//   return div;
// };

// decorateTopAds();
decorateSearchResults();
// decorateOrganicOffers();
// decorateRichResults();
// decorateShoppingAdResults();
// decorateShoppingResults();

// Best results aren't immediately in the page
// setTimeout(() => {
//   decorateShoppingBestResult();
// }, 2000);

// decorateShoppingOtherResults();
// decorateShoppingBottomAds();

// setTimeout(() => {
document.querySelectorAll('.sc-promo').forEach((element) => {
  new Vue({
    render: (h) => {
      return h(DiscountRibbon, {
        props: {
          url: element.dataset.discountUrl,
        },
      });
    },
  }).$mount(element);
});
// }, 3000);
