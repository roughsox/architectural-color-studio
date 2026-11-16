// Shared by every page. Copy buttons: copies the text of the element named in data-copy (inside the nearest
// section), or else the element right after the button.
document.addEventListener('click', e => {
  const b = e.target.closest('button.copy');
  if (!b) return;
  const t = b.dataset.copy ? b.closest('section, .prompt, div').querySelector(b.dataset.copy) : b.nextElementSibling;
  if (!t || !navigator.clipboard) return;
  navigator.clipboard.writeText(t.innerText).then(() => { const o = b.textContent; b.textContent = 'Copied'; setTimeout(() => (b.textContent = o), 1500); });
});
