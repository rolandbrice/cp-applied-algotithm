'use strict';

/**
 * A binary min-heap priority queue.
 *
 * Dijkstra's algorithm repeatedly needs the unvisited vertex with the
 * smallest tentative distance. A min-heap makes each extraction O(log n)
 * instead of the O(n) scan a naive implementation would use.
 */
class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  get size() {
    return this.heap.length;
  }

  push(value, priority) {
    this.heap.push({ value, priority });

    // Bubble the new entry up until the heap property is restored.
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIndex = (index - 1) >> 1;
      if (this.heap[parentIndex].priority <= this.heap[index].priority) break;

      [this.heap[parentIndex], this.heap[index]] = [
        this.heap[index],
        this.heap[parentIndex],
      ];
      index = parentIndex;
    }
  }

  pop() {
    if (this.heap.length === 0) return null;

    const min = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.#sinkDown(0);
    }

    return min;
  }

  #sinkDown(index) {
    const n = this.heap.length;

    while (true) {
      const left = 2 * index + 1;
      const right = left + 1;
      let smallest = index;

      if (left < n && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < n && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];
      index = smallest;
    }
  }
}

/**
 * Validates the graph shape and the edge weights.
 * Dijkstra requires non-negative weights, otherwise its greedy choice is
 * no longer guaranteed to be optimal.
 */
function validateGraph(graph) {
  if (graph === null || typeof graph !== 'object' || Array.isArray(graph)) {
    throw new TypeError('graph must be a non-null object');
  }

  for (const [vertex, neighbours] of Object.entries(graph)) {
    if (
      neighbours === null ||
      typeof neighbours !== 'object' ||
      Array.isArray(neighbours)
    ) {
      throw new TypeError(`graph["${vertex}"] must be an object of neighbours`);
    }

    for (const [neighbour, weight] of Object.entries(neighbours)) {
      if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 0) {
        throw new RangeError(
          `Edge ${vertex} -> ${neighbour} has an invalid weight: ${weight}. ` +
            'Weights must be finite, non-negative numbers.'
        );
      }
    }
  }
}

/**
 * Finds the shortest distance from `start` to every vertex in a weighted graph.
 *
 * @param {Object<string, Object<string, number>>} graph
 *   Adjacency list where graph[u][v] is the weight of the edge u -> v.
 * @param {string} start
 *   The vertex to compute distances from.
 * @returns {Object<string, number>}
 *   An object mapping every vertex to its shortest distance from `start`.
 *   Unreachable vertices have a distance of Infinity.
 *
 * @example
 * const graph = {
 *   A: { B: 4, C: 2 },
 *   B: { A: 4, C: 5, D: 10 },
 *   C: { A: 2, B: 5, D: 3 },
 *   D: { B: 10, C: 3 },
 * };
 * dijkstra(graph, 'A'); // { A: 0, B: 4, C: 2, D: 5 }
 */
function dijkstra(graph, start) {
  validateGraph(graph);

  if (!Object.prototype.hasOwnProperty.call(graph, start)) {
    throw new Error(`Start vertex "${start}" does not exist in the graph.`);
  }

  // Every known vertex starts at Infinity, except the source at 0.
  // A null-prototype object keeps vertex names such as "constructor" or
  // "toString" from colliding with Object.prototype properties.
  const distances = Object.create(null);
  for (const vertex of Object.keys(graph)) {
    distances[vertex] = Infinity;
  }
  distances[start] = 0;

  const queue = new MinPriorityQueue();
  queue.push(start, 0);

  while (queue.size > 0) {
    const { value: current, priority: currentDistance } = queue.pop();

    // Skip outdated queue entries left behind by a later, cheaper update.
    if (currentDistance > distances[current]) continue;

    const neighbours = graph[current] ?? {};

    for (const [neighbour, weight] of Object.entries(neighbours)) {
      // A neighbour may be referenced without being a declared key.
      // It is still a vertex, so give it an entry (unreachable for now).
      if (!Object.hasOwn(distances, neighbour)) {
        distances[neighbour] = Infinity;
      }

      const candidate = currentDistance + weight;

      if (candidate < distances[neighbour]) {
        distances[neighbour] = candidate;
        queue.push(neighbour, candidate);
      }
    }
  }

  // Return a normal object so callers get the shape shown in the task.
  return { ...distances };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { dijkstra, MinPriorityQueue };
}
