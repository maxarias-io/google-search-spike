<template>
  <button
    class="discount-ribbon flex justify-center items-center focus:outline-none focus-visible:ring dark:focus-visible:ring show immediate"
  >
    <div class="button-content flex flex-row rounded-full text-white items-center expanded">
      <div class="flex flex-row justify-center items-center">
        <div
          class="button-text-container subtitle-5 border-white overflow-hidden flex flex-row justify-center items-center show-coupon-text"
        >
          <div class="button-logo-container">
            <Logo class="button-logo mr-8" width="16" height="16" />
          </div>
          <div class="button-text flex flex-column overflow-hidden">
            <div v-if="loading" class="dot-flashing"></div>
            <span v-else>{{ discount }}</span>
          </div>
        </div>
      </div>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from '@vue/composition-api';
import Logo from '../assets/logo.svg?inline';
import { sendMessageToBackground } from '../utils/extension-messenger';

export default defineComponent({
  name: 'DiscountRibbon',
  components: {
    Logo,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const hide = ref(false);
    const loading = ref(true);
    const discount = ref('');

    onMounted(() => {
      const fetchMerchant = () => {
        sendMessageToBackground('LOOK_UP_MERCHANT', props.url).then((merchant) => {
          loading.value = false;

          if (merchant && merchant.bestPercentOff > 0) {
            discount.value = `Up to ${merchant.bestPercentOff}% off`;
          } else {
            hide.value = true;
          }
        });
      };

      fetchMerchant();
    });

    return {
      discount,
      loading,
      hide,
    };
  },
});
</script>

<style lang="postcss" scoped>
.discount-ribbon {
  opacity: 0;

  &.show {
    opacity: 1;
  }
}

.button-content {
  background: linear-gradient(135deg, #3f35f2 0%, #9966ff 100%);
  max-height: 20px;
  max-width: 20px;
  overflow: hidden;

  &.expanded {
    max-width: 200px;

    .close-button {
      opacity: 1;
    }

    .button-text {
      &:after {
        max-height: 100%;
      }
    }
  }
}

.button-text-container {
  max-height: 40px;
  overflow: hidden;

  .button-logo {
    width: 12px;
    height: 12px;
    margin-left: 6px;
    margin-right: 6px;

    .logo-circle {
      fill: #fff;
    }
  }

  .button-text {
    padding-right: 12px;

    span {
      height: 20px;
      opacity: 1;
    }
  }
}

/**
 * ==============================================
 * Dot Flashing
 * ==============================================
 */
.dot-flashing {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #9880ff;
  color: #9880ff;
  animation: dotFlashing 1s infinite linear alternate;
  animation-delay: 0.5s;
}

.dot-flashing::before,
.dot-flashing::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
}

.dot-flashing::before {
  left: -15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #9880ff;
  color: #9880ff;
  animation: dotFlashing 1s infinite alternate;
  animation-delay: 0s;
}

.dot-flashing::after {
  left: 15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #9880ff;
  color: #9880ff;
  animation: dotFlashing 1s infinite alternate;
  animation-delay: 1s;
}

@keyframes dotFlashing {
  0% {
    background-color: #9880ff;
  }
  50%,
  100% {
    background-color: #ebe6ff;
  }
}
</style>
