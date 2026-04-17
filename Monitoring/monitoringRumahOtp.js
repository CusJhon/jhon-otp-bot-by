const axios = require("axios");
const fs = require("fs");
const moment = require("moment-timezone");
const config = require("../config");

const API_KEY = config.RUMAHOTP;
const CHANNEL_ID = config.idmonitoringprice;
const SNAPSHOT = "./Monitoring/monitoring.json";

if (!fs.existsSync(SNAPSHOT)) {
  fs.writeFileSync(SNAPSHOT, JSON.stringify({}, null, 2));
}

const loadSnapshot = () =>
  JSON.parse(fs.readFileSync(SNAPSHOT, "utf8"));

const saveSnapshot = (data) =>
  fs.writeFileSync(SNAPSHOT, JSON.stringify(data, null, 2));

const formatRp = n => "Rp" + Number(n).toLocaleString("id-ID");

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function safeSendMessage(bot, chatId, text, options = {}) {
  try {
    return await bot.sendMessage(chatId, text, options);
  } catch (err) {
    // Kalau kena rate limit Telegram
    if (err.response?.error_code === 429) {
      const retryAfter = (err.response.parameters?.retry_after || 5) * 1000;
      console.warn(`⏳ Rate limit, retry after ${retryAfter / 1000}s`);
      await delay(retryAfter);
      return safeSendMessage(bot, chatId, text, options);
    }
    throw err;
  }
}

