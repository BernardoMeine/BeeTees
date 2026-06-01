# File dedicated to bugs found while performing black-box testing

## Checkout Flow

1 - I'm able to input the customer's name as special characters only (e.g: %&%$%*&#@) - Improvement on the business rule

2 - I'm able to remove all items from the cart while I'm at the checkout page and place an empty order - Bug (critical)

3 - If I was logged in as a guest previously, and decide to log in with an account, when I reach the checkout page, the guest info that I've placed is still showing up (Name, Email and credit card information) - Bug (critical)

4 - I'm able to place an order passing an incomplete address (Only passing ZIP, Neighborhood, City/State and Country) but without the Street Number and Name, and any complementary info - Improvement on the business rule


