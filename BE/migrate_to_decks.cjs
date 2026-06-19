const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration to decks...');
  
  // Find all existing admin_flashcards
  const flashcards = await prisma.admin_flashcards.findMany();
  
  if (flashcards.length === 0) {
    console.log('No flashcards found. Skipping migration.');
    return;
  }
  
  // Group flashcards by their existing 'level'
  const levels = [...new Set(flashcards.map(f => f.level))];
  console.log(`Found levels: ${levels.join(', ')}`);
  
  for (const level of levels) {
    const deckName = `Bộ thẻ JLPT ${level}`;
    
    // Check if deck already exists
    let deck = await prisma.flashcard_decks.findFirst({
      where: { name: deckName }
    });
    
    // If not, create it
    if (!deck) {
      console.log(`Creating deck: ${deckName}`);
      deck = await prisma.flashcard_decks.create({
        data: {
          name: deckName,
          description: `Bộ thẻ từ vựng luyện thi JLPT cấp độ ${level}`
        }
      });
    }
    
    // Get flashcards for this level that don't have a deck_id yet
    const cardsToUpdate = flashcards.filter(f => f.level === level && f.deck_id === null);
    
    if (cardsToUpdate.length > 0) {
      console.log(`Assigning ${cardsToUpdate.length} cards to deck: ${deckName}`);
      
      const cardIds = cardsToUpdate.map(c => c.id);
      
      await prisma.admin_flashcards.updateMany({
        where: { id: { in: cardIds } },
        data: { deck_id: deck.id }
      });
    } else {
      console.log(`No unassigned cards for level ${level}`);
    }
  }
  
  console.log('Migration completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
