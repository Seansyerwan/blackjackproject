/**
 * We get the base playerchips. This will be modified in it's int form as we go along.
 * We also will convert it to a string value, chipText, and use the literals in order to allow us to parse the int as a string
 */
var playerChips = 10000;
var chipText = "Chips: " + "".concat(playerChips);
var chipsWagered = 0;
var buyIn = new Audio("purchase.mp3"); //this audio cue plays whenever the player begins the game, or "buys in".
/**
 * We will be utilising this function throughout the code to get the max number we can allow for.
 * I.E the first card the dealer "draws" will be between 1 and 11 (ace).
 */
function randomNumGen(maximum) {
    return Math.floor(Math.random() * maximum) + 1;
}
var Player = { cardTotal: 0, obtainedCards: [] };
var dealer = { cardTotal: 0, obtainedCards: [] };
var dealtCards = [];
for (var i = 0; i < 3; i++) {
    if (i != 2) {
        addToCards(Player, dealtCards);
        console.log("added to player total");
        console.log(Player.cardTotal);
    }
    else {
        addToCards(dealer, dealtCards);
        console.log("added to dealer total");
        console.log(dealer.cardTotal);
    }
}
document.getElementById('playAgain').style.display = 'none';
var buyInForm = document.getElementById('chipsWagered');
/**
 * This adds numbers into the array, and subsiquently, into the total cards.
 * If the number is 1, then it will be set to 11 if it would allow for it to be added
 */
function addToCards(player, dealtCards) {
    var cardNum = randomNumGen(11);
    var suit = ["Hearts", "Diamonds", "Spades", "Clubs"];
    var thisCard = { cardValue: cardNum, cardSuit: suit[randomNumGen(4) - 1] };
    if (hasCard(dealtCards, thisCard)) {
        addToCards(player, dealtCards);
    }
    else {
        if ((thisCard.cardValue == 1 && player.cardTotal + thisCard.cardValue < 22)) {
            thisCard.cardValue = 11;
        }
        player.cardTotal = player.cardTotal + thisCard.cardValue;
        if (player.cardTotal > 21) {
            checkOverflow(player);
        }
        player.obtainedCards.push(thisCard);
        dealtCards.push(thisCard);
    }
}
/**
 * We check for if the overflow has an 11 in the array.
 * Splice works as follows ...(starting index, the amount of things to delete,, and things to insert)
 */
function checkOverflow(player) {
    if (hasAce(player.obtainedCards)) {
        player.cardTotal = player.cardTotal - 10;
    }
    console.log("ADJUSTED FOR ACE");
}
/**
 * We listen for the event of the form being submitted. once this is the case, it prevents the site from refreshing, then we change the value of the user's chips.
 * The users chips is now updated.
 */
buyInForm.addEventListener("submit", function (e) {
    e.preventDefault(); //we prevent the refresh of the page
    var buyInInput = document.querySelector('#chipsIn');
    chipsWagered = parseInt(buyInInput.value);
    console.log("Buy input value: " + buyInInput.value);
    if (playerChips - chipsWagered >= 0) {
        playerChips = playerChips - chipsWagered;
    }
    else {
        alert("ERROR: Bet exceeds chips! Try again.");
        document.getElementById('game').style.display = 'none';
        playAgain();
    }
    console.log(playerChips);
    chipText = "Chips: " + "".concat(playerChips);
    document.getElementById('chipTotal').textContent = chipText; //we get the chipTotal id. 
});
/**
 * The function below shows the chip wager form, but hides the other data.
 */
function showWager() {
    document.getElementById('chipsWagered').style.display = 'block';
    document.getElementById('playAgain').style.display = 'none';
    document.getElementById('start').style.display = 'none';
}
//function that changes the document to allow for the text to appear. 
//we also allow for the player to click on either button
function showGame() {
    document.getElementById('chipsWagered').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('dealerCards').textContent = "Dealer Score: " + "".concat(dealer.cardTotal);
    if (Player.cardTotal == 21) {
        document.getElementById('playerCards').textContent = "Player Score: " + "".concat(Player.cardTotal) + " which is BLACKJACK!";
    }
    else {
        document.getElementById('playerCards').textContent = "Player Score: " + "".concat(Player.cardTotal);
    }
    document.getElementById('playerTotal').textContent = "Player has: " + "".concat(cardHand(Player.obtainedCards));
    document.getElementById('dealerTotal').textContent = "Dealer has: " + "".concat(cardHand(dealer.obtainedCards));
    chipText = "Chips: " + "".concat(playerChips);
    document.getElementById('chipTotal').textContent = chipText; //we get the chipTotal id. 
    document.getElementById('draw').style.display = 'inline-block';
    document.getElementById('stand').style.display = 'inline-block';
    if (playerChips - chipsWagered > 0) {
        document.getElementById('doubleDown').style.display = 'inline-block';
    }
    buyIn.play(); //play the sfx
}
/**
 * In order to account for aces; do an array of visited numbers, if at any stage 11 was visited and the number
 * goes above 21, then set the number to be itself less 10, and replace the 11 in the array.
 */
function draw() {
    addToCards(Player, dealtCards);
    /**
     * if the player busts, we wont let them draw.
     */
    if (Player.cardTotal > 21) {
        document.getElementById('playerCards').textContent = "Player Score: " + "".concat(Player.cardTotal) + " which is Bust!";
        stand(); //prevent them from drawing.
    }
    else {
        document.getElementById('playerCards').textContent = "Player Score: " + "".concat(Player.cardTotal);
    }
    document.getElementById('dealerTotal').textContent = "Dealer has: " + "".concat(cardHand(Player.obtainedCards));
}
/**
 * Doubling down: you draw one final time, while also doubling the amount of chips previously bet; if one bet 200 chips, we now increase that bet to 400.
 * So, we just draw one time, and increase the amount of chips they bet on.
 */
