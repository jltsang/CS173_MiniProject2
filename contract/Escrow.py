# Escrow - Example for illustrative purposes only.

import smartpy as sp

class Escrow(sp.Contract):
    def __init__(self, owner, fromOwner, counterparty, fromCounterparty, admin, epoch, hashedSecret):
        self.init(fromOwner           = fromOwner,
                  fromCounterparty    = fromCounterparty,
                  balanceOwner        = sp.tez(0),
                  balanceCounterparty = sp.tez(0),
                  hashedSecret        = hashedSecret,
                  epoch               = epoch,
                  owner               = owner,
                  counterparty        = counterparty,
                  admin               = admin,
                  revertOwner         = False,
                  revertCounterparty  = False,
        )

    @sp.entry_point
    def addBalanceOwner(self):
        sp.verify(self.data.revertOwner == False, message = "The owner has agreed to revert the funds. Funds cannot be added.")
        sp.verify(self.data.balanceOwner == sp.tez(0), message = "The owner has already added funds.")
        sp.verify(sp.amount == self.data.fromOwner, message = "The amount is incorrect.")
        sp.verify(sp.sender == self.data.owner, message = "You are not the intended recipient.")
        self.data.balanceOwner = self.data.fromOwner

    @sp.entry_point
    def addBalanceCounterparty(self):
        sp.verify(self.data.revertCounterparty == False, message = "The counterparty has agreed to revert the funds. Funds cannot be added.")
        sp.verify(self.data.balanceCounterparty == sp.tez(0), message = "The counterparty has already added funds.")
        sp.verify(sp.amount == self.data.fromCounterparty, message = "The amount is incorrect.")
        sp.verify(sp.sender == self.data.counterparty, message = "You are not the intended recipient.")
        self.data.balanceCounterparty = self.data.fromCounterparty

    def claim(self, identity):
        sp.verify(sp.sender == identity, message = "You are not the intended recipient.")
        sp.verify(self.data.revertOwner == False, message = "The owner has agreed to revert the funds. Funds cannot be claimed.")
        sp.verify(self.data.revertCounterparty == False, message = "The counterparty has agreed to revert the funds. Funds cannot be claimed.")
        sp.send(identity, self.data.balanceOwner + self.data.balanceCounterparty)
        self.data.balanceOwner = sp.tez(0)
        self.data.balanceCounterparty = sp.tez(0)

    @sp.entry_point
    def claimCounterparty(self, params):
        sp.verify(sp.now < self.data.epoch, message = "The time limit has expired.")
        sp.verify(self.data.hashedSecret == sp.blake2b(params.secret), message = "The secret is incorrect.")
        self.claim(self.data.counterparty)

    @sp.entry_point
    def claimOwner(self):
        sp.verify(self.data.epoch < sp.now)
        self.claim(self.data.owner)

    @sp.entry_point
    def revertFunds(self):
        sp.if sp.sender == self.data.owner:
            sp.verify(self.data.revertOwner == False, message = "You have already agreed to revert the funds.")
            self.data.revertOwner = True
        sp.if sp.sender == self.data.counterparty:
            sp.verify(self.data.revertCounterparty == False, message = "You have already agreed to revert the funds.")
            self.data.revertCounterparty = True
        sp.if sp.sender == self.data.admin:
            sp.verify(self.data.revertOwner == True, message = "The owner has not agreed to revert the funds.")
            sp.verify(self.data.revertCounterparty == True, message = "The counterparty has not agreed to revert the funds.")
            sp.if self.data.balanceOwner > sp.tez(0):
                sp.send(self.data.owner, self.data.balanceOwner)
                self.data.balanceOwner = sp.tez(0)
            sp.if self.data.balanceCounterparty > sp.tez(0):
                sp.send(self.data.counterparty, self.data.balanceCounterparty)
                self.data.balanceCounterparty = sp.tez(0)
            self.data.revertOwner = False
            self.data.revertCounterparty = False

@sp.add_test(name = "Escrow")
def test():
    scenario = sp.test_scenario()
    scenario.h1("Escrow")
    hashSecret = sp.blake2b(sp.bytes("0x01223344"))
    alice = sp.test_account("Alice")
    bob = sp.test_account("Bob")
    c1 = Escrow(alice.address, sp.tez(50), bob.address, sp.tez(4), alice.address, sp.timestamp(123), hashSecret)
    scenario += c1
    c1.addBalanceOwner().run(sender = alice, amount = sp.tez(50))
    c1.addBalanceCounterparty().run(sender = bob, amount = sp.tez(4))
    scenario.h3("Erronous secret")
    c1.claimCounterparty(secret = sp.bytes("0x01223343")).run(sender = bob, valid = False)
    scenario.h3("Correct secret")
    c1.claimCounterparty(secret = sp.bytes("0x01223344")).run(sender = bob)

sp.add_compilation_target("escrow", Escrow(sp.address("tz1MscYnPSby46hZMBZNmCuPa6v3H65oCkuY"), sp.tez(50), sp.address("tz1fszj4aHFsJfhZp3bPnTGqDR2Z54sY4bm1"), sp.tez(4), sp.address("tz1WUKjXiGKguuYAvB1NnmGdYt89sSdi9gzv"), sp.timestamp(1681698973), sp.bytes("0xc2e588e23a6c8b8192da64af45b7b603ac420aefd57cc1570682350154e9c04e")))
