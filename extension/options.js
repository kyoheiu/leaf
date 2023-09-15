const ok = () => {
	console.debug("ok");
};

const err = () => {
	console.debug("error");
};

function saveOptions(e) {
	browser.storage.local
		.set({
			leafBase: document.querySelector("#leafBase").value,
		})
		.then(ok());
	browser.storage.local
		.set({
			leafToken: document.querySelector("#leafToken").value,
		})
		.then(ok());
	document.querySelector("#managed-base").innerText =
		document.querySelector("#leafBase").value;
	e.preventDefault();
}

function restoreOptions() {
	let storageItem = browser.storage.local.get("leafBase");
	storageItem.then((res) => {
		document.querySelector("#managed-base").innerText = res.leafBase;
	});
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
