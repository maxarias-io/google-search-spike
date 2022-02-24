/**
 * Parses the best merchant code and returns the promo label
 *
 * @param merchant
 * @param short Return a short label
 * @returns The label
 */
export const merchantDiscount = (merchant, short = false) => {
  let discount = "";

  if (merchant.bestCode) {
    const { isFreeshipping, percentOff, amountOff } = merchant.bestCode;

    if (percentOff) {
      discount = short ? `${percentOff}% off` : `Up to ${percentOff}% off`;
    } else if (amountOff) {
      discount = short ? `$${amountOff} off` : `Up to $${amountOff} off`;
    } else if (isFreeshipping) {
      discount = "Free shipping";
    }
  }

  return discount;
};
