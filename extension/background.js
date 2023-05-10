const addNewOne = (tab) => {
	const gettingItem = browser.storage.local.get(["leafBase", "leafToken"]);
	gettingItem.then((res) => {
		const target = `${res.leafBase}/api/create`;
		console.debug(`Add new article: ${tab.url}`);

		fetch(target, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: res.leafToken,
			},
			body: JSON.stringify({ url: tab.url }),
		}).then((res) => {
			browser.notifications
				.create("leafResult", {
					type: "basic",
					title: "leaf",
					message: `Result: ${res.statusText}`,
				})
				.then((r) => {
					setTimeout(() => {
						browser.notifications.clear("leafResult");
					}, 3000);
				});
		});
	});
};

browser.browserAction.onClicked.addListener((tab) => addNewOne(tab));
