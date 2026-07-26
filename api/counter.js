const fs = require('fs');
const path = require('path');

let kv;
try {
  kv = require('@vercel/kv');
} catch (e) {
  kv = null;
}

const COUNTER_KEY = 'lunyu_visitor_count';
const LOCAL_FILE = path.join(__dirname, '../data/counter.txt');

async function getCountFromFile() {
  try {
    if (fs.existsSync(LOCAL_FILE)) {
      const content = fs.readFileSync(LOCAL_FILE, 'utf-8').trim();
      return parseInt(content) || 0;
    }
  } catch (e) {}
  return 0;
}

async function saveCountToFile(count) {
  try {
    const dir = path.dirname(LOCAL_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_FILE, count.toString());
  } catch (e) {}
}

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Content-Type', 'application/json');

  try {
    let count;

    if (kv) {
      count = await kv.get(COUNTER_KEY);
      count = parseInt(count || '0');
      count++;
      await kv.set(COUNTER_KEY, count.toString());
    } else {
      count = await getCountFromFile();
      count++;
      await saveCountToFile(count);
    }

    res.status(200).json({ value: count });
  } catch (error) {
    let count = await getCountFromFile();
    count++;
    await saveCountToFile(count);
    res.status(200).json({ value: count });
  }
};
