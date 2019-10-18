var firebaseConfig = {
	apiKey: "",
	authDomain: "",
	databaseURL: "",
	projectId: "",
	storageBucket: "",
	messagingSenderId: "",
	appId: ""
};
const app = firebase.initializeApp(firebaseConfig);
const storage = app.storage("gs://" + firebaseConfig["storageBucket"]);

function syncBookmarks(callback) {
	chrome.bookmarks.getTree((itemTree) => {
		var bookmarksJson = bookmarkTreeToJson(itemTree);
		callback(bookmarksJson);
	});
}

function bookmarkTreeToJson(itemTree) {
	var bookmarksJson = new Object();
	itemTree.forEach((item) => {
		if (item.title) {
			bookmarksJson[item.title] = {};
			processNode(item, bookmarksJson[item.title]);
		}
		processNode(item, bookmarksJson);

	});
	return bookmarksJson;
}

function processNode(node, bmJson) {
	if (node.children) {
		if (node.title) {
			bmJson[node.title] = { "id": node.id };
		}
		node.children.forEach(function (child) {
			if (node.title) {
				processNode(child, bmJson[node.title]);
			} else {
				processNode(child, bmJson);
			}
		});
	}
	if (node.url) {
		bmJson[node.title] = { "id": node.id, "url": node.url };
	}
}

function storetoFB(bookmarksJson) {
	var storageRef = storage.ref();
	var bookmarksRef = storageRef.child('bookmarks');
	var fileName = "bmarks.txt";
	var spaceRef = bookmarksRef.child(fileName);
	var path = spaceRef.fullPath;
	var data = JSON.stringify(bookmarksJson);
	// console.log(data);
	spaceRef.putString(data).then(function (snapshot) {
		console.log('Updated bookmarks file! - ' + Date.now());
	});
}

var fileJson = {
	"Bookmarks Bar": {
		"id": "1",
		"new book mark": {
			"id": "150",
			"url": "https://www.google.com"
		}
	}
}
function createBookMarks(fileJson) {
	for (var key in fileJson) {
		if (fileJson[key]["id"]) {
			processBookMarks(fileJson, key, createBookMarks);
		}
	};
}

function processBookMarks(fileJson, key, callback) {
	console.log("fetching it");
	try{
		chrome.bookmarks.get(fileJson[key]["id"], (node)=>{
			try{
				if(node){
					console.log("node already present"+key);
					callback(fileJson[key])
				}
			}catch(lastError){
				console.log("caught and created");
			}
		});
	}catch(lastError){
		console.log("caught and created");
	}

}

function readFileFromFirebase() {

}
chrome.runtime.onStartup.addListener(
	// syncBookmarks(storetoFB)
	createBookMarks(fileJson)
);

