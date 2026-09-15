// Express 4 n'attrape pas tout seul les erreurs des fonctions async.
// Ce wrapper évite d'écrire un try/catch dans chaque controller.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
