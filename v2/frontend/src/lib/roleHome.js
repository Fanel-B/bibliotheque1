// Où atterrir juste après connexion/inscription — chaque rôle a son espace,
// pour qu'on distingue tout de suite un usager d'un employé ou d'un admin.
export function roleHomePath(role) {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'employee':
      return '/employe';
    default:
      return '/';
  }
}
