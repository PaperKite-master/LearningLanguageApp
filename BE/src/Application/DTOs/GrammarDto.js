export function toGrammarDto(grammar) {
  return {
    id: grammar.id,
    lessonId: grammar.lesson_id,
    title: grammar.title,
    contentMarkdown: grammar.content_markdown ?? null,
    order: grammar.order ?? 0,
    createdAt: grammar.created_at ?? null
  };
}