async function monitoring(bot) {
  try {
    const snapshot = loadSnapshot();
    const now = moment().tz("Asia/Jakarta").format("DD/MM/YYYY, HH:mm:ss");
    
    console.log(`[${now}] Monitoring RumahOTP dimulai...`);

    // Ambil data services
    const servicesResponse = await axios.get(
      "https://www.rumahotp.com/api/v2/services",
      { 
        headers: { "x-apikey": API_KEY },
        timeout: 30000 // 30 detik timeout
      }
    );

    const services = servicesResponse.data.data;
    
    for (const svc of services) {
      try {
        // Ambil data countries untuk service ini
        const countriesResponse = await axios.get(
          `https://www.rumahotp.com/api/v2/countries?service_id=${svc.service_code}`,
          { 
            headers: { "x-apikey": API_KEY },
            timeout: 30000
          }
        );

        const countries = countriesResponse.data.data;

        for (const c of countries) {
          // Ambil data pricelist untuk country ini
          const servers = (c.pricelist || [])
            .filter(s => s.stock >= 5)
            .sort((a, b) => a.price - b.price)
            .slice(0, 5);

          const top5Blocks = servers.map((s, i) => {
            const snapKey = `${svc.service_code}-${c.number_id}-${s.provider_id}`;
            const oldPrice = snapshot[snapKey]?.price;

            if (oldPrice && s.price < oldPrice) {
              return (
`👑 <b>Server ${s.server_id}</b> | ${formatRp(oldPrice)} ➡️ ${formatRp(s.price)} 🔻
└ 📦 Stok: ${s.stock} • ⭐ Rate: ${s.rate}%`
              );
            }

            return (
`├ <b>Server ${s.server_id}</b> | ${formatRp(s.price)}
└ 📦 Stok: ${s.stock} • ⭐ Rate: ${s.rate}%`
            );
          });

          const top5Text = top5Blocks.join("\n\n");

          // Loop provider untuk deteksi perubahan harga
          for (const p of c.pricelist || []) {
            const key = `${svc.service_code}-${c.number_id}-${p.provider_id}`;

            const old = snapshot[key];
            const priceNow = p.price;
            const stockNow = p.stock;
            const rateNow = p.rate;

            // Deteksi harga turun
            if (old && priceNow < old.price) {
              const diff = old.price - priceNow;
              const percent = ((diff / old.price) * 100).toFixed(2);

              // Ambil data operator
              let operatorList = "Tidak ada info operator";
              try {
                const operatorsResponse = await axios.get(
                  `https://www.rumahotp.com/api/v2/operators?country=${encodeURIComponent(c.name)}&provider_id=${p.provider_id}`,
                  { 
                    headers: { "x-apikey": API_KEY },
                    timeout: 15000
                  }
                );

                if (operatorsResponse.data.data && operatorsResponse.data.data.length > 0) {
                  operatorList = operatorsResponse.data.data
                    .map(o => o.name)
                    .join(", ");
                }
              } catch (error) {
                console.error(`Gagal ambil operator: ${error.message}`);
              }

const text = `
<b>📢 JHON-OFFICIAL INFO HARGA</b>

<b>📉 HARGA TURUN TERDETEKSI</b>

👑 <b>TOP SERVER TERMURAH</b>
<b>📉 UPDATE TERBARU:</b>
• <b>Service</b> : ${svc.service_name}
• <b>Negara</b>  : ${c.name}
• <b>Server</b>  : ${p.server_id}
• <b>Harga</b>   : <s>${formatRp(old.price)}</s> ➡️ <b>${formatRp(priceNow)}</b>
🔻 <b>Turun</b>  : <b>${formatRp(diff)}</b> (${percent}%)

<b>📊 INFO LAYANAN</b>
• <b>Rate Sukses</b> : ${rateNow}%
• <b>Stok</b>        : ${stockNow} pcs
• <b>Operator</b>    : ${operatorList}

📱 <b>${svc.service_name}</b> — <b>${c.name}</b>

<b>📊 TOP 5 SERVER AVAILABLE</b>
<i>(Min. Stok 5 pcs)</i>
<blockquote expandable>${top5Text}
</blockquote>
🕒 <i>Update: ${now}</i>
`;

              // Kirim ke channel
              try {
await safeSendMessage(bot, CHANNEL_ID, text, {
  parse_mode: "HTML",
  disable_web_page_preview: true,
  reply_markup: {
    inline_keyboard: [
      [{ text: "🛒 Order Sekarang", url: "https://t.me/JHON_STORE_MD_BOT" }],
      [{ text: "📊 Cek Harga Real-time", url: config.urlpricechannel }]
    ]
  }
});

// ⏳ delay antar notif biar adem
await delay(3000); // 3 detik

  console.log(`✅ Sent price update notification for ${svc.service_name} - ${c.name}`);

} catch (error) {
  console.error(`Gagal kirim ke channel: ${error.message}`);
                
                // Fallback: kirim ke owner jika gagal ke channel
if (config.OWNER_ID) {
    try {
      await bot.sendMessage(
        config.OWNER_ID.toString(),
        `<b>⚠️ Gagal kirim ke channel</b>

Service : <b>${svc.service_name}</b>
Negara  : <b>${c.name}</b>

<code>${error.message}</code>`,
        { parse_mode: "HTML" }
      );
    } catch (fallbackError) {
      console.error(`Gagal fallback ke owner: ${fallbackError.message}`);
    }
  }
}
            }

            // Update snapshot dengan data terbaru
            snapshot[key] = {
              price: priceNow,
              stock: stockNow,
              rate: rateNow,
              last_updated: now
            };
          }
        }
      } catch (serviceError) {
        console.error(`Error pada service ${svc.service_name}: ${serviceError.message}`);
        continue; // Lanjut ke service berikutnya
      }
    }

    saveSnapshot(snapshot);
    console.log(`[${now}] Monitoring RumahOTP selesai. Snapshot disimpan.`);
    
  } catch (error) {
    console.error(`Error monitoring RumahOTP: ${error.message}`);
    
    // Kirim error ke owner jika ada
    if (config.OWNER_ID) {
      try {
        await bot.sendMessage(
          config.OWNER_ID.toString(), 
          `❌ Error monitoring RumahOTP:\n${error.message}\n\n🕒 ${moment().tz("Asia/Jakarta").format("DD/MM/YYYY, HH:mm:ss")}`
        );
      } catch (sendError) {
        console.error(`Gagal kirim error ke owner: ${sendError.message}`);
      }
    }
  }
}

module.exports = monitoring;