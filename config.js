/*
# SCRIPT AUTO-ORDER V6

Script Ini Dibuat Oleh Jhon - OffiCial
Jangan Hapus Credits Ini, Hargai Developer!

Big Thanks To :
 • Jhon - OffiCial ( t.me/cpm_jhon21 )
 • All Buyer Jhon - OffiCial
 • Allah SWT (Tuhanku)
 • Orang Tua saya (Panutan ku)
 • Keluarga (Support system)
 • All creator bot 
*/

// 🧩 Tambahkan ini di atas!
const fs = require("fs");
const chalk = require("chalk");

module.exports = {
TOKEN: "8157058223:AAEdFVzLVqbM6LbAulORiV2LapYgX2ve4A8", // Token dari @BotFather
OWNER_ID: "5215661259", // ID Telegram owner
urladmin: "https://t.me/cpm_jhon21",
urlchannel: "https://t.me/REAL_TIME_JHON_OTP",
urlpricechannel: "https://t.me/TESTIMONI_JHON_OTP",
idchannel: "-1003536369608", // isi id channel untuk notifikasi Pembelian Maupun Deposit
idmonitoringprice: "-1003380429988", // isi Id channel untuk update Price Secara RealTime
botName: "Auto Order Nokos - Botz",
version: "1.0.0",
ownerName: "Jhon - OffiCial",
authorName: "@JhonOtp",
  
//==============================================[ SETTING HARGA SCRIPT ]=======//
hargaScriptNokos: 50000,
  
//==============================================[ SETTING FOTO ]=======//
// BAGIAN FOTO INI BELOM BERPENGARUH SEMUA 
fotothumbnail: "assets/images/thumbnail.jpg",       // Foto utama bot (/start)
fotothumbnailQris: "assets/images/qriscustom.jpg",
fotoNotificationProsesMaintenance: "assets/images/ProsesMaintenance.jpg",
fotoNotificationCompleteMaintenance: "assets/images/CompleteMaintenance.jpg",
fotoNotificationOrderOTP: "assets/images/orderOtp.jpg",
fotoNotificationDeposit: "assets/images/deposit.jpg",

//==============================================[ SETTING IMAGE LINK ]=======//
linkthumbnail: "https://b.top4top.io/p_3671dqg8e0.jpg",       // Foto utama bot (/start)
linkthumbnailQris: "https://f.top4top.io/p_3671blxfp0.jpg",
linkNotificationDailyMaintenanceProses: "https://j.top4top.io/p_3671i8w890.jpg",
linkNotificationDailyMaintenanceComplete: "https://b.top4top.io/p_3671p6di30.jpg",
linkNotificationOrderOTP: "https://g.top4top.io/p_3646oz5d11.jpg",
linkNotificationDeposit: "https://f.top4top.io/p_3646suw3m1.jpg",

//==============================================[ SETTING RUMAHOTP ]=======//
RUMAHOTP: "otp_JrwkBqJXMGzWVSPE", // Apikey RumahOtp
UNTUNG_NOKOS: 2000, // Ini Untung Nokos, Jadi Setiap Ada Yang Beli Nokos Untung 1000
UNTUNG_DEPOSIT: 500, // Ini Untung Deposit Jadi Kalo Ada Yang Deposit Bakal Ada Biaya Admin 500
type_ewallet_RUMAHOTP: "dana", 
// Hanya Menerima Type Ewalet : Dana, Gopay, Ovo, ShopeePay, Link Aja ( Ovo, ShopeePay, Link Aja Belom Gw Coba Si😂 )
nomor_pencairan_RUMAHOTP: "6285591916436"// Nomor Ewalet Masing Masing 
};

// 🔁 Auto reload jika file config.js diubah
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.blue(">> Update File :"), chalk.black.bgWhite(`${__filename}`));
  delete require.cache[file];
  require(file);
});