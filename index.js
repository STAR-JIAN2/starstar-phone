/* ============================================================
 * 星宝的小手机 · SillyTavern 扩展
 * 会话列表 / 多 NPC / 群聊 / 朋友圈 / 分层设置 / 记忆回流
 * v0.12.0
 * ============================================================ */

const MODULE_NAME = 'tavern_phone';
const STORE_KEY = 'tp_chat';
const MEM_KEY = 'tp_mem';                 // 手机记忆元数据（按聊天隔离）
const MEM_MARKER = '📱手机记忆';           // 世界书里那条固定条目的标记
const DEFAULT_CHAR_AVATAR = 'https://card-site-c1a.pages.dev/api/file/media/2026-09-11/5d35a7b2-4d6d-4faa-ad9f-55e3d1db3608.png';
const DEFAULT_USER_AVATAR = 'https://cdn.imgos.cn/vip/2026/01/15/6968e2c3734e9.png';
const DEFAULT_WALLPAPER = 'https://free.picui.cn/free/20260610/0b069700b5e8e5a78a3e61c7b9bb0269.png';
const DEFAULT_NPC_AVATAR = 'https://card-site-c1a.pages.dev/api/file/media/2026-09-11/5d35a7b2-4d6d-4faa-ad9f-55e3d1db3608.png';

const CONTACTS_KEY = 'tp_contacts';       // 联系人列表（按本轮聊天隔离，和手机聊天一致）
const CHATS_KEY = 'tp_chats';             // { 联系人id: [消息] }
const CHAR_ID = 'char';                   // 主角色固定占这个 id，名字/头像跟着角色卡走

// 功能区贴图。想换图在「设置 → 功能区图标」里填链接即可（所有卡通用）。
const ACTION_ICONS = Object.freeze({
    voice: 'https://cdn.imgos.cn/vip/2026/02/01/697f0415ae31e.png',
    link: '',   // 还没有贴图，暂时用内置的手绘风 SVG
    food: 'https://cdn.imgos.cn/vip/2026/02/01/697f053a6c0a1.png',
    transfer: 'https://cdn.imgos.cn/vip/2026/02/02/69802ab29174c.png',
    image: 'https://cdn.imgos.cn/vip/2026/02/01/697f047f41444.png',
    location: 'https://cdn.imgos.cn/vip/2026/02/01/697f0511d2188.png',
    weather: 'https://cdn.imgos.cn/vip/2026/02/01/697f0529a9272.png',
    sticker: 'https://cdn.imgos.cn/vip/2026/02/01/697f0415ae31e.png',
});
const ACTION_ICON_LABELS = Object.freeze({
    voice: '语音 / 撤回', link: '链接', food: '外卖 / 代付', transfer: '转账 / 红包',
    image: '图片', location: '定位', weather: '天气', sticker: '表情',
});
// 链接暂时没有贴图，用一段同色系的手绘 SVG 顶上（不是 emoji）
const LINK_SVG = '<svg viewBox="0 0 24 24" class="tp-ico-svg"><path d="M9.5 14.5a3.6 3.6 0 0 1 0-5l2.2-2.2a3.6 3.6 0 0 1 5 5l-1 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14.5 9.5a3.6 3.6 0 0 1 0 5l-2.2 2.2a3.6 3.6 0 0 1-5-5l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

const STICKERS = {
    '害羞': 'https://cdn.imgos.cn/vip/2026/01/15/6968dc35230a6.png',
    '眼巴巴看着你的小狗': 'https://cdn.imgos.cn/vip/2026/01/15/6968dc6198bb1.png',
    '一只淋雨小狗': 'https://cdn.imgos.cn/vip/2026/01/15/6968dc8a74aa6.png',
    '委屈': 'https://cdn.imgos.cn/vip/2026/01/15/6968e023759f0.png',
    '生气': 'https://cdn.imgos.cn/vip/2026/01/15/6968e033ec20f.png',
    '心虚': 'https://cdn.imgos.cn/vip/2026/01/15/6968e02ff1c9b.png',
    '我想你': 'https://cdn.imgos.cn/vip/2026/01/15/6968e0312be3f.png',
    '睡觉': 'https://cdn.imgos.cn/vip/2026/01/15/6968e033bcf3d.png',
    '疑惑': 'https://cdn.imgos.cn/vip/2026/01/15/6968e02ff1c96.png',
    '不满': 'https://cdn.imgos.cn/vip/2026/01/15/6968e02ff0ac2.png',
    '觉得对方坏': 'https://cdn.imgos.cn/vip/2026/01/15/6968e030427ee.png',
    '摸头': 'https://cdn.imgos.cn/vip/2026/01/15/6968e034ac7b3.png',
    '分析局势': 'https://cdn.imgos.cn/vip/2026/01/15/6968e033ef5f7.png',
    '这是什么情趣': 'https://cdn.imgos.cn/vip/2026/01/15/6968e032ed0da.png',
    '亲亲': 'https://cdn.imgos.cn/vip/2026/01/15/6968e0340f855.png',
    '网络把我毁了': 'https://cdn.imgos.cn/vip/2026/01/15/6968e03133f93.png',
    '我没招了': 'https://cdn.imgos.cn/vip/2026/01/15/6968e0337354a.png',
    '翻白眼': 'https://cdn.imgos.cn/vip/2026/01/15/6968e032c3c36.png',
    '吃饭': 'https://cdn.imgos.cn/vip/2026/01/15/6968e032aa815.png',
    '挠挠下巴': 'https://cdn.imgos.cn/vip/2026/01/15/6968e03473a08.png',
    '被爱意击中': 'https://cdn.imgos.cn/vip/2026/01/15/6968e03488988.png',
    '咬你': 'https://cdn.imgos.cn/vip/2026/01/15/6968e030966cd.png',
    '抱抱': 'https://cdn.imgos.cn/vip/2026/01/15/6968e0311305e.png',
    '晚安': 'https://cdn.imgos.cn/vip/2026/02/27/69a186f9959ae.png',
    '我超超超爱你': 'https://cdn.imgos.cn/vip/2026/01/15/6968e03440d67.png',
    '舔你': 'https://cdn.imgos.cn/vip/2026/01/15/6968e034c863a.png',
    '装货': 'https://cdn.imgos.cn/vip/2026/01/15/6968e034bf45d.png',
    '觉得对方犯贱': 'https://cdn.imgos.cn/vip/2026/01/15/6968e0311d741.png',
    '觉得所有人无语': 'https://cdn.imgos.cn/vip/2026/01/15/6968e0337d70c.png',
    '觉得对方很欠揍': 'https://cdn.imgos.cn/vip/2026/01/15/6968e03446bd0.png',
    '觉得自己帅': 'https://cdn.imgos.cn/vip/2026/01/15/6968e032db010.png',
    '又咋了': 'https://cdn.imgos.cn/vip/2026/01/15/6968e03194122.png',
};

const DEFAULT_SETTINGS = Object.freeze({
    charAvatar: DEFAULT_CHAR_AVATAR, userAvatar: DEFAULT_USER_AVATAR, wallpaper: DEFAULT_WALLPAPER,
    font: 'default', narration: false, statusText: '在线', globalEnabled: true, fabX: null, fabY: null,
    memEnabled: true, memTarget: 'chat', memEvery: 6,   // 记忆回流：开关 / 目标世界书 / 每几条总结
    customStickers: {},                                  // 自定义表情：{名字: 图片URL}
    momentsCover: 'https://free.picui.cn/free/20260610/0b069700b5e8e5a78a3e61c7b9bb0269.png',
    actionIcons: {},                                     // 功能区图标覆盖：{ voice: 'https://…' }
    perChar: {},                                         // 每张角色卡各自的那份：{ 卡标识: { charAvatar, wallpaper, … } }
    utilProfile: '',                                     // 工具调用（总结/生成NPC）走哪个连接配置，空＝跟随当前预设
});

const state = { panelOpen: false, badge: 0, generating: false, summarizing: false, tab: 'chat', view: 'list', activeId: CHAR_ID, lastStamp: 0 };

/* ---------- 基础 ---------- */
function ctx() { return window.SillyTavern.getContext(); }
function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function toast(t, m) { try { window.toastr && toastr[t](m); } catch (e) {} }
function fontFamily(v) { if (v === 'xiaolai') return "'XiaoLai', cursive"; if (v === 'round') return "'Yuanti SC', 'YouYuan', sans-serif"; return "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"; }

function getSettings() {
    const c = ctx();
    if (!c.extensionSettings[MODULE_NAME]) c.extensionSettings[MODULE_NAME] = structuredClone(DEFAULT_SETTINGS);
    for (const k of Object.keys(DEFAULT_SETTINGS)) if (!Object.hasOwn(c.extensionSettings[MODULE_NAME], k)) c.extensionSettings[MODULE_NAME][k] = DEFAULT_SETTINGS[k];
    return c.extensionSettings[MODULE_NAME];
}
function saveSettings() { ctx().saveSettingsDebounced(); }
/* ---------- 分层：这张卡的设置 vs 所有卡通用 ----------
   TA 的头像/壁纸/朋友圈封面/在线状态/旁白，每张角色卡各存一份，
   免得在 A 卡换了头像，B 卡也跟着变。 */
const PER_CHAR_KEYS = Object.freeze(['charAvatar', 'wallpaper', 'momentsCover', 'statusText', 'narration']);
// 用角色卡的文件名当标识（酒馆里这个最稳），拿不到就退回名字
function charKey() {
    try {
        const c = ctx(); const ch = c.characters?.[c.characterId];
        return (ch && (ch.avatar || ch.name)) || (c.name2 || '').trim() || '__default__';
    } catch (e) { return '__default__'; }
}
// 这张卡自己的那份。第一次见到这张卡时，拿当前的值复制一份，之后各改各的。
function charSet() {
    const s = getSettings();
    if (!s.perChar || typeof s.perChar !== 'object') s.perChar = {};
    const k = charKey();
    if (!s.perChar[k]) {
        const seed = {};
        for (const key of PER_CHAR_KEYS) seed[key] = s[key];
        s.perChar[k] = seed; saveSettings();
        console.log(`[${MODULE_NAME}] 为角色卡「${k}」建了一份独立的手机设置`);
    }
    return s.perChar[k];
}
// 取一个「这张卡的」值；这张卡没设过就退回全局默认
function sv(key) {
    const v = charSet()[key];
    if (v === undefined || v === null) return getSettings()[key];
    if (typeof v === 'string' && !v.trim()) return getSettings()[key];
    return v;
}

function allStickers() { const cs = getSettings().customStickers; return { ...STICKERS, ...(cs && typeof cs === 'object' ? cs : {}) }; }

/* ---------- 联系人 / 多会话 ---------- */
// 联系人存在 chatMetadata 里，和手机聊天一样按本轮酒馆聊天隔离。
function contacts() {
    const cm = ctx().chatMetadata;
    if (!Array.isArray(cm[CONTACTS_KEY])) cm[CONTACTS_KEY] = [];
    if (!cm[CONTACTS_KEY].some(x => x && x.id === CHAR_ID)) {
        cm[CONTACTS_KEY].unshift({ id: CHAR_ID, name: '', avatar: '', persona: '', statusText: '', wallpaper: '', userAvatar: '', narration: null, unread: 0, createdAt: Date.now() });
    }
    return cm[CONTACTS_KEY];
}
function allChats() {
    const cm = ctx().chatMetadata;
    if (!cm[CHATS_KEY] || typeof cm[CHATS_KEY] !== 'object') cm[CHATS_KEY] = {};
    // 迁移：老版本的单人聊天记录 → 主角色的会话
    if (Array.isArray(cm[STORE_KEY]) && cm[STORE_KEY].length && !Array.isArray(cm[CHATS_KEY][CHAR_ID])) {
        cm[CHATS_KEY][CHAR_ID] = cm[STORE_KEY];
        console.log(`[${MODULE_NAME}] 已把旧的聊天记录迁移到联系人「主角色」`);
    }
    return cm[CHATS_KEY];
}
function chatOf(id) { const m = allChats(); if (!Array.isArray(m[id])) m[id] = []; return m[id]; }
function phoneChat() { return chatOf(state.activeId || CHAR_ID); }   // 当前打开的会话
function memChat() { return chatOf(CHAR_ID); }                        // 记忆回流只看主角色那条线

function contactById(id) { return contacts().find(c => c.id === id) || contacts()[0]; }
function activeContact() { return contactById(state.activeId || CHAR_ID); }
function isCharContact(ct) { return !!ct && ct.id === CHAR_ID; }
// 分层取值：联系人自己填了就用自己的，留空就往上一层（这张卡 → 全局）要
function ctName(ct) { return (ct && ct.name) || (isCharContact(ct) ? charName() : 'TA'); }
function ctAvatar(ct) {
    if (ct && ct.avatar) return ct.avatar;
    if (isGroup(ct)) { const m = groupMembers(ct)[0]; return m ? ctAvatar(m) : DEFAULT_NPC_AVATAR; }
    return isCharContact(ct) ? sv('charAvatar') : DEFAULT_NPC_AVATAR;
}
// 群聊头像：没自定义就拼成九宫格
function ctAvatarHTML(ct, cls) {
    if (isGroup(ct) && !ct.avatar) {
        const ms = groupMembers(ct).slice(0, 4);
        if (ms.length) return `<div class="${cls} tp-gav n${ms.length}">${ms.map(m => `<img src="${esc(ctAvatar(m))}">`).join('')}</div>`;
    }
    return `<img class="${cls}" src="${esc(ctAvatar(ct))}">`;
}
function ctStatusLine(ct) { return isGroup(ct) ? `${groupMembers(ct).length} 人` : ctStatus(ct); }
function ctUserAvatar(ct) { return (ct && ct.userAvatar) || getSettings().userAvatar; }
function ctWallpaper(ct) { return (ct && ct.wallpaper) || sv('wallpaper'); }
function ctStatus(ct) { return (ct && ct.statusText) || sv('statusText'); }
function ctNarration(ct) { return (ct && ct.narration != null) ? !!ct.narration : !!sv('narration'); }

function isGroup(ct) { return !!ct && ct.type === 'group'; }
// 群成员：只要还存在的普通联系人（群不能套群）
function groupMembers(ct) {
    if (!isGroup(ct)) return [];
    const all = contacts();
    return (ct.members || []).map(id => all.find(x => x.id === id)).filter(x => x && x.type !== 'group');
}
function addGroup({ name, members }) {
    const g = {
        id: 'grp_' + genId(), type: 'group', name: String(name || '').trim() || '新群聊',
        members: (members || []).slice(), avatar: '', wallpaper: '', userAvatar: '',
        statusText: '', narration: null, unread: 0, createdAt: Date.now(),
    };
    contacts().push(g); persist(); return g;
}
function reEsc(t) { return String(t).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); }

function addContact({ name, avatar, persona, statusText }) {
    const ct = {
        id: 'npc_' + genId(), name: String(name || '').trim() || '新朋友',
        avatar: String(avatar || '').trim(), persona: String(persona || '').trim(),
        statusText: String(statusText || '').trim(), wallpaper: '', userAvatar: '',
        narration: null, unread: 0, createdAt: Date.now(),
    };
    contacts().push(ct); persist(); return ct;
}
function delContact(id) {
    if (id === CHAR_ID) { toast('info', '主角色不能删掉哦'); return; }
    const cm = ctx().chatMetadata;
    cm[CONTACTS_KEY] = contacts().filter(c => c.id !== id);
    const m = allChats(); delete m[id];
    persist();
}

