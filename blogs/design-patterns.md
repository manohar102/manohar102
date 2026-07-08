When building enterprise systems—especially financial software or billing engines—maintaining code scalability, testability, and clarity is paramount. Changing business requirements (such as adding tax calculators, shipping formulas, and new payment gateways) can quickly turn a simple codebase into a tangled mess of nested `if-else` blocks.

By adhering to the **SOLID principles** and utilizing Gang of Four (GoF) design patterns, we can establish clean boundaries and make systems resilient to change. In this article, we dive into production-grade implementations of two critical patterns—**Strategy** and **Decorator**—using real code examples from the [Design Patterns repository](https://github.com/manohar102/Design-Patterns).

---

## 1. The Strategy Pattern: Swapping Payment Gateways

The **Strategy Pattern** is a behavioral pattern that defines a family of algorithms, encapsulates each one, and makes them interchangeable. This pattern lets the algorithm vary independently of clients that use it (adhering directly to the *Open/Closed Principle*).

In our checkout flow, we want users to be able to pay using different payment gateways (like Credit Cards or PayPal) without modifying the main `ShoppingCart` controller.

### The Strategy Abstraction

We start by defining a simple interface `PaymentStrategy`:

```java
package strategypattern;

public interface PaymentStrategy {
    void pay(double amount);
}
```

### Concrete Payment Gateways

We implement concrete algorithms for payment methods, such as `CreditCardStrategy`:

```java
package strategypattern;

public class CreditCardStrategy implements PaymentStrategy {
    private String name;
    private String cardNumber;
    private String cvv;
    private String dateOfExpiry;

    public CreditCardStrategy(String nm, String ccNum, String cvv, String expiryDate) {
        this.name = nm;
        this.cardNumber = ccNum;
        this.cvv = cvv;
        this.dateOfExpiry = expiryDate;
    }

    @Override
    public void pay(double amount) {
        // Obfuscate card number for safety
        String maskedCard = "xxxx-xxxx-xxxx-" + cardNumber.substring(cardNumber.length() - 4);
        System.out.println("Paid $" + String.format("%.2f", amount) + " using Credit Card (" + maskedCard + ")");
    }
}
```

The client class `ShoppingCart` does not know the details of how credit cards or PayPal process the payment. It simply delegates the execution:

```java
// Dynamic injection of strategy
public void pay(PaymentStrategy paymentMethod) {
    double amount = calculateTotal();
    paymentMethod.pay(amount);
}
```

> **Why it matters:** Adding a new payment gateway (e.g. Crypto payments) is as simple as creating a new class implementing `PaymentStrategy`. The core shopping cart and checkout code remains completely untouched and safe from regressions.

---

## 2. The Decorator Pattern: Dynamic Pricing & Add-ons

The **Decorator Pattern** is a structural pattern that allows behavior to be added to an individual object dynamically, without affecting the behavior of other objects from the same class. It uses composition instead of inheritance to extend functionality.

In billing, this is highly effective when calculating invoice line items where we start with a base price (e.g., a subscription plan) and dynamically wrap it with modifiers like taxes, regional surcharges, late fees, and discount coupons.

In our repository, this is illustrated using the classic coffee beverage condiment wrapping example (matching the Head First catalog), which serves as a clean blueprint for a component wrapper.

### The Base Component

We define an abstract `Beverage` class representing our base product:

```java
package decoratorpattern;

public abstract class Beverage {
    protected String description = "Unknown Beverage";

    public String getDescription() {
        return description;
    }

    public abstract double cost();
}
```

### The Wrapper Abstraction

Our condiments extend `CondimentDecorator` which holds a reference to the wrapped object:

```java
package decoratorpattern;

public abstract class CondimentDecorator extends Beverage {
    protected Beverage beverage;

    @Override
    public abstract String getDescription();
}
```

### Concrete Decorator

We can wrap the component dynamically. For instance, the `Mocha` decorator adds its own description and cost to the nested beverage:

```java
package decoratorpattern;

public class Mocha extends CondimentDecorator {

    public Mocha(Beverage beverage) {
        this.beverage = beverage;
    }

    @Override
    public String getDescription() {
        return beverage.getDescription() + ", Mocha";
    }

    @Override
    public double cost() {
        return beverage.cost() + 0.20;
    }
}
```

At runtime, we can construct highly customized objects:

```java
// Start with Espresso, add double Mocha and Whip
Beverage beverage = new Espresso();
beverage = new Mocha(beverage);
beverage = new Mocha(beverage);
beverage = new Whip(beverage);

System.out.println(beverage.getDescription() + " $" + beverage.cost());
```

> **Billing Application:** By mapping this structure to a billing invoice, your `BasePlan` can be wrapped by `TaxDecorator(plan)`, then `DiscountDecorator(taxWrappedPlan)`, resolving the final price step-by-step at runtime while keeping calculations separated and testable.

---

## Conclusion

Software design patterns are not just academic concepts—they are battle-tested recipes for constructing software that stays calm under changing real-world loads. Enforcing clean interfaces, prioritizing composition over inheritance, and keeping responsibilities singular ensures that your backend code stays maintainable as your system grows in volume and complexity.
