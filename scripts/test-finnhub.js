const fetch = require('node-fetch');
require('dotenv').config();

async function testFinnhub() {
  const apiKey = process.env.FINNHUB_API_KEY;
  
  if (!apiKey) {
    console.error('❌ FINNHUB_API_KEY is not set in .env.local');
    console.log('Please add FINNHUB_API_KEY=your_api_key to your .env.local file');
    return;
  }

  console.log('🔑 Using API Key:', apiKey.substring(0, 5) + '...');
  
  const testSymbol = 'AAPL'; // Test with Apple stock
  const url = `https://finnhub.io/api/v1/quote?symbol=${testSymbol}&token=${apiKey}`;
  
  console.log('🌐 Testing connection to Finnhub API...');
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error('❌ API Error:', data.error);
      return;
    }
    
    console.log('✅ Successfully connected to Finnhub API!');
    console.log('📊 Stock Data for', testSymbol + ':', data);
    
  } catch (error) {
    console.error('❌ Failed to connect to Finnhub API:');
    console.error(error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔍 Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify if api.finnhub.io is accessible from your network');
      console.log('3. Try using a VPN if you\'re behind a corporate firewall');
    }
  }
}

testFinnhub();