/* ---------- 手机设定打包进角色卡 ----------
   写进卡的 data.extensions.tavern_phone，导出 PNG/JSON 时会跟着走。
   注意：只带「人设」，不带聊天记录，也不带你自己的头像。 */
function cardPreset() {
    try { return ctx().characters?.[ctx().characterId]?.data?.extensions?.[MODULE_NAME] || null; } catch (e) { return null; }
}
function canWriteCard() { return typeof ctx().writeExtensionField === 'function'; }

function buildCardPreset() {
    const s = getSettings(); const out = { v: 1, exportedAt: Date.now(), contacts: [] };
    for (const ct of contacts()) {
        const o = {
            id: ct.id, name: ct.name || '', avatar: ct.avatar || '',
            wallpaper: ct.wallpaper || '', statusText: ct.statusText || '',
            narration: ct.narration == null ? null : !!ct.narration,
        };
        if (isGroup(ct)) { o.type = 'group'; o.members = (ct.members || []).slice(); }
        else o.persona = ct.persona || '';
        if (ct.id === CHAR_ID) {   // 主角色这条把当前实际生效的值写死，别人那边才看得到你调的样子
            o.avatar = ct.avatar || sv('charAvatar');
            o.wallpaper = ct.wallpaper || sv('wallpaper');
            o.statusText = ct.statusText || sv('statusText');
            if (o.narration == null) o.narration = !!sv('narration');
        }
        out.contacts.push(o);
    }
    return out;
}

async function saveToCard() {
    const c = ctx();
    if (c.characterId == null || !c.characters?.[c.characterId]) { toast('warning', '先选一张角色卡'); return; }
    if (!canWriteCard()) {
        console.warn(`[${MODULE_NAME}] 这个酒馆版本没给扩展暴露 writeExtensionField，写不了卡`);
        toast('error', '这个酒馆版本不支持写卡，控制台看 [tavern_phone]'); return;
    }
    if (!window.confirm('把当前的联系人、群聊、头像壁纸这些写进角色卡？\n（会改动卡文件本身，不含聊天记录）')) return;
    try {
        await c.writeExtensionField(c.characterId, MODULE_NAME, buildCardPreset());
        console.log(`[${MODULE_NAME}] 已写入角色卡 data.extensions.${MODULE_NAME}`);
        toast('success', '写进卡了，导出这张卡就会带上');
        updateCardStatus();
    } catch (e) { console.error(`[${MODULE_NAME}] 写卡失败`, e); toast('error', '写卡失败，控制台看 [tavern_phone]'); }
}

// 把卡里的预设铺成本轮聊天的联系人。force=false 时只在还没有联系人的新聊天里铺。
function seedFromCard(force) {
    const c = ctx(); const p = cardPreset();
    if (!p || !Array.isArray(p.contacts) || !p.contacts.length) return false;
    const cm = c.chatMetadata;
    if (!force && Array.isArray(cm[CONTACTS_KEY]) && cm[CONTACTS_KEY].length) return false;
    const seeded = [];
    const base = p.contacts.find(x => x && x.id === CHAR_ID) || {};
    seeded.push({
        id: CHAR_ID, name: '', avatar: base.avatar || '', persona: '',
        statusText: base.statusText || '', wallpaper: base.wallpaper || '', userAvatar: '',
        narration: base.narration == null ? null : !!base.narration, unread: 0, createdAt: Date.now(),
    });
    for (const x of p.contacts) {
        if (!x || !x.id || x.id === CHAR_ID) continue;
        seeded.push({
            id: x.id, type: x.type === 'group' ? 'group' : undefined,
            name: x.name || '', avatar: x.avatar || '', persona: x.persona || '',
            statusText: x.statusText || '', wallpaper: x.wallpaper || '', userAvatar: '',
            members: x.type === 'group' ? (x.members || []).slice() : undefined,
            narration: x.narration == null ? null : !!x.narration, unread: 0, createdAt: Date.now(),
        });
    }
    cm[CONTACTS_KEY] = seeded; persist();
    console.log(`[${MODULE_NAME}] 已从角色卡读入手机预设：${seeded.length} 个联系人`);
    return true;
}
function loadFromCardManual() {
    if (!cardPreset()) { toast('info', '这张卡里没有手机预设'); return; }
    if (!window.confirm('用卡里的预设覆盖当前的联系人列表？\n（聊天记录不会删，但卡里没有的联系人会消失）')) return;
    seedFromCard(true);
    state.activeId = CHAR_ID; state.view = 'list'; recountBadge();
    applySettings(); switchTab('chat');
    toast('success', '已按卡里的预设铺好');
}
function updateCardStatus() {
    const el = document.querySelector('#tp-panel #tp-card-status'); if (!el) return;
    const p = cardPreset();
    const api = canWriteCard() ? '' : '（当前酒馆版本写不了卡）';
    el.textContent = p
        ? `这张卡里已有手机预设：${(p.contacts || []).length} 个联系人${p.exportedAt ? '，' + stampShort(p.exportedAt) + '写入' : ''}${api}`
        : `这张卡里还没有手机预设。${api}`;
}

/* ---------- 时间戳 ---------- */
function pad2(n) { return n < 10 ? '0' + n : String(n); }
function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
// 聊天里那条居中的时间分隔
function stampText(ts) {
    const d = new Date(ts), now = new Date(); const hm = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    if (sameDay(d, now)) return hm;
    const y = new Date(now.getTime() - 86400000);
    if (sameDay(d, y)) return '昨天 ' + hm;
    if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日 ${hm}`;
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}
// 聊天列表右上角那个短的
function stampShort(ts) {
    if (!ts) return '';
    const d = new Date(ts), now = new Date();
    if (sameDay(d, now)) return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    if (sameDay(d, new Date(now.getTime() - 86400000))) return '昨天';
    if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}/${d.getDate()}`;
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
function phoneMem() { const cm = ctx().chatMetadata; if (!cm[MEM_KEY] || typeof cm[MEM_KEY] !== 'object') cm[MEM_KEY] = { summary: '', count: 0, book: '', uid: null }; return cm[MEM_KEY]; }
async function persist() { try { await ctx().saveMetadata(); } catch (e) { console.error(`[${MODULE_NAME}]`, e); } }

/* ---------- 短代码渲染 ---------- */
function renderInline(raw, isUser) {
    let html = esc(raw);
    const alignClass = isUser ? 'right-align' : 'left-align';
    const bubbleClass = isUser ? 'bubble-pink' : 'bubble-blue';
    const glass = isUser ? 'frosted-glass-pink' : 'frosted-glass';
    const iconBg = isUser ? 'frosted-icon-bg-pink' : 'frosted-icon-bg';

    for (const [name, url] of Object.entries(allStickers())) {
        const safe = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        html = html.replace(new RegExp(`\\[${safe}\\]`, 'g'), `<img src="${url}" class="sticker-img" style="vertical-align:middle;display:inline-block;">`);
    }
    html = html.replace(/\[语音[：:]\s*(.*?)\]/g, (m, c) => {
        const p = c.split(/[|｜]/); let dur = '10"', txt = '（点击播放语音）';
        if (p.length > 1) { dur = p[0]; txt = p[1]; } else { const r = p[0]; (r.includes('"') || r.includes('&quot;') || r.includes('s') || /^\d+$/.test(r)) ? dur = r : txt = r; }
        return `<details class="voice-bubble-container ${alignClass}"><summary class="voice-bar ${bubbleClass}"><div class="play-triangle"></div><div class="voice-wave-box"><span class="wave-bar"></span><span class="wave-bar"></span><span class="wave-bar"></span></div><span class="voice-duration">${dur}</span></summary><div class="voice-text ${bubbleClass}">${txt}</div></details>`;
    });
    html = html.replace(/\[定位[：:]\s*(.*?)\]/g, (m, c) => {
        const p = c.split(/[|｜]/); const dist = p[0] || '未知距离', note = p[1] || '正在向你靠近...';
        return `<details class="link-card-container ${alignClass}"><summary class="link-card-preview ${glass}"><div class="link-info"><div class="link-title">我在这里等你</div><div class="link-desc">实时位置共享中...</div></div><div class="link-icon-box ${iconBg}">📍</div></summary><div class="link-content ${glass}"><div class="map-placeholder"><div class="radar-circle"></div><div class="radar-dot"></div><div class="map-text">${dist}</div><div class="map-subtext">备注：${note}</div></div></div></details>`;
    });
    html = html.replace(/\[天气[：:]\s*(.*?)\]/g, (m, c) => {
        const p = c.split(/[|｜]/); const w = p[0] || '', tip = p[1] || '记得照顾好自己。';
        return `<details class="link-card-container ${alignClass}"><summary class="link-card-preview ${glass}"><div class="link-icon-box ${iconBg}">⛅</div><div class="link-info"><div class="link-title">天气预报</div><div class="link-desc">点击查看详情</div></div></summary><div class="link-content ${glass}"><div class="weather-widget"><div class="weather-main"><span class="weather-icon">🌦️</span><span class="weather-temp">Today</span></div><div class="weather-desc">${w}</div><div class="weather-tips">${tip}</div></div></div></details>`;
    });
    html = html.replace(/\[外卖[：:]\s*(.*?)\]/g, (m, c) => {
        const p = c.split(/[|｜]/); const f = p[0] || '', st = p[1] || '已买单';
        return `<details class="link-card-container ${alignClass}"><summary class="link-card-preview ${glass}"><div class="link-icon-box ${iconBg}">🛵</div><div class="link-info"><div class="link-title">美团外卖</div><div class="link-desc">预计即将送达</div></div></summary><div class="link-content ${glass}"><div class="link-content-inner text-center"><div class="food-emoji">🍗</div><div class="order-name">${f}</div><div class="order-status-tag paid">${st}</div></div></div></details>`;
    });
    html = html.replace(/\[代付[：:]\s*(.*?)\]/g, (m, c) => {
        const p = c.split(/[|｜]/); const f = p[0] || '', pr = p[1] || '¥ --';
        return `<details class="link-card-container ${alignClass}"><summary class="link-card-preview ${glass}"><div class="link-icon-box ${iconBg}">💳</div><div class="link-info"><div class="link-title">代付请求</div><div class="link-desc">共 1 件商品</div></div></summary><div class="link-content ${glass}"><div class="link-content-inner text-center"><div class="food-emoji">🥤</div><div class="order-name">${f}</div><div class="order-price">${pr}</div><div class="action-btn">帮TA付款</div></div></div></details>`;
    });
    html = html.replace(/\[转账[：:]\s*(.*?)\]/g, (m, c) => {
        const p = c.split(/[|｜]/); const amt = p[0] || '0.00', note = p[1] || '恭喜发财', code = (p[2] || '').trim();
        let icon = '¥', st = '转账中', cls = '';
        if (code.includes('收')) { icon = '✔'; st = '已收款'; cls = 'status-received'; }
        else if (code.includes('退')) { icon = '↩'; st = '已退还'; cls = 'status-returned'; }
        return `<div class="link-card-container ${alignClass}"><div class="transfer-card-preview ${cls}"><div class="transfer-icon-box">${icon}</div><div class="transfer-info"><div class="transfer-title">向你转账</div><div class="transfer-amount">¥ ${amt}</div><div class="transfer-desc">${note}</div></div><div class="transfer-status">${st}</div></div></div>`;
    });
    html = html.replace(/\[链接[：:]\s*(.*?)\]/g, (m, c) => {
        const p = c.split(/[|｜]/); const t = p[0] || '', d = p[1] || '点击查看';
        return `<details class="link-card-container ${alignClass}"><summary class="link-card-preview ${glass}"><div class="link-icon-box ${iconBg}">🔗</div><div class="link-info"><div class="link-title">分享链接</div><div class="link-desc">点击查看</div></div></summary><div class="link-content ${glass}"><div class="link-content-inner"><div style="font-weight:bold;margin-bottom:5px;">${t}</div><div style="font-size:11px;color:#666;">${d}</div></div></div></details>`;
    });
    html = html.replace(/\[图片[：:]\s*(.*?)\]/g, (m, c) =>
        `<details class="link-card-container ${alignClass}"><summary class="link-card-preview ${glass}"><div class="link-icon-box ${iconBg}">🖼️</div><div class="link-info"><div class="link-title">收到一张照片</div><div class="link-desc">点击查看详情...</div></div></summary><div class="link-content ${glass}"><div class="link-content-inner text-center"><div class="image-placeholder custom-bg"><div class="img-text" style="color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.8);">备注：${c}</div></div><div class="link-meta">Image Shared</div></div></div></details>`);
    html = html.replace(/\[撤回[：:]\s*([\s\S]*?)\]/g, (m, c) => {
        const who = isUser ? '你' : '对方'; const content = c.trim();
        return `<div class="tp-recall"><details class="recall-wrapper"><summary class="system-tip"><span>${who}撤回了一条消息</span>${content ? '<span class="tip-hint">(查看)</span>' : ''}</summary>${content ? `<div class="ghost-bubble">${content}</div>` : ''}</details></div>`;
    });
    return html;
}

// 一段内容 → { kind, html }（先剥一层外方括号，统一判断类型，避免嵌套气泡）
function contentToHtml(content, isUser) {
    let c = String(content).trim(); if (!c) return null;
    const bubbleClass = isUser ? 'bubble-pink' : 'bubble-blue';
    let inner = c; const w = c.match(/^\[([\s\S]*)\]$/); if (w) inner = w[1].trim();
    if (/^旁白[：:]/.test(inner)) return { kind: 'narration', html: `<div class="tp-narration">${esc(inner.replace(/^旁白[：:]\s*/, ''))}</div>` };
    if (/^撤回[：:]/.test(inner)) return { kind: 'system', html: renderInline(`[${inner}]`, isUser) };
    if (/^(语音|定位|天气|链接|图片|外卖|代付|转账)[：:]/.test(inner)) return { kind: 'component', html: renderInline(`[${inner}]`, isUser) };
    let name = inner.replace(/^\d+\./, '');
    const AS = allStickers();
    if (AS[name]) return { kind: 'sticker', html: `<img src="${AS[name]}" class="sticker-img">` };
    return { kind: 'bubble', html: `<div class="bubble ${bubbleClass}">${renderInline(c, isUser)}</div>` };
}

/* ---------- 剥掉预设的外壳 ----------
   很多中文预设会包一层 <Think> 思维链、<顶栏>、<content>、[V9_DAILY_START] 状态栏
   和 <!-- 字数 --> 注释。不剥的话这些会被当成聊天内容塞进手机，或者被当成记忆摘要
   灌进主线。 */
function stripPreset(raw) {
    let t = String(raw || '');
    t = t.replace(/<think>[\s\S]*?<\/think>/gi, '');
    t = t.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
    // 思维链没闭合/开头标签被吃掉时，把最后一个 </think> 之前的全丢掉
    const it = t.search(/<\/think(?:ing)?>/i);
    if (it >= 0) t = t.slice(it).replace(/^<\/think(?:ing)?>/i, '');
    t = t.replace(/<顶栏>[\s\S]*?<\/顶栏>/g, '');
    t = t.replace(/\[V9_DAILY_START\][\s\S]*?\[V9_DAILY_END\]/g, '');
    t = t.replace(/<!--[\s\S]*?-->/g, '');
    // 有 <content> 就只要里面的（可能有好几段）
    const cs = t.match(/<content>[\s\S]*?<\/content>/gi);
    if (cs && cs.length) t = cs.map(x => x.replace(/<\/?content>/gi, '')).join('\n');
    // 剩下的单独成行的标签（<Scene_NO>…、状态栏残骸）也扫掉
    t = t.replace(/^\s*<\/?[A-Za-z_\u4e00-\u9fa5][^>\n]*>\s*$/gm, '');
    return t.trim();
}

/* ---------- 工具调用：尽量绕开预设 ----------
   总结记忆、生成NPC 这类是「工具调用」，不是剧情续写。但 generateQuietPrompt 会把
   请求塞进你当前预设＋聊天历史里发出去，强势的预设（ECoT / 越狱类）会直接无视我们的
   要求，回一整篇小说回来。所以：
   1) 能用酒馆的「连接配置」就走干净通道，不带预设、不带聊天历史；
   2) 拿不到干净通道时照旧发，但输出必须过校验，不合格宁可不用，也不能存进记忆。 */
function connProfiles() {
    try { const p = ctx().extensionSettings?.connectionManager?.profiles; return Array.isArray(p) ? p : []; } catch (e) { return []; }
}
function hasCleanChannel() {
    try { const svc = ctx().ConnectionManagerRequestService; return !!(svc && typeof svc.sendRequest === 'function'); } catch (e) { return false; }
}
async function utilGenerate(prompt, maxTokens) {
    const c = ctx(); const pid = getSettings().utilProfile;
    if (pid && hasCleanChannel()) {
        try {
            const r = await c.ConnectionManagerRequestService.sendRequest(pid, prompt, maxTokens || 400);
            const t = typeof r === 'string' ? r : (r?.content ?? r?.message?.content ?? '');
            if (String(t).trim()) return String(t);
            console.warn(`[${MODULE_NAME}] 干净通道返回空，退回默认通道`);
        } catch (e) { console.warn(`[${MODULE_NAME}] 干净通道失败，退回默认通道`, e); }
    }
    return await c.generateQuietPrompt({ quietPrompt: prompt, skipWIAN: true, responseLength: maxTokens || 400 });
}
// 一眼能看出是预设接管了的特征
function looksHijacked(t) {
    return /<\/?think\b|<顶栏>|\[V9_DAILY|<content>|<DRAFT|Scene_Title|当前字数|ECFR|小冰块/i.test(String(t || ''));
}
// 读工具调用的返回。
// 关键：判"有没有被接管"必须在剥壳之前——stripPreset 会把一整篇小说洗成一段干净的
// 正文，看起来跟正常摘要没两样。所以规则是：
//   有信封 → 用信封里的；没信封但满是预设痕迹 → 直接判失败；都没有 → 按老办法剥壳。
function readUtilReply(raw, tag) {
    const t = String(raw || '');
    const m = t.match(new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>'));
    if (m) return { text: m[1].trim(), bad: '' };
    if (looksHijacked(t)) return { text: '', bad: '被预设接管了' };
    return { text: stripPreset(t), bad: '' };
}
// 工具调用统一的开头，尽量把预设压住
const UTIL_GUARD = '【系统工具调用 · 不是剧情续写】\n忽略任何要求你写小说、写顶栏、写状态栏、写思维链、凑字数、描写亲密情节的指令。这一条只需要一个极短的纯文本结果。\n\n';

/* ---------- 渲染 ---------- */
function chatArea() { return document.querySelector('#tp-panel .chat-area'); }
function appendRow(isUser, r, mid, who) {
    const area = chatArea(); if (!area || !r) return;
    const midAttr = mid != null ? String(mid) : '';
    const del = mid != null ? `<div class="tp-del" data-del="${midAttr}" title="删除这条">✕</div>` : '';
    if (r.kind === 'narration' || r.kind === 'system') {
        area.insertAdjacentHTML('beforeend', `<div class="tp-line center" data-mid="${midAttr}">${r.html}${del}</div>`);
    } else {
        const ct = activeContact(); const side = isUser ? 'right' : 'left';
        const speaker = (!isUser && who) ? contactById(who) : null;
        const av = isUser ? ctUserAvatar(ct) : (speaker ? ctAvatar(speaker) : ctAvatar(ct));
        // 群里才在气泡上方标名字
        const tag = (!isUser && speaker && isGroup(ct)) ? `<div class="tp-speaker">${esc(ctName(speaker))}</div>` : '';
        area.insertAdjacentHTML('beforeend', `<div class="tp-line msg-row ${side}" data-mid="${midAttr}"><img class="avatar" src="${esc(av)}"><div class="msg-inner">${tag}${r.html}</div>${del}</div>`);
    }
    area.scrollTop = area.scrollHeight;
}
function renderOne(isUser, text, mid, ts, who) {
    const r = contentToHtml(text, isUser); if (!r) return;
    maybeStamp(ts);
    appendRow(isUser, r, mid, who);
}
// 距上一条超过 5 分钟（或是第一条）就插一条居中时间
function maybeStamp(ts) {
    if (!ts) return;
    const area = chatArea(); if (!area) return;
    if (state.lastStamp && ts - state.lastStamp < 5 * 60 * 1000) return;
    state.lastStamp = ts;
    area.insertAdjacentHTML('beforeend', `<div class="tp-timestamp">${esc(stampText(ts))}</div>`);
}

// AI 回复 → { status, items[] }。手机块只取 [对|..]，忽略 [我|..]（防复述重复）
function parseCharPayload(raw) {
    const ta = (ctx().name2 || '').trim();
    const items = []; let status = null;
    // [手机|状态|时间] … [/手机]。时间那段有的预设不写，所以可有可无。
    const bm = String(raw).match(/\[手机\|([^|\]]*?)(?:\|([^|\]]*?))?\]([\s\S]*?)\[\/手机\]/);
    if (bm) {
        status = (bm[1] || '').trim();
        // 只收手机块里的东西：[对|…] 是气泡，[旁白：…] 是旁白，[我|…] 是复述用户的，丢掉。
        // 块外面那些旁白是主线小说的正文，不往手机里搬。
        bm[3].split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
            const nar = line.match(/^\[旁白[：:|]\s*([\s\S]*?)\]$/);
            if (nar) { const t = nar[1].trim(); if (t) items.push(`[旁白：${t}]`); return; }
            const m = line.match(/^\[对\|([\s\S]*)\]$/);
            if (m) { const t = m[1].trim(); if (t) items.push(t); }
        });
    } else {
        String(raw).split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
            let l = line;
            if (ta && (l.startsWith(ta + '：') || l.startsWith(ta + ':'))) l = l.slice(ta.length + 1).trim();
            if (l) items.push(l);
        });
    }
    return { status, items };
}

