const addNewOne = (tab) => {
	const gettingItem = browser.storage.local.get(["hmstrBase", "hmstrToken"]);
	gettingItem.then((res) => {
		const target = `${res.hmstrBase}/api/create`;
		console.log(`Add new article: ${tab.url}`);

		fetch(target, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: res.hmstrToken,
			},
			body: JSON.stringify({ url: tab.url }),
		}).then((res) => {
			console.log(res.statusText);
			browser.notifications
				.create("hmstrResult", {
					type: "basic",
					title: "hmstr",
					message: `Result: ${res.statusText}`,
				})
				.then((r) => {
					setTimeout(() => {
						browser.notifications.clear("hmstrResult");
					}, 3000);
				});
		});
	});
};

browser.action.onClicked.addListener((tab) => addNewOne(tab));
