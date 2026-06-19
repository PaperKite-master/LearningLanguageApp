/**
 * Delete a user account (hard delete).
 * This removes the auth.users row (via Prisma mapping if available) and cascades to related profile/data.
 */
export async function deleteAccountUseCase(prisma, userId) {
  // Since we don't have the Supabase service_role key to hit the Admin API easily,
  // we can delete the user via Prisma. The `users` table is mapped to auth.users.
  // Note: This relies on the database having appropriate cascade deletes set up
  // or Prisma handling the deletion of related profiles.
  await prisma.users.delete({
    where: { id: userId }
  });
}
