const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════
//  KNOWLEDGE BASE — بغیر API کے
// ═══════════════════════════════════════
const KB = {

  // ── اہلیت / Eligibility ──
  eligibility: {
    keywords: [
      'eligib','اہلیت','ehliyat','ehliat','eligible','qualify','قابل','شرائط',
      'condition','requirement','kaun apply','kon apply','kaun kr sakta','criteria',
      'marks','نمبر','percentage','merit','matric','inter','dae','60','65','70'
    ],
    reply: `✅ *AFSS سکالرشپ کے لیے اہلیت:*

• میٹرک میں کم از کم *70%* نمبر
• انٹر / DAE میں *65%* (اقلیتی: 60%)
• سرکاری ادارے میں زیرِ تعلیم ہوں
• شدید مالی مشکلات ہوں
• PEEF، HEC یا کسی اور NGO سے وظیفہ نہ مل رہا ہو

درخواست کا وقت: *یکم اگست تا 31 اکتوبر* ہر سال

🌐 مزید معلومات: https://alfalahss.org/apply-for-scholarship/`
  },

  // ── درخواست / Apply ──
  apply: {
    keywords: [
      'apply','درخواست','aply','appply','apli','applay','application',
      'scholarship chahiye','scholrship chahiye','scholarship chahye',
      'chahiye','chahye','chaye','chaiye','lena hai','leni hai',
      'kaise apply','kaisy apply','apply karna','apply krna','apply kesy',
      'form','فارم','register','signup','sign up','enroll','داخلہ',
      'scholarship k liye','scholarship ke liye','scholarship ka','scholarship ki'
    ],
    reply: `📝 *سکالرشپ کے لیے درخواست کا طریقہ:*

1️⃣ ویب سائٹ سے تازہ فارم ڈاؤن لوڈ کریں
2️⃣ *سیاہ پوائنٹر قلم* سے بھریں
3️⃣ تمام دستاویزات منسلک کریں
4️⃣ 31 اکتوبر سے پہلے جمع کریں

📅 درخواستیں: *یکم اگست تا 31 اکتوبر*

⚠️ ادھورے یا پرانے فارم مسترد ہوں گے

📥 فارم یہاں سے لیں:
https://alfalahss.org/apply-for-scholarship/`
  },

  // ── وقت / Date / Deadline ──
  date: {
    keywords: [
      'kab','کب','date','تاریخ','deadline','last date','آخری','akhri',
      'kb aye gi','kab aye gi','kb aaye gi','kab aayegi','scholarship kab',
      'kab milegi','kb milegi','kab milti','ky aye gi','ki aye gi',
      'open','start','shuru','شروع','august','اگست','october','اکتوبر',
      'time','وقت','when','ky waqt'
    ],
    reply: `📅 *سکالرشپ درخواستوں کا وقت:*

🟢 شروع: *یکم اگست*
🔴 آخری تاریخ: *31 اکتوبر*

یہ سلسلہ *ہر سال* جاری رہتا ہے۔

اگر آپ ابھی apply کرنا چاہتے ہیں تو فارم یہاں سے لیں:
https://alfalahss.org/apply-for-scholarship/

📞 مزید معلومات کے لیے:
واٹس ایپ: *0345-1414457*`
  },

  // ── وظیفہ / Stipend ──
  stipend: {
    keywords: [
      'stipend','وظیفہ','wazifa','wazaif','kitni raqam','kitna paisa',
      'how much','amount','رقم','paisa','پیسہ','monthly','ماہانہ',
      'payment','ادائیگی','salary','تنخواہ','rate','scholarship amount',
      'kitna milta','kitni milti','scholarship ka amount'
    ],
    reply: `💰 *ماہانہ وظائف (Stipends):*

🏥 میڈیکل / انجینئرنگ: *₨10,000/ماہ*
🎓 گریجویشن: *₨8,000/ماہ*
📗 انٹرمیڈیٹ / DAE: *₨5,000/ماہ*

تمام فنڈز کا *88%* براہِ راست طلباء کو ملتا ہے۔

🌐 https://alfalahss.org`
  },

  // ── سپانسر / Donate ──
  sponsor: {
    keywords: [
      'sponsor','سپانسر','donate','donation','عطیہ','dena','دینا',
      'contribute','fund','زکوٰۃ','zakat','sadqa','صدقہ','help karna',
      'support','مدد کرنا','de sakte','dy skte','sponsor karna','sponsor krna'
    ],
    reply: `🤝 *طالب علم کو سپانسر کریں:*

🏥 میڈیکل (5 سال): *₨675,000*
⚙️ انجینئرنگ (4 سال): *₨540,000*
🎓 گریجویشن (4 سال): *₨432,000*
📗 DAE (3 سال): *₨198,000*
📒 انٹر (2 سال): *₨132,000*

✅ زکوٰۃ، صدقہ، عطیہ — سب قابل قبول ہے
✅ طالب علم کی پیشرفت کی باقاعدہ رپورٹ ملے گی

🌐 سپانسرشپ پورٹل:
https://alfalahss.org/sponsorship-portal/`
  },

  // ── بینک / Bank ──
  bank: {
    keywords: [
      'bank','بینک','account','اکاؤنٹ','transfer','payment','send money',
      'mcb','meezan','میزان','lloyds','جمع','donate karna','paise bhejne',
      'paisa kahan','account number','acc no'
    ],
    reply: `🏦 *عطیہ دینے کے لیے بینک اکاؤنٹس:*

🇵🇰 *MCB بینک* — کھاریاں
اکاؤنٹ: *0020 1010 1001 4478*

🇵🇰 *میزان بینک* — لاہور
اکاؤنٹ: *0103509922*

🇬🇧 *Lloyds TSB* — انگلینڈ
Title: Alfalah Scholarship Scheme
اکاؤنٹ: *02888959*

📸 ٹرانزیکشن کے بعد screenshot واٹس ایپ پر بھیجیں:
*0345-1414457*`
  },

  // ── رابطہ / Contact ──
  contact: {
    keywords: [
      'contact','رابطہ','rabta','phone','فون','email','ای میل','address',
      'پتہ','whatsapp','number','نمبر','office','دفتر','reach','milna',
      'baat karni','call','helpline','کہاں','kahan','location'
    ],
    reply: `📞 *رابطہ معلومات:*

🌐 ویب سائٹ: https://alfalahss.org
📧 ای میل: info@alfalahss.org
📞 فون: +92-53-7701299
💬 واٹس ایپ: *0345-1414457*

📍 گلشنِ رضاء، ڈنگہ روڈ، دھوریہ
تحصیل کھاریاں، ضلع گجرات، پنجاب`
  },

  // ── تعارف / About ──
  about: {
    keywords: [
      'about','تعارف','tarruf','what is','kya hai','کیا ہے','history',
      'تاریخ','afss','alfalah','الفلاح','1998','founded','kaun se','introduction',
      'organization','ادارہ','idara','mission','vision','مشن','وژن'
    ],
    reply: `ℹ️ *الفلاح سکالرشپ سکیم (AFSS)*

1998 میں گجرات، پنجاب میں قائم ہوئی۔
صرف 46 طلباء سے شروع — آج *5,735 اسکالرز*

📊 *27 سالہ خدمت:*
• 896 ڈاکٹرز
• 482 انجینئرز
• 1,377 پوسٹ گریجویٹس
• ₨650M+ تقسیم شدہ

🎯 *مشن:* ذات پات، مذہب سے قطع نظر مستحق طلباء کو مالی امداد

🌐 https://alfalahss.org`
  },

  // ── اسکالرز / Scholars ──
  scholars: {
    keywords: [
      'scholars','اسکالرز','students','طلباء','current','موجودہ',
      'kitne','کتنے','list','profiles','who got','kisey mili'
    ],
    reply: `🎓 *موجودہ اسکالرز:*

AFSS ابھی *5,735* طلباء کو سپورٹ کر رہی ہے۔

تمام پروفائلز دیکھنے کے لیے:
🌐 https://alfalahss.org/current-scholars/`
  },

  // ── سلام / Greeting ──
  greeting: {
    keywords: [
      'salam','سلام','hello','hi','hey','assalam','assalamualaikum',
      'aoa','good morning','good evening','goodmorning','helo','hllo',
      'السلام','وعلیکم','آداب','adab','ji','جی'
    ],
    reply: `وعلیکم السلام! 👋

*الفلاح سکالرشپ سکیم* میں خوش آمدید۔

میں آپ کی مدد کر سکتا ہوں:
📝 سکالرشپ درخواست
✅ اہلیت کی شرائط
📅 درخواست کی تاریخیں
💰 وظیفے کی معلومات
🤝 سپانسرشپ
📞 رابطہ

اپنا سوال لکھیں — میں جواب دوں گا۔`
  },

  // ── شکریہ / Thanks ──
  thanks: {
    keywords: [
      'thank','شکریہ','shukriya','shukriya','thanks','jazakallah',
      'جزاک اللہ','mehrbani','مہربانی','bahut acha','bohat acha','great','nice'
    ],
    reply: `جزاک اللہ خیراً 🙏

کوئی اور سوال ہو تو بے جھجھک پوچھیں۔
ہم حاضر ہیں! 🎓

🌐 https://alfalahss.org`
  }
};

