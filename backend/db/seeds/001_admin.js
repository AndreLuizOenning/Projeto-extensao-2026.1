import bcrypt from 'bcryptjs';

export async function seed(knex) {
  const cpf = '57035040900';
  const exists = await knex('users').where({ cpf }).first();
  if (exists) return;

  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error('ADMIN_INITIAL_PASSWORD ausente ou fraca para seed do admin (mínimo 8 caracteres).');
  }

  const password_hash = await bcrypt.hash(adminPassword, 10);
  await knex('users').insert({ nome: 'Administrador', cpf, email: 'admin@holding.local', password_hash, role: 'ADMIN' });
}
