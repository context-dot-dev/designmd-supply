const button = document.querySelector('#open');
const domainLabel = document.querySelector('#domain');
const status = document.querySelector('#status');

async function initialize() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab?.url ?? '');
    const domain = url.hostname.replace(/\.$/, '');
    if (!['http:', 'https:'].includes(url.protocol)
      || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)
      || /\.(localhost|local|internal|test|invalid|example)$/.test(domain)) {
      throw new Error('Unsupported page');
    }

    domainLabel.textContent = domain;
    button.disabled = false;
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await chrome.tabs.create({ url: `https://designmd.supply/guides/${domain}` });
        window.close();
      } catch {
        status.textContent = 'Could not open the guide. Please try again.';
        button.disabled = false;
      }
    });
  } catch {
    domainLabel.textContent = 'Open a public website first';
    status.textContent = 'Browser pages, local addresses, and IP addresses are not supported.';
  }
}

initialize();