// ═══════════════════════════════════════
//  SMART DETECT — غلط spelling بھی سمجھے
// ═══════════════════════════════════════
function detectIntent(text) {
  const t = text.toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')  // keep Urdu + English
    .replace(/\s+/g, ' ')
    .trim();

  for (const [intent, data] of Object.entries(KB)) {
    if (data.keywords.some(kw => t.includes(kw.toLowerCase()))) {
      return intent;
    }
  }
  return null;
}

// ═══════════════════════════════════════
//  DAILY REPORT SYSTEM
// ═══════════════════════════════════════
let dailyLog = []; // { name, number, question, reply, time }

function logMessage(name, number, question, reply) {
  dailyLog.push({
    name: name || 'نامعلوم',
    number,
    question,
    reply: reply.substring(0, 80) + '...',
    time: new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })
  });
}

function buildDailyReport() {
  const today = new Date().toLocaleDateString('ur-PK', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  if (dailyLog.length === 0) {
    return `📊 *آج کی رپورٹ — ${today}*\n\nآج کوئی پیغام موصول نہیں ہوا۔`;
  }

  let report = `📊 *AFSS واٹس ایپ بوٹ رپورٹ*\n📅 ${today}\n`;
  report += `━━━━━━━━━━━━━━━━━━\n`;
  report += `📨 کل پیغامات: *${dailyLog.length}*\n\n`;

  dailyLog.forEach((log, i) => {
    report += `${i + 1}️⃣ *${log.name}* (${log.number})\n`;
    report += `   🕐 ${log.time}\n`;
    report += `   ❓ ${log.question}\n`;
    report += `   ✅ ${log.reply}\n\n`;
  });

  report += `━━━━━━━━━━━━━━━━━━\n`;
  report += `_AFSS WhatsApp Bot_`;
  return report;
}

// رات 10 بجے رپورٹ بھیجیں
function scheduleDailyReport(sock) {
  const REPORT_HOUR = 22; // رات 10 بجے
  const ADMIN_NUMBER = process.env.ADMIN_NUMBER || '923451414457'; // آپ کا نمبر

  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === REPORT_HOUR && now.getMinutes() === 0) {
      try {
        const report = buildDailyReport();
        await sock.sendMessage(`${ADMIN_NUMBER}@s.whatsapp.net`, { text: report });
        console.log('✅ Daily report sent');
        dailyLog = []; // reset
      } catch (e) {
        console.error('Report error:', e.message);
      }
    }
  }, 60 * 1000); // ہر منٹ check
}

