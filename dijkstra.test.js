'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { dijkstra } = require('./dijkstra.js');

const exampleGraph = {
  A: { B: 4, C: 2 },
  B: { A: 4, C: 5, D: 10 },
  C: { A: 2, B: 5, D: 3 },
  D: { B: 10, C: 3 },
};

test('returns the expected distances for the assignment example', () => {
  assert.deepEqual(dijkstra(exampleGraph, 'A'), {
    A: 0,
    B: 4,
    C: 2,
    D: 5,
  });
});

test('works from a different start vertex', () => {
  assert.deepEqual(dijkstra(exampleGraph, 'D'), {
    A: 5,
    B: 8,
    C: 3,
    D: 0,
  });
});

test('handles a single-vertex graph', () => {
  assert.deepEqual(dijkstra({ A: {} }, 'A'), { A: 0 });
});

test('marks unreachable vertices as Infinity', () => {
  const graph = {
    A: { B: 1 },
    B: { A: 1 },
    C: { D: 2 },
    D: { C: 2 },
  };

  assert.deepEqual(dijkstra(graph, 'A'), {
    A: 0,
    B: 1,
    C: Infinity,
    D: Infinity,
  });
});

test('handles directed graphs', () => {
  const graph = {
    A: { B: 1 },
    B: { C: 2 },
    C: {},
  };

  assert.deepEqual(dijkstra(graph, 'A'), { A: 0, B: 1, C: 3 });
});

test('prefers a cheaper multi-edge route over a direct expensive edge', () => {
  const graph = {
    A: { B: 100, C: 1 },
    B: {},
    C: { B: 2 },
  };

  assert.equal(dijkstra(graph, 'A').B, 3);
});

test('supports zero-weight edges', () => {
  const graph = {
    A: { B: 0 },
    B: { C: 0 },
    C: {},
  };

  assert.deepEqual(dijkstra(graph, 'A'), { A: 0, B: 0, C: 0 });
});

test('includes referenced vertices that are not declared as keys', () => {
  const graph = { A: { B: 7 } };

  assert.deepEqual(dijkstra(graph, 'A'), { A: 0, B: 7 });
});

test('handles vertex names that collide with Object.prototype', () => {
  const graph = {
    A: { constructor: 2, toString: 3 },
    constructor: {},
    toString: {},
  };

  assert.deepEqual(dijkstra(graph, 'A'), {
    A: 0,
    constructor: 2,
    toString: 3,
  });
});

test('rejects an unknown start vertex', () => {
  assert.throws(() => dijkstra(exampleGraph, 'Z'), /does not exist/);
});

test('rejects negative edge weights', () => {
  const graph = { A: { B: -1 }, B: {} };

  assert.throws(() => dijkstra(graph, 'A'), /non-negative/);
});

test('rejects non-numeric edge weights', () => {
  const graph = { A: { B: '4' }, B: {} };

  assert.throws(() => dijkstra(graph, 'A'), /invalid weight/);
});

test('matches Bellman-Ford on random non-negative graphs', () => {
  // Small deterministic PRNG so failures are reproducible.
  let seed = 42;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let trial = 0; trial < 200; trial += 1) {
    const size = 2 + Math.floor(random() * 7);
    const vertices = Array.from({ length: size }, (_, i) => `V${i}`);
    const graph = Object.fromEntries(vertices.map((v) => [v, {}]));

    for (const from of vertices) {
      for (const to of vertices) {
        if (from !== to && random() < 0.3) {
          graph[from][to] = Math.floor(random() * 20);
        }
      }
    }

    const source = vertices[0];

    // Reference implementation: Bellman-Ford relaxation.
    const expected = Object.fromEntries(vertices.map((v) => [v, Infinity]));
    expected[source] = 0;
    for (let pass = 0; pass < size - 1; pass += 1) {
      for (const from of vertices) {
        for (const [to, weight] of Object.entries(graph[from])) {
          const candidate = expected[from] + weight;
          if (candidate < expected[to]) expected[to] = candidate;
        }
      }
    }

    assert.deepEqual(
      dijkstra(graph, source),
      expected,
      `Mismatch on trial ${trial}: ${JSON.stringify(graph)}`
    );
  }
});
