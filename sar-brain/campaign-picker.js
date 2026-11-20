// Mount the campaign control in the current viewer's toolbar.
(() => {
  const script = document.currentScript;
  const { campaign, mode, toolbar } = script.dataset;
  const pages = {
    RENIN: {
      network: 'renin_slideria_brain_20261116/RENIN_SAR_Brain.html',
      squares: 'renin_all_platforms_20261116/RENIN_All_Platforms.html'
    },
    ABL1: {
      network: 'abl1-synthesis/ABL1_SAR_Brain.html',
      squares: 'abl1-synthesis/ABL1_All_Platforms.html'
    },
    S1P1: {
      network: 's1p1-synthesis/S1P1_SAR_Brain.html',
      squares: 's1p1-synthesis/S1P1_Combined_Exploration.html'
    }
  };
  const label = document.createElement('label');
  label.textContent = 'Campaign ';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Campaign');
  for (const name of Object.keys(pages)) select.add(new Option(name, name));
  const restore = () => { select.value = campaign; };
  restore();
  window.addEventListener('pageshow', restore);
  select.addEventListener('change', () => {
    const activeMode = mode === 'combined'
      ? (document.getElementById('retro').hidden ? 'network' : 'squares')
      : mode;
    location.assign(new URL(pages[select.value][activeMode], script.src));
  });
  label.append(select);
  document.querySelector(toolbar).prepend(label);
})();
