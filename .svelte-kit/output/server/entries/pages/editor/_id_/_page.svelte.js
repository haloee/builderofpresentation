import { e as ensure_array_like, c as pop, p as push } from "../../../../chunks/index.js";
import "../../../../chunks/client.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
import "clsx";
const replacements = {
  translate: /* @__PURE__ */ new Map([
    [true, "yes"],
    [false, "no"]
  ])
};
function attr(name, value, is_boolean = false) {
  if (value == null || !value && is_boolean) return "";
  const normalized = name in replacements && replacements[name].get(value) || value;
  const assignment = is_boolean ? "" : `="${escape_html(normalized, true)}"`;
  return ` ${name}${assignment}`;
}
function _page($$payload, $$props) {
  push();
  let slides = [];
  $$payload.out += `<section><button>${escape_html("Prezentáció nézet")}</button> `;
  {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(slides);
    $$payload.out += `<select><option value="text">Csak szöveg</option><option value="image">Csak kép</option><option value="text-image">Szöveg + Kép</option><option value="image-text">Kép + Szöveg</option></select> <button>➕ Új dia hozzáadása</button> <!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let slide = each_array[$$index];
      $$payload.out += `<div>`;
      if (slide.imagePath !== null) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<input${attr("value", slide.imagePath)}>`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]--> `;
      if (slide.content !== null) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<textarea>`;
        const $$body = escape_html(slide.content);
        if ($$body) {
          $$payload.out += `${$$body}`;
        }
        $$payload.out += `</textarea>`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]--></div>`;
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--></section>`;
  pop();
}
export {
  _page as default
};
