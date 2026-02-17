# Canonical Card Model

This document defines the official internal data structure for a playing card within the Blackjack application. This model serves as the single source of truth for game logic, independent of any visual representation or third-party library.

## Data Structure

Each card object MUST adhere to the following schema:

```javascript
{
  rank: number, // 1-13
  suit: number, // 0-3
  id: string    // Unique identifier
}
```

## Rank Mapping

The `rank` property is an integer from 1 to 13.

| Rank (Integer) | Card Face | Blackjack Value |
| :--- | :--- | :--- |
| **1** | **Ace** | 1 or 11 |
| **2 - 10** | **2 - 10** | Face Value |
| **11** | **Jack** | 10 |
| **12** | **Queen** | 10 |
| **13** | **King** | 10 |

*Note: The calculation of the card's value in the context of a Blackjack hand (e.g., Ace being 1 or 11) is handled by the game logic (Hand evaluation), not stored directly on the card object.*

## Suit Mapping

The `suit` property is an integer from 0 to 3.

| Suit (Integer) | Suit Name | Symbol |
| :--- | :--- | :--- |
| **0** | **Spades** | ♠ |
| **1** | **Hearts** | ♥ |
| **2** | **Clubs** | ♣ |
| **3** | **Diamonds** | ♦ |

*Note: This mapping aligns with the `deck-of-cards` library convention to simplify potential integration, but the canonical model enforces this explicitly.*

## The `id` Property

The `id` property is a unique string identifier for each specific card instance.

### Why it must be unique across a multi-deck shoe
In Blackjack, a "shoe" often contains multiple decks (e.g., 6 decks). This means there will be multiple "Ace of Spades" cards in play.
- **Problem:** If we only identify cards by `rank` and `suit`, we cannot distinguish between the first Ace of Spades dealt and the second one. This causes issues for:
    - **Animation/DOM Tracking:** Knowing exactly which DOM element corresponds to which card in logic.
    - **State Management:** Tracking which specific cards have been dealt vs. which remain in the shoe.
- **Solution:** A unique `id` (e.g., `"deck1-card1"`, `"d0-r1-s0"`, or a UUID) ensures every physical card has a unique logical identity.

## Independence from Visual Libraries

This model is designed to be **independent** of the `deck-of-cards` library or any other UI rendering logic.

### Reasons for Decoupling:
1.  **Separation of Concerns:** The game logic (rules, scoring, win/loss) should not know or care about how cards are displayed (DOM elements, animations, CSS).
2.  **Testability:** We can write unit tests for the game logic using simple JavaScript objects without needing a DOM environment or mocking the visual library.
3.  **Flexibility:** If we decide to swap the `deck-of-cards` library for a different renderer (e.g., Canvas, React, or a different DOM library) in the future, the core game logic remains unchanged. The "Canonical Card" is the bridge; the UI layer is responsible for mapping a Canonical Card to a Visual Card.
