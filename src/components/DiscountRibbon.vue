<template>
  <div
    v-show="!removed"
    class="discount-ribbon"
    :class="{ show: !hide, absolute }"
    ref="discountRibbon"
    :style="computedStyles"
  >
    <div class="button-content">
      <div class="button-text-container" :class="{ 'has-discount': !loading && discount }">
        <div class="button-logo-container">
          <Logo class="button-logo" width="16" height="16" />
        </div>
        <div class="button-text" :class="{ 'has-discount': !loading && discount }">
          <div v-if="loading" class="dot-pulse"></div>
          <div v-else>{{ discount }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, onBeforeUnmount, ref, computed } from '@vue/composition-api';
import Logo from '../assets/logo.svg?inline';
import { sendMessageToBackground } from '../utils/extension-messenger';

export default defineComponent({
  name: 'DiscountRibbon',
  components: {
    Logo,
  },
  props: {
    absolute: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      required: true,
    },
    top: {
      type: String,
      default: '',
    },
    left: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const removed = ref(false);
    const hide = ref(true);
    const loading = ref(true);
    const discount = ref('');
    const discountRibbon = ref(null);

    const computedStyles = computed(() => {
      return {
        ...(props.top ? { top: props.top } : {}),
        ...(props.left ? { left: props.left } : {}),
      };
    });

    let intersectionObserver = null;

    const fetchData = () => {
      if (props.url.includes('/aclk?')) {
        const urlToQuery = props.url.startsWith('/aclk?') ? `https://www.google.com/${props.url}` : props.url;
        sendMessageToBackground('DECODE_GOOGLE_URL', urlToQuery).then((url) => fetchMerchant(url));
      } else {
        fetchMerchant(props.url);
      }
    };

    const fetchMerchant = (url) => {
      sendMessageToBackground('LOOK_UP_MERCHANT', url).then((merchant) => {
        if (merchant && merchant.bestPercentOff > 0) {
          loading.value = false;
          discount.value = `Up to ${merchant.bestPercentOff}% off`;
        } else {
          // Wait a bit and fade out
          setTimeout(() => {
            hide.value = true;
          }, 500);
          // After fading out, remove from DOM
          setTimeout(() => {
            removed.value = true;
          }, 1000);
        }
      });
    };

    // Fetch data only when the item is in view
    const handleIntersection = (entries) => {
      if (entries[0].isIntersecting) {
        fetchData();
        intersectionObserver.unobserve(discountRibbon.value);
      }
    };

    onMounted(() => {
      setTimeout(() => (hide.value = false), 100);

      intersectionObserver = new IntersectionObserver(handleIntersection, { threshold: 0.25 });
      intersectionObserver.observe(discountRibbon.value);
    });

    onBeforeUnmount(() => {
      intersectionObserver.unobserve(discountRibbon.value);
    });

    return {
      discount,
      loading,
      hide,
      removed,
      discountRibbon,
      computedStyles,
    };
  },
});
</script>

<style lang="postcss" scoped>
.discount-ribbon {
  opacity: 0;
  transition: opacity 250ms ease-in 200ms, min-width 250ms ease-in 200ms;
  width: fit-content;
  margin: 4px 0;
  z-index: 100;
  font-size: 14px;

  &.show {
    opacity: 1;
  }

  &.absolute {
    position: absolute;
    left: 4px;
    top: 4px;
  }
}

.button-content {
  background: linear-gradient(135deg, #3f35f2 0%, #9966ff 100%);
  max-height: 24px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  color: #fff !important;
}

.button-logo-container {
  display: flex;
}

.button-text-container {
  height: 24px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  &.has-discount {
    min-width: 130px;
  }

  .button-logo {
    width: 12px;
    height: 12px;
    margin-left: 6px;
    margin-right: 6px;

    .logo-circle {
      fill: #fff !important;
    }
  }

  .button-text {
    min-width: 54px;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    &.has-discount {
      min-width: 90px;
    }
  }
}

/**
 * ==============================================
 * Dot Pulse
 * ==============================================
 */
.dot-pulse {
  position: relative;
  left: -9999px;
  width: 5px;
  height: 5px;
  border-radius: 5px;
  background-color: #fff;
  color: #fff;
  box-shadow: 9999px 0 0 -5px #fff;
  animation: dotPulse 1.5s infinite linear;
  animation-delay: 0.25s;
  transform: translateX(20px);
}

.dot-pulse::before,
.dot-pulse::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
  width: 5px;
  height: 5px;
  border-radius: 5px;
  background-color: #fff;
  color: #fff;
}

.dot-pulse::before {
  box-shadow: 9984px 0 0 -5px #fff;
  animation: dotPulseBefore 1.5s infinite linear;
  animation-delay: 0s;
}

.dot-pulse::after {
  box-shadow: 10014px 0 0 -5px #fff;
  animation: dotPulseAfter 1.5s infinite linear;
  animation-delay: 0.5s;
}

@keyframes dotPulseBefore {
  0% {
    box-shadow: 9984px 0 0 -5px #fff;
  }
  30% {
    box-shadow: 9984px 0 0 2px #fff;
  }
  60%,
  100% {
    box-shadow: 9984px 0 0 -5px #fff;
  }
}

@keyframes dotPulse {
  0% {
    box-shadow: 9999px 0 0 -5px #fff;
  }
  30% {
    box-shadow: 9999px 0 0 2px #fff;
  }
  60%,
  100% {
    box-shadow: 9999px 0 0 -5px #fff;
  }
}

@keyframes dotPulseAfter {
  0% {
    box-shadow: 10014px 0 0 -5px #fff;
  }
  30% {
    box-shadow: 10014px 0 0 2px #fff;
  }
  60%,
  100% {
    box-shadow: 10014px 0 0 -5px #fff;
  }
}
</style>
