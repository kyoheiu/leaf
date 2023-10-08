const addNewOne = (url) => {
	const gettingItem = browser.storage.local.get(['leafBase', 'leafToken']);
	gettingItem.then((res) => {
		const target = `${res.leafBase}/api/create`;
		console.debug(`Add new article: ${url}`);

		fetch(target, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: res.leafToken
			},
			body: JSON.stringify({ url: url })
		}).then((res) => {
			browser.notifications
				.create('leafResult', {
					type: 'basic',
					title: 'leaf',
					message: `Result: ${res.statusText}`
				})
				.then((r) => {
					setTimeout(() => {
						browser.notifications.clear('leafResult');
					}, 3000);
				});
		});
	});
};

browser.browserAction.onClicked.addListener((tab) => addNewOne(tab.url));

browser.contextMenus.create({
	id: 'leaf',
	title: 'Save this page to leaf',
	contexts: ['all']
});

browser.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId == 'leaf') {
		if (info.linkUrl) {
			addNewOne(info.linkUrl);
		} else {
			addNewOne(tab.url);
		}
	}
});
