# Deck of Cards Library Analysis

This document provides an analysis of the `deck-of-cards` library located in the `deck-of-cards-master` directory.

## Entry Point

-   **Main Library File:** [`deck-of-cards-master/lib/deck.js`](../deck-of-cards-master/lib/deck.js)
    -   The `package.json` points to `lib/deck.js` as the module entry point.
    -   It exports a default function `Deck`.

## Exported Functions/Classes

The library primarily exports a single factory function `Deck`, which attaches several static properties and methods.

-   **`Deck(jokers)`**: Factory function that creates a new deck instance.
    -   **Parameters:** `jokers` (boolean) - if true, creates a 55-card deck (including jokers); otherwise, a standard 52-card deck.
    -   **Returns:** An observable object representing the deck (`self`).

-   **Static Properties on `Deck`:**
    -   `Deck.animationFrames`: Helper for animation loops.
    -   `Deck.ease`: Easing functions for animations.
    -   `Deck.modules`: Object containing loaded modules (`bysuit`, `fan`, `intro`, `poker`, `shuffle`, `sort`, `flip`).
    -   `Deck.Card`: Reference to the `Card` factory function.
    -   `Deck.prefix`: Helper for CSS vendor prefixes.
    -   `Deck.translate`: Helper for CSS translate strings.

## Card Structure

Cards are created using the `Card` factory function in [`deck-of-cards-master/lib/card.js`](../deck-of-cards-master/lib/card.js).

-   **Rank & Suit:** Derived from the card's initial index (`i`):
    -   **Rank:** `i % 13 + 1` (Integers 1-13, representing Ace through King).
    -   **Suit:** `Math.floor(i / 13)` (Integers 0-3).
    -   **Value Format:** The library uses integer representations for rank and suit internally.
-   **Visuals:** Each card is a DOM element containing `face` and `back` sub-elements.
-   **State:**
    -   `i`: Original index.
    -   `pos`: Current position index in the deck.
    -   `x`, `y`, `z`, `rot`: Transform coordinates and rotation.
    -   `$el`: The DOM element for the card.
    -   `mount`, `unmount`: Methods to add/remove from DOM.
    -   `setSide('front' | 'back')`: Flips the card.

## Shuffle Method Used

-   **Algorithm:** Fisher-Yates Shuffle.
-   **Implementation:** Located in [`deck-of-cards-master/lib/fisherYates.js`](../deck-of-cards-master/lib/fisherYates.js).
-   **Usage:** The `shuffle` module ([`deck-of-cards-master/lib/modules/shuffle.js`](../deck-of-cards-master/lib/modules/shuffle.js)) applies the Fisher-Yates algorithm to the `deck.cards` array and then triggers animations to visually shuffle the cards.

## Draw Method Behavior

-   **No Explicit Draw Method:** The library does **not** provide a standard `draw()` or `deal()` method that returns a card and removes it from the deck data structure.
-   **Poker Module:** The `poker` module ([`deck-of-cards-master/lib/modules/poker.js`](../deck-of-cards-master/lib/modules/poker.js)) demonstrates dealing by animating the top 5 cards (last 5 in the array) to a specific layout, but it is a visual effect specific to a poker hand, not a generic draw function.
-   **Custom Implementation:** To implement "drawing", one would need to interact with the `deck.cards` array directly (e.g., `pop()` or `shift()`) and handle the DOM removal or animation manually.

## State Mutation

-   **Mutable:** The library heavily relies on mutating state.
    -   **Deck State:** The `deck.cards` array is mutated in-place during shuffles (reordered).
    -   **Card State:** Card objects are mutated directly (properties like `x`, `y`, `rot`, `pos` are updated during animations and interactions).
    -   **DOM:** The library directly manipulates DOM elements' styles and classes.

## Multiple Decks Implementation

-   **Independent Instances:** The `Deck` function is a factory that creates a self-contained environment (a container `div` and its own array of `Card` objects).
-   **Implementation Strategy:** To have multiple decks, you would simply call `Deck()` multiple times:
    ```javascript
    var deck1 = Deck();
    var deck2 = Deck();
    ```
    Each deck would be an independent DOM element and JavaScript object. There is no built-in mechanism to merge them into a single "shoe" (a combined set of cards) within the library's core logic; this would require custom logic to manage multiple `deck.cards` arrays or a unified array of Card objects from multiple Deck instances.
