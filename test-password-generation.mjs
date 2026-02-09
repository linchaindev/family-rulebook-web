import fetch from 'node-fetch';

async function generatePassword() {
  try {
    const response = await fetch('http://localhost:3000/api/trpc/password.generateForCurrentMonth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    
    const data = await response.json();
    console.log('Password generation result:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

generatePassword();
