const bcrypt = require('bcrypt');

async function generatePasswordHash() {
  const password = 'password123';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nUpdate SQL:');
    console.log(`UPDATE users SET password = '${hash}' WHERE username IN ('admin', 'dr.smith', 'dr.jane');`);
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generatePasswordHash();