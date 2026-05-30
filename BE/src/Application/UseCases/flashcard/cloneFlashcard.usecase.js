import { toFlashcardDto } from '../../DTOs/FlashcardDto.js';

export async function cloneFlashcardUseCase({ flashcardRepo, id, userId }) {
  // Find the original flashcard from the library
  // We use findByIdAndUserId with null to ensure we are cloning a library card, not someone else's personal card
  const originalCard = await flashcardRepo.findByIdAndUserId(id, null);
  
  if (!originalCard) {
    const error = new Error('Library flashcard not found');
    error.statusCode = 404;
    throw error;
  }

  // Parse notes to inject new metadata for the cloned card
  let parsedNotes = {};
  try {
    if (originalCard.notes) {
      parsedNotes = JSON.parse(originalCard.notes);
    }
  } catch (e) {
    // Ignore invalid JSON
  }

  // Fetch user's existing cards to figure out the next displayId and prevent duplicates
  const myCards = await flashcardRepo.listByUserId(userId);

  // Check if this card was already cloned by looking for originalId in notes
  // OR fallback to checking exact match of frontText and backText (for clones created before we added originalId tracking)
  const alreadyCloned = myCards.some(c => {
    try {
      if (c.front_text === originalCard.front_text && c.back_text === originalCard.back_text) {
        return true;
      }
      if (!c.notes) return false;
      const notes = JSON.parse(c.notes);
      return notes.originalId === id;
    } catch(e) {
      return false;
    }
  });

  if (alreadyCloned) {
    const error = new Error('You have already saved this flashcard');
    error.statusCode = 400; // Bad request
    throw error;
  }
  const existingNums = myCards
    .map(c => {
      let notes = {};
      try { if (c.notes) notes = JSON.parse(c.notes); } catch(e) {}
      const mId = notes.displayId || '';
      return parseInt(mId.replace('M', ''), 10);
    })
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);
      
  let nextNum = 1;
  for (let i = 0; i < existingNums.length; i++) {
    if (existingNums[i] === nextNum) {
      nextNum++;
    } else if (existingNums[i] > nextNum) {
      break; 
    }
  }

  const newDisplayId = `M${String(nextNum).padStart(3, '0')}`;
  
  // Set the new displayId, default status, and originalId to prevent re-cloning
  parsedNotes.displayId = newDisplayId;
  parsedNotes.status = 'Published';
  parsedNotes.originalId = id;

  // Create the cloned card
  const clonedCard = await flashcardRepo.create({
    userId,
    frontText: originalCard.front_text,
    backText: originalCard.back_text,
    notes: JSON.stringify(parsedNotes)
  });

  return toFlashcardDto(clonedCard);
}
