const ok = () => {
	console.log("ok");
};

const err = () => {
	console.log("error");
};

function saveOptions(e) {
	browser.storage.local
		.set({
			hmstrBase: document.querySelector("#hmstrBase").value,
		})
		.then(ok());
	browser.storage.local
		.set({
			hmstrToken: document.querySelector("#hmstrToken").value,
		})
		.then(ok());
	document.querySelector("#managed-base").innerText =
		document.querySelector("#hmstrBase").value;
	e.preventDefault();
}

function restoreOptions() {
	let storageItem = browser.storage.local.get("hmstrBase");
	storageItem.then((res) => {
		document.querySelector("#managed-base").innerText = res.hmstrBase;
	});
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
