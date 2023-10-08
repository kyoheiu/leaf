const addNewOne = async (url) => {
	const gettingItem = await chrome.storage.local.get(['leafBase', 'leafToken']);
	console.log(gettingItem.leafBase);
	const target = `${gettingItem.leafBase}/api/create`;
	console.debug(`Add new article: ${url}`);

	const res = await fetch(target, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: gettingItem.leafToken
		},
		body: JSON.stringify({ url: url })
	});
	chrome.notifications.create('leafResult', {
		type: 'basic',
		title: 'New article',
		iconUrl: chrome.runtime.getURL("icons/48.png"),
		message: `${res.statusText} ${url}`
	});
};

chrome.action.onClicked.addListener((tab) => addNewOne(tab.url));

chrome.contextMenus.create({
	id: 'leaf',
	title: 'Save this page to leaf',
	contexts: ['all']
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	if (info.menuItemId == 'leaf') {
		if (info.linkUrl) {
			await addNewOne(info.linkUrl);
		} else {
			await addNewOne(tab.url);
		}
	}
});
