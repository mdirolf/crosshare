from __future__ import annotations

from dataclasses import (dataclass, field)
import itertools
import random
from typing import List

import word_db


DIR_ACROSS = 0
DIR_DOWN = 1


@dataclass
class Cell:
    grid: Grid
    x: int
    y: int
    value: str
    entries: List[Entry] = field(default_factory=list)

    def add_entry(self, entry):
        self.entries.append(entry)

    def _id(self):
        return self.y * self.grid.width + self.x


@dataclass
class Entry:
    grid: Grid
    pattern: str
    cells: List[Cell]

    def pattern_with_replacement(self, cell_id, value):
        pattern = ""
        for cell in self.cells:
            if cell._id() == cell_id:
                pattern += value
            else:
                pattern += cell.value
        return pattern

    def crosses(self):
        crosses = []
        for c in self.cells:
            crosses += [e for e in c.entries if e != self]
        return crosses


def weighted_shuffle(l):
    weighted = []
    weight_map = dict(l)
    while len(weighted) < len(l):
        choices, weights = zip(*weight_map.items())
        choice = random.choices(choices, weights)[0]
        weighted.append(choice)
        weight_map[choice] = 0
    return weighted


class Grid(object):

    def grid_with_entry_replaced(self, entry, word):
        if len(word) != len(entry.cells):
            raise Exception("botched", word, entry.pattern)
        replacements = {}
        for i in range(len(word)):
            replacements[entry.cells[i]._id()] = word[i]
        return Grid(self.to_string(replacements))

    def cell_id(self, x, y):
        return y * self.width + x

    def cell_at(self, x, y):
        return self.cells[self.cell_id(x, y)]

    def val_at(self, x, y):
        return self.cell_at(x, y).value

    def is_block(self, x, y):
        return self.val_at(x, y) == '.'

    def to_string(self, replacements=None):
        s = ""
        for y in range(self.height):
            for x in range(self.width):
                if replacements and self.cell_id(x,y) in replacements:
                    s += replacements[self.cell_id(x,y)]
                else:
                    s += self.val_at(x, y)
            s += "\n"
        return s

    def __str__(self):
        return " " + " ".join(self.to_string())

    def words(self):
        return [e.pattern for e in self.entries if ' ' not in e.pattern]

    def cost(self):
        cost = 0
        for e in self.entries:
            entry_cost = 5
            match = word_db.highest_score(e.pattern)
            if match:
               entry_cost = 1 / match[1]
            cost += entry_cost
        return cost

    def __init__(self, template, verify=False):
        rows = template.strip('\n').split('\n')
        self.height = len(rows)
        self.width = len(rows[0])
        self.cells = []
        self.entries = []

        for y in range(self.height):
            for x in range(self.width):
                self.cells.append(Cell(self, x, y, rows[y][x]))

        for dir in (DIR_ACROSS, DIR_DOWN):
            xincr = (dir == DIR_ACROSS) and 1 or 0
            yincr = (dir == DIR_DOWN) and 1 or 0

            for y in range(self.height):
                for x in range(self.width):
                    start_of_row = (dir == DIR_ACROSS and x == 0) or \
                                   (dir == DIR_DOWN and y == 0)
                    start_of_entry = (not self.is_block(x, y) and \
                                      (start_of_row or self.is_block(x-xincr, y-yincr)) and \
                                      (x + xincr < self.width and \
                                       y + yincr < self.height and \
                                       not self.is_block(x+xincr, y+yincr)))
                    if not start_of_entry:
                        continue

                    entry_cells = []
                    entry_pattern = ""
                    xt = x
                    yt = y
                    while xt < self.width and yt < self.height:
                        if self.is_block(xt, yt):
                            break
                        cell = self.cell_at(xt, yt)
                        entry_cells.append(cell)
                        entry_pattern += cell.value
                        xt += xincr
                        yt += yincr
                    if verify and not word_db.num_matches(entry_pattern):
                        raise Exception("Batched it", entry_pattern)
                    entry = Entry(self, entry_pattern, entry_cells)
                    for c in entry_cells:
                        c.add_entry(entry)
                    self.entries.append(entry)


class Solver(object):

    best_grid = None
    best_cost = 0

    def __init__(self, grid):
        self.initial_grid = Grid(grid)

    def most_constrained(self, grid):
        entries_to_solve = [(e, word_db.num_matches(e.pattern)) for e in grid.entries if ' ' in e.pattern]
        return sorted(entries_to_solve, key=lambda x: x[1])

    def _solve(self, grid):
        if self.best_grid and grid.cost() > self.best_cost:
            return None

        constraints = self.most_constrained(grid)
        if not constraints: # new best soln
            print(grid)
            print(grid.cost())
            self.best_grid = grid
            self.best_cost = grid.cost()
            return grid

        entry_to_solve, options = constraints[0]
        if not options: # we're f'ed
            return None

        already_used = grid.words()
        matches = word_db.matching_words(entry_to_solve.pattern)
        matches = weighted_shuffle(matches)

        count = 0
        for word in matches:
            if self.best_grid and count > 10:
                return None

            if word in already_used:
                continue

            # Lookahead and only consider if crosses still have potential
            crosses = entry_to_solve.crosses()
            fail = False
            for i in range(len(word)):
                if entry_to_solve.pattern[i] == ' ':
                    cross = crosses[i]
                    pattern = cross.pattern_with_replacement(entry_to_solve.cells[i]._id(),
                                                             word[i])
                    if not word_db.matching_words(pattern):
                        fail = True
                        break
            if fail:
                continue

            count += 1

            new_grid = grid.grid_with_entry_replaced(entry_to_solve, word)
            soln = self._solve(new_grid)
#            if soln:
#                return soln

        return None

    def solve(self):
        self._solve(self.initial_grid)
        print(self.best_grid)
        print(self.best_cost)
        return self.best_grid

if __name__ == "__main__":
    test_grid = '''    .    .     
    .    .     
    .    .     
VANBURENZOPIANO
...   ..   ....
WASHINGTONYHAWK
   ..   .      
     .   .     
      .   ..   
ROOSEVELTONJOHN
....   ..   ...
JEFFERSONNYBONO
     .    .    
     .    .    
     .    .    '''
#     test_grid = '''CROC.CAPO.TACIT
# COMA.UBER.ALERO
# TWAS.RENO.XANAX
# VANBURENZOPIANO
# ...ABE..CIA....
# WASHINGTONYHAWK
# ADO..T  .KERNEL
# GECKO.   .RHINE
# ENIGMA.   ..MCI
# ROOSEVELTONJOHN
# ....LE ..   ...
# JEFFERSONNYBONO
# APOET.    .    
# MERIT.    .    
# BEANE.    .    '''
    solver = Solver(test_grid)
    import timeit
    count, total = timeit.Timer(lambda: solver.solve()).autorange()
    print(total/count)
