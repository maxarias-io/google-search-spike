import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api';
// import { sendMessageToBackground } from '../utils/extension-messenger';
import DiscountRibbon from '../components/DiscountRibbon.vue';

Vue.use(VueCompositionAPI);

console.log('init content script');

const GOOGLE_TAGS = ['SALE', 'CURBSIDE', 'LOW PRICE', 'FREE 2-DAY', 'GREAT PICK', 'PRICE DROP'];

const decorateSearchResults = () => {
  // Only run these on Desktop resolution
  if (window.innerWidth > 768) {
    // Desktop Ads
    document.querySelectorAll('#tads > div, #bottomads > div').forEach((element) => {
      const searchResultItemHref = element.querySelector('a').getAttribute('href');
      const discount = generateDiscount(searchResultItemHref);

      element.insertBefore(discount, element.firstChild);
    });

    // Not _great_ but these are the search result items on desktop
    document.querySelectorAll('#search > div > div > div').forEach((element) => {
      const citeElement = element.querySelector('cite[role="text"]');

      // I couldn't find a better way of distinguishing these from the other search results
      const peopleAlsoAsk = element.innerHTML.includes('People also ask');

      if (citeElement && citeElement.closest('a') && !peopleAlsoAsk) {
        const searchResultItemHref = citeElement.closest('a').getAttribute('href');
        const discount = generateDiscount(searchResultItemHref);

        element.insertBefore(discount, element.firstChild);
      }
    });
  } else {
    // Mobile search results.
    document.querySelectorAll('#tads a[role="presentation"], #rso a[role="presentation"]').forEach((element) => {
      const searchResultItemHref = element.parentElement.getAttribute('href');
      const discount = generateDiscount(searchResultItemHref);

      element.insertBefore(discount, element.firstChild);
    });
  }
};

// These are offers that show up on the right sidebar
const decorateOrganicOffers = () => {
  document.querySelectorAll('#kp-wp-tab-overview div[data-attrid="organic_offers_grid"] > div a').forEach((element) => {
    const itemHref = element.getAttribute('href');

    const discount = generateDiscount(itemHref);
    element.append(discount);
  });
};

// These are an Ad that sit at the top of the page of the searched product
const decorateRichResults = () => {
  // Desktop Rich results
  document.querySelectorAll('.cu-container .pla-unit a.clickable-card').forEach((element) => {
    const itemHref = element.getAttribute('href');
    const container = element.closest('.pla-unit').querySelector('.pla-unit-container');

    if (container) {
      const discount = generateDiscount(itemHref);
      discount.dataset.absolute = true;

      container.append(discount);
    }
  });

  // Mobile Rich results
  document.querySelectorAll('.commercial-unit-mobile-top .pla-unit').forEach((element) => {
    const itemHref = element.getAttribute('href');

    const discount = generateDiscount(itemHref);
    discount.dataset.absolute = true;

    element.firstElementChild.append(discount);
  });
};

// Decorates Shopping page Ads
const decorateShoppingAdResults = () => {
  if (window.innerWidth > 768) {
    document.querySelectorAll('.sh-sr__shop-result-group .sh-np__click-target').forEach((element) => {
      const shoppingItemHref = element.getAttribute('href');

      const discount = generateDiscount(shoppingItemHref);
      discount.dataset.absolute = true;

      const saleElement = Array.from(element.querySelectorAll('div')).find((el) =>
        GOOGLE_TAGS.includes(el.textContent.toUpperCase()),
      );

      if (saleElement) {
        discount.dataset.top = '32px';
        discount.dataset.left = '8px';
      }

      const sellerContainer = element.closest('.sh-np__click-target');
      sellerContainer.append(discount);
    });
  } else {
    document.querySelectorAll('.sh-sr__tau .sh-np__click-target').forEach((element) => {
      const itemHref = element.getAttribute('href');
      const discount = generateDiscount(itemHref);
      discount.dataset.absolute = true;

      const saleElement = Array.from(element.querySelectorAll('div')).find((el) =>
        GOOGLE_TAGS.includes(el.textContent.toUpperCase()),
      );

      if (saleElement) {
        discount.dataset.top = '32px';
        discount.dataset.left = '8px';
      }

      element.append(discount);
    });
  }
};