// 群聊回复：一行一条「名字：内容」，认不出名字的算上一个人的续话
function parseGroupPayload(raw, members) {
    const out = [];
    const names = members.map(m => ({ id: m.id, name: ctName(m) })).sort((a, b) => b.name.length - a.name.length);
    let lastWho = null;
    String(raw).split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
        if (/^\[?旁白[：:]/.test(line)) { out.push({ who: null, text: line }); lastWho = null; return; }
        let hit = null;
        for (const n of names) {
            const m = line.match(new RegExp('^\\[?' + reEsc(n.name) + '\\]?\\s*[：:]\\s*([\\s\\S]*)$'));
            if (m) { hit = { who: n.id, text: m[1].trim() }; break; }
        }
        if (hit) { if (hit.text) out.push(hit); lastWho = hit.who; }
        else if (lastWho) out.push({ who: lastWho, text: line });
        else if (names.length) { out.push({ who: names[0].id, text: line }); lastWho = names[0].id; }
    });
    return out;
}

function setStatus(s) {
    // 只改当前这次显示，不落库——免得盖掉用户在专属设置里填的在线状态
    const el = document.querySelector('#tp-panel .contact-status');
    if (el && s && state.tab === 'chat' && state.view === 'room') el.textContent = s;
}
function deleteMsg(mid) {
    const m = allChats(); const id = state.activeId || CHAR_ID;
    m[id] = (m[id] || []).filter(x => String(x.id) !== String(mid));
    persist(); loadHistory(); renderChatList();
}
function loadHistory() {
    const a = chatArea(); if (!a) return;
    a.innerHTML = ''; state.lastStamp = 0;
    for (const m of phoneChat()) renderOne(m.role === 'user', m.text, m.id, m.ts, m.who);
}

/* ---------- typing ---------- */
function showTyping() {
    const a = chatArea(); if (!a || document.getElementById('tp-typing')) return;
    const tct = activeContact();
    const tav = isGroup(tct) ? ctAvatar(groupMembers(tct)[0] || tct) : ctAvatar(tct);
    a.insertAdjacentHTML('beforeend', `<div class="tp-line msg-row left tp-typing" id="tp-typing"><img class="avatar" src="${esc(tav)}"><div class="dots"><span></span><span></span><span></span></div></div>`);
    a.scrollTop = a.scrollHeight;
}
function hideTyping() { const t = document.getElementById('tp-typing'); if (t) t.remove(); }

/* ---------- 发送 / 催回复 ---------- */
function pushUser(text) {
    const t = String(text).trim(); if (!t) return;
    const item = { id: genId(), role: 'user', text: t, ts: Date.now() };
    phoneChat().push(item); renderOne(true, t, item.id, item.ts); persist(); renderChatList();
}

async function askReply() {
    if (state.generating || state.summarizing) return;
    const c = ctx(); const list = phoneChat();
    if (isGroup(activeContact())) return askGroupReply();
    if (!list.length) { toast('info', '先发条消息给TA吧～'); return; }
    state.generating = true; showTyping();
    let replied = false;
    const ct = activeContact();
    const me = (c.name1 || '我').trim();
    const ta = ctName(ct);
    const recent = list.slice(-24).map(m => `${m.role === 'user' ? me : ta}：${m.text}`).join('\n');
    const narr = ctNarration(ct)
        ? `开启了旁白模式：除了聊天气泡，可以在消息之间穿插旁白，用 [旁白：内容] 单独占一行，写${ta}此刻的心理活动、动作或所处环境。旁白不要写成对话。`
        : '不要写旁白、心理活动或动作描写，只发即时消息文字。';
    // NPC：把人设喂进去，并说明这不是主角色
    const who = isCharContact(ct) ? '' :
        `${ta}是${me}手机通讯录里的另一个人（不是${charName()}），请完全以${ta}的身份说话。` +
        (ct.persona ? `\n【${ta}的人设】\n${ct.persona}\n` : '');
    const quiet = `以下是${ta}和${me}正在用手机聊天的场景。${who}请只以${ta}的身份、用适合手机即时通讯的口吻回复${me}的最新消息。可以分多条，每条单独占一行。${narr}不要复述${me}说的话，不要加引号或旁白式叙述。\n\n【手机里最近的对话】\n${recent}\n\n【现在轮到${ta}回复】`;
    try {
        const raw = await c.generateQuietPrompt({ quietPrompt: quiet });
        hideTyping();
        const text = stripPreset(raw);
        if (!text) { toast('warning', '没收到回复，检查下酒馆的API连接？'); return; }
        const parsed = parseCharPayload(text);
        const status = parsed.status;
        let items = parsed.items;
        // 关了旁白就别让 AI 偷偷塞旁白进来（全被滤光的话还是留着，免得一条都没有）
        if (!ctNarration(ct) && items.length) {
            const pure = items.filter(x => !/^\[?旁白[：:]/.test(String(x).trim()));
            if (pure.length) items = pure;
        }
        if (status) setStatus(status);
        // 生成期间用户可能翻走了，别把消息画到别人的会话里
        const visible = () => state.panelOpen && state.activeId === ct.id && state.view === 'room';
        if (!items.length) {
            const item = { id: genId(), role: 'char', text, ts: Date.now() };
            chatOf(ct.id).push(item); if (visible()) renderOne(false, text, item.id, item.ts);
        } else {
            for (const part of items) {           // 逐条延迟弹出
                if (visible()) showTyping();
                await sleep(500); hideTyping();
                const item = { id: genId(), role: 'char', text: part, ts: Date.now() };
                chatOf(ct.id).push(item); if (visible()) renderOne(false, part, item.id, item.ts);
            }
        }
        if (!visible()) { ct.unread = (ct.unread || 0) + 1; recountBadge(); }
        persist(); replied = true; renderChatList();
    } catch (e) {
        hideTyping(); console.error(`[${MODULE_NAME}] 生成失败`, e); toast('error', '生成失败，看看酒馆是否已连接API');
    } finally { state.generating = false; hideTyping(); if (replied && isCharContact(ct)) maybeSummarize(); }
}

// 群聊：让群里的人你一言我一语地接话
async function askGroupReply() {
    if (state.generating || state.summarizing) return;
    const c = ctx(); const ct = activeContact(); const list = phoneChat();
    const ms = groupMembers(ct);
    if (!ms.length) { toast('warning', '这个群里还没有人，去右上角 ⋯ 里加几个'); return; }
    if (!list.length) { toast('info', '先在群里说句话吧～'); return; }
    state.generating = true; showTyping();
    const me = (c.name1 || '我').trim();
    const nameOf = m => m.role === 'user' ? me : (m.who ? ctName(contactById(m.who)) : '旁白');
    const recent = list.slice(-24).map(m => `${nameOf(m)}：${m.text}`).join('\n');
    const roster = ms.map(m => isCharContact(m)
        ? `- ${ctName(m)}（就是当前这张角色卡的角色本人，按TA一贯的性格说话）`
        : `- ${ctName(m)}${m.persona ? '：' + m.persona : ''}`).join('\n');
    const narr = ctNarration(ct)
        ? '可以在中间穿插旁白，单独一行写成 [旁白：内容]，写环境或某人的小动作。'
        : '不要写旁白、心理活动或动作描写，只发群里的聊天文字。';
    const quiet = `这是一个手机群聊「${ctName(ct)}」，${me}也在群里。\n\n【群成员】\n${roster}\n\n请让群里的人接${me}的话。可以只有一个人说，也可以几个人你一言我一语。总共 2 到 6 条。\n严格按这个格式，每行一条，名字必须是上面列出来的那几个：\n名字：内容\n${narr}\n不要替${me}说话，不要加引号。\n\n【群里最近的消息】\n${recent}\n\n【现在群里的人接话】`;
    try {
        const raw = await c.generateQuietPrompt({ quietPrompt: quiet });
        hideTyping();
        const text = stripPreset(raw);
        if (!text) { toast('warning', '没收到回复，检查下酒馆的API连接？'); return; }
        let rows = parseGroupPayload(text, ms);
        if (!ctNarration(ct) && rows.length) { const pure = rows.filter(r => r.who); if (pure.length) rows = pure; }
        if (!rows.length) { console.warn(`[${MODULE_NAME}] 群聊没解析出内容，原始返回：`, text); toast('warning', '没解析出内容，再点一次试试？'); return; }
        const visible = () => state.panelOpen && state.activeId === ct.id && state.view === 'room';
        for (const row of rows) {
            if (visible()) showTyping();
            await sleep(450); hideTyping();
            const item = { id: genId(), role: 'char', who: row.who || null, text: row.text, ts: Date.now() };
            chatOf(ct.id).push(item);
            if (visible()) renderOne(false, row.text, item.id, item.ts, item.who);
        }
        if (!visible()) { ct.unread = (ct.unread || 0) + 1; recountBadge(); }
        persist(); renderChatList();
    } catch (e) {
        hideTyping(); console.error(`[${MODULE_NAME}] 群聊生成失败`, e); toast('error', '生成失败，看看酒馆是否已连接API');
    } finally { state.generating = false; hideTyping(); }
}

/* ---------- 记忆总结回流世界书（手机 ↔ 主线打通） ---------- */
// 复刻酒馆的世界书条目默认模板（context 没暴露 createWorldInfoEntry，手搓一条完整的免得缺字段）
function memEntryTemplate() {
    return {
        key: [], keysecondary: [], comment: '', content: '',
        constant: false, vectorized: false, selective: true, selectiveLogic: 0,
        addMemo: false, order: 100, position: 0, disable: false, ignoreBudget: false,
        excludeRecursion: false, preventRecursion: false,
        matchPersonaDescription: false, matchCharacterDescription: false,
        matchCharacterPersonality: false, matchCharacterDepthPrompt: false,
        matchScenario: false, matchCreatorNotes: false,
        delayUntilRecursion: 0, probability: 100, useProbability: true,
        depth: 4, outletName: '', group: '', groupOverride: false, groupWeight: 100,
        scanDepth: null, caseSensitive: null, matchWholeWords: null, useGroupScoring: null,
        automationId: '', role: 0, sticky: null, cooldown: null, delay: null, triggers: [],
    };
}
function freeUid(data) { for (let u = 0; u < 1000000; u++) if (!(u in data.entries)) return u; return Date.now(); }

// 决定把记忆写进哪本世界书，返回书名（拿不到返回 ''）
async function resolveMemBook() {
    const c = ctx(); const s = getSettings();
    const names = c.getWorldInfoNames ? c.getWorldInfoNames() : [];

    // 角色主世界书模式：只有角色确实绑了书才用，否则退回聊天专属（不擅自写坏别人的卡）
    if (s.memTarget === 'char') {
        try {
            const bound = c.characters?.[c.characterId]?.data?.extensions?.world;
            if (bound && names.includes(bound)) return bound;
        } catch (e) {}
    }

    // 聊天专属世界书（chat_metadata.world_info）——和手机聊天一样按本轮聊天隔离
    const cm = c.chatMetadata;
    let book = cm['world_info'];
    if (book) { // 已绑：直接用，缺文件就补个空的
        if (!names.includes(book)) { try { await c.saveWorldInfo(book, { entries: {} }, true); if (c.updateWorldInfoList) await c.updateWorldInfoList(); } catch (e) {} }
        return book;
    }
    // 没绑：建一本并绑到当前聊天
    const charName = (() => { try { return c.name2 || c.characters?.[c.characterId]?.name || '角色'; } catch (e) { return '角色'; } })();
    const bookName = `📱小手机记忆-${charName}`.replace(/[\\/:*?"<>|]/g, '_').slice(0, 60);
    try {
        if (!names.includes(bookName)) { await c.saveWorldInfo(bookName, { entries: {} }, true); if (c.updateWorldInfoList) await c.updateWorldInfoList(); }
        cm['world_info'] = bookName; await c.saveMetadata();
        console.log(`[${MODULE_NAME}] 已创建并绑定聊天世界书: ${bookName}（在聊天栏的小书本图标里，不在全局World Info列表）`);
        return bookName;
    } catch (e) { console.error(`[${MODULE_NAME}] 建世界书失败`, e); return ''; }
}

// 把摘要写进 book 里那条固定的“手机记忆”条目（存在则更新，不存在则新建）
// constant=true 时是蓝灯常驻（作兜底注入）；false 时只是可查看副本，不参与注入（避免和直接注入重复）
async function writeMemEntry(book, content, constant) {
    const c = ctx();
    const data = await c.loadWorldInfo(book);
    if (!data || !data.entries) return false;
    const mem = phoneMem();

    let entry = (mem.uid != null && data.entries[mem.uid]) ? data.entries[mem.uid] : null;
    if (!entry) entry = Object.values(data.entries).find(e => String(e.comment || '').startsWith(MEM_MARKER));
    if (!entry) { const uid = freeUid(data); entry = { uid, ...memEntryTemplate() }; data.entries[uid] = entry; }

    entry.comment = `${MEM_MARKER}${constant ? '（自动·勿手动改）' : '（自动·仅存档·主线已直接注入）'}`;
    entry.content = content;
    entry.constant = !!constant;   // 见上：兜底才蓝灯，否则只当存档
    entry.disable = false; entry.selective = false; entry.key = [];
    entry.position = 4; entry.depth = 1; entry.role = 0; entry.order = 100;

    mem.book = book; mem.uid = entry.uid;
    await c.saveWorldInfo(book, data, true);  // saveWorldInfo 会同步刷新 worldInfoCache，下次生成立刻生效
    return true;
}

// 把摘要直接注入每次主线生成（最稳的通道，不依赖世界书）
const MEM_INJECT_KEY = 'tavern_phone_mem';
function applyMemInjection(summary) {
    const c = ctx();
    if (typeof c.setExtensionPrompt !== 'function') { console.warn(`[${MODULE_NAME}] 无 setExtensionPrompt，无法直接注入`); return false; }
    try {
        const s = String(summary || '').trim();
        if (!s) { c.setExtensionPrompt(MEM_INJECT_KEY, '', 1, 1, false, 0); return true; }
        const me = (c.name1 || '我').trim(); const ta = charName();
        // 带上最近几条手机原文，让角色能记起具体内容（表情/原话），而不只是被压扁的梗概
        const list = memChat();
        const recent = list.slice(-8).map(m => `${m.role === 'user' ? me : ta}：${m.text}`).join('\n');
        const text = `【手机聊天·剧情连续性·重要】${me}和${ta}刚刚在手机上聊过，${ta}理应清楚记得下面的内容；主线对话请自然衔接，绝不能表现得毫不知情或矢口否认。\n梗概：${s}${recent ? `\n最近原文：\n${recent}` : ''}`;
        c.setExtensionPrompt(MEM_INJECT_KEY, text, 1, 1, false, 0); // IN_CHAT(1)、紧贴当前楼层(depth1)、SYSTEM(0)
        console.log(`[${MODULE_NAME}] 已注入主线记忆(梗概${s.length}字 + 最近${Math.min(list.length, 8)}条原文)`);
        return true;
    } catch (e) { console.error(`[${MODULE_NAME}] 注入失败`, e); return false; }
}

// 尽力把摘要写进世界书（injected=直接注入是否成功；成了世界书只留存档，没成世界书就当兜底蓝灯）
async function flowToWorldBook(content, injected) {
    const c = ctx();
    const miss = ['loadWorldInfo', 'saveWorldInfo', 'getWorldInfoNames'].filter(k => typeof c[k] !== 'function');
    if (miss.length) { console.warn(`[${MODULE_NAME}] 世界书接口缺失: ${miss.join(', ')}（跳过，主线已用直接注入）`); return { ok: false, reason: 'no-api' }; }
    try {
        const book = await resolveMemBook();
        if (!book) { console.warn(`[${MODULE_NAME}] 没解析出可写入的世界书`); return { ok: false, reason: 'no-book' }; }
        const ok = await writeMemEntry(book, content, !injected); // 注入成功→世界书只存档(不重复注入)；注入失败→世界书兜底
        console.log(`[${MODULE_NAME}] 世界书写入 ${ok ? '成功' : '失败'}（${injected ? '仅存档' : '兜底注入'}）→ ${book}`);
        return ok ? { ok: true, book } : { ok: false, reason: 'write-fail', book };
    } catch (e) { console.error(`[${MODULE_NAME}] 世界书写入异常`, e); return { ok: false, reason: 'exception' }; }
}

// 攒够 memEvery 条就自动总结（在 askReply 成功后触发；不阻塞聊天）
function maybeSummarize() {
    const s = getSettings(); if (!s.memEnabled) return;
    const mem = phoneMem(), list = memChat();
    if (mem.count > list.length) mem.count = list.length;  // 删过消息，回退计数
    if (list.length - mem.count >= (s.memEvery || 6)) summarizeAndFlow(false);
}

// 总结新消息 → 更新滚动摘要 → 注入主线（+尽力写世界书）
async function summarizeAndFlow(manual = false) {
    const c = ctx(); const s = getSettings();
    if (!s.memEnabled && !manual) return;
    if (state.generating || state.summarizing) { if (manual) toast('info', 'TA还在打字，稍等一下～'); return; }
    const chatId = c.getCurrentChatId ? c.getCurrentChatId() : c.chatId;
    if (!chatId) { if (manual) toast('warning', '先打开一个聊天再回流哦'); return; }

    const list = memChat(), mem = phoneMem();
    if (mem.count > list.length) mem.count = list.length;
    const newMsgs = list.slice(mem.count);
    if (!newMsgs.length) { if (manual) toast('info', '没有新消息需要回流～'); return; }
    if (newMsgs.length < 2 && !manual) return;

    state.summarizing = true;
    if (manual) toast('info', '正在把手机记忆回流到主线…');
    const me = (c.name1 || '我').trim();
    const ta = (c.name2 || c.characters?.[c.characterId]?.name || '对方').trim();
    const convo = newMsgs.map(m => `${m.role === 'user' ? me : ta}：${m.text}`).join('\n');
    const prev = mem.summary ? `【已有的手机记忆摘要】\n${mem.summary}\n\n` : '';
    const quiet = `${UTIL_GUARD}你是剧情记录员。下面是${me}和${ta}用手机聊天的新增内容。请把它整合进已有摘要，输出一份更新后的、第三人称、简洁的“手机聊天记忆”，只保留主线剧情需要知道的：发生了什么、约定了什么、情绪和关系的变化、提到的计划或事实。不要逐句复述，不要写对话原文，不要加引号。\n\n输出格式（严格遵守，整个回复只有这三行）：\n<摘要>\n这里写摘要，150字以内\n</摘要>\n\n${prev}【新增手机聊天】\n${convo}`;
    try {
        const raw = await utilGenerate(quiet, 400);
        const got = readUtilReply(raw, '摘要');
        const summary = got.text.replace(/^手机(聊天)?记忆[:：]?\s*/, '').replace(/^摘要[:：]\s*/, '').trim();
        // 这段每轮都要注进主线，宁可不写，也不能把预设吐出来的小说写进去
        const bad = got.bad ? got.bad
            : !summary ? '空'
            : looksHijacked(summary) ? '带着预设的标签'
            : summary.length > 300 ? `太长（${summary.length}字）`
            : '';
        if (bad) {
            console.warn(`[${MODULE_NAME}] 摘要不合格（${bad}），已丢弃，原始返回：`, String(raw || '').slice(0, 500));
            toast('warning', `回流已跳过：模型没给出摘要（${bad}）。去设置里给「工具调用」选一个干净的连接配置试试。`);
            return;
        }

        // 存档 + 主通道：直接注入主线（最稳）
        mem.summary = summary; mem.count = list.length;
        const injected = applyMemInjection(summary);
        // 副通道：尽力写世界书（注入成功→只存档；注入失败→世界书兜底注入）
        const wb = await flowToWorldBook(`（${ta}和${me}的手机聊天记忆，随剧情自动更新）\n${summary}`, injected);
        mem.injected = injected; mem.book = wb.ok ? wb.book : ''; mem.wbReason = wb.ok ? '' : wb.reason;
        await persist(); updateMemStatus();

        if (injected) toast('success', wb.ok ? `已回流：主线+世界书都写好了` : `已回流到主线（世界书没写成，但主线能看到）`);
        else if (wb.ok) toast('success', `已写入世界书（无法直接注入，靠世界书生效）`);
        else toast('error', `回流失败：主线注入和世界书都没成，控制台看 [tavern_phone]`);
    } catch (e) {
        console.error(`[${MODULE_NAME}] 回流失败`, e); toast('error', '回流失败，看看酒馆API连接');
    } finally { state.summarizing = false; }
}

async function clearMem() {
    if (!window.confirm('清空手机记忆？\n注入主线的那段会一起清掉，世界书里那条会被置空。聊天记录不动。')) return;
    const mem = phoneMem();
    const book = mem.book;
    mem.summary = ''; mem.count = 0; mem.injected = false; mem.wbReason = '';
    applyMemInjection('');
    if (book) { try { await writeMemEntry(book, '（已清空）', false); } catch (e) { console.warn(`[${MODULE_NAME}] 清世界书条目失败`, e); } }
    await persist(); updateMemStatus();
    toast('success', '手机记忆已清空');
}

function updateMemStatus() {
    const el = document.querySelector('#tp-panel #tp-mem-status'); if (!el) return;
    const mem = phoneMem();
    if (mem.summary) {
        const inj = mem.injected ? '已注入主线 ✓' : '主线注入 ✗';
        const bk = mem.book ? `｜世界书：${mem.book}` : (mem.wbReason === 'no-api' ? '｜世界书接口不可用(已用直接注入)' : '｜世界书未写入');
        const preview = mem.summary.length > 36 ? mem.summary.slice(0, 36) + '…' : mem.summary;
        el.textContent = `${inj} · 同步 ${mem.count} 条${bk}\n${preview}`;
    } else { el.textContent = '还没有手机记忆——聊几句，或点下面按钮手动回流。'; }
}

/* ---------- 表情：内置 + 自定义 ---------- */
function buildEmojiGrid() {
    const grid = document.getElementById('tp-emoji-grid'); if (!grid) return;
    const drawer = document.querySelector('#tp-panel .tp-emoji-drawer');
    grid.innerHTML = '';
    for (const [name, url] of Object.entries(allStickers())) {
        const cell = document.createElement('div'); cell.className = 'tp-emoji-cell'; cell.title = name;
        cell.innerHTML = `<img src="${esc(url)}">`;
        cell.addEventListener('click', () => { pushUser(`[${name}]`); if (drawer) drawer.classList.remove('open'); });
        grid.appendChild(cell);
    }
}
function renderStickerManager() {
    const box = document.querySelector('#tp-panel #tp-sticker-list'); if (!box) return;
    const cs = getSettings().customStickers || {}; const names = Object.keys(cs);
    box.innerHTML = names.length
        ? names.map(n => `<div class="tp-sticker-item"><img src="${esc(cs[n])}"><span class="tp-sticker-name">${esc(n)}</span><span class="tp-sticker-del" data-sticker="${esc(n)}">✕</span></div>`).join('')
        : '<div class="tp-sticker-empty">还没有自定义表情，下面加一个～</div>';
}
function addCustomSticker() {
    const nameEl = document.querySelector('#tp-panel #tp-sticker-name');
    const urlEl = document.querySelector('#tp-panel #tp-sticker-url');
    if (!nameEl || !urlEl) return;
    const name = nameEl.value.trim().replace(/[\[\]｜|]/g, ''); const url = urlEl.value.trim();
    if (!name || !url) { toast('warning', '名字和图片链接都要填哦'); return; }
    const s = getSettings(); if (!s.customStickers || typeof s.customStickers !== 'object') s.customStickers = {};
    s.customStickers[name] = url; saveSettings();
    nameEl.value = ''; urlEl.value = '';
    renderStickerManager(); buildEmojiGrid();
    toast('success', `表情「${name}」加好了`);
}
function delCustomSticker(name) {
    const s = getSettings(); if (s.customStickers) delete s.customStickers[name];
    saveSettings(); renderStickerManager(); buildEmojiGrid();
}

/* ---------- 朋友圈 ---------- */
const MOM_KEY = 'tp_moments';
function moments() { const cm = ctx().chatMetadata; if (!Array.isArray(cm[MOM_KEY])) cm[MOM_KEY] = []; return cm[MOM_KEY]; }
function charName() { try { const c = ctx(); return (c.name2 || c.characters?.[c.characterId]?.name || '对方').trim(); } catch (e) { return '对方'; } }
function splitMoment(text) { const imgs = []; const caption = String(text).replace(/\[([^\]\n]+)\]/g, (m, d) => { imgs.push(d.trim()); return ''; }).trim(); return { caption, imgs }; }
function momentPhotoTile(desc) { const AS = allStickers(); if (AS[desc]) return `<div class="tp-mom-photo tp-mom-photo-sticker"><img src="${esc(AS[desc])}"></div>`; return `<div class="tp-mom-photo"><span>${esc(desc)}</span></div>`; }
function timeAgo(ts) { const d = Date.now() - ts; const m = Math.floor(d / 60000); if (m < 1) return '刚刚'; if (m < 60) return m + '分钟前'; const h = Math.floor(m / 60); if (h < 24) return h + '小时前'; const day = Math.floor(h / 24); return day < 8 ? day + '天前' : new Date(ts).toLocaleDateString(); }

function pushMoment(author, text) { const t = String(text || '').trim(); if (!t) return null; const item = { id: genId(), author, text: t, ts: Date.now(), likes: [], comments: [] }; moments().push(item); persist(); loadMoments(); return item; }
function delMoment(id) { const cm = ctx().chatMetadata; cm[MOM_KEY] = (cm[MOM_KEY] || []).filter(m => String(m.id) !== String(id)); persist(); loadMoments(); }
function toggleLike(id, who) { const m = moments().find(x => String(x.id) === String(id)); if (!m) return; const i = m.likes.indexOf(who); if (i >= 0) m.likes.splice(i, 1); else m.likes.push(who); persist(); loadMoments(); }
function addMomentComment(id, who, name, text) { const t = String(text || '').trim(); if (!t) return; const m = moments().find(x => String(x.id) === String(id)); if (!m) return; m.comments.push({ who, name, text: t, ts: Date.now() }); persist(); loadMoments(); }

function loadMoments() {
    const feed = document.querySelector('#tp-panel #tp-mom-feed'); if (!feed) return;
    const s = getSettings(); const mainCt = contactById(CHAR_ID); const cn = ctName(mainCt); const arr = moments();
    const cov = document.querySelector('#tp-panel #tp-mom-cover-img'); if (cov) cov.src = sv('momentsCover');
    const meav = document.querySelector('#tp-panel #tp-mom-me-av'); if (meav) meav.src = ctUserAvatar(mainCt);
    if (!arr.length) { feed.innerHTML = '<div class="tp-mom-empty">还没有朋友圈。<br>点右上角 ＋ 发一条，或点 TA 让 TA 发。</div>'; return; }
    feed.innerHTML = arr.slice().reverse().map(m => {
        const isUser = m.author === 'user';
        const name = isUser ? '我' : cn;
        const av = isUser ? ctUserAvatar(mainCt) : ctAvatar(mainCt);
        const { caption, imgs } = splitMoment(m.text);
        const photos = imgs.length ? `<div class="tp-mom-photos n${Math.min(imgs.length, 9)}">${imgs.map(momentPhotoTile).join('')}</div>` : '';
        const liked = m.likes.includes('user');
        const likeNames = m.likes.map(l => l === 'user' ? '我' : cn);
        const likeRow = m.likes.length ? `<div class="tp-mom-likes">❤ ${likeNames.map(esc).join('，')}</div>` : '';
        const comRows = m.comments.map(cc => `<div class="tp-mom-comment"><b>${esc(cc.name)}：</b>${esc(cc.text)}</div>`).join('');
        const social = (m.likes.length || m.comments.length) ? `<div class="tp-mom-social">${likeRow}${comRows}</div>` : '';
        return `<div class="tp-mom-post" data-mid="${m.id}">
            <img class="tp-mom-av" src="${esc(av)}">
            <div class="tp-mom-body">
              <div class="tp-mom-name">${esc(name)}</div>
              ${caption ? `<div class="tp-mom-text">${esc(caption)}</div>` : ''}
              ${photos}
              <div class="tp-mom-meta"><span class="tp-mom-time">${timeAgo(m.ts)}</span>
                <span class="tp-mom-acts">
                  <span class="tp-mom-like ${liked ? 'on' : ''}" data-like="${m.id}">${liked ? '❤' : '♡'}</span>
                  <span class="tp-mom-cmt" data-cmt="${m.id}">💬</span>
                  ${isUser ? `<span class="tp-mom-react" data-react="${m.id}">让TA看</span>` : ''}
                  <span class="tp-mom-del2" data-delmom="${m.id}">✕</span>
                </span>
              </div>
              ${social}
              <div class="tp-mom-cmtbox" data-box="${m.id}" style="display:none;"><input class="tp-mom-cmtinput" data-input="${m.id}" placeholder="说点什么…"><span class="tp-mom-cmtsend" data-send="${m.id}">发送</span></div>
            </div>
          </div>`;
    }).join('');
}

function openComposer() { const c = document.querySelector('#tp-panel #tp-mom-composer'); if (c) { c.classList.add('open'); const ta = c.querySelector('#tp-mom-input'); if (ta) { ta.value = ''; setTimeout(() => ta.focus(), 50); } } }
function closeComposer() { const c = document.querySelector('#tp-panel #tp-mom-composer'); if (c) c.classList.remove('open'); }
function submitComposer() { const ta = document.querySelector('#tp-panel #tp-mom-input'); if (!ta) return; const v = ta.value.trim(); if (!v) { toast('info', '写点什么再发～'); return; } pushMoment('user', v); closeComposer(); }

async function charPostMoment() {
    const c = ctx(); if (state.generating || state.summarizing) { toast('info', 'TA正忙，稍等～'); return; }
    const chatId = c.getCurrentChatId ? c.getCurrentChatId() : c.chatId; if (!chatId) { toast('warning', '先打开一个聊天'); return; }
    const ta = charName(); state.generating = true; toast('info', `等${ta}发条朋友圈…`);
    const quiet = `请以${ta}的身份、符合当前剧情和${ta}的性格发一条朋友圈。可以配图，用[图片描述]表示（例如[窗外的雪]、[刚做好的晚饭]），也可以不配图。20到60字，口语、有生活感，别太正式。只输出朋友圈正文，不要引号、不要旁白、不要前后缀。`;
    try {
        const raw = await c.generateQuietPrompt({ quietPrompt: quiet });
        const text = stripPreset(raw).replace(/^["“』」]+|["”『「]+$/g, '').trim();
        if (!text) { toast('warning', '没拿到内容，检查下API？'); return; }
        if (looksHijacked(text) || text.length > 300) {
            console.warn(`[${MODULE_NAME}] 朋友圈返回不像一条朋友圈，已丢弃：`, text.slice(0, 300));
            toast('warning', '模型回了一大篇（多半被预设接管了），这条没发出去'); return;
        }
        pushMoment('char', text);
    } catch (e) { console.error(`[${MODULE_NAME}]`, e); toast('error', '发朋友圈失败，看看API'); }
    finally { state.generating = false; }
}

async function charReactMoment(id) {
    const c = ctx(); if (state.generating || state.summarizing) { toast('info', 'TA正忙，稍等～'); return; }
    const m = moments().find(x => String(x.id) === String(id)); if (!m) return;
    const ta = charName(); const me = (c.name1 || '我').trim();
    const { caption, imgs } = splitMoment(m.text);
    state.generating = true; toast('info', `等${ta}看一眼…`);
    const quiet = `以下是${me}发的一条朋友圈：\n正文：${caption || '（无文字）'}${imgs.length ? `\n配图：${imgs.join('、')}` : ''}\n\n请以${ta}的身份、按当前剧情和性格决定要不要点赞、要不要评论：\n- 要点赞就输出一行：[赞]\n- 要评论就输出一行：[评论：内容]\n- 可以只点赞、只评论、都做，或都不做（都不做就输出：[无]）\n只输出这些标记，不要别的。`;
    try {
        const raw = await c.generateQuietPrompt({ quietPrompt: quiet }); const text = stripPreset(raw);
        let did = false;
        if (/\[赞\]/.test(text) && !m.likes.includes(ta)) { m.likes.push(ta); did = true; }
        const cc = text.match(/\[评论[：:]\s*([\s\S]*?)\]/);
        if (cc && cc[1].trim()) { m.comments.push({ who: 'char', name: ta, text: cc[1].trim(), ts: Date.now() }); did = true; }
        persist(); loadMoments();
        toast(did ? 'success' : 'info', did ? `${ta}回应了～` : `${ta}看过了，没吭声`);
    } catch (e) { console.error(`[${MODULE_NAME}]`, e); toast('error', '让TA看失败，看看API'); }
    finally { state.generating = false; }
}


/* ---------- 功能区图标（贴图，所有卡通用，可在设置里换） ---------- */
function actionIconUrl(key) { const s = getSettings(); const o = s.actionIcons || {}; return (o[key] || ACTION_ICONS[key] || '').trim(); }
function ico(key) { const u = actionIconUrl(key); return u ? `<img src="${esc(u)}" alt="">` : (key === 'link' ? LINK_SVG : ''); }
function refreshActionIcons() { document.querySelectorAll('#tp-panel [data-ico]').forEach(el => { el.innerHTML = ico(el.dataset.ico); }); }

/* ---------- 聊天列表 ---------- */
// 列表里那条灰色预览：把组件短代码压成 [语音] 这种
const PREVIEW_MAP = { '语音': '[语音]', '定位': '[位置]', '天气': '[天气]', '链接': '[链接]', '图片': '[图片]', '外卖': '[外卖]', '代付': '[代付]', '转账': '[转账]' };
function previewText(m) {
    let t = String((m && m.text) || '').trim(); if (!t) return '';
    const nar = t.match(/^\[?旁白[：:]\s*([\s\S]*?)\]?$/); if (nar) return nar[1].slice(0, 22);
    if (/^\[?撤回[：:]/.test(t)) return '撤回了一条消息';
    const comp = t.match(/^\[(语音|定位|天气|链接|图片|外卖|代付|转账)[：:]/);
    if (comp) return PREVIEW_MAP[comp[1]];
    const bare = t.replace(/^\[|\]$/g, '');
    if (allStickers()[bare]) return '[表情]';
    return t.replace(/\s+/g, ' ').slice(0, 22);
}
function lastActive(ct) { const l = chatOf(ct.id); const last = l[l.length - 1]; return last ? (last.ts || 0) : (ct.createdAt || 0); }
function renderChatList() {
    const box = document.getElementById('tp-clist'); if (!box) return;
    // 主角色永远置顶，其余按最后消息时间排
    const arr = contacts().slice().sort((a, b) => {
        if (a.id === CHAR_ID) return -1;
        if (b.id === CHAR_ID) return 1;
        return lastActive(b) - lastActive(a);
    });
    box.innerHTML = arr.map(ct => {
        const l = chatOf(ct.id); const last = l[l.length - 1];
        let prev = last ? previewText(last) : (isCharContact(ct) ? '还没聊过，点进去说句话～' : (isGroup(ct) ? '群刚建好，说句话热热场～' : '新朋友，打个招呼吧～'));
        if (last && isGroup(ct)) { const sp = last.role === 'user' ? '我' : (last.who ? ctName(contactById(last.who)) : ''); if (sp) prev = sp + '：' + prev; }
        const unread = ct.unread > 0 ? `<span class="tp-cbadge">${ct.unread > 99 ? '99+' : ct.unread}</span>` : '';
        const del = isCharContact(ct) ? '' : `<span class="tp-cdel" data-delct="${esc(ct.id)}" title="删掉这个联系人">✕</span>`;
        return `<div class="tp-citem" data-open="${esc(ct.id)}">
            ${ctAvatarHTML(ct, 'tp-cav')}
            <div class="tp-cmain"><div class="tp-cname">${esc(ctName(ct))}${isGroup(ct) ? `<span class="tp-gtag">${groupMembers(ct).length}</span>` : ''}</div><div class="tp-cprev">${esc(prev)}</div></div>
            <div class="tp-cright"><span class="tp-ctime">${esc(last ? stampShort(last.ts) : '')}</span>${unread}${del}</div>
          </div>`;
    }).join('');
}

/* ---------- 视图切换（列表 / 聊天室 / 专属设置） ---------- */
function setView(v) {
    state.view = v;
    document.querySelectorAll('#tp-panel .tp-sub').forEach(el => el.classList.toggle('active', el.dataset.sub === v));
    closeAllMenus();
    if (v === 'list') renderChatList();
    if (v === 'room') loadHistory();
    if (v === 'cset') loadCSetForm();
    renderHeader(); applyWallpaper();
}
function openRoom(id) {
    state.activeId = id;
    const ct = contactById(id); if (ct && ct.unread) { ct.unread = 0; persist(); }
    recountBadge(); state.tab = 'chat'; setView('room');
}
function recountBadge() { state.badge = contacts().reduce((n, c) => n + (c.unread || 0), 0); updateBadge(); }

function renderHeader() {
    const hl = document.getElementById('tp-hl'), hr = document.getElementById('tp-hr'); if (!hl || !hr) return;
    const nameEl = document.querySelector('#tp-panel .contact-name');
    const stEl = document.querySelector('#tp-panel .contact-status');
    let title = '聊天', sub = '', l = '✕', la = 'close', lt = '收起', r = '＋', ra = 'new-npc', rt = '加个联系人';
    if (state.tab === 'chat' && state.view === 'room') {
        const ct = activeContact();
        title = ctName(ct); sub = ctStatusLine(ct);
        l = '‹'; la = 'back-list'; lt = '返回列表'; r = '⋯'; ra = 'cset'; rt = 'TA 的专属设置';
    } else if (state.tab === 'chat' && state.view === 'cset') {
        title = ctName(activeContact()); sub = '专属设置';
        l = '‹'; la = 'back-room'; lt = '返回聊天'; r = ''; ra = ''; rt = '';
    } else if (state.tab === 'moments') {
        title = '朋友圈'; r = ''; ra = ''; rt = '';
    } else if (state.tab === 'settings') {
        title = '设置'; sub = '这张卡 ＋ 所有卡通用'; r = ''; ra = ''; rt = '';
    }
    hl.textContent = l; hl.title = lt; hl.dataset.act = la;
    hr.textContent = r; hr.title = rt; hr.dataset.act = ra; hr.style.visibility = r ? '' : 'hidden';
    if (nameEl) nameEl.textContent = title;
    if (stEl) { stEl.textContent = sub; stEl.style.display = sub ? '' : 'none'; }
}
function applyWallpaper() {
    const wl = document.querySelector('#tp-panel .wallpaper-layer'); if (!wl) return;
    const inRoom = state.tab === 'chat' && (state.view === 'room' || state.view === 'cset');
    const url = inRoom ? ctWallpaper(activeContact()) : sv('wallpaper');
    wl.style.backgroundImage = `url('${url}')`;
}

/* ---------- 新建联系人 ---------- */
function openNpcSheet() {
    closeSheets();
    const el = document.getElementById('tp-npc-sheet'); if (!el) return;
    ['name', 'avatar', 'status', 'persona'].forEach(k => { const i = document.getElementById('tp-npc-' + k); if (i) i.value = ''; });
    el.classList.add('open');
    setTimeout(() => { const i = document.getElementById('tp-npc-name'); if (i) i.focus(); }, 60);
}
function closeNpcSheet() { const el = document.getElementById('tp-npc-sheet'); if (el) el.classList.remove('open'); }
function createNpcFromForm() {
    const v = id => (document.getElementById(id) ? document.getElementById(id).value : '').trim();
    const name = v('tp-npc-name');
    if (!name) { toast('warning', '先给TA起个名字～'); return; }
    const ct = addContact({ name, avatar: v('tp-npc-avatar'), persona: v('tp-npc-persona'), statusText: v('tp-npc-status') });
    closeNpcSheet(); renderChatList(); toast('success', `「${name}」加进通讯录了`);
    openRoom(ct.id);
}
async function aiGenerateNpc() {
    const c = ctx();
    if (state.generating || state.summarizing) { toast('info', '正忙，稍等一下～'); return; }
    const chatId = c.getCurrentChatId ? c.getCurrentChatId() : c.chatId;
    if (!chatId) { toast('warning', '先打开一个聊天'); return; }
    const me = (c.name1 || '我').trim(), main = charName();
    const exist = contacts().map(x => ctName(x)).join('、');
    state.generating = true; toast('info', '让 AI 想一个…');
    const quiet = `${UTIL_GUARD}请为${me}的手机通讯录设计一个新的联系人（一个配角NPC，不是${main}本人），要贴合当前剧情和世界观。已有的人：${exist}，不要重名。\n\n输出格式（严格遵守，整个回复只有这五行）：\n<NPC>\n名字：（2-4个字）\n状态：（很短的一句在线状态，10字以内）\n人设：（TA是谁、和${me}是什么关系、说话风格，80字以内，写成一段）\n</NPC>`;
    try {
        const got = readUtilReply(await utilGenerate(quiet, 300), 'NPC');
        if (got.bad) { toast('warning', `生成失败：${got.bad}。去设置里给「工具调用」选一个干净的连接配置。`); return; }
        const raw = got.text;
        const g = re => { const m = raw.match(re); return m ? m[1].trim().replace(/^[「『"“]+|[」』"”]+$/g, '') : ''; };
        const name = g(/名字[：:]\s*(.+)/), st = g(/状态[：:]\s*(.+)/), pe = g(/人设[：:]\s*([\s\S]+)/);
        if (!name || looksHijacked(raw)) {
            console.warn(`[${MODULE_NAME}] AI 生成NPC失败，原始返回：`, String(raw).slice(0, 500));
            toast('warning', name ? '返回的内容被预设接管了，换个连接配置试试' : '没解析出内容，再点一次试试？');
            return;
        }
        const set = (id, val) => { const i = document.getElementById(id); if (i && val) i.value = val; };
        set('tp-npc-name', name); set('tp-npc-status', st); set('tp-npc-persona', pe.split(/\n\s*\n/)[0].trim());
        toast('success', '生成好了，改一改就能创建');
    } catch (e) { console.error(`[${MODULE_NAME}]`, e); toast('error', '生成失败，看看酒馆API'); }
    finally { state.generating = false; }
}

/* ---------- 建群 ---------- */
function closeSheets() { ['tp-add-sheet', 'tp-npc-sheet', 'tp-grp-sheet'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('open'); }); }
function openAddSheet() { closeSheets(); const el = document.getElementById('tp-add-sheet'); if (el) el.classList.add('open'); }
function renderMemberPicker(boxId, selected) {
    const box = document.getElementById(boxId); if (!box) return;
    const sel = new Set(selected || []);
    const list = contacts().filter(c => !isGroup(c));
    box.innerHTML = list.length
        ? list.map(c => `<label class="tp-pick-row"><input type="checkbox" value="${esc(c.id)}" ${sel.has(c.id) ? 'checked' : ''}>${ctAvatarHTML(c, 'tp-pick-av')}<span class="tp-pick-name">${esc(ctName(c))}</span></label>`).join('')
        : '<div class="tp-sticker-empty">还没有别的联系人，先加两个人再拉群～</div>';
}
function pickedMembers(boxId) { return Array.prototype.slice.call(document.querySelectorAll('#' + boxId + ' input:checked')).map(i => i.value); }
function openGrpSheet() {
    closeSheets();
    const el = document.getElementById('tp-grp-sheet'); if (!el) return;
    const n = document.getElementById('tp-grp-name'); if (n) n.value = '';
    renderMemberPicker('tp-grp-pick', [CHAR_ID]);
    el.classList.add('open');
}
function createGroupFromForm() {
    const members = pickedMembers('tp-grp-pick');
    if (members.length < 2) { toast('warning', '群聊至少要选两个人'); return; }
    const typed = (document.getElementById('tp-grp-name') || {}).value || '';
    const auto = members.slice(0, 3).map(id => ctName(contactById(id))).join('、') + (members.length > 3 ? '等' : '');
    const g = addGroup({ name: typed.trim() || auto, members });
    closeSheets(); renderChatList(); toast('success', `群「${ctName(g)}」建好了`);
    openRoom(g.id);
}

/* ---------- 每个人的专属设置 ---------- */
function loadCSetForm() {
    const ct = activeContact(); const q = sel => document.querySelector('#tp-panel ' + sel);
    const isChar = isCharContact(ct); const grp = isGroup(ct);
    const show = (sel, on) => { const el = q(sel); if (el) el.style.display = on ? '' : 'none'; };
    show('#tp-cs-members-group', grp); show('#tp-cs-status-group', !grp);
    if (grp) renderMemberPicker('tp-cs-members', ct.members || []);
    if (q('#tp-cs-name')) { q('#tp-cs-name').value = ct.name || ''; q('#tp-cs-name').placeholder = isChar ? `留空＝跟着角色卡（${charName()}）` : (grp ? '群名字' : '名字'); }
    if (q('#tp-cs-avatar')) { q('#tp-cs-avatar').value = ct.avatar || ''; q('#tp-cs-avatar').placeholder = isChar ? '留空＝用这张卡的 TA 头像' : (grp ? '留空＝用成员头像拼一个' : '留空＝用默认头像'); }
    if (q('#tp-cs-user')) q('#tp-cs-user').value = ct.userAvatar || '';
    if (q('#tp-cs-wall')) q('#tp-cs-wall').value = ct.wallpaper || '';
    if (q('#tp-cs-status')) q('#tp-cs-status').value = ct.statusText || '';
    if (q('#tp-cs-narr')) q('#tp-cs-narr').value = ct.narration == null ? 'inherit' : (ct.narration ? 'on' : 'off');
    if (q('#tp-cs-persona')) q('#tp-cs-persona').value = ct.persona || '';
    show('#tp-cs-persona-group', !isChar && !grp);
    const db = q('#tp-cs-del'); if (db) { db.style.display = isChar ? 'none' : ''; db.textContent = grp ? '解散这个群' : '删掉这个联系人'; }
    const hint = q('#tp-cs-hint'); if (hint) hint.textContent = isChar
        ? '主角色的名字和人设跟着角色卡走。这里留空的项，会用「设置 → 这张卡的设置」里的值。'
        : (grp ? '勾选谁在群里。留空的项会用「设置」里的值。' : '这里留空的项，会用「设置」里的值。人设会在TA回复时喂给AI。');
}
function saveCSet() {
    const ct = activeContact(); const q = sel => document.querySelector('#tp-panel ' + sel);
    const val = sel => (q(sel) ? q(sel).value.trim() : '');
    ct.name = val('#tp-cs-name');
    ct.avatar = val('#tp-cs-avatar');
    ct.userAvatar = val('#tp-cs-user');
    ct.wallpaper = val('#tp-cs-wall');
    ct.statusText = val('#tp-cs-status');
    ct.persona = q('#tp-cs-persona') ? q('#tp-cs-persona').value.trim() : '';
    const nv = val('#tp-cs-narr'); ct.narration = nv === 'inherit' ? null : (nv === 'on');
    if (isGroup(ct)) {
        const picked = pickedMembers('tp-cs-members');
        if (picked.length < 2) { toast('warning', '群里至少要留两个人'); return; }
        ct.members = picked;
    }
    persist(); renderChatList(); renderHeader(); applyWallpaper(); loadHistory(); applyFabAvatar();
    toast('success', `${ctName(ct)} 的设置保存好了`);
}
function delActiveContact() {
    const ct = activeContact(); if (isCharContact(ct)) return;
    const msg = isGroup(ct) ? `解散「${ctName(ct)}」，群里的聊天记录也一起删掉？` : `把「${ctName(ct)}」和你们的聊天记录一起删掉？`;
    if (!window.confirm(msg)) return;
    delContact(ct.id); state.activeId = CHAR_ID; recountBadge(); setView('list');
    toast('success', '已删除');
}

/* ---------- 面板 / 导航 ---------- */
function updateBadge() { const b = document.querySelector('#tp-fab .tp-badge'); if (!b) return; if (state.badge > 0) { b.textContent = state.badge > 99 ? '99+' : state.badge; b.classList.add('show'); } else b.classList.remove('show'); }
function positionPanel() {
    const p = document.getElementById('tp-panel'), fab = document.getElementById('tp-fab'); if (!p || !fab) return;
    const vv = window.visualViewport;
    const de = document.documentElement;
    let vw = Math.round((vv && vv.width) || window.innerWidth || de.clientWidth || 360);
    let vh = Math.round((vv && vv.height) || window.innerHeight || de.clientHeight || 640);
    if (!(vw > 0)) vw = 360;
    if (!(vh > 0)) vh = 640;
    const set = (k, v) => p.style.setProperty(k, v, 'important'); // 防止酒馆主题 CSS 覆盖
    if (vw <= 560 || vh <= 640) {
        // 手机端必须给出「明确的像素高度」。
        // 之前用 top+bottom+height:auto，手机浏览器内核会把里层 height:100% 算成 0，
        // 手机壳就只剩顶部一条粉边。
        const m = 8;
        set('position', 'fixed');
        set('left', m + 'px'); set('top', m + 'px');
        set('right', 'auto'); set('bottom', 'auto');
        set('width', Math.max(200, vw - m * 2) + 'px');
        set('height', Math.max(200, vh - m * 2) + 'px');
        healPanel();
        return;
    }
    const pw = 330, ph = Math.min(580, vh - 40);
    const fr = fab.getBoundingClientRect();
    let left = fr.left - pw - 12; if (left < 8) left = fr.right + 12; if (left + pw > vw - 8) left = vw - pw - 8; left = clamp(left, 8, Math.max(8, vw - pw - 8));
    let top = clamp(fr.top + fr.height / 2 - ph / 2, 8, Math.max(8, vh - ph - 8));
    set('position', 'fixed');
    set('left', left + 'px'); set('top', top + 'px'); set('right', 'auto'); set('bottom', 'auto');
    set('width', pw + 'px'); set('height', ph + 'px');
    healPanel();
}
// 双保险：若某些手机内核仍把手机壳算成一条（height:100% 解析为 0），
// 就直接把壳子和内容层的像素高度写死。
function healPanel() {
    const p = document.getElementById('tp-panel'); if (!p) return;
    if (!p.offsetHeight) return; // 面板还没显示，没必要量
    const shell = p.querySelector('.cute-phone-container'); if (!shell) return;
    const cl = p.querySelector('.content-layer');
    const clear = () => {
        ['width', 'height'].forEach(k => { shell.style.removeProperty(k); if (cl) cl.style.removeProperty(k); });
    };
    const ph = parseInt(p.style.height, 10), pw = parseInt(p.style.width, 10);
    if (!(ph > 0) || !(pw > 0)) { clear(); return; }
    // 用 offsetHeight（不受入场动画的 transform 影响）判断是否真的塌了
    clear();
    if (shell.offsetHeight >= ph - 4 && shell.offsetWidth >= pw - 4) return;
    shell.style.setProperty('width', pw + 'px', 'important');
    shell.style.setProperty('height', ph + 'px', 'important');
    if (cl) { cl.style.setProperty('width', (pw - 20) + 'px', 'important'); cl.style.setProperty('height', (ph - 20) + 'px', 'important'); }
    console.warn(`[${MODULE_NAME}] 面板高度异常，已强制修正为 ${pw}x${ph}`);
}
function openPanel() {
    const p = document.getElementById('tp-panel'); positionPanel(); p.classList.add('open');
    requestAnimationFrame(positionPanel); setTimeout(positionPanel, 300);
    state.panelOpen = true; applySettings(); switchTab(state.tab || 'chat'); recountBadge();
}
function closePanel() { const p = document.getElementById('tp-panel'); if (p) p.classList.remove('open'); state.panelOpen = false; closeAllMenus(); }
function togglePanel() { state.panelOpen ? closePanel() : openPanel(); }
function switchTab(tab) {
    // 已经在聊天页又点了一次「聊天」→ 退回列表（和微信一个手感）
    if (tab === 'chat' && state.tab === 'chat' && state.view !== 'list') { setView('list'); return; }
    state.tab = tab;
    document.querySelectorAll('#tp-panel .tp-page').forEach(el => el.classList.toggle('active', el.dataset.tab === tab));
    document.querySelectorAll('#tp-panel .tp-nav-item').forEach(el => el.classList.toggle('active', el.dataset.tab === tab));
    closeAllMenus();
    if (tab === 'chat') { setView(state.view === 'cset' ? 'room' : (state.view || 'list')); return; }
    if (tab === 'moments') loadMoments();
    if (tab === 'settings') applySettings();
    renderHeader(); applyWallpaper();
}
function closeAllMenus() {
    document.querySelectorAll('#tp-panel .menu-pop.open').forEach(el => el.classList.remove('open'));
    const d = document.querySelector('#tp-panel .tp-emoji-drawer'); if (d) d.classList.remove('open');
}

/* ---------- 设置 ---------- */
function applySettings() {
    const s = getSettings();
    const phone = document.querySelector('#tp-panel .cute-phone-container'); if (phone) phone.style.fontFamily = fontFamily(s.font);
    applyFabAvatar();
    applyWallpaper(); renderHeader(); refreshActionIcons(); renderChatList();
    const q = sel => document.querySelector('#tp-panel ' + sel);
    for (const k of Object.keys(ACTION_ICONS)) { const el = q('#tp-ico-' + k); if (el) el.value = (s.actionIcons && s.actionIcons[k]) || ''; }
    const cardName = (() => { try { return charName(); } catch (e) { return '这张卡'; } })();
    if (q('#tp-set-cardname')) q('#tp-set-cardname').textContent = cardName;
    if (q('#tp-set-char')) q('#tp-set-char').value = sv('charAvatar');
    if (q('#tp-set-user')) q('#tp-set-user').value = s.userAvatar;
    if (q('#tp-set-wall')) q('#tp-set-wall').value = sv('wallpaper');
    if (q('#tp-set-cover')) q('#tp-set-cover').value = sv('momentsCover');
    if (q('#tp-set-status')) q('#tp-set-status').value = sv('statusText');
    if (q('#tp-set-font')) q('#tp-set-font').value = s.font;
    const sw = q('#tp-set-narr'); if (sw) sw.classList.toggle('on', !!sv('narration'));
    const msw = q('#tp-set-mem'); if (msw) msw.classList.toggle('on', !!s.memEnabled);
    if (q('#tp-set-memtarget')) q('#tp-set-memtarget').value = s.memTarget || 'chat';
    if (q('#tp-set-memevery')) q('#tp-set-memevery').value = s.memEvery || 6;
    const up = q('#tp-set-utilprofile');
    if (up) {
        const profs = connProfiles();
        up.innerHTML = '<option value="">跟随当前预设（可能被预设接管）</option>' +
            profs.map(p => `<option value="${esc(p.id)}">${esc(p.name || p.id)}</option>`).join('');
        up.value = s.utilProfile || '';
        const uh = q('#tp-util-hint');
        if (uh) uh.textContent = !hasCleanChannel()
            ? '这个酒馆版本没提供干净通道，只能跟随预设。'
            : (profs.length
                ? '总结记忆、生成NPC 会走这个接口，绕开你的预设和聊天历史。聊天回复不受影响，还是走预设。'
                : '没找到连接配置。在酒馆的 API 连接页建一个 Connection Profile，这里就能选了。');
    }
    updateMemStatus(); updateCardStatus();
    renderStickerManager();
}
function saveFromForm() {
    const s = getSettings(); const q = sel => document.querySelector('#tp-panel ' + sel);
    const pc = charSet();   // 这几项写进「这张卡」的那份
    pc.charAvatar = q('#tp-set-char').value.trim() || DEFAULT_CHAR_AVATAR;
    s.userAvatar = q('#tp-set-user').value.trim() || DEFAULT_USER_AVATAR;
    pc.wallpaper = q('#tp-set-wall').value.trim() || DEFAULT_WALLPAPER;
    pc.statusText = q('#tp-set-status').value.trim() || '在线';
    s.font = q('#tp-set-font').value;
    if (q('#tp-set-cover')) pc.momentsCover = q('#tp-set-cover').value.trim() || sv('momentsCover');
    s.memTarget = q('#tp-set-memtarget') ? q('#tp-set-memtarget').value : s.memTarget;
    if (q('#tp-set-memevery')) s.memEvery = clamp(parseInt(q('#tp-set-memevery').value, 10) || 6, 2, 50);
    if (q('#tp-set-utilprofile')) s.utilProfile = q('#tp-set-utilprofile').value;
    if (!s.actionIcons || typeof s.actionIcons !== 'object') s.actionIcons = {};
    for (const k of Object.keys(ACTION_ICONS)) { const el = q('#tp-ico-' + k); if (el) { const v = el.value.trim(); if (v) s.actionIcons[k] = v; else delete s.actionIcons[k]; } }
    saveSettings(); applySettings(); loadHistory();
    toast('success', '设置已保存～');
}

/* ---------- 拖拽 FAB ---------- */
function applyFabPos() {
    const s = getSettings(); const fab = document.getElementById('tp-fab'); if (!fab) return;
    if (s.fabX != null && s.fabY != null) {
        const x = clamp(s.fabX, 4, window.innerWidth - fab.offsetWidth - 4);
        const y = clamp(s.fabY, 4, window.innerHeight - fab.offsetHeight - 4);
        fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto'; fab.style.bottom = 'auto';
    }
}
function initDrag(fab) {
    let active = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
    fab.addEventListener('pointerdown', e => { active = true; moved = false; const r = fab.getBoundingClientRect(); sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top; try { fab.setPointerCapture(e.pointerId); } catch (_) {} });
    fab.addEventListener('pointermove', e => {
        if (!active) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
        const w = fab.offsetWidth, h = fab.offsetHeight;
        fab.style.left = clamp(ox + dx, 4, window.innerWidth - w - 4) + 'px';
        fab.style.top = clamp(oy + dy, 4, window.innerHeight - h - 4) + 'px';
        fab.style.right = 'auto'; fab.style.bottom = 'auto';
    });
    fab.addEventListener('pointerup', e => {
        if (!active) return; active = false; try { fab.releasePointerCapture(e.pointerId); } catch (_) {}
        if (!moved) { togglePanel(); }
        else { const s = getSettings(); s.fabX = parseInt(fab.style.left, 10); s.fabY = parseInt(fab.style.top, 10); saveSettings(); if (state.panelOpen) positionPanel(); }
    });
}

/* ---------- 全局开关（酒馆扩展面板） ---------- */
function applyGlobalEnabled() { const s = getSettings(); const fab = document.getElementById('tp-fab'); if (fab) fab.style.display = s.globalEnabled ? '' : 'none'; if (!s.globalEnabled) closePanel(); }
function injectGlobalToggle() {
    const host = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
    if (!host || document.getElementById('tp-global-enable')) return;
    const s = getSettings();
    host.insertAdjacentHTML('beforeend', `<div id="tp-ext-block" class="tp-root"><label><input type="checkbox" id="tp-global-enable" ${s.globalEnabled ? 'checked' : ''}> 显示「星宝的小手机」悬浮球</label></div>`);
    document.getElementById('tp-global-enable').addEventListener('change', function () { getSettings().globalEnabled = this.checked; saveSettings(); applyGlobalEnabled(); });
}

/* ---------- UI 构建 ---------- */
function menuBtn(key, title, items) {
    const list = items.map(it => `<div class="menu-item" data-tpl="${esc(it.tpl)}">${it.label}</div>`).join('<div class="menu-sep"></div>');
    return `<div class="menu-anchor"><div class="action-img-btn menu-toggle" data-ico="${key}" title="${title}">${ico(key)}</div><div class="menu-pop">${list}</div></div>`;
}
function codeBtn(key, tpl, title) { return `<div class="action-img-btn tp-fill" data-ico="${key}" data-tpl="${esc(tpl)}" title="${title}">${ico(key)}</div>`; }

function buildPanelHTML() {
    return `
    <div class="tp-panel tp-root" id="tp-panel">
      <div class="cute-phone-container">
        <div class="wallpaper-layer"></div>
        <div class="content-layer">
          <div class="phone-header"><div class="blur-overlay"></div>
            <div class="header-content">
              <div class="header-btn" id="tp-hl" data-act="close" title="收起">✕</div>
              <div class="header-mid"><div class="contact-name">聊天</div><div class="contact-status"></div></div>
              <div class="header-btn" id="tp-hr" data-act="new-npc" title="加个联系人">＋</div>
            </div>
          </div>
          <div class="tp-pages">

            <div class="tp-page active" data-tab="chat">

              <!-- 会话列表 -->
              <div class="tp-sub active" data-sub="list">
                <div class="tp-clist" id="tp-clist"></div>
                <div class="tp-npc-sheet" id="tp-add-sheet">
                  <div class="tp-npc-card">
                    <div class="tp-npc-title">加点什么</div>
                    <div class="tp-add-opt" id="tp-add-npc"><span class="tp-add-ico">👤</span>加一个联系人</div>
                    <div class="tp-add-opt" id="tp-add-grp"><span class="tp-add-ico">👥</span>发起群聊</div>
                    <div class="tp-npc-btns"><span class="tp-npc-btn" id="tp-add-cancel">取消</span></div>
                  </div>
                </div>
                <div class="tp-npc-sheet" id="tp-grp-sheet">
                  <div class="tp-npc-card">
                    <div class="tp-npc-title">发起群聊</div>
                    <input class="tp-set-input" id="tp-grp-name" placeholder="群名字（留空就用成员名字拼一个）">
                    <div class="tp-pick-box" id="tp-grp-pick"></div>
                    <div class="tp-npc-btns"><span class="tp-npc-btn" id="tp-grp-cancel">取消</span><span class="tp-npc-btn ok" id="tp-grp-ok">创建</span></div>
                  </div>
                </div>
                <div class="tp-npc-sheet" id="tp-npc-sheet">
                  <div class="tp-npc-card">
                    <div class="tp-npc-title">加个联系人</div>
                    <input class="tp-set-input" id="tp-npc-name" placeholder="名字">
                    <input class="tp-set-input" id="tp-npc-status" placeholder="在线状态，如「在忙」（可留空）">
                    <input class="tp-set-input" id="tp-npc-avatar" placeholder="头像链接（可留空）">
                    <textarea class="tp-set-input tp-npc-ta" id="tp-npc-persona" placeholder="TA 是谁、和你什么关系、说话什么风格…（可留空）"></textarea>
                    <div class="tp-npc-btns">
                      <span class="tp-npc-btn" id="tp-npc-cancel">取消</span>
                      <span class="tp-npc-btn ai" id="tp-npc-ai">✨ 让 AI 想一个</span>
                      <span class="tp-npc-btn ok" id="tp-npc-ok">创建</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 聊天室 -->
              <div class="tp-sub" data-sub="room">
                <div class="chat-area"></div>
                <div class="tp-emoji-drawer"><div class="hd"><span class="t">表情</span><span class="x" id="tp-emoji-close">✕</span></div><div class="tp-emoji-grid" id="tp-emoji-grid"></div></div>
                <div class="phone-footer"><div class="blur-overlay"></div>
                  <div class="footer-content">
                    <div class="action-bar">
                      ${menuBtn('voice', '语音 / 撤回', [{ label: '🎙️ 语音', tpl: '[语音：8"|这里写语音内容]' }, { label: '👻 撤回', tpl: '[撤回：这里写撤回内容]' }])}
                      ${codeBtn('link', '[链接：标题|描述]', '链接')}
                      ${menuBtn('food', '外卖 / 代付', [{ label: '🍱 为TA点', tpl: '[外卖：点单内容|已买单]' }, { label: '💳 请代付', tpl: '[代付：点单内容|这里写金额 如：¥38.00]' }])}
                      ${menuBtn('transfer', '转账 / 红包', [{ label: '🧧 转账', tpl: '[转账：金额|备注]' }, { label: '💰 收款', tpl: '[转账：金额|备注|收]' }, { label: '↩️ 退回', tpl: '[转账：金额|备注|退]' }])}
                      ${codeBtn('image', '[图片：这里写图片描述]', '图片')}
                      ${codeBtn('location', '[定位：距离xxkm|正在靠近你]', '定位')}
                      ${codeBtn('weather', '[天气：这里写天气情况，如：晴转多云|这里写备注，如：记得带伞]', '天气')}
                      <div class="action-img-btn" id="tp-emoji-btn" data-ico="sticker" title="表情">${ico('sticker')}</div>
                    </div>
                    <div class="input-wrapper"><input class="input-box" id="tp-input" placeholder="打字，回车发一条…"><div class="send-img-btn" id="tp-send" title="让TA回复">➤</div></div>
                  </div>
                </div>
              </div>

              <!-- 单人专属设置 -->
              <div class="tp-sub" data-sub="cset">
                <div class="tp-settings">
                  <div class="tp-hint tp-cs-top" id="tp-cs-hint"></div>
                  <div class="tp-set-group"><label class="tp-set-label">名字</label><input class="tp-set-input" id="tp-cs-name"></div>
                  <div class="tp-set-group"><label class="tp-set-label">TA 的头像链接</label><input class="tp-set-input" id="tp-cs-avatar"></div>
                  <div class="tp-set-group"><label class="tp-set-label">我在这个聊天里的头像</label><input class="tp-set-input" id="tp-cs-user" placeholder="留空＝用通用设置里的"></div>
                  <div class="tp-set-group"><label class="tp-set-label">这个聊天的壁纸</label><input class="tp-set-input" id="tp-cs-wall" placeholder="留空＝用这张卡的壁纸"></div>
                  <div class="tp-set-group" id="tp-cs-status-group"><label class="tp-set-label">TA 的在线状态</label><input class="tp-set-input" id="tp-cs-status" placeholder="留空＝用这张卡的设置"></div>
                  <div class="tp-set-group" id="tp-cs-members-group"><label class="tp-set-label">群成员</label><div class="tp-pick-box" id="tp-cs-members"></div></div>
                  <div class="tp-set-group"><label class="tp-set-label">旁白模式</label>
                    <select class="tp-set-input" id="tp-cs-narr">
                      <option value="inherit">跟随这张卡的设置</option>
                      <option value="on">开 · 气泡之外还有心理活动和环境描写</option>
                      <option value="off">关 · 只有纯气泡对话</option>
                    </select>
                  </div>
                  <div class="tp-set-group" id="tp-cs-persona-group"><label class="tp-set-label">TA 的人设（回复时喂给 AI）</label><textarea class="tp-set-input tp-npc-ta" id="tp-cs-persona" placeholder="TA 是谁、和你什么关系、说话风格…"></textarea></div>
                  <button class="tp-save-btn" id="tp-cs-save">保存</button>
                  <button class="tp-mem-btn tp-danger" id="tp-cs-del">删掉这个联系人</button>
                </div>
              </div>

            </div>

            <div class="tp-page" data-tab="moments">
              <div class="tp-moments">
                <div class="tp-mom-cover">
                  <img class="tp-mom-cover-img" id="tp-mom-cover-img">
                  <div class="tp-mom-cover-mask"></div>
                  <div class="tp-mom-tools"><span class="tp-mom-tool" id="tp-mom-charpost" title="让TA发一条">TA</span><span class="tp-mom-tool" id="tp-mom-post" title="发一条">＋</span></div>
                  <div class="tp-mom-me"><span class="tp-mom-me-name">我的朋友圈</span><img class="tp-mom-me-av" id="tp-mom-me-av"></div>
                </div>
                <div class="tp-mom-feed" id="tp-mom-feed"></div>
              </div>
              <div class="tp-mom-composer" id="tp-mom-composer">
                <div class="tp-mom-comp-card">
                  <div class="tp-mom-comp-title">发朋友圈</div>
                  <textarea class="tp-mom-comp-input" id="tp-mom-input" placeholder="这一刻的想法…"></textarea>
                  <div class="tp-mom-comp-hint">配图直接写描述：[窗外的晚霞]，可以写好几个。</div>
                  <div class="tp-mom-comp-btns"><span class="tp-mom-comp-cancel" id="tp-mom-cancel">取消</span><span class="tp-mom-comp-send" id="tp-mom-send">发送</span></div>
                </div>
              </div>
            </div>

            <div class="tp-page" data-tab="settings">
              <div class="tp-settings">
                <div class="tp-hint tp-cs-top">下面分两段：上半段只管当前这张角色卡，下半段所有卡通用。想给某个联系人再单独设，进那个人的聊天 → 右上角 ⋯</div>
                <div class="tp-mem-divider">🎴 这张卡的设置 · 只影响「<span id="tp-set-cardname">这张卡</span>」</div>
                <div class="tp-set-group"><label class="tp-set-label">TA 的头像链接</label><input class="tp-set-input" id="tp-set-char"></div>
                <div class="tp-set-group"><label class="tp-set-label">聊天壁纸链接</label><input class="tp-set-input" id="tp-set-wall"></div>
                <div class="tp-set-group"><label class="tp-set-label">朋友圈封面链接</label><input class="tp-set-input" id="tp-set-cover"></div>
                <div class="tp-set-group"><label class="tp-set-label">TA 的在线状态</label><input class="tp-set-input" id="tp-set-status" placeholder="在线 / 想你中 / 学习中…"></div>
                <div class="tp-set-group"><div class="tp-set-row"><label class="tp-set-label" style="margin:0;">默认旁白模式</label><div class="tp-switch" id="tp-set-narr"></div></div></div>
                <div class="tp-mem-divider">🌐 所有卡通用</div>
                <div class="tp-set-group"><label class="tp-set-label">我的头像链接</label><input class="tp-set-input" id="tp-set-user"></div>
                <div class="tp-set-group"><label class="tp-set-label">字体</label><select class="tp-set-input" id="tp-set-font"><option value="default">默认</option><option value="xiaolai">小赖字体</option><option value="round">圆润</option></select></div>
                <div class="tp-mem-divider">🎀 功能区图标 · 留空就用自带的</div>
                ${Object.keys(ACTION_ICONS).map(k => `<div class="tp-set-group tp-ico-row"><span class="tp-ico-prev" data-ico="${k}">${ico(k)}</span><input class="tp-set-input" id="tp-ico-${k}" placeholder="${esc(ACTION_ICON_LABELS[k])} 的图片链接"></div>`).join('')}
                <div class="tp-mem-divider">🎴 打包进角色卡</div>
                <div class="tp-set-group">
                  <div class="tp-mem-status" id="tp-card-status"></div>
                  <button class="tp-mem-btn" id="tp-card-save">把手机设定写进这张卡</button>
                  <button class="tp-mem-btn" id="tp-card-load" style="margin-top:6px;">从卡里读回预设</button>
                </div>
                <div class="tp-hint">写进去的是联系人、群聊、头像、壁纸、人设这些「设定」，<b>不含聊天记录</b>，也不含你自己的头像。别人导入这张卡、开一个新聊天时会自动铺上。</div>
                <div class="tp-mem-divider">📱 记忆回流 · 让主线知道手机聊了啥</div>
                <div class="tp-set-group"><div class="tp-set-row"><label class="tp-set-label" style="margin:0;">开启记忆回流</label><div class="tp-switch" id="tp-set-mem"></div></div></div>
                <div class="tp-set-group"><label class="tp-set-label">回流到哪本世界书</label><select class="tp-set-input" id="tp-set-memtarget"><option value="chat">本轮聊天专属（推荐）</option><option value="char">角色主世界书</option></select></div>
                <div class="tp-set-group"><label class="tp-set-label">每聊几条自动总结一次</label><input class="tp-set-input" id="tp-set-memevery" type="number" min="2" max="50"></div>
                <div class="tp-set-group">
                  <div class="tp-mem-status" id="tp-mem-status">还没有手机记忆。</div>
                  <button class="tp-mem-btn" id="tp-mem-now">立即总结并回流</button>
                  <button class="tp-mem-btn tp-danger" id="tp-mem-clear" style="margin-top:6px;">清空手机记忆</button>
                </div>
                <div class="tp-set-group"><label class="tp-set-label">工具调用走哪个接口</label>
                  <select class="tp-set-input" id="tp-set-utilprofile"></select>
                  <div class="tp-hint" id="tp-util-hint"></div>
                </div>
                <div class="tp-hint">记忆回流只统计和主角色的那条聊天，NPC 的私聊不会写进主线。</div>
                <div class="tp-mem-divider">🐰 我的表情 · 自己加贴纸</div>
                <div class="tp-sticker-list" id="tp-sticker-list"></div>
                <div class="tp-set-group">
                  <input class="tp-set-input tp-sticker-in" id="tp-sticker-name" placeholder="表情名字，如 抱抱（发送时用 [抱抱]）">
                  <input class="tp-set-input tp-sticker-in" id="tp-sticker-url" placeholder="图片链接 https://…">
                  <button class="tp-mem-btn" id="tp-sticker-add">＋ 添加表情</button>
                </div>
                <button class="tp-save-btn" id="tp-save">保存设置</button>
                <div class="tp-hint">回车发一条（可连发多条），点 ➤ 让 TA 回复。功能卡点一下会填进输入框，改完再发。鼠标悬在消息上出现 ✕ 可删除单条。悬浮球可拖动。</div>
              </div>
            </div>

          </div>
          <div class="tp-nav">
            <div class="tp-nav-item active" data-tab="chat"><span class="tp-nav-ico">💬</span>聊天</div>
            <div class="tp-nav-item" data-tab="moments"><span class="tp-nav-ico">🐶</span>朋友圈</div>
            <div class="tp-nav-item" data-tab="settings"><span class="tp-nav-ico">⚙️</span>设置</div>
          </div>
        </div>
      </div>
    </div>`;
}
// 悬浮球的脸＝主角色在聊天里的那张脸，别出现同一个人两个头像
function fabAvatar() {
    try { return ctAvatar(contactById(CHAR_ID)); } catch (e) { return sv('charAvatar'); }
}
function applyFabAvatar() { const el = document.querySelector('#tp-fab img'); if (el) el.src = fabAvatar(); }
function buildFabHTML() { return `<div class="tp-fab" id="tp-fab" title="小手机（可拖动）"><img src="${esc(fabAvatar())}"><span class="tp-badge"></span></div>`; }

function fillInput(tpl) { const input = document.querySelector('#tp-input'); if (!input) return; input.value = tpl; input.focus(); const len = input.value.length; try { input.setSelectionRange(len, len); } catch (e) {} closeAllMenus(); }

function bindEvents() {
    const panel = document.getElementById('tp-panel');

    // 顶栏两个按钮：做什么看 data-act（renderHeader 会改）
    const headerAct = act => {
        if (act === 'close') closePanel();
        else if (act === 'new-npc') openAddSheet();
        else if (act === 'back-list') setView('list');
        else if (act === 'back-room') setView('room');
        else if (act === 'cset') setView('cset');
    };
    document.getElementById('tp-hl').addEventListener('click', function () { headerAct(this.dataset.act); });
    document.getElementById('tp-hr').addEventListener('click', function () { headerAct(this.dataset.act); });

    // 会话列表
    document.getElementById('tp-clist').addEventListener('click', e => {
        const del = e.target.closest('.tp-cdel');
        if (del) {
            e.stopPropagation();
            const id = del.getAttribute('data-delct'); const ct = contactById(id);
            if (window.confirm(`把「${ctName(ct)}」和你们的聊天记录一起删掉？`)) { delContact(id); recountBadge(); renderChatList(); }
            return;
        }
        const row = e.target.closest('.tp-citem'); if (row) openRoom(row.getAttribute('data-open'));
    });

    // 新建联系人
    document.getElementById('tp-add-cancel').addEventListener('click', closeSheets);
    document.getElementById('tp-add-npc').addEventListener('click', openNpcSheet);
    document.getElementById('tp-add-grp').addEventListener('click', openGrpSheet);
    document.getElementById('tp-add-sheet').addEventListener('click', e => { if (e.target.id === 'tp-add-sheet') closeSheets(); });
    document.getElementById('tp-grp-cancel').addEventListener('click', closeSheets);
    document.getElementById('tp-grp-ok').addEventListener('click', createGroupFromForm);
    document.getElementById('tp-grp-sheet').addEventListener('click', e => { if (e.target.id === 'tp-grp-sheet') closeSheets(); });
    document.getElementById('tp-npc-cancel').addEventListener('click', closeNpcSheet);
    document.getElementById('tp-npc-ok').addEventListener('click', createNpcFromForm);
    document.getElementById('tp-npc-ai').addEventListener('click', aiGenerateNpc);
    document.getElementById('tp-npc-sheet').addEventListener('click', e => { if (e.target.id === 'tp-npc-sheet') closeNpcSheet(); });

    // 单人专属设置
    document.getElementById('tp-cs-save').addEventListener('click', saveCSet);
    document.getElementById('tp-cs-del').addEventListener('click', delActiveContact);

    const input = document.getElementById('tp-input');
    document.getElementById('tp-send').addEventListener('click', async () => { const t = input.value.trim(); if (t) { pushUser(t); input.value = ''; } await askReply(); });
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const t = input.value.trim(); if (t) { pushUser(t); input.value = ''; } } });
    panel.querySelectorAll('.tp-nav-item').forEach(el => el.addEventListener('click', () => switchTab(el.dataset.tab)));
    document.getElementById('tp-save').addEventListener('click', saveFromForm);
    document.getElementById('tp-set-narr').addEventListener('click', function () { const pc = charSet(); pc.narration = !sv('narration'); this.classList.toggle('on', !!pc.narration); saveSettings(); applySettings(); });
    document.getElementById('tp-set-mem').addEventListener('click', function () { const s = getSettings(); s.memEnabled = !s.memEnabled; this.classList.toggle('on', s.memEnabled); saveSettings(); });
    document.getElementById('tp-mem-now').addEventListener('click', () => summarizeAndFlow(true));
    document.getElementById('tp-mem-clear').addEventListener('click', clearMem);
    document.getElementById('tp-card-save').addEventListener('click', saveToCard);
    document.getElementById('tp-card-load').addEventListener('click', loadFromCardManual);
    document.getElementById('tp-sticker-add').addEventListener('click', addCustomSticker);

    // 朋友圈：固定按钮
    const mp = document.getElementById('tp-mom-post'); if (mp) mp.addEventListener('click', openComposer);
    const mcp = document.getElementById('tp-mom-charpost'); if (mcp) mcp.addEventListener('click', charPostMoment);
    const msend = document.getElementById('tp-mom-send'); if (msend) msend.addEventListener('click', submitComposer);
    const mcancel = document.getElementById('tp-mom-cancel'); if (mcancel) mcancel.addEventListener('click', closeComposer);
    // 朋友圈：feed 事件委托（feed 元素常驻，只换 innerHTML）
    const feed = document.getElementById('tp-mom-feed');
    if (feed) {
        feed.addEventListener('click', e => {
            const like = e.target.closest('[data-like]'); if (like) { toggleLike(like.getAttribute('data-like'), 'user'); return; }
            const del = e.target.closest('[data-delmom]'); if (del) { delMoment(del.getAttribute('data-delmom')); return; }
            const react = e.target.closest('[data-react]'); if (react) { charReactMoment(react.getAttribute('data-react')); return; }
            const cmt = e.target.closest('[data-cmt]'); if (cmt) { const box = feed.querySelector(`[data-box="${cmt.getAttribute('data-cmt')}"]`); if (box) { box.style.display = box.style.display === 'none' ? 'flex' : 'none'; const inp = box.querySelector('input'); if (inp && box.style.display !== 'none') inp.focus(); } return; }
            const send = e.target.closest('[data-send]'); if (send) { const id = send.getAttribute('data-send'); const inp = feed.querySelector(`[data-input="${id}"]`); if (inp) addMomentComment(id, 'user', '我', inp.value); return; }
        });
        feed.addEventListener('keydown', e => { const inp = e.target.closest('[data-input]'); if (inp && e.key === 'Enter') { e.preventDefault(); addMomentComment(inp.getAttribute('data-input'), 'user', '我', inp.value); } });
    }

    panel.querySelectorAll('.menu-toggle').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); const pop = btn.parentElement.querySelector('.menu-pop'); const was = pop.classList.contains('open'); closeAllMenus(); if (!was) pop.classList.add('open'); }));
    panel.querySelectorAll('.menu-item').forEach(it => it.addEventListener('click', e => { e.stopPropagation(); fillInput(it.getAttribute('data-tpl')); }));
    panel.querySelectorAll('.tp-fill').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); fillInput(b.getAttribute('data-tpl')); }));

    const drawer = panel.querySelector('.tp-emoji-drawer');
    document.getElementById('tp-emoji-btn').addEventListener('click', e => { e.stopPropagation(); const open = drawer.classList.contains('open'); closeAllMenus(); if (!open) { buildEmojiGrid(); drawer.classList.add('open'); } });
    document.getElementById('tp-emoji-close').addEventListener('click', () => drawer.classList.remove('open'));
    buildEmojiGrid();

    // 删除单条 + 删除自定义表情 + 点空白关菜单
    panel.addEventListener('click', e => {
        const del = e.target.closest('.tp-del');
        if (del) { e.stopPropagation(); deleteMsg(del.getAttribute('data-del')); return; }
        const sdel = e.target.closest('.tp-sticker-del');
        if (sdel) { e.stopPropagation(); delCustomSticker(sdel.getAttribute('data-sticker')); return; }
        closeAllMenus();
    });
}

