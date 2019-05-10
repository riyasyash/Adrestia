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
const storage = app.storage("gs://"+firebaseConfig["storageBucket"]);

function syncBookmarks(callback){
	chrome.bookmarks.getTree((itemTree) => {
		var bookmarksJson = bookmarkTreeToJson(itemTree);
		callback(bookmarksJson);
	});
}

function bookmarkTreeToJson(itemTree) {
	var bookmarksJson = new Object();
	itemTree.forEach((item) => {
		if(item.title){
			bookmarksJson[item.title] = {};
			processNode(item, bookmarksJson[item.title]);
		}
		processNode(item, bookmarksJson);

	});
	return bookmarksJson;
}

function processNode(node, bmJson){
	if(node.children){
		if(node.title){
			bmJson[node.title]={};
		}
		node.children.forEach(function(child){
			if(node.title){
				processNode(child, bmJson[node.title]);
			}else{
				processNode(child, bmJson);}
			});
	}
	if(node.url){
		bmJson[node.title] = node.url;
	}
}

function storetoFB(bookmarksJson){
	var storageRef = storage.ref();
	var bookmarksRef = storageRef.child('bookmarks');
	var fileName = "bmarks.txt";
	var spaceRef = bookmarksRef.child(fileName);
	var path = spaceRef.fullPath;
	var data = JSON.stringify(bookmarksJson);

	spaceRef.putString(data).then(function(snapshot) {
		console.log('Updated bookmarks file! - ' + Date.now());
	});
}
chrome.runtime.onStartup.addListener(
	syncBookmarks(storetoFB)
	);