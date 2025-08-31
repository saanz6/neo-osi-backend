const fetch = require('node-fetch');

const BASE_URL = 'https://neo-osi-backend.onrender.com';

// Реальные тестовые данные - замените на ваши
const TEST_CREDENTIALS = {
  email: 'test@example.com', // или ваш реальный email
  password: 'password123'    // или ваш реальный пароль
};

async function login() {
  try {
    console.log('🔐 Пытаемся войти в систему...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CREDENTIALS)
    });
    
    const data = await response.json();
    console.log('📊 Статус входа:', response.status);
    
    if (!response.ok) {
      console.log('❌ Ошибка входа:', data);
      return null;
    }
    
    console.log('✅ Успешный вход в продакшен!');
    return data.accessToken;
  } catch (error) {
    console.log('❌ Ошибка сети при входе:', error.message);
    return null;
  }
}

async function testChat(token) {
  console.log('\n🧪 Тестируем /ai/chat в продакшене...');
  
  try {
    const response = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt: 'Привет, как дела?' })
    });
    
    console.log('📊 Статус:', response.status);
    const data = await response.json();
    console.log('📄 Ответ чата:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.log('❌ Ошибка при тестировании чата:', error.message);
  }
}

async function testDocuments(token) {
  console.log('\n🧪 Тестируем /ai/documents в продакшене...');
  
  try {
    const response = await fetch(`${BASE_URL}/ai/documents`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt: 'Создай акт выполненных работ' })
    });
    
    console.log('📊 Статус:', response.status);
    console.log('📄 Content-Type:', response.headers.get('content-type'));
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      console.log('📄 JSON ответ:', JSON.stringify(data, null, 2));
    } else {
      console.log('📄 Получен файл или другой контент');
    }
    
  } catch (error) {
    console.log('❌ Ошибка при тестировании документов:', error.message);
  }
}

async function main() {
  console.log('🚀 Тестируем Neo OSI Backend в продакшене...');
  console.log('🌐 URL:', BASE_URL);
  
  const token = await login();
  if (!token) {
    console.log('❌ Не удалось войти в систему. Проверьте credentials.');
    return;
  }
  
  await testChat(token);
  await testDocuments(token);
  
  console.log('\n✅ Тестирование продакшена завершено!');
}

main().catch(console.error);
