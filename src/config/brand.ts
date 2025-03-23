/**
 * Brand configuration with customizable settings
 */
export const brandConfig = {
  // Brand info
  name: "MAO Jewels",
  shortName: "MAO",
  logoUrl: "https://ext.same-assets.com/2383782970/2567439816.png",

  // Theme colors - can be customized as needed
  colors: {
    primary: "blue",
    secondary: "gray",
    accent: "gold",
  },

  // Contact information
  contact: {
    email: "info@maojewels.com",
    phone: "+1 (555) 123-4567",
    address: "123 Jewelry Lane, New York, NY 10001",
  },

  // Currency symbol
  currency: "₹",

  // API endpoints
  apis: {
    // GoldAPI - Public API for gold prices that doesn't require API key
    goldRate: "https://www.goldapi.io/api/XAU/INR",
    goldApiHeaders: {
      'x-access-token': 'goldapi-dummykey',
      'Content-Type': 'application/json'
    }
  }
}
