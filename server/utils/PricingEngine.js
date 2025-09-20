class PricingEngine {
  constructor() {
    // Shipping rates (USD per kg)
    this.shippingRates = {
      DHL: {
        rate: 0.15, // USD per kg
        minimum: 25.00 // USD minimum charge
      },
      SEA: {
        rate: 0.08, // USD per kg
        minimum: 15.00 // USD minimum charge
      }
    };
    
    // Exchange rates (USD to BBD)
    this.exchangeRate = 2.02; // 1 USD = 2.02 BBD
  }

  /**
   * Calculate shipping cost based on weight and method
   * @param {number} totalWeight - Total weight in kg
   * @param {string} shippingMethod - 'DHL' or 'SEA'
   * @returns {number} Shipping cost in USD
   */
  calculateShippingCost(totalWeight, shippingMethod) {
    const method = this.shippingRates[shippingMethod];
    if (!method) {
      throw new Error(`Invalid shipping method: ${shippingMethod}`);
    }
    
    const calculatedCost = totalWeight * method.rate;
    return Math.max(calculatedCost, method.minimum);
  }

  /**
   * Calculate landed cost per unit - EXACT Excel replication
   * @param {Object} product - Product object with excelStructure
   * @param {number} quantity - Quantity to calculate for
   * @param {string} shippingMethod - 'DHL' or 'SEA'
   * @returns {Object} Calculated pricing details
   */
  calculateLandedCost(product, quantity, shippingMethod) {
    const excel = product.excelStructure;
    
    // Step 1: Calculate cartons needed
    const cartons = Math.ceil(quantity / excel.casePack.value);
    
    // Step 2: Calculate total weight
    const totalWeight = cartons * excel.weight.value;
    
    // Step 3: Calculate shipping cost
    const shippingCost = this.calculateShippingCost(totalWeight, shippingMethod);
    
    // Step 4: Calculate duties amount (as percentage of base price)
    const dutiesAmount = excel.price.value * (excel.duties.value / 100);
    
    // Step 5: Calculate setup cost (if any)
    const setupCost = excel.setupCost ? excel.setupCost.value : 0;
    
    // Step 6: Calculate landed cost per unit
    const landedCostPerUnit = excel.price.value + dutiesAmount + (shippingCost / quantity) + (setupCost / quantity);
    
    // Step 7: Apply profit margin (check for profit override)
    const profitMargin = (excel.profitOverride && excel.profitOverride.value > 0) ? 
      excel.profitOverride.value : excel.profitMargin.value;
    
    const unitPriceUSD = landedCostPerUnit * (1 + profitMargin / 100);
    
    // Step 8: Convert to BBD
    const unitPriceBBD = unitPriceUSD * this.exchangeRate;
    
    // Step 9: Calculate totals
    const totalPriceBBD = unitPriceBBD * quantity;
    const totalCostBBD = (excel.price.value + dutiesAmount) * this.exchangeRate * quantity;
    const totalGrossProfitBBD = totalPriceBBD - totalCostBBD;
    
    return {
      cartons,
      totalWeight,
      shippingCostUSD: shippingCost,
      dutiesAmountUSD: dutiesAmount,
      setupCostUSD: setupCost,
      landedCostPerUnitUSD: landedCostPerUnit,
      unitPriceUSD: unitPriceUSD,
      unitPriceBBD: Math.round(unitPriceBBD * 100) / 100, // Round to 2 decimal places
      totalPriceBBD: Math.round(totalPriceBBD * 100) / 100,
      totalGrossProfitBBD: Math.round(totalGrossProfitBBD * 100) / 100,
      exchangeRate: this.exchangeRate,
      profitMargin: profitMargin,
      profitOverride: excel.profitOverride ? excel.profitOverride.value : 0
    };
  }

  /**
   * Calculate pricing for both shipping methods
   * @param {Object} product - Product object
   * @param {number} quantity - Quantity to calculate for
   * @returns {Object} Pricing for both DHL and SEA
   */
  calculateAllPricing(product, quantity) {
    const dhlPricing = this.calculateLandedCost(product, quantity, 'DHL');
    const seaPricing = this.calculateLandedCost(product, quantity, 'SEA');
    
    return {
      byDHL: dhlPricing,
      bySEA: seaPricing,
      quantity,
      productName: product.name
    };
  }

  /**
   * Validate product data for pricing calculation
   * @param {Object} product - Product object
   * @returns {Object} Validation result
   */
  validateProduct(product) {
    const errors = [];
    const excel = product.excelStructure;
    
    if (!excel.casePack || excel.casePack.value <= 0) {
      errors.push('Case Pack must be greater than 0');
    }
    
    if (!excel.weight || excel.weight.value <= 0) {
      errors.push('Weight must be greater than 0');
    }
    
    if (!excel.price || excel.price.value <= 0) {
      errors.push('Price must be greater than 0');
    }
    
    if (!excel.duties || excel.duties.value < 0) {
      errors.push('Duties must be 0 or greater');
    }
    
    if (!excel.profitMargin || excel.profitMargin.value < 0) {
      errors.push('Profit Margin must be 0 or greater');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get pricing summary for display
   * @param {Object} product - Product object
   * @param {number} quantity - Quantity
   * @returns {Object} Formatted pricing summary
   */
  getPricingSummary(product, quantity) {
    const validation = this.validateProduct(product);
    if (!validation.isValid) {
      return { error: 'Invalid product data', details: validation.errors };
    }
    
    const pricing = this.calculateAllPricing(product, quantity);
    
    return {
      productName: product.name,
      quantity,
      pricing: {
        byDHL: {
          unitPrice: `BBD$${pricing.byDHL.unitPriceBBD.toFixed(2)}`,
          totalPrice: `BBD$${pricing.byDHL.totalPriceBBD.toFixed(2)}`,
          grossProfit: `BBD$${pricing.byDHL.totalGrossProfitBBD.toFixed(2)}`,
          leadTime: `${product.excelStructure.prodLeadTime.value} days`
        },
        bySEA: {
          unitPrice: `BBD$${pricing.bySEA.unitPriceBBD.toFixed(2)}`,
          totalPrice: `BBD$${pricing.bySEA.totalPriceBBD.toFixed(2)}`,
          grossProfit: `BBD$${pricing.bySEA.totalGrossProfitBBD.toFixed(2)}`,
          leadTime: `${product.excelStructure.prodLeadTime.value} days`
        }
      },
      details: pricing
    };
  }
}

module.exports = new PricingEngine();

