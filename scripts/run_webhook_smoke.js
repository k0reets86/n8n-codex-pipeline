// Simple webhook smoke tester
// Usage: node scripts/run_webhook_smoke.js <URL>
// Exits non-zero if response not 2xx or JSON invalid

const url = process.argv[2] || process.env.N8N_TEST_WEBHOOK_URL;
if (!url) {
  console.error('Usage: node scripts/run_webhook_smoke.js <URL>');
  process.exit(1);
}

async function main() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ probe: 'ci' }),
    });
    const statusOK = res.status >= 200 && res.status < 300;
    let json;
    try {
      json = await res.json();
    } catch (e) {
      console.error('Response is not JSON');
      process.exit(2);
    }
    console.log('HTTP', res.status, json);
    if (!statusOK) process.exit(3);
    // Optional check: ensure "status":"ok" if present
    if (json && json.status && json.status !== 'ok') {
      console.error('Unexpected status field:', json.status);
      process.exit(4);
    }
  } catch (e) {
    console.error('Request error:', e.message);
    process.exit(5);
  }
}

main();
