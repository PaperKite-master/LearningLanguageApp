/**
 * Delete an admin user (hard delete).
 * This removes the auth.users row and cascades to related profile/data where the DB allows it.
 */
export async function deleteAdminUserUseCase(prisma, userId) {
  await prisma.users.delete({
    where: { id: userId }
  });
}
