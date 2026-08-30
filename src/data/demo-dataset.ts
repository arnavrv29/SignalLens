// SignalLens AI - Synthetic Demo Dataset Generator
// ~500 reviews with hidden patterns for analytics pipeline to discover
//
// Hidden story:
// - Jan avg ~4.3, Feb avg ~4.2, Mar avg ~3.8
// - Delivery complaints spike in March (+187%)
// - Wait-time complaints spike (+142%)
// - Weekend negative sentiment increases significantly
// - Food quality remains relatively stable
// - Service complaints rise moderately

import { Review } from '@/types';

const RESTAURANTS = ['The Golden Fork', 'Bistro Azure'];
const VISIT_TYPES = ['dine-in', 'delivery', 'takeaway'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
const LOCATIONS = ['downtown', 'suburbs'];

// Review templates by sentiment/topic
const POSITIVE_FOOD = [
  'The food was absolutely delicious! Every dish was cooked to perfection.',
  'Amazing flavors in every bite. The chef really knows what they are doing.',
  'Best pasta I have had in a long time. Fresh ingredients and perfect seasoning.',
  'The steak was cooked exactly as ordered. Tender and flavorful.',
  'Incredible sushi, very fresh fish. The menu selection is impressive.',
  'Loved the dessert menu. The chocolate cake was heavenly.',
  'Food quality is consistently excellent. The salad was so fresh and tasty.',
  'Great portion sizes and every dish we tried was wonderful.',
  'The appetizers were creative and the entree was outstanding.',
  'Fantastic curry with authentic spices. Will definitely come back for more.',
];

const NEGATIVE_FOOD = [
  'The food was bland and overcooked. Very disappointing meal.',
  'Stale bread and the soup was cold. Not up to the usual standard.',
  'Portions were tiny for the price. The chicken was undercooked.',
  'The pizza dough was soggy and toppings were sparse.',
  'Food arrived cold and tasted like it was reheated. Very poor quality.',
];

const POSITIVE_SERVICE = [
  'Staff was incredibly friendly and attentive. Made our evening special.',
  'Our waiter was very knowledgeable and gave great recommendations.',
  'The service was prompt and professional. Everyone was so polite.',
  'Manager came by to check on us. Really appreciated the personal touch.',
  'The hostess was welcoming and the server was outstanding.',
];

const NEGATIVE_SERVICE = [
  'Service was terrible. Our waiter was rude and completely ignored us.',
  'Had to wait 20 minutes just to get someone to take our order. Very unprofessional.',
  'Staff seemed overwhelmed and disorganized. The server got our order wrong twice.',
  'The attitude of the staff was unacceptable. Manager was nowhere to be found.',
  'Server was inattentive and we had to flag someone down multiple times.',
  'Really disappointed with the service today. Staff was not friendly at all.',
];

const NEGATIVE_DELIVERY = [
  'Delivery took over an hour. Food was completely cold when it arrived.',
  'Wrong order delivered. Missing items and no response from the restaurant.',
  'The delivery driver was lost and the food was a mess when it finally arrived.',
  'Online order was wrong. They forgot half the items. Very frustrating experience.',
  'Delivery time was way too long. Over 90 minutes for a simple order.',
  'Cold food, missing items in delivery. The packaging was terrible.',
  'Ordered takeaway but waited 45 minutes past the estimated time.',
  'Late delivery and the food quality suffered. Everything was soggy.',
  'Delivery was a disaster. Wrong items and when I called they were unhelpful.',
  'The worst delivery experience. Food was cold, items missing, and took forever.',
];

const NEGATIVE_WAITING = [
  'Had to wait over 40 minutes for our food. The restaurant was not even busy.',
  'Extremely slow service. We waited forever to get seated and then another long wait for food.',
  'The wait time was ridiculous. Over an hour for a simple burger.',
  'Took way too long to get our order. Almost an hour just for appetizers.',
  'Waited 30 minutes just to be acknowledged. Then another 45 for food. Unacceptable.',
  'So slow today. We waited and waited. Almost walked out.',
  'Long wait times completely ruined the experience. The food took forever.',
  'Speed of service needs improvement. We waited too long for everything.',
  'Way too slow. Waited 50 minutes for our main course. Will not be back.',
  'The delay was unreasonable. Over 40 minutes and they seemed in no rush.',
];

const POSITIVE_AMBIANCE = [
  'Beautiful restaurant with a cozy atmosphere. The decor is stunning.',
  'Great ambiance. Perfect lighting and comfortable seating.',
  'The atmosphere was perfect for a date night. Quiet and elegant.',
  'Love the interior design. Very spacious and the music was great.',
];

const NEGATIVE_AMBIANCE = [
  'Too noisy and crowded. Could not hear my dining partner.',
  'The restaurant was dirty and the restroom was in terrible condition.',
  'Lighting was too dim and the seating was uncomfortable.',
];

const POSITIVE_PRICE = [
  'Great value for money. Generous portions at reasonable prices.',
  'Very affordable and the quality matches higher-priced restaurants.',
  'The lunch deal is an absolute steal. Highly recommend.',
];

const NEGATIVE_PRICE = [
  'Way overpriced for what you get. Not worth the cost at all.',
  'The bill was shocking. Tiny portions at premium prices.',
  'Too expensive for the quality. You can find much better deals elsewhere.',
];

const GENERIC_POSITIVE = [
  'Great experience overall. Will definitely recommend to friends.',
  'Everything was perfect. A wonderful dining experience from start to finish.',
  'We had a lovely time. Nothing to complain about.',
  'Really enjoyed our visit. Will be coming back soon.',
  'Solid restaurant. Consistent quality and always a pleasant visit.',
];

const GENERIC_NEGATIVE = [
  'Will not be returning. Very disappointing experience overall.',
  'Used to be much better. Quality has really gone down recently.',
  'Not what it used to be. Standards have clearly dropped.',
  'Overall a poor experience. Would not recommend right now.',
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomDate(year: number, month: number): string {
  const day = Math.floor(Math.random() * 28) + 1;
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function generateReview(
  id: number,
  date: string,
  rating: number,
  reviewText: string,
  visitType: string,
  mealType: string,
): Review {
  return {
    review_id: `REV-${String(id).padStart(4, '0')}`,
    date,
    restaurant: randomChoice(RESTAURANTS),
    rating: Math.round(rating * 10) / 10,
    review_text: reviewText,
    visit_type: visitType,
    location: randomChoice(LOCATIONS),
    meal_type: mealType,
  };
}

export function generateDemoDataset(): Review[] {
  const reviews: Review[] = [];
  let id = 1;

  // JANUARY: ~165 reviews, avg rating ~4.3, mostly positive
  for (let i = 0; i < 165; i++) {
    const date = randomDate(2025, 1);
    const dow = new Date(date).getDay();
    const isWeekend = dow === 0 || dow === 6;
    const visitType = randomChoice(VISIT_TYPES);
    const mealType = randomChoice(MEAL_TYPES);
    let rating: number;
    let text: string;
    const r = Math.random();

    if (r < 0.55) {
      // Positive food
      rating = randomFloat(4.0, 5.0);
      text = randomChoice(POSITIVE_FOOD);
    } else if (r < 0.7) {
      // Positive service
      rating = randomFloat(4.0, 5.0);
      text = randomChoice(POSITIVE_SERVICE);
    } else if (r < 0.8) {
      // Positive ambiance/price
      rating = randomFloat(4.0, 5.0);
      text = Math.random() > 0.5 ? randomChoice(POSITIVE_AMBIANCE) : randomChoice(POSITIVE_PRICE);
    } else if (r < 0.88) {
      // Generic positive
      rating = randomFloat(3.5, 4.5);
      text = randomChoice(GENERIC_POSITIVE);
    } else if (r < 0.93) {
      // Minor negative (service)
      rating = randomFloat(2.5, 3.5);
      text = randomChoice(NEGATIVE_SERVICE);
    } else if (r < 0.96) {
      // Minor negative (delivery) - low rate in Jan
      rating = randomFloat(2.0, 3.0);
      text = randomChoice(NEGATIVE_DELIVERY);
      if (isWeekend) rating -= 0.2;
    } else {
      // Minor negative (waiting) - low rate in Jan
      rating = randomFloat(2.5, 3.5);
      text = randomChoice(NEGATIVE_WAITING);
    }

    reviews.push(generateReview(id++, date, Math.max(1, Math.min(5, rating)), text, visitType, mealType));
  }

  // FEBRUARY: ~165 reviews, avg rating ~4.2, slight increase in complaints
  for (let i = 0; i < 165; i++) {
    const date = randomDate(2025, 2);
    const dow = new Date(date).getDay();
    const isWeekend = dow === 0 || dow === 6;
    const visitType = randomChoice(VISIT_TYPES);
    const mealType = randomChoice(MEAL_TYPES);
    let rating: number;
    let text: string;
    const r = Math.random();

    if (r < 0.50) {
      rating = randomFloat(4.0, 5.0);
      text = randomChoice(POSITIVE_FOOD);
    } else if (r < 0.63) {
      rating = randomFloat(4.0, 5.0);
      text = randomChoice(POSITIVE_SERVICE);
    } else if (r < 0.72) {
      rating = randomFloat(3.5, 5.0);
      text = Math.random() > 0.5 ? randomChoice(POSITIVE_AMBIANCE) : randomChoice(POSITIVE_PRICE);
    } else if (r < 0.80) {
      rating = randomFloat(3.5, 4.5);
      text = randomChoice(GENERIC_POSITIVE);
    } else if (r < 0.87) {
      // Negative service rising slightly
      rating = randomFloat(2.5, 3.5);
      text = randomChoice(NEGATIVE_SERVICE);
    } else if (r < 0.93) {
      // Delivery complaints starting to rise
      rating = randomFloat(2.0, 3.0);
      text = randomChoice(NEGATIVE_DELIVERY);
      if (isWeekend) rating -= 0.3;
    } else {
      // Waiting complaints starting to rise
      rating = randomFloat(2.0, 3.5);
      text = randomChoice(NEGATIVE_WAITING);
      if (isWeekend) rating -= 0.2;
    }

    reviews.push(generateReview(id++, date, Math.max(1, Math.min(5, rating)), text, visitType, mealType));
  }

  // MARCH: ~170 reviews, avg rating ~3.8, significant complaint increase
  for (let i = 0; i < 170; i++) {
    const date = randomDate(2025, 3);
    const dow = new Date(date).getDay();
    const isWeekend = dow === 0 || dow === 6;
    const visitType = randomChoice(VISIT_TYPES);
    const mealType = randomChoice(MEAL_TYPES);
    let rating: number;
    let text: string;
    const r = Math.random();

    if (r < 0.30) {
      // Food still mostly positive (stable)
      rating = randomFloat(3.8, 5.0);
      text = randomChoice(POSITIVE_FOOD);
    } else if (r < 0.38) {
      rating = randomFloat(3.5, 4.5);
      text = randomChoice(POSITIVE_SERVICE);
    } else if (r < 0.43) {
      rating = randomFloat(3.5, 4.5);
      text = randomChoice(GENERIC_POSITIVE);
    } else if (r < 0.48) {
      // Food negative (minimal increase)
      rating = randomFloat(2.5, 3.5);
      text = randomChoice(NEGATIVE_FOOD);
    } else if (r < 0.60) {
      // Service complaints increased significantly
      rating = randomFloat(1.5, 3.0);
      text = randomChoice(NEGATIVE_SERVICE);
      if (isWeekend) rating -= 0.5;
    } else if (r < 0.78) {
      // DELIVERY complaints SPIKE (+187% target)
      rating = randomFloat(1.0, 2.5);
      text = randomChoice(NEGATIVE_DELIVERY);
      if (isWeekend) rating -= 0.3;
    } else if (r < 0.92) {
      // WAITING complaints SPIKE (+142% target)
      rating = randomFloat(1.0, 2.5);
      text = randomChoice(NEGATIVE_WAITING);
      if (isWeekend) rating -= 0.5;
    } else {
      // Mixed negative
      rating = randomFloat(1.5, 3.0);
      text = Math.random() > 0.5 ? randomChoice(NEGATIVE_PRICE) : randomChoice(NEGATIVE_AMBIANCE);
      if (isWeekend) rating -= 0.3;
    }

    reviews.push(generateReview(id++, date, Math.max(1, Math.min(5, rating)), text, visitType, mealType));
  }

  return reviews;
}

export function reviewsToCsv(reviews: Review[]): string {
  const headers = ['review_id', 'date', 'restaurant', 'rating', 'review_text', 'visit_type', 'location', 'meal_type'];
  const rows = reviews.map(r =>
    headers.map(h => {
      const val = r[h as keyof Review] ?? '';
      // Escape CSV fields containing commas or quotes
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}
