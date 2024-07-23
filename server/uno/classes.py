from enum import Enum
import random
import copy

class Card:
    def __init__(self, value, color):
        self.value = value
        self.color = color

CARD_COLORS = ['Red', 'Yellow', 'Blue', 'Green']
CARD_VALUES = range(1, 13)  # 10 = pass, 11 = +2, 12 = change turn
DECK = [Card(value, color) for value in CARD_VALUES for color in CARD_COLORS]
SPECIAL_CARDS = [
    Card(0, 'Red'),
    Card(0, 'Yellow'),
    Card(0, 'Blue'),
    Card(0, 'Green'),
    Card(13, 'Special'),  # change color
    Card(13, 'Special'),  # change color
    Card(13, 'Special'),  # change color
    Card(13, 'Special'),  # change color
    Card(14, 'Special'),  # +4
    Card(14, 'Special'),   # +4
    Card(14, 'Special'),  # +4
    Card(14, 'Special'),   # +4
]
ORGANISED_DECK = DECK * 2
ORGANISED_DECK.extend(SPECIAL_CARDS)
NO_CARD = { "value": 0,"color": 'null'}

class Deck:
    def __init__(self):
        self.deck = copy.deepcopy(ORGANISED_DECK)
        self.dump = []
        self.shuffle()
        self.returnCard()

    def shuffle(self):
        random.shuffle(self.deck)

    def clearDump(self):
        if not self.deck:
            self.deck = self.dump
            self.dump = []
            self.shuffle()

    def dumpCard(self, card):
        self.dump.append(card)

    def drawCard(self):
        self.clearDump()
        return self.deck.pop(0) if self.deck else None
    
    def drawCards(self, number):
        return [self.drawCard() for _ in range(number)]
    
    def returnCard(self):
        card = self.drawCard()
        while card and card.value > 9:
            self.deck.append(card)
            self.shuffle()
            card = self.drawCard()
        if card is not None:
            self.dump.append(card)
        return card
    
    def getReturnedCard(self):
        return self.dump[-1] if self.dump else None

# Other functions :
def getPlayerToSend(player):
    return { 
        "username": player.user.username,
        "icon": player.user.icon,
        "nCards": len(player.cards),
    }

def getCardToSend(card):
    return {
        "value": card.value,
        "color": card.color,
    }

def getCardsToSend(cards):
    return [getCardToSend(card) for card in cards]

def getTextToSend(text):
    return { 
        "sender": text.sender,
        "message": text.message,
    }