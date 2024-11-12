// Function to calculate the total price for a line item, including applying any discounts
export const calculateLineTotal = (detail) => {
  const totalBeforeDiscount = detail.quantity * detail.price; // Calculate total before discount
  const discountAmount = calculateDiscountAmount(detail); // Get discount amount based on the fixed discount only
  const lineTotal = totalBeforeDiscount - discountAmount; // Deduct discount from total
  return Math.max(0, lineTotal); // Ensure the total isn't negative
};

// Function to calculate the discount amount based on the discount type and value
export const calculateDiscountAmount = (detail) => {
  let discountAmount = 0;

  discountAmount = Math.min(
    detail.discountValue,
    detail.quantity * detail.price
  );
  return discountAmount;
};

// Function to calculate the total quantity of all items in the order
export const calculateTotalQuantity = (orderDetails) => {
  return orderDetails.reduce((acc, item) => acc + item.quantity, 0);
};

// Function to calculate the total value of all items in the order, considering the discount
export const calculateTotalValue = (orderDetails) => {
  return orderDetails.reduce((acc, item) => {
    const lineTotal = calculateLineTotal(item); // Use calculateLineTotal to get the adjusted total for each item
    return acc + lineTotal;
  }, 0);
};

// Function to calculate the total discount of all items in the order
export const calculateTotalDiscount = (orderDetails) => {
  return orderDetails.reduce((acc, item) => {
    const discountAmount = calculateDiscountAmount(item);
    return acc + discountAmount;
  }, 0);
};