// Best result, Desktop only, doesn't always popup
const decorateShoppingBestResult = () => {
  document.querySelectorAll('.sh-pr__product-results .sh-dp__cont .pspo-fade .shntl').forEach((element) => {
    const bestResultItemHref = element.getAttribute('href');

    const discount = generateDiscount(bestResultItemHref);

    element.parentNode.insertBefore(discount, element.nextSibling);
  });
};

const decorateShoppingSearchResults = () => {
  if (window.innerWidth > 768) {
    document.querySelectorAll('.sh-pr__product-results > div').forEach((element) => {
      const itemAnchor = element.querySelector('a.shntl');
      if (itemAnchor) {
        const itemHref = itemAnchor.getAttribute('href').replace('/url?url=', '');

        // Special cases for products that link to a Google page for shopping, not a Merchant
        if (!itemHref.startsWith('/shopping/product')) {
          const discount = generateDiscount(itemHref);
          discount.dataset.absolute = true;

          const container = itemAnchor.closest('.sh-dgr__content');

          if (container.previousElementSibling && container.previousElementSibling.innerText) {
            discount.dataset.top = '32px';
            discount.dataset.left = '8px';
          }

          container.append(discount);
        }
      }
    });
  } else {
    // Mobile Shopping page
    document
      .querySelectorAll('.sh-pr__product-results .sh-pr__product-result .sh-pr__secondary-container a')
      .forEach((element) => {
        const itemHref = element.getAttribute('href').replace('/url?q=', '');
        const discount = generateDiscount(itemHref);
        discount.dataset.absolute = true;

        const container = element.closest('.sh-pr__product-result');

        const saleElement = Array.from(container.querySelectorAll('div + div')).find((el) =>
          GOOGLE_TAGS.includes(el.textContent.toUpperCase()),
        );

        if (saleElement) {
          discount.dataset.top = '32px';
          discount.dataset.left = '8px';
        }

        container.append(discount);
      });
  }
};

const decorateShoppingTopReviews = () => {
  document
    .querySelectorAll('#sh-sr__results .smsrc .sh-pr__product-result .sh-pr__secondary-container a')
    .forEach((element) => {
      const itemHref = element.getAttribute('href').replace('/url?q=', '');
      const discount = generateDiscount(itemHref);
      discount.dataset.absolute = true;

      const container = element.closest('.sh-pr__product-result');

      const saleElement = Array.from(container.querySelectorAll('div + div')).find((el) =>
        GOOGLE_TAGS.includes(el.textContent.toUpperCase()),
      );

      if (saleElement) {
        discount.dataset.top = '32px';
        discount.dataset.left = '8px';
      }

      container.append(discount);
    });
};

// Generates the discount Div
const generateDiscount = (url) => {
  const div = document.createElement('div');
  div.classList.add('sc-promo');
  div.dataset.discountUrl = url;

  return div;
};

const createVueInstance = (element) => {
  new Vue({
    render: (h) => {
      return h(DiscountRibbon, {
        props: {
          absolute: Boolean(element.dataset.absolute),
          left: element.dataset.left,
          top: element.dataset.top,
          url: element.dataset.discountUrl,
        },
      });
    },
  }).$mount(element);
};

const init = () => {
  // Search page
  decorateSearchResults();
  decorateRichResults();
  decorateOrganicOffers();

  // Shopping page

  decorateShoppingAdResults();
  // Best results aren't immediately in the page
  setTimeout(() => {
    decorateShoppingBestResult();
  }, 2000);

  decorateShoppingSearchResults();
  decorateShoppingTopReviews();

  document.querySelectorAll('.sc-promo').forEach((element) => {
    createVueInstance(element);
  });
};

window.addEventListener('load', init, false);
