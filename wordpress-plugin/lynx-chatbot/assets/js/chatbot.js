(function () {
	'use strict';

	if (!window.LynxChatbot) return;
	var cfg = window.LynxChatbot;

	function el(tag, attrs, children) {
		var node = document.createElement(tag);
		if (attrs) {
			Object.keys(attrs).forEach(function (k) {
				if (k === 'class') node.className = attrs[k];
				else if (k === 'text') node.textContent = attrs[k];
				else if (k.indexOf('on') === 0) node.addEventListener(k.slice(2), attrs[k]);
				else node.setAttribute(k, attrs[k]);
			});
		}
		(children || []).forEach(function (c) { node.appendChild(c); });
		return node;
	}

	function escapeHtml(s) {
		return String(s)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	function renderMarkdownish(text) {
		var safe = escapeHtml(text);
		safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
		safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');
		safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
		return safe.replace(/\n/g, '<br>');
	}

	function buildPanel(mountInline) {
		var panel = el('div', { class: 'lynx-chatbot-panel' + (mountInline ? ' is-open' : '') });

		var header = el('div', { class: 'lynx-chatbot-header' });
		header.appendChild(el('span', { text: cfg.title || 'Chatbot' }));
		if (!mountInline) {
			var closeBtn = el('button', { class: 'lynx-chatbot-close', 'aria-label': cfg.strings.close, text: '×' });
			header.appendChild(closeBtn);
			closeBtn.addEventListener('click', function () { panel.classList.remove('is-open'); });
		}
		panel.appendChild(header);

		var messages = el('div', { class: 'lynx-chatbot-messages' });
		panel.appendChild(messages);

		var inputWrap = el('div', { class: 'lynx-chatbot-input' });
		var textarea = el('textarea', { placeholder: cfg.strings.placeholder, rows: '1' });
		var sendBtn = el('button', { type: 'button', text: cfg.strings.send });
		inputWrap.appendChild(textarea);
		inputWrap.appendChild(sendBtn);
		panel.appendChild(inputWrap);

		var history = [];

		function addMessage(role, text, sources) {
			var wrap = el('div', { class: 'lynx-chatbot-msg ' + role });
			var bubble = el('div', { class: 'lynx-chatbot-bubble' });
			bubble.innerHTML = renderMarkdownish(text);
			wrap.appendChild(bubble);
			if (sources && sources.length) {
				var src = el('div', { class: 'lynx-chatbot-sources' });
				var links = sources.map(function (s) {
					var title = s.title || s.url;
					return '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(title) + '</a>';
				}).join(' &middot; ');
				src.innerHTML = '<strong>' + escapeHtml(cfg.strings.sources) + '</strong> ' + links;
				bubble.appendChild(src);
			}
			messages.appendChild(wrap);
			messages.scrollTop = messages.scrollHeight;
		}

		if (cfg.welcome) {
			addMessage('bot', cfg.welcome);
		}

		function send() {
			var text = textarea.value.trim();
			if (!text) return;
			textarea.value = '';
			addMessage('user', text);
			history.push({ role: 'user', text: text });

			var thinkingWrap = el('div', { class: 'lynx-chatbot-msg bot' });
			var thinkingBubble = el('div', { class: 'lynx-chatbot-bubble', text: cfg.strings.thinking });
			thinkingWrap.appendChild(thinkingBubble);
			messages.appendChild(thinkingWrap);
			messages.scrollTop = messages.scrollHeight;

			sendBtn.disabled = true;

			fetch(cfg.endpoint, {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': cfg.nonce
				},
				body: JSON.stringify({ message: text, history: history.slice(-10) })
			})
				.then(function (res) { return res.json().then(function (j) { return { ok: res.ok, body: j }; }); })
				.then(function (out) {
					messages.removeChild(thinkingWrap);
					sendBtn.disabled = false;
					if (!out.ok) {
						addMessage('bot', cfg.strings.error + ' ' + (out.body && out.body.error ? out.body.error : ''));
						return;
					}
					addMessage('bot', out.body.answer, out.body.sources);
					history.push({ role: 'assistant', text: out.body.answer });
				})
				.catch(function () {
					messages.removeChild(thinkingWrap);
					sendBtn.disabled = false;
					addMessage('bot', cfg.strings.error);
				});
		}

		sendBtn.addEventListener('click', send);
		textarea.addEventListener('keydown', function (e) {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				send();
			}
		});

		return panel;
	}

	function mountFloating() {
		var root = document.getElementById('lynx-chatbot-root');
		if (!root) return;

		var fab = el('button', { class: 'lynx-chatbot-fab', type: 'button', 'aria-label': cfg.strings.open, text: '\u{1F4AC}' });
		var panel = buildPanel(false);
		root.appendChild(fab);
		root.appendChild(panel);

		fab.addEventListener('click', function () {
			panel.classList.toggle('is-open');
		});
	}

	function mountInline() {
		var inlines = document.querySelectorAll('#lynx-chatbot-root-inline, .lynx-chatbot-inline');
		inlines.forEach(function (node) {
			if (node.dataset.lynxMounted === '1') return;
			node.dataset.lynxMounted = '1';
			node.appendChild(buildPanel(true));
		});
	}

	document.addEventListener('DOMContentLoaded', function () {
		mountFloating();
		mountInline();
	});
})();
