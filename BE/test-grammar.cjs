const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  try {
    const lesson = await prisma.lessons.findFirst();
    console.log('Lesson ID:', lesson.id);
    const grammar = await prisma.grammars.create({
      data: {
        lesson_id: lesson.id,
        title: 'Ngữ pháp 〜に従って・〜に沿って・〜に関する・〜伺う',
        content_markdown: 'Test',
        order: 0,
        status: 'published'
      }
    });
    console.log('Success:', grammar.id);
    
    // Test update
    const updated = await prisma.grammars.update({
      where: { id: grammar.id },
      data: { title: 'Updated' }
    });
    console.log('Updated:', updated.id);
    
    // Clean up
    await prisma.grammars.delete({ where: { id: grammar.id } });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