// ═══════════════════════════════════════
//  MAIN BOT
// ═══════════════════════════════════════
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: require('pino')({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n══════════════════════════════');
      console.log('📱 QR CODE اسکین کریں:');
      console.log('WhatsApp کھولیں → Linked Devices → Link a Device');
      console.log('══════════════════════════════\n');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;

      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startBot();
    }

    if (connection === 'open') {
      console.log('✅ بوٹ چل پڑا! WhatsApp سے connected ہے۔');
      scheduleDailyReport(sock);
    }
  });

  // ── پیغام آنے پر ──
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue; // اپنا پیغام skip
      if (!msg.message) continue;

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      if (isGroup) continue; // گروپ ignore

      // پیغام نکالیں
      const text = msg.message?.conversation
        || msg.message?.extendedTextMessage?.text
        || '';

      if (!text) continue;

      // نام لیں
      const pushName = msg.pushName || '';
      const number = from.replace('@s.whatsapp.net', '');

      console.log(`📨 ${pushName} (${number}): ${text}`);

      // intent پہچانیں
      const intent = detectIntent(text);
      let reply;

      if (intent && KB[intent]) {
        reply = KB[intent].reply;
      } else {
        // سمجھ نہیں آیا
        reply = `السلام علیکم${pushName ? ' ' + pushName : ''}! 👋

آپ کا پیغام موصول ہوگیا۔

ہماری ٹیم جلد آپ سے رابطہ کرے گی۔ 
براہ کرم تھوڑا انتظار کریں۔

یا براہ راست واٹس ایپ کریں:
📞 *0345-1414457*

🌐 www.alfalahss.org`;
      }

      // جواب بھیجیں
      try {
        await sock.sendMessage(from, { text: reply }, { quoted: msg });
        console.log(`✅ جواب بھیجا (${intent || 'fallback'})`);

        // log کریں
        logMessage(pushName, number, text, reply);
      } catch (e) {
        console.error('Send error:', e.message);
      }

      // 1 سیکنڈ pause (spam سے بچیں)
      await new Promise(r => setTimeout(r, 1000));
    }
  });
}

startBot().catch(console.error);
