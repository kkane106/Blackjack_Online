var run = (function(){// Starting game stats
  var cards = [];
  var amount = 0;
  var handNum = 1;

  // Create player and dealer
  var player = {
    name: 'Player',
    bankroll: 100,
    betSize: 2,
    hand: [],
    handValue: 0,
    wins: false,
    blackjack: false
  };

  var dealer = {
    name: 'Dealer',
    hand: [],
    handValue: 0,
    wins: false,
    blackjack: false
  };

  //Create action/event buttons
  var buttonStand = document.createElement("button");
  buttonStand.innerHTML = "Stand";
  var buttonHit = document.createElement("button");
  buttonHit.innerHTML = "Hit";
  var buttonDouble = document.createElement("button");
  buttonDouble.innerHTML = "Double";
  var buttonSplit = document.createElement("button");
  buttonSplit.innerHTML = "Split";
  var buttonTip = document.createElement("button");
  buttonTip.innerHTML = "Tip";
  var buttonDeal = document.createElement("button");
  buttonDeal.innerHTML = "Deal";

  // Place bet - Will be interactive in future
  function placeBet(multiple){
    var bet = player.betSize * multiple;
    $('#bet').children().text('');
    $('#bet').children().text('Bet Amount: $' + bet);
    return bet;
  }

  // Create new shuffled deck
  function createShuffledDeck(){
    // Create ranks and suits
    var rank = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
    var suit = ["c", "d", "h", "s"];

    // Create deck
    var deck = function(){
      for (var r = 0; r < rank.length; r++) {
        for (var s = 0; s < suit.length; s++) {
          cards.push(rank[r] + suit[s]);
        }
      }
      return cards;
    }

    var newDeck = deck();

    // Ref accepted answer from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array on 12/25/17
    function shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;
      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
      return array;
    };
    return shuffle(newDeck);
  }

  // Deal card from top of deck
  function dealHand(){
    return cards.shift();
  }

  // Show card image
  function displayCard(card) {
    return '<img src="images/cards/' + card + '.png" alt=Playing card ' + card + '>';
  }

  // Evaluate hand values
  function handValue(hand){
    var value = 0;
    var aces = 0;
    for (var i = 0; i < hand.length; i++){
      switch (hand[i][0]) {
        case '2':
          value += 2; break;
        case '3':
          value += 3; break;
        case '4':
          value += 4; break;
        case '5':
          value += 5; break;
        case '6':
          value += 6; break;
        case '7':
          value += 7; break;
        case '8':
          value += 8; break;
        case '9':
          value += 9; break;
        default:
          value += 10; break;
        case 'A':
          value += 11;
          aces += 1;
          break;
      }
    }
    while (aces > 0){
      if (value > 21){
        value -= 10;
      }
      aces--;
    }
    return value;
  }

  function toggleAllButtons() {
    buttonStand.disabled = true;
    buttonHit.disabled = true;
    buttonDouble.disabled = true;
    buttonSplit.disabled = true;
    buttonTip.disabled = true;
    buttonDeal.disabled = false;
  }

  // Player blackjack check
  function player21Check(){
    if (player.handValue === 21){
      player.blackjack = true;
      player.wins = true;
      toggleAllButtons()
      determineWinner(amount);
    }
  }

  // Check to see if the dealer has blackjack
  function dealer21Check(){
    if (dealer.handValue === 21){
      $('#dealerHand').append(displayCard(dealer.hand[dealer.hand.length - 1]));
      $('#dealerName').append(' -> ' + dealer.handValue);
      dealer.blackjack = true;
      dealer.wins = true;
      toggleAllButtons()
      determineWinner(amount);
    }
  }

  // Create stand event
  function standButton(){
    $("#stand").append(buttonStand);

    buttonStand.addEventListener ("click", function(event) {
      event.stopImmediatePropagation();
      toggleAllButtons()
      dealerTurn();
    });
  }

  // Create hit event
  function hitButton(){
    $("#hit").append(buttonHit);

    buttonHit.addEventListener ("click", function(event) {
      event.stopImmediatePropagation();
      player.hand.push(dealHand());
      $('#playerHand').append(displayCard(player.hand[player.hand.length - 1]));
      player.handValue = handValue(player.hand);
      $('#playerName').append(' -> ' + player.handValue);
      buttonDouble.disabled = true;
      buttonSplit.disabled = true;
      playerTurn();
    });
  }

  // Create double event - only available first round
  function doubleButton(){
    $("#double").append(buttonDouble);

    buttonDouble.addEventListener ("click", function(event) {
      event.stopImmediatePropagation();
      amount = placeBet(2);
      player.hand.push(dealHand());
      $('#playerHand').append(displayCard(player.hand[player.hand.length - 1]));
      player.handValue = handValue(player.hand);
      $('#playerName').append(' -> ' + player.handValue);
      toggleAllButtons()
      playerTurn();
      dealerTurn();
    });
  }

  // Create split event
  function splitButton(){
    $("#split").append(buttonSplit);

    buttonSplit.addEventListener ("click", function(event) {
      event.stopImmediatePropagation();
      alert("The split functionality is a future enhancement. For now, the hand can be played out like any other.");
      // This is going to be complicated; especially if I make this work on mobile
    });
  }

  // Create Tip (odd calculation helper) event
  function tipButton(){
    $("#tip").append(buttonTip);

    buttonTip.addEventListener ("click", function(event) {
      event.stopImmediatePropagation();
      // Note: player soft hand has slightly different odds; but for this game we are using the same hints for both.
  		// Same for split hands.
  		var pv = handValue(player.hand);
  		var dv = handValue(dealer.hand[0][0]);
  		// Player hard hand recommendations
  		// https://wizardofodds.com/games/blackjack/strategy/1-deck/ ref 10/29/17
  		if (pv >= 4 && pv <= 7) {
  				hint = "hitting";
  		}
  		else if	(pv === 8) {
  			if (dv >= 2 && dv <= 4) {
  				hint = "hitting";
  			}
  			else if (dv >= 5 && dv <= 6) {
  					hint = "doubling or hitting";
  			}
  			else if (dv >= 7 && dv <= 11) {
  				hint = "hitting";
  			}
  		}
  		else if	(pv === 9) {
  			if (dv >= 2 && dv <= 6) {
  				hint = "doubling or hitting";
  			}
  			else if (dv >= 7 && dv <= 11) {
  				hint = "hitting";
  			}
  		}
  		else if	(pv === 10) {
  			if (dv >= 2 && dv <= 9) {
  				hint = "doubling or hitting";
  			}
  			else if (dv >= 10 && dv <= 11) {
  				hint = "hitting";
  			}
  		}
  		else if	(pv === 11) {
  			hint = "doubling or hitting";
  		}
  		else if	(pv === 12) {
  			if (dv >= 2 && dv <= 3) {
  				hint = "hitting";
  			}
  			else if (dv >= 4 && dv <= 6) {
  				hint = "standing";
  			}
  			else if (dv >= 7 && dv <= 11) {
  				hint = "hitting";
  			}
  		}
  		else if	(pv >= 13 && pv <= 16) {
  			if (dv >= 2 && dv <= 6) {
  				hint = "standing";
  			}
  			else if (dv >= 7 && dv <= 11) {
  				hint = "hitting";
  			}
  		}
  		else if	(pv >= 17) {
  			hint = "standing";
  		}
  		$('#winner').children().text("The odds recommend: " + hint);
      return hint;
    });
  }

  // Create deal event
  function dealButton(){
    $("#newDeal").append(buttonDeal);

    buttonDeal.addEventListener ("click", function(event) {
      event.stopImmediatePropagation();
      handNum++;
      cards = [];
      player.hand = [];
      player.handValue = 0;
      dealer.hand = [];
      dealer.handValue = 0;
      amount = 0;
      $('#playerName').text('');
      $('#dealerName').text('');
      $('#playerHand').text('');
      $('#dealerHand').text('');
      $('#winner').children().text('');
      player.blackjack = false;
      dealer.blackjack = false;
      player.wins = false;
      dealer.wins = false;
      buttonStand.disabled = false;
      buttonHit.disabled = false;
      buttonDouble.disabled = false;
      buttonSplit.disabled = false;
      buttonTip.disabled = false;
      initialDeal();
    });
  }

  // Show hand number
  function displayHandNum() {
    $('#handNum').children().text('');
    $('#handNum').children().text('Hand Number: ' + handNum);
  }

  // Show player bankroll (total amount of money the player has for the session)
  function displayBankroll() {
    $('#bankroll').children().text('');
    $('#bankroll').children().text('Bankroll: $' + player.bankroll);
  }

  // Setup game
  var initialDeal = function() {
    displayHandNum();
    displayBankroll();
    amount = placeBet(1);
    createShuffledDeck();
    buttonDeal.disabled = true;

    $('#dealerName').text(dealer.name + "'s Hand Value: ");
    $('#playerName').text(player.name + "'s Hand Value: ");

    // Deal first three cards face up (2 to player and 1 to dealer)
    player.hand.push(dealHand());
    $('#playerHand').append(displayCard(player.hand[player.hand.length - 1]));
    dealer.hand.push(dealHand());
    $('#dealerHand').append(displayCard(dealer.hand[dealer.hand.length - 1]));
    player.hand.push(dealHand());
    $('#playerHand').append(displayCard(player.hand[player.hand.length - 1]));

    player.handValue = handValue(player.hand);
    dealer.handValue = handValue(dealer.hand);

    $('#playerName').append(player.handValue);
    $('#dealerName').append(dealer.handValue);

    // If player has blackjack they win and the round is over
    player21Check();

    // Deal final dealer card
    dealer.hand.push(dealHand());
    dealer.handValue = handValue(dealer.hand);

    // Usually the player would be offered insurance; but since this is a negative expected value play it is no longer offered and the dealer wins the round if they have blackjack
    dealer21Check()

    // Create action buttons
    standButton();
    hitButton();
    doubleButton();
    // The split button is only enabled if both the cards are the same rank
    splitButton();
    if (!(player.hand[0][0] === player.hand[1][0])){
      buttonSplit.disabled = true;
    }
    tipButton();
    dealButton();
  };

  // Since the player has to act first the dealer automatically wins when the player goes over 21
  function playerTurn(){
    $('#winner').children().text('');
    if (handValue(player.hand) > 21) {
      dealer.wins = true;
      toggleAllButtons()
      determineWinner(amount);
    }
  }

  // The dealer has to stand on all 17s (this rule favors the player - as opposed to allowing the dealer to hit on soft 17s)
  function dealerTurn() {
    if (!(dealer.wins)) {
      $('#dealerHand').append(displayCard(dealer.hand[dealer.hand.length - 1]));
      dealer.handValue = handValue(dealer.hand);
      $('#dealerName').append(' -> ' + dealer.handValue);
      while (dealer.handValue < 17) {
        dealer.hand.push(dealHand());
        $('#dealerHand').append(displayCard(dealer.hand[dealer.hand.length - 1]));
        dealer.handValue = handValue(dealer.hand);
        $('#dealerName').append(' -> ' + dealer.handValue);
      }
      if (dealer.handValue > 21) {
        player.wins = true;
      }
      determineWinner(amount);
    }
  }

  // Winner order: player blackjack, dealer blackjack, player over 21 means dealer wins, dealer over 21 means player wins, whoever has the highest hand value wins, it is a tie, there is a catch all for all other scenarios (which shouldn't exist and means I made a mistake in my logic somewhere)
  function determineWinner(amount) {
    if (player.blackjack) {
      amount *= 1.5;
      $('#winner').children().text("Congrats, you win $" + amount + " with blackjack!");
      player.bankroll += amount;
    }
    else if (dealer.blackjack) {
      $('#winner').children().append("Sorry, dealer wins with blackjack.");
      player.bankroll -= amount;
    }
    else if (dealer.wins) {
      $('#winner').children().text("Sorry, dealer wins.");
      player.bankroll -= amount;
    }
    else if (player.wins){
      $('#winner').children().text("Player wins!");
      player.bankroll += amount;
    }
    else if (handValue(dealer.hand) > handValue(player.hand)) {
      $('#winner').children().text("Sorry, dealer wins.");
      player.bankroll -= amount;
    }
    else if (handValue(dealer.hand) < handValue(player.hand)) {
      $('#winner').children().text("Player wins!");
      player.bankroll += amount;
    }
    else if (handValue(dealer.hand) === handValue(player.hand)) {
      $('#winner').children().text("It's a push (tie).");
      // No change to bankroll
    }
    else{
      alert("Sorry, unknown winner. Please deal (or reload the page if needed) to continue play.");
    }
    $('#bankroll').children().append(' -> ' + player.bankroll);
  }

  // Start game
  return initialDeal;
})();

run();
