function saveOptions(e) {
	chrome.storage.local.set({
		leafBase: document.querySelector('#leafBase').value
	});
	chrome.storage.local.set({
		leafToken: document.querySelector('#leafToken').value
	});
	document.querySelector('#managed-base').innerText = document.querySelector('#leafBase').value;
	e.preventDefault();
}

function restoreOptions() {
	chrome.storage.local.get('leafBase', (storageItem) => {
		document.querySelector('#managed-base').innerText = storageItem.leafBase;
	});
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
