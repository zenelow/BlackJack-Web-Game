# Game Engine Architecture

This document defines the high-level architecture for the Blackjack application. The primary design goal is a strict separation of concerns between the **Game Logic** (State) and the **Visual Presentation** (UI).

## Architectural Layers

The application is divided into four distinct layers/components:

### 1. Shoe (Card Source)
*   **Role:** Pure data provider.
*   **Responsibilities:**
    *   Generates the multi-deck stack of cards.
    *   Implements the Shuffle algorithm (Fisher-Yates).
    *   Provides a `draw()` method to yield `Card` objects.
    *   Tracks the number of remaining cards.
*   **Dependencies:** None. It produces `Card` objects (Canonical Model).
*   **Context:** It knows nothing about "Hands", "Players", or "Rules". It is simply a stack of cards.

### 2. Hand (Card Container + Scoring Logic)
*   **Role:** Data container and rule evaluator for a specific set of cards.
*   **Responsibilities:**
    *   Maintains an array of `Card` objects for a specific entity (Player or Dealer).
    *   **Scoring Logic:** Calculates the numeric value of the hand.
        *   Handles Ace logic (soft vs. hard totals).
        *   Example: `[Ace, 6]` -> Value: 17 (Soft).
        *   Example: `[Ace, 6, 10]` -> Value: 17 (Hard).
    *   Determines instantaneous states: `isBlackjack`, `isBusted`, `canSplit`, `canDouble`.
*   **Dependencies:** `Card` model.
*   **Context:** It knows *what* cards it holds and *what* they are worth, but not *whose* turn it is or *who* won.

### 3. GameEngine (Round State Controller)
*   **Role:** The "Brain" or "Conductor" of the application.
*   **Responsibilities:**
    *   **State Management:** Tracks the current phase of the round (Betting, Dealing, PlayerTurn, DealerTurn, Resolution).
    *   **Entity Management:** Instantiates and manages the `Shoe`, `Player` hand, and `Dealer` hand.
    *   **Flow Control:**
        *   Validates moves (e.g., "Can the player hit right now?").
        *   Executes moves (moves card from Shoe to Hand).
        *   Enforces game rules (Dealer must hit on soft 17, etc.).
        *   Determines the winner and payouts.
    *   **Event Emission:** Notifies the outside world when state changes (e.g., `emit('cardDealt', { card, to: 'player' })`).
*   **Dependencies:** `Shoe`, `Hand`.
*   **Context:** This is the only place where the "Rules of Blackjack" exist.

### 4. UI Layer (Visual Rendering)
*   **Role:** The "View" or "Consumer" of the Game Engine.
*   **Responsibilities:**
    *   **Rendering:** Visualizes the state provided by the GameEngine.
        *   Updates the balance/bet display.
        *   Renders cards on the screen (using the `deck-of-cards` library or DOM elements).
        *   Shows/hides buttons (Hit, Stand, Deal) based on the engine state.
    *   **Input Handling:** Captures user clicks and calls methods on the `GameEngine` (e.g., `engine.hit()`, `engine.stand()`).
    *   **Animation Orchestration:** Ensures animations finish before the next game state is processed (e.g., wait for card to fly to hand before enabling "Hit" button).
*   **Dependencies:** `GameEngine`.

## Decoupling Strategy

### Why Game Logic Must Not Depend on the Visual Deck Library

1.  **Latency & Synchronization:** Visual libraries often have animation durations (e.g., 500ms for a card deal). The Game Logic deals cards instantaneously (microseconds). If the logic waits for the UI, the architecture becomes brittle and slow. Instead, the Logic updates instantly, and the UI "catches up" via queues or events.
2.  **Testability:** We need to run thousands of simulated hands to verify the odds and shuffle fairness. This is impossible if the logic requires a DOM or runs at "animation speed."
3.  **Portability:** If we decide to switch from the current DOM-based library to a Canvas-based renderer (like Phaser or PixiJS) later, we should not have to rewrite a single line of Blackjack logic.
4.  **Stability:** The `deck-of-cards` library modifies DOM elements. Game logic should rely on immutable data structures (Arrays, Objects), not the fragile state of the DOM.

## Data Flow

1.  **User Action:** User clicks "Hit".
2.  **UI Layer:** Calls `gameEngine.hit()`.
3.  **GameEngine:**
    *   Checks if hit is valid.
    *   Calls `shoe.draw()`.
    *   Adds card to `playerHand`.
    *   Checks for bust.
    *   Emits `playerHit` event with the new card data.
4.  **UI Layer:**
    *   Listens for `playerHit`.
    *   Triggers the visual animation of the card flying from the shoe to the player's position.
    *   Updates the score display.
