var fs = require("fs"),
	js = "",
	html = "",
	css = "",
	newFile;

fs.readFile("js/script.js", function (err,data) {
  if (err) throw err;
  js += data;
});

fs.readFile("css/style.css", function (err,data) {
  if (err) throw err;
  css += data;
});

fs.readFile("index.html", function (err,data) {
  if (err) throw err;
  html += data;
});

function newText(){
	html = html.replace("<link rel=\"stylesheet\" href=\"css/style.css\">", "");
	html = html.replace("/*Here goes style*/", css);
	html = html.replace("<script src=\"js/script.js\"></script>", "");
	html = html.replace("// Here goes script", js);

	fs.writeFile("compressed.html", html, function(err) {
	    if(err) throw err;
	    console.log("The file was saved!");
	}); 
}

setTimeout(newText, 1000);