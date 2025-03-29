/**
 * Problem Set 1: Flashcards - Algorithm Functions
 *
 * This file contains the implementations for the flashcard algorithm functions
 * as described in the problem set handout.
 *
 * Please DO NOT modify the signatures of the exported functions in this file,
 * or you risk failing the autograder.
 */

import { Flashcard, AnswerDifficulty, BucketMap } from "./flashcards";

/**
 * Converts a Map representation of learning buckets into an Array-of-Set representation.
 *
 * @param buckets Map where keys are bucket numbers and values are sets of Flashcards.
 * @returns Array of Sets, where element at index i is the set of flashcards in bucket i.
 *          Buckets with no cards will have empty sets in the array.
 * @spec.requires buckets is a valid representation of flashcard buckets.
 */
export function toBucketSets(buckets: BucketMap): Array<Set<Flashcard>> {
  const maxBucket = Math.max(...buckets.keys(), -1);
  return Array.from({ length: maxBucket + 1 }, (_, i) => buckets.get(i) || new Set<Flashcard>());
}

/**
 * Finds the range of buckets that contain flashcards, as a rough measure of progress.
 *
 * @param buckets Array-of-Set representation of buckets.
 * @returns object with minBucket and maxBucket properties representing the range,
 *          or undefined if no buckets contain cards.
 * @spec.requires buckets is a valid Array-of-Set representation of flashcard buckets.
 */
export function getBucketRange(buckets: Array<Set<Flashcard>>): { minBucket: number; maxBucket: number } | undefined {
  let minBucket = -1, maxBucket = -1;
  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i]?.size) {
      if (minBucket === -1) minBucket = i;
      maxBucket = i;
    }
  }
  return minBucket === -1 ? undefined : { minBucket, maxBucket };
}

/**
 * Selects cards to practice on a particular day.
 *
 * @param buckets Array-of-Set representation of buckets.
 * @param day current day number (starting from 0).
 * @returns a Set of Flashcards that should be practiced on day `day`,
 *          according to the Modified-Leitner algorithm.
 * @spec.requires buckets is a valid Array-of-Set representation of flashcard buckets.
 */

export function practice(buckets: Array<Set<Flashcard>>, day: number): Set<Flashcard> {
  const practiceCards = new Set<Flashcard>();
  const intervals = [1, 4, 10, 30, 100];
  intervals.forEach((interval, index) => {
    if (day % interval === 0 && buckets[index]) {
      buckets[index].forEach(card => practiceCards.add(card));
    }
  });
  return practiceCards;
}
/**
 * Updates a card's bucket number after a practice trial.
 *
 * @param buckets Map representation of learning buckets.
 * @param card flashcard that was practiced.
 * @param difficulty how well the user did on the card in this practice trial.
 * @returns updated Map of learning buckets.
 * @spec.requires buckets is a valid representation of flashcard buckets.
 */

export function update(buckets: BucketMap, card: Flashcard, difficulty: AnswerDifficulty): BucketMap {
  const updatedBuckets = new Map(buckets);
  let currentBucket = [...updatedBuckets.entries()].find(([_, set]) => set.has(card))?.[0] ?? 0;
  updatedBuckets.get(currentBucket)?.delete(card);
  let newBucket = difficulty === AnswerDifficulty.Wrong ? 0 :
    difficulty === AnswerDifficulty.Hard ? Math.max(0, currentBucket - 1) :
      Math.min(4, currentBucket + 1);
  if (!updatedBuckets.has(newBucket)) updatedBuckets.set(newBucket, new Set());
  updatedBuckets.get(newBucket)?.add(card);
  return updatedBuckets;
}

/**
 * Generates a hint for a flashcard.
 *
 * @param card flashcard to hint
 * @returns a hint for the front of the flashcard.
 * @spec.requires card is a valid Flashcard.
 */
export function getHint(card: Flashcard): string {
  return card.hint?.trim() || (card.tags.length > 0 ? `Try a card related to: ${card.tags.join(', ')}` : `First few characters: ${card.front.slice(0, 5)}...`);
}

/**
 * Computes statistics about the user's learning progress.
 *
 * @param buckets representation of learning buckets.
 * @param history representation of user's answer history.
 * @returns statistics about learning progress.
 * @spec.requires [SPEC TO BE DEFINED]
 */
export function computeProgress(buckets: BucketMap | Array<Set<Flashcard>>, history: Array<{ card: Flashcard; difficulty: AnswerDifficulty }>): { totalCards: number; bucketDistribution: number[] } {
  let totalCards = 0;
  const bucketDistribution: number[] = [];
  if (Array.isArray(buckets)) {
    buckets.forEach((bucket, index) => {
      bucketDistribution[index] = bucket.size;
      totalCards += bucket.size;
    });
  } else {
    for (const [index, set] of buckets.entries()) {
      bucketDistribution[index] = set.size;
      totalCards += set.size;
    }
  }
  return { totalCards, bucketDistribution };
}