/* ---------- 初始化 ---------- */
function init() {
    if (document.getElementById('tp-fab')) return;
    getSettings();
    try { seedFromCard(false); } catch (e) { console.error(`[${MODULE_NAME}] 读卡预设失败`, e); }
    document.body.insertAdjacentHTML('beforeend', buildFabHTML());
    document.body.insertAdjacentHTML('beforeend', buildPanelHTML());
    bindEvents();
    applyFabPos();
    initDrag(document.getElementById('tp-fab'));
    applySettings();
    applyGlobalEnabled();
    injectGlobalToggle();
    [800, 2000, 4000].forEach(t => setTimeout(injectGlobalToggle, t)); // 扩展面板可能后渲染，重试
    let relayoutPending = false;
    const relayout = () => {
        if (relayoutPending) return; relayoutPending = true;
        requestAnimationFrame(() => { relayoutPending = false; if (state.panelOpen) positionPanel(); applyFabPos(); });
    };
    window.addEventListener('resize', relayout);
    window.addEventListener('orientationchange', () => setTimeout(relayout, 250));
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', relayout);
        window.visualViewport.addEventListener('scroll', relayout);
    }
    const c = ctx();
    applyMemInjection(phoneMem().summary); // 恢复本轮聊天已有的记忆注入
    c.eventSource.on(c.event_types.CHAT_CHANGED, () => {
        // 换了酒馆聊天＝换了一套联系人，退回列表重新来
        state.activeId = CHAR_ID; state.view = 'list';
        try { seedFromCard(false); } catch (e) { console.error(`[${MODULE_NAME}] 读卡预设失败`, e); }
        applySettings(); applyMemInjection(phoneMem().summary);
        if (state.panelOpen) switchTab(state.tab || 'chat');
        recountBadge();
    });
    // 接口自检（打印到控制台，方便排查回流问题）
    const wiApi = ['loadWorldInfo', 'saveWorldInfo', 'getWorldInfoNames', 'updateWorldInfoList'].map(k => `${k}:${typeof c[k] === 'function' ? '✓' : '✗'}`).join(' ');
    console.log(`[${MODULE_NAME}] 小手机已就位 🐰 v0.12.0 ｜ setExtensionPrompt:${typeof c.setExtensionPrompt === 'function' ? '✓' : '✗'} ｜ 写卡接口 writeExtensionField:${canWriteCard() ? '✓' : '✗'} ｜ 干净通道:${hasCleanChannel() ? `✓(${connProfiles().length}个配置)` : '✗'} ｜ 世界书接口 ${wiApi}`);
}

(function boot() {
    (function tryBoot() {
        if (window.SillyTavern?.getContext) { const c = window.SillyTavern.getContext(); c.eventSource.on(c.event_types.APP_READY, init); }
        else setTimeout(tryBoot, 300);
    })();
})();
