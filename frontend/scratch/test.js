async function test() {
  const q = 'Apple hiring';
  const u = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=en-US&gl=US&ceid=US:en';
  const r1 = await fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(u));
  const d1 = await r1.json();
  console.log('Response:', d1.status);
}

test();
