import assert from "assert";
import { AnswerDifficulty, Flashcard, BucketMap } from "../src/flashcards";
import {
  toBucketSets,
  getBucketRange,
  practice,
  update,
  getHint,
  computeProgress,
} from "../src/algorithm";
import { expect } from "chai";

/*
 * Testing strategy for toBucketSets():
 *
 * TODO: Describe your testing strategy for toBucketSets() here.
 */
describe("toBucketSets()", () => {
  it("should return an empty array when the input map is empty", () => {
    const emptyMap: BucketMap = new Map();
    const result = toBucketSets(emptyMap);
    assert.deepStrictEqual(result, []);
  });

  it("should create an array with a single bucket when the map contains one bucket", () => {
    const card: Flashcard = { front: "Hello", back: "World", hint: "Test", tags: [] };
    const singleBucketMap: BucketMap = new Map([[0, new Set([card])]]);
    const result = toBucketSets(singleBucketMap);
    assert.strictEqual(result.length, 1);
    assert.deepStrictEqual(result[0], new Set([card]));
  });

  it("should handle multiple buckets correctly", () => {
    const card1: Flashcard = { front: "Hello", back: "World", hint: "Test1", tags: [] };
    const card2: Flashcard = { front: "Goodbye", back: "World", hint: "Test2", tags: [] };
    const multipleBucketMap: BucketMap = new Map([
      [0, new Set([card1])],
      [1, new Set([card2])],
    ]);
    const result = toBucketSets(multipleBucketMap);
    assert.strictEqual(result.length, 2);
    assert.deepStrictEqual(result[0], new Set([card1]));
    assert.deepStrictEqual(result[1], new Set([card2]));
  });

  it("should handle buckets containing multiple cards", () => {
    const card1: Flashcard = { front: "Hello", back: "World", hint: "Test1", tags: [] };
    const card2: Flashcard = { front: "Goodbye", back: "World", hint: "Test2", tags: [] };
    const multiCardBucketMap: BucketMap = new Map([
      [0, new Set([card1, card2])],
    ]);
    const result = toBucketSets(multiCardBucketMap);
    assert.strictEqual(result.length, 1);
    assert.deepStrictEqual(result[0], new Set([card1, card2]));
  });

  it("should handle sparse buckets with gaps correctly", () => {
    const card1: Flashcard = { front: "Hello", back: "World", hint: "Test1", tags: [] };
    const card2: Flashcard = { front: "Goodbye", back: "World", hint: "Test2", tags: [] };
    const sparseBucketMap: BucketMap = new Map([
      [0, new Set([card1])],
      [3, new Set([card2])],
    ]);
    const result = toBucketSets(sparseBucketMap);
    assert.strictEqual(result.length, 4);
    assert.deepStrictEqual(result[0], new Set([card1]));
    assert.deepStrictEqual(result[3], new Set([card2]));
    assert.strictEqual(result[1], undefined);
    assert.strictEqual(result[2], undefined);
  });
});

/*
 * Testing strategy for getBucketRange():
 *
 * TODO: Describe your testing strategy for getBucketRange() here.
 */
describe("getBucketRange()", () => {
  const card1 = new Flashcard("Speed of light", "299,792,458 m/s", "Physics constant", ["science"]);
  const card2 = new Flashcard("First president of the US", "George Washington", "Historical leader", ["history"]);

  it("should return undefined when the bucket array is empty", () => {
    const buckets: Set<Flashcard>[] = [];
    assert.strictEqual(getBucketRange(buckets), undefined);
  });

  it("should return the correct range for a single bucket", () => {
    const buckets: Set<Flashcard>[] = [new Set(), new Set([card1]), new Set()];
    const result = getBucketRange(buckets);
    assert.deepStrictEqual(result, { minBucket: 1, maxBucket: 1 });
  });

  it("should return the correct range across multiple buckets", () => {
    const buckets: Set<Flashcard>[] = [new Set(), new Set([card1]), new Set([card2]), new Set()];
    const result = getBucketRange(buckets);
    assert.deepStrictEqual(result, { minBucket: 1, maxBucket: 2 });
  });
});

/*
 * Testing strategy for practice():
 *
 * TODO: Describe your testing strategy for practice() here.
 */
