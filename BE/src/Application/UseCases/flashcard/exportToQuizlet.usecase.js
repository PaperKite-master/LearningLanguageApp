/**
 * ExportToQuizletUseCase
 *
 * Quizlet Import format (Tab-Separated Values):
 *   - Each line = one flashcard
 *   - Front and Back separated by a TAB (\t)
 *   - Cards separated by newline (\n)
 *
 * Example:
 *   日本語\tJapanese language
 *   猫\tcat
 *
 * In Quizlet → Import, set:
 *   Between term and definition: Tab
 *   Between cards: New line
 */
export async function exportToQuizletUseCase({ flashcardRepo, userId }) {
  const flashcards = await flashcardRepo.listByUserId(userId);

  if (flashcards.length === 0) return '';

  const lines = flashcards.map((card) => {
    // Sanitise embedded tabs/newlines so they don't break the TSV structure
    const front = card.front_text.replace(/[\t\n\r]/g, ' ');
    const back  = card.back_text.replace(/[\t\n\r]/g, ' ');
    return `${front}\t${back}`;
  });

  return lines.join('\n');
}
