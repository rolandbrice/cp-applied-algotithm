# Dijkstra's Algorithm in JavaScript

A binary-heap implementation of Dijkstra's shortest-path algorithm.

## Usage

```js
const { dijkstra } = require('./dijkstra.js');

const graph = {
  A: { B: 4, C: 2 },
  B: { A: 4, C: 5, D: 10 },
  C: { A: 2, B: 5, D: 3 },
  D: { B: 10, C: 3 },
};

console.log(dijkstra(graph, 'A'));
// { A: 0, B: 4, C: 2, D: 5 }
```

The graph is an adjacency object: `graph[u][v]` is the weight of the edge from
`u` to `v`. The example above is undirected, so each edge is listed in both
directions. Directed graphs work too: list only the edges that exist.

The function returns an object containing every vertex and its shortest
distance from `start`. Vertices that cannot be reached get `Infinity`.

## How it works

1. Set the distance to every vertex to `Infinity`, except the start vertex,
   which is `0`.
2. Put the start vertex in a min-priority queue keyed by distance.
3. Repeatedly extract the vertex with the smallest tentative distance.
4. For each of its neighbours, relax the edge: if going through the current
   vertex produces a shorter distance, update the neighbour and enqueue it.
5. Stop when the queue is empty. Every extracted distance is final.

Outdated queue entries are skipped with `currentDistance > distances[current]`.
This is the standard "lazy deletion" approach and avoids implementing a
decrease-key operation.

## Complexity

With `V` vertices and `E` edges:

- Time: `O((V + E) log V)` — each edge can cause one heap insertion, and each
  insertion/extraction costs `O(log V)`.
- Space: `O(V + E)` — the distance table plus the heap. (The heap can hold up
  to `E` entries when distances improve repeatedly.)

Dijkstra's algorithm requires **non-negative edge weights**; the implementation
throws a `RangeError` if a negative weight is supplied. For graphs with negative
weights, use Bellman-Ford instead.

## Tests

The suite uses Node's built-in test runner, so there are no dependencies:

```bash
node --test dijkstra.test.js
```

It covers the assignment example, directed/unreachable/zero-weight cases, input
validation, and a randomized comparison against Bellman-Ford.
