# Shoe Architecture Design

This document outlines the architectural design for the `Shoe` class, which manages the collection of playing cards used in the Blackjack game. The Shoe is responsible for generating, shuffling, and dealing cards from multiple decks.

## Class Overview

The `Shoe` class encapsulates the logic for a multi-deck shoe. It provides a clean API for the game controller to request cards without needing to know the details of deck management.

### Responsibilities
1.  Generate a specified number of standard 52-card decks.
2.  Shuffle the combined collection of cards.
3.  Deal cards one by one, maintaining state.
4.  Report the number of remaining cards.
5.  Reset/reshuffle when needed.

## Constructor Signature

```javascript
/**
 * Creates a new Shoe instance.
 * @param {number} deckCount - The number of decks to include in the shoe. Defaults to 6.
 */
constructor(deckCount = 6)
```

## Internal State Variables

The class will maintain the following private state:

-   `_cards`: An array of `Card` objects (following the [Canonical Card Model](./canonical-card-model.md)). This array acts as a stack or queue representing the physical cards in the shoe.
-   `_deckCount`: The number of decks currently configured (integer).
-   `_initialSize`: The total number of cards when full (`_deckCount * 52`). Useful for calculating penetration.

## Card Generation Strategy

Upon initialization or reset:
1.  Clear the `_cards` array.
2.  Loop `d` from 0 to `deckCount - 1`.
3.  Loop `s` (suit) from 0 to 3.
4.  Loop `r` (rank) from 1 to 13.
5.  Create a card object:
    ```javascript
    {
      rank: r,
      suit: s,
      id: `${d}-${s}-${r}` // Unique ID combining deck index, suit, and rank
    }
    ```
6.  Push the card to `_cards`.

## Fisher-Yates Shuffle Algorithm

After generation, the `shuffle()` method must be called. This implementation will use the modern Fisher-Yates (Knuth) shuffle:

1.  Iterate from the last element (`i = length - 1`) down to 1.
2.  Pick a random index `j` such that `0 <= j <= i`.
3.  Swap `_cards[i]` and `_cards[j]`.
4.  This ensures an unbiased permutation where every card has an equal probability of ending up in any position.

## Method Behaviors

### `draw()`
-   **Purpose:** Removes and returns the next card from the shoe.
-   **Behavior:**
    1.  Check if `_cards` is empty.
    2.  If empty, handle error (see Error Handling).
    3.  Call `_cards.pop()` (removes from end) or `_cards.shift()` (removes from front). *Decision: Use `pop()` for better performance in V8 arrays.*
    4.  Return the `Card` object.

### `remaining()`
-   **Purpose:** Returns the count of cards currently in the shoe.
-   **Behavior:** Returns `_cards.length`.

### `reset()`
-   **Purpose:** Refills the shoe with fresh decks and shuffles them.
-   **Behavior:**
    1.  Clears `_cards`.
    2.  Re-runs the Card Generation Strategy.
    3.  Calls the Shuffle Algorithm.

## Error Handling Strategy

-   **Empty Shoe on Draw:**
    -   If `draw()` is called when `remaining() === 0`:
        -   **Immediate Action:** Throw a specific `ShoeEmptyError`.
        -   **Game Logic Responsibility:** The game controller should check `remaining()` before drawing or handle this error by triggering a reshuffle (or auto-reshuffling when a "cut card" limit is reached, though the cut card logic is usually managed by the game controller checking penetration).
-   **Invalid Deck Count:**
    -   Constructor should throw an error if `deckCount` is less than 1 or not an integer.

## Separation of Concerns (No UI Logic)

**CRITICAL:** The `Shoe` class must contain **ZERO** references to the DOM, CSS, or the `deck-of-cards` visual library.

### Why?
1.  **Pure Logic:** The Shoe is a data structure. It manages data (cards), not pixels.
2.  **Testability:** We must be able to test `Shoe.draw()` in a Node.js environment without a browser.
3.  **Flexibility:** The visual representation of a "shoe" (if any) is distinct from the logical stack of cards. The game controller will ask the `Shoe` for a card (data), then tell the UI to animate a card dealing (visuals).