describe("practice()", () => {
  const card1 = new Flashcard("Newton's First Law", "Inertia", "Physics principle", ["science"]);
  const card2 = new Flashcard("Pythagorean theorem", "a² + b² = c²", "Mathematical formula", ["math"]);
  const card3 = new Flashcard("DNA base pairs", "A-T, C-G", "Genetic information", ["biology"]);

  it("should always include cards from bucket 0 regardless of the day", () => {
    const buckets: Set<Flashcard>[] = [new Set([card1]), new Set(), new Set(), new Set()];
    const practiceCards = practice(buckets, 10);
    assert.ok(practiceCards.has(card1));
  });

  it("should include cards from specific buckets on specific days", () => {
    const buckets: Set<Flashcard>[] = [new Set([card1]), new Set([card2]), new Set([card3]), new Set()];
    [0, 4, 10, 30, 100].forEach(day => {
      const practiceCards = practice(buckets, day);
      assert.ok(practiceCards.size > 0);
    });
  });
});

/*
 * Testing strategy for update():
 *
 * TODO: Describe your testing strategy for update() here.
 */
describe("update()", () => {
  const card1 = new Flashcard("Boiling point of water", "100°C", "Standard atmospheric pressure", ["chemistry"]);
  
  it("should move the card to bucket 0 when the answer is marked as wrong", () => {
    const buckets: Map<number, Set<Flashcard>> = new Map([[2, new Set([card1])]]);
    const updatedBuckets = update(buckets, card1, AnswerDifficulty.Wrong);
    assert.ok(updatedBuckets.get(0)?.has(card1));
    assert.ok(!updatedBuckets.get(2)?.has(card1));
  });

  it("should move the card back one bucket when the answer is marked as hard", () => {
    const buckets: Map<number, Set<Flashcard>> = new Map([[2, new Set([card1])]]);
    const updatedBuckets = update(buckets, card1, AnswerDifficulty.Hard);
    assert.ok(updatedBuckets.get(1)?.has(card1));
    assert.ok(!updatedBuckets.get(2)?.has(card1));
  });

  it("should move the card forward one bucket when the answer is marked as easy", () => {
    const buckets: Map<number, Set<Flashcard>> = new Map([[1, new Set([card1])]]);
    const updatedBuckets = update(buckets, card1, AnswerDifficulty.Easy);
    assert.ok(updatedBuckets.get(2)?.has(card1));
    assert.ok(!updatedBuckets.get(1)?.has(card1));
  });
});

/*
 * Testing strategy for getHint():
 *
 * TODO: Describe your testing strategy for getHint() here.
 */
describe("getHint()", () => {
  it("should return the predefined hint if one is available", () => {
    const card = new Flashcard("Moon landing year", "1969", "Historic space event", ["history"]);
    assert.strictEqual(getHint(card), "Historic space event");
  });

  it("should return a hint based on tags if no predefined hint is available", () => {
    const card = new Flashcard("E = mc²", "Energy-mass equivalence", "", ["physics", "relativity"]);
    assert.ok(getHint(card).includes("physics, relativity"));
  });

  it("should return a hint based on the first few characters if no hint or tags are available", () => {
    const card = new Flashcard("Great Wall of China", "Ancient defense structure", "", []);
    assert.ok(getHint(card).startsWith("First few characters: Great"));
  });
});

/*
 * Testing strategy for computeProgress():
 *
 * TODO: Describe your testing strategy for computeProgress() here.
 */
describe("computeProgress()", () => {
  const card1 = new Flashcard("Smallest prime number", "2", "First prime", ["math"]);
  const card2 = new Flashcard("Chemical formula for methane", "CH4", "Organic compound", ["chemistry"]);

  it("should correctly compute progress for a bucket array", () => {
    const buckets: Set<Flashcard>[] = [new Set([card1]), new Set([card2]), new Set()];
    const progress = computeProgress(buckets, []);
    assert.strictEqual(progress.totalCards, 2);
    assert.deepStrictEqual(progress.bucketDistribution, [1, 1, 0]);
  });

  it("should correctly compute progress for a bucket map", () => {
    const buckets: Map<number, Set<Flashcard>> = new Map([
      [0, new Set([card1])],
      [2, new Set([card2])]
    ]);
    const progress = computeProgress(buckets, []);
    assert.strictEqual(progress.totalCards, 2);
    assert.ok(progress.bucketDistribution[0] === 1);
    assert.ok(progress.bucketDistribution[2] === 1);
  });
});