function doubleDown() {
    if (Player.obtainedCards.length > 2) {
        document.getElementById('doubleDown').style.display = 'none';
        alert("You can't double down after the first draw!");
    }
    else if (playerChips - chipsWagered >= 0) {
        playerChips = playerChips - chipsWagered;
        chipsWagered = chipsWagered * 2;
        chipText = "Chips: " + "".concat(playerChips);
        document.getElementById('chipTotal').textContent = chipText; //we get the chipTotal id. 
        buyIn.play(); //play the sfx again
        draw(); //we draw once
        stand(); //and prevent drawing. 
    }
    else {
        alert("Cannot double down! Not enough chips.");
    }
}
/**
 * This is very simple; we just dont let the player draw, or do anything else.
 */
function stand() {
    document.getElementById('draw').style.display = 'none';
    document.getElementById('stand').style.display = 'none';
    document.getElementById('doubleDown').style.display = 'none';
    dealerDraw();
}
/**
 * This is where the magic happens: the dealer will continiously draw until they have reached 17, or gone bust.
 */
function dealerDraw() {
    while (dealer.cardTotal < 17) {
        addToCards(dealer, dealtCards);
        document.getElementById('dealerCards').textContent = "Dealer Score: " + "".concat(dealer.cardTotal);
        document.getElementById('dealerTotal').textContent = "Dealer has: " + cardHand(dealer.obtainedCards);
    }
    compareHands();
}
/**
 * We use this function to determine the winner.
 */
function compareHands() {
    /**
     * Should the dealer draw over 21 OR the player has a greater number than the dealer AND provided the player draws under 22, the player wins.
     * Furthermore, a blackjack pays 3 to 2. that is, regularly you get twice your bet back. blackjack means thrice your bet.
     */
    if ((dealer.cardTotal > 21 || Player.cardTotal > dealer.cardTotal) && (Player.cardTotal < 22)) {
        playerChips = playerChips + (2 * chipsWagered);
        chipText = "Chips: " + "".concat(playerChips);
        document.getElementById('chipTotal').textContent = chipText; //we get the chipTotal id. 
        document.getElementById('result').textContent = "Player wins!";
    }
    else if (Player.cardTotal == dealer.cardTotal && Player.cardTotal < 22) {
        playerChips = playerChips + chipsWagered;
        chipText = "Chips: " + "".concat(playerChips);
        document.getElementById('chipTotal').textContent = chipText; //we get the chipTotal id. 
        document.getElementById('result').textContent = "Draw, bet is returned";
    }
    else {
        document.getElementById('result').textContent = "The house wins.";
    }
    Player.cardTotal = 0;
    Player.obtainedCards = [];
    dealer.cardTotal = 0;
    dealer.obtainedCards = [];
    document.getElementById('playAgain').style.display = 'block';
}
/**
 * Now we ask if the user wants to play again.
*/
function playAgain() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('result').textContent = "";
    showWager(); //we allow the user to wager again.
    for (var i = 0; i < 3; i++) {
        if (i != 2) {
            addToCards(Player, dealtCards);
            console.log("added to player total");
            console.log(Player.cardTotal);
        }
        else {
            addToCards(dealer, dealtCards);
            console.log("added to dealer total");
            console.log(dealer.cardTotal);
        }
    }
}
//we want to now add the background toggle option. we track it with a background image int. default (image enabled = 0)
var backgroundImage = 0;
function toggleBackground() {
    switch (backgroundImage) {
        case 0:
            backgroundImage++;
            document.body.style.backgroundImage = "none";
            document.body.style.backgroundColor = "white";
            break;
        case 1:
            backgroundImage++;
            document.body.style.backgroundImage = "none";
            document.body.style.backgroundColor = "black";
            document.body.style.color = "white";
            break;
        default:
            backgroundImage = -1;
            backgroundImage++;
            document.body.style.color = "black";
            document.body.style.backgroundImage = "url('blackjack_table.png')";
            break;
    }
}
var backgroundFont = 0;
//similarly, we will do the same for the font toggling. there will be much less lines of code as this is easier to execute.
function toggleFont() {
    switch (backgroundFont) {
        case 0:
            backgroundFont++;
            document.body.style.fontFamily = "Papyrus, fantasy";
            break;
        case 1:
            backgroundFont++;
            document.body.style.fontFamily = "Garamond, serif";
            break;
        case 2:
            backgroundFont++;
            document.body.style.fontFamily = "Helvetica, sans-serif";
            break;
        default:
            backgroundFont = -1;
            backgroundFont++;
            document.body.style.fontFamily = "Courier New, monospace";
            break;
    }
}
//we check to see if the card has been drawn already. This is becasue the contains function is not available for objects. 
function hasCard(cards, newCard) {
    return cards.some(function (c) { return c.cardValue === newCard.cardValue && c.cardSuit === newCard.cardSuit; });
}
//this is how we confirm if the card is an ace.
function hasAce(cards) {
    cards.forEach(function (element) {
        if (element.cardValue == 11) {
            element.cardValue = 1;
            return true;
        }
    });
    return false;
}
//we check the hand, and change the displayed content accordingly
function cardHand(cards) {
    var str = " ";
    for (var i = 0; i < cards.length; i++) {
        if (cards[i].cardValue === 1 || cards[i].cardValue === 11) {
            str += "Ace of " + cards[i].cardSuit + " ";
        }
        else {
            str += cards[i].cardValue.toString() + " of " + cards[i].cardSuit + " ";
        }
    }
    return str;
}
