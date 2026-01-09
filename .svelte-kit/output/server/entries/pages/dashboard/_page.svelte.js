import { e as ensure_array_like, c as pop, p as push } from "../../../chunks/index.js";
import "../../../chunks/client.js";
import { e as escape_html } from "../../../chunks/escaping.js";
function _page($$payload, $$props) {
  push();
  let presentations = [];
  const each_array = ensure_array_like(presentations);
  $$payload.out += `<section class="min-h-screen bg-gray-100 p-6 flex justify-center items-center"><div class="max-w-4xl w-full bg-white shadow-lg rounded-xl p-6"><h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Saját Projektek</h2> <div class="flex justify-between items-center mb-6"><button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition">+ Új Prezentáció</button></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let presentation = each_array[$$index];
    $$payload.out += `<div class="p-5 bg-white border border-gray-300 rounded-xl shadow-lg cursor-pointer hover:bg-gray-50 transition transform hover:scale-105"><h3 class="text-lg font-semibold text-gray-700">${escape_html(presentation.title)}</h3></div>`;
  }
  $$payload.out += `<!--]--></div></div></section>`;
  pop();
}
export {
  _page as default
};
