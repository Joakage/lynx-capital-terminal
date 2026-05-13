(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
		var btn = document.getElementById('lynx-reindex-btn');
		var status = document.getElementById('lynx-reindex-status');
		if (!btn || !window.LynxChatbotAdmin) return;

		btn.addEventListener('click', function () {
			btn.disabled = true;
			status.textContent = LynxChatbotAdmin.strings.running;

			fetch(LynxChatbotAdmin.reindexUrl, {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': LynxChatbotAdmin.nonce
				},
				body: '{}'
			})
				.then(function (res) { return res.json().then(function (j) { return { ok: res.ok, body: j }; }); })
				.then(function (out) {
					btn.disabled = false;
					if (!out.ok) {
						status.textContent = LynxChatbotAdmin.strings.error + ' ' + (out.body && out.body.message ? out.body.message : 'HTTP');
						return;
					}
					var msg = LynxChatbotAdmin.strings.done + ' ' + out.body.indexed + ' / ' + out.body.total;
					if (out.body.errors && out.body.errors.length) {
						msg += ' (' + out.body.errors.length + ' errores)';
						console.warn('Lynx Chatbot reindex errors', out.body.errors);
					}
					status.textContent = msg;
				})
				.catch(function (err) {
					btn.disabled = false;
					status.textContent = LynxChatbotAdmin.strings.error + ' ' + err.message;
				});
		});
	});
})();
