import type {
  Person,
  Item,
  PersonTotal,
  Currency,
  Adjustment,
} from "../splitApp/split.types.ts";

// Currency conversion helper
function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
): number {
  // Simple exchange rates (USD base)
  const rates: Record<Currency, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.5,
    CAD: 1.36,
    AUD: 1.52,
  };

  // Convert to USD first, then to target currency
  const inUSD = amount / rates[fromCurrency];
  return inUSD * rates[toCurrency];
}

export function calculatePersonTotals(
  people: Person[],
  items: Item[],
  adjustments: Adjustment[],
  baseCurrency: Currency = "USD",
): PersonTotal[] {
  // Initialize tracking for each person
  const personData = new Map<
    string,
    {
      itemsSubtotal: number;
      totalPaid: number;
      assignedItems: Array<{ name: string; share: number; currency: Currency }>;
      paidItems: Array<{ name: string; amount: number; currency: Currency }>;
    }
  >();

  people.forEach((person) => {
    personData.set(person.id, {
      itemsSubtotal: 0,
      totalPaid: 0,
      assignedItems: [],
      paidItems: [],
    });
  });

  // Calculate item shares (consumption) and payments
  items.forEach((item) => {
    const assignedCount = item.usedBy.size;

    // Process consumption (assignedTo)
    if (assignedCount > 0) {
      const sharePerPerson = item.price / assignedCount;
      const shareInBaseCurrency = convertCurrency(
        sharePerPerson,
        item.currency,
        baseCurrency,
      );

      item.usedBy.forEach((personId) => {
        const data = personData.get(personId);
        if (data) {
          data.itemsSubtotal += shareInBaseCurrency;
          data.assignedItems.push({
            name: item.name,
            share: sharePerPerson,
            currency: item.currency,
          });
        }
      });
    }

    // Process payments (paidBy)
    item.paidBy.forEach((payer, personId) => {
      const data = personData.get(personId);
      if (data) {
        const paidInBaseCurrency = convertCurrency(
          payer.amount,
          payer.currency,
          baseCurrency,
        );
        data.totalPaid += paidInBaseCurrency;
        data.paidItems.push({
          name: item.name,
          amount: payer.amount,
          currency: payer.currency,
        });
      }
    });
  });

  // Calculate total bill subtotal in base currency
  const billSubtotal = items.reduce((sum, item) => {
    const priceInBaseCurrency = convertCurrency(
      item.price,
      item.currency,
      baseCurrency,
    );
    return sum + priceInBaseCurrency;
  }, 0);

  // Calculate adjustments
  const adjustmentResults = adjustments.map((adjustment) => {
    let totalAmount: number;

    if (adjustment.type === "discount") {
      // Discounts reduce the subtotal before other adjustments
      totalAmount = adjustment.isPercent
        ? (billSubtotal * adjustment.value) / 100
        : adjustment.value;
      // Discounts are subtracted (capped at billSubtotal to prevent negative)
      totalAmount = Math.min(totalAmount, billSubtotal);
    } else {
      // Tips and taxes are added
      totalAmount = adjustment.isPercent
        ? (billSubtotal * adjustment.value) / 100
        : adjustment.value;
    }

    return {
      ...adjustment,
      totalAmount,
    };
  });

  // Build results for each person
  return people.map((person) => {
    const data = personData.get(person.id)!;

    // Calculate proportional ratio based on consumption
    let personRatio = 0;
    if (billSubtotal > 0) {
      personRatio = data.itemsSubtotal / billSubtotal;
    }

    // Calculate person's share of each adjustment
    const personAdjustments = adjustmentResults.map((adjResult) => ({
      id: adjResult.id,
      label: adjResult.label,
      type: adjResult.type,
      amount: adjResult.totalAmount * personRatio,
    }));

    // Calculate total owed
    const adjustmentsTotal = personAdjustments.reduce((sum, adj) => {
      // Discounts subtract, tips and taxes add
      return adj.type === "discount" ? sum - adj.amount : sum + adj.amount;
    }, 0);

    const totalOwed = data.itemsSubtotal + adjustmentsTotal;

    // Calculate balance: negative = overpaid (should receive), positive = underpaid (should pay)
    const balance = totalOwed - data.totalPaid;

    return {
      personId: person.id,
      personName: person.name,
      itemsSubtotal: data.itemsSubtotal,
      adjustments: personAdjustments,
      total: totalOwed,
      totalPaid: data.totalPaid,
      balance,
      assignedItems: data.assignedItems,
      paidItems: data.paidItems,
    };
  });
}
