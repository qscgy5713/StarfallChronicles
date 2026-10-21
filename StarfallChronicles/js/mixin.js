/**
 * mixinFrom(Class)：把 class 的方法 (不含 constructor) 複製成普通物件，供 Object.assign 掛到其他類別的原型。
 * 引擎 mixin 檔 (engine_guild.js / engine_story.js) 用 class 語法撰寫方法，不必處理逗號分隔。
 */
function mixinFrom(Cls) {
  const out = {};
  Object.getOwnPropertyNames(Cls.prototype)
    .filter(n => n !== "constructor")
    .forEach(n => { out[n] = Cls.prototype[n]; });
  return out;
}

if (typeof window !== "undefined") window.mixinFrom = mixinFrom;
if (typeof module !== "undefined" && module.exports) module.exports = { mixinFrom };
