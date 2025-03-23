"use client"

import { useState, useEffect } from 'react'
import { brandConfig } from '@/config/brand'

interface GoldRateData {
  rate: number | null
  currency: string
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useGoldRate() {
  const [data, setData] = useState<GoldRateData>({
    rate: null,
    currency: brandConfig.currency,
    loading: true,
    error: null,
    lastUpdated: null
  })

  useEffect(() => {
    const fetchGoldRate = async () => {
      console.log("Starting gold rate fetch...");
      try {
        setData(prev => ({ ...prev, loading: true, error: null }))

        // Since we don't have a real gold API available, we'll simulate one
        // with a reasonable gold price estimate plus some randomization

        // Simulate API fetch delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Base gold price in USD per troy ounce (approximate value)
        const baseGoldPriceUSD = 2300;

        // Add some small randomization to simulate real market fluctuations
        const randomFactor = 0.98 + (Math.random() * 0.04); // 0.98 to 1.02
        const goldPriceUSD = baseGoldPriceUSD * randomFactor;

        // Simulate USD to INR exchange rate (approximate value)
        const usdToInrRate = 83 * (0.99 + (Math.random() * 0.02)); // 82.17 to 84.66

        console.log(`Simulated gold price: $${goldPriceUSD.toFixed(2)} USD per troy ounce`);
        console.log(`Simulated USD to INR rate: ${usdToInrRate.toFixed(2)}`);

        // Convert gold price from USD per troy ounce to INR per 10 grams
        const gramsPerTroyOunce = 31.1035;
        const pricePerGramUSD = goldPriceUSD / gramsPerTroyOunce;

        // For 22K gold, it's 91.67% pure (22/24)
        const purityFactor22K = 0.9167;
        const pricePerGram22KUSD = pricePerGramUSD * purityFactor22K;

        // Convert to INR and calculate for 10 grams
        const pricePerGram22KINR = pricePerGram22KUSD * usdToInrRate;
        const priceForTenGrams22KINR = pricePerGram22KINR * 10;

        // Round to nearest whole number for display
        const roundedPrice = Math.round(priceForTenGrams22KINR);

        console.log(`Calculated gold price: ${roundedPrice} ${brandConfig.currency} for 10g of 22K gold`);

        // Set a consistent last updated time format
        const now = new Date();

        setData({
          rate: roundedPrice,
          currency: brandConfig.currency,
          loading: false,
          error: null,
          lastUpdated: now
        });

      } catch (err) {
        console.error('Error in gold rate calculation:', err);

        // Get current time for the error state too
        const now = new Date();

        // Fallback to approximate gold rate
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Using approximate rate',
          rate: 68500,
          lastUpdated: now
        }));
      }
    };

    fetchGoldRate();

    // Refresh gold rate every 15 minutes
    const intervalId = setInterval(fetchGoldRate, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return data;
}
