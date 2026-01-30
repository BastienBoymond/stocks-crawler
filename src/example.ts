import { getQuote, getStockInfo, getLastPrice } from "./index.js";

async function main() {
  // Test with ISIN
  const isin = "TSLA"; // Air Liquide

  console.log(`Testing all functions with ISIN: ${isin}\n`);

  // Test getLastPrice with ISIN
  console.log("--- getLastPrice ---");
  const price = await getLastPrice(isin);
  console.log(`Price: ${price}\n`);

  // Test getStockInfo with ISIN
  console.log("--- getStockInfo ---");
  const info = await getStockInfo(isin);
  if (info) {
    console.log(`Symbol: ${info.symbol}`);
    console.log(`ISIN: ${info.isin}`);
    console.log(`Exchange: ${info.exchange}`);
    console.log(`Sector: ${info.sector}`);
    console.log(`Index: ${info.index}\n`);
  }

  // Test getQuote with ISIN
  console.log("--- getQuote ---");
  const data = await getQuote(isin, true);
  console.log(`Name: ${data.name}`);
  console.log(`Symbol: ${data.symbol}`);
  console.log(`Current: ${data.today.current}`);
  console.log(`Change: ${data.change.value >= 0 ? '+' : ''}${data.change.value} (${data.change.percent}%)`);
}

main();
