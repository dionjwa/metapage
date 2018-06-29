---
---

var urlObject = new URL(window.location.href);
var urlParam = urlObject.searchParams.get('url');
var debugParam = urlObject.searchParams.get('debug') == '1' || urlObject.searchParams.get('debug') == 'true';

// var metapage = new Metapage({debug:debugParam});
console.log('urlParam', urlParam);
document.getElementById("url").innerHTML = urlParam;
//Hard coding DCC for now
// urlParam = 'http://localhost:8180/metaframe/';
// urlParam = 'http://localhost:9091/metaframe?WSPORT=8180';

var metaframeDataUrl = new URL(urlParam);
// metaframeDataUrl
// var metaframeDataUrl = urlParam;
if (!metaframeDataUrl.pathname.endsWith('/metaframe.json')) {
	if (metaframeDataUrl.pathname.endsWith('/')) {
		metaframeDataUrl.pathname = metaframeDataUrl.pathname.substring(0, metaframeDataUrl.pathname.length - 1);
	}
	metaframeDataUrl.pathname = metaframeDataUrl.pathname + '/metaframe.json';
}

console.log('site.baseurl', "{{site.baseurl}}");
console.log(metaframeDataUrl.toString());
fetch(metaframeDataUrl.toString(), {method: 'get',mode: 'no-cors'})
  .then(function(response) {
    return response.json();
  })
  .then(function(metaframeJson) {
  	console.log('metaframeJson', metaframeJson);
    buildEditorWithInitialInputs(metaframeJson.inputs);
  })
  // .catch(function(error) {
  //   console.error(error);
  // });




function buildEditorWithInitialInputs(startInputs) {

	var idInputs = 'inputsId';
	var idOutputs = 'outputsId';
	var idTarget = 'target';
	var metapageDef = {
		id: '_',
		iframes: {},
		pipes: [
			{
				source: {
					id: idInputs,
					name:'*',
				},
				target: {
					id: idTarget,
					name:'*',
				}
			},
			{
				source: {
					id: idTarget,
					name:'*',
				},
				target: {
					id: idOutputs,
					name:'*',
				}
			}
		],
	};
	console.log(metapageDef);
	metapageDef.iframes[idInputs] = {
		url: '{{site.baseurl}}/metaframes/passthrough/?edit=1',
		inputs: startInputs,
		outputs: startInputs,
	};
	metapageDef.iframes[idOutputs] = {
		url: '{{site.baseurl}}/metaframes/passthrough/?edit=0',
	};


	metapageDef.iframes[idTarget] = {
		url: urlParam,
		inputs: startInputs,
	};

	var startState = {};
	startState[idInputs] = startInputs;
	startState[idTarget] = startInputs;

	console.log(metapageDef);

	var metapage = Metapage.fromDefinition(metapageDef, startState);
	var metaframe = metapage.getMetaframe(idTarget);
	var metaframeInputs = metapage.getMetaframe(idInputs);
	var metaframeOutputs = metapage.getMetaframe(idOutputs);

	// var metaframe = metapage.createIFrame('http://localhost:8180/metaframe/');
	// var metaframeInputs = metapage.createIFrame('{{site.baseurl}}/metapage/metaframes/passthrough/?edit=1');
	// var metaframeOutputs = metapage.createIFrame('{{site.baseurl}}/metapage/metaframes/passthrough/?edit=0&debug=1');

	document.getElementById("container-inputs").appendChild(metaframeInputs.iframe);
	document.getElementById("container-outputs").appendChild(metaframeOutputs.iframe);
	document.getElementById("container-metaframe").appendChild(metaframe.iframe);

	// metapage.pipe({
	// 	source: {
	// 		id: metaframeInputs.id,
	// 		name:'*',
	// 	},
	// 	target: {
	// 		id: metaframe.id,
	// 		name:'*',
	// 	}
	// });
	// metapage.pipe({
	// 	source: {
	// 		id: metaframe.id,
	// 		name:'*',
	// 	},
	// 	target: {
	// 		id: metaframeOutputs.id,
	// 		name:'*',
	// 	}
	// });
}



//Parse the "url" parameter out of the query string, if it exists.
// const qs = (function(a) {
//     if (a == "") return {};
//     var b = {};
//     for (var i = 0; i < a.length; ++i)
//     {
//         var p=a[i].split('=', 2);
//         if (p.length == 1)
//             b[p[0]] = "";
//         else
//             b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
//     }
//     return b;
// })(window.location.search.substr(1).split('&'));

// var url = qs['url'];
// var debug = qs['debug'];

// var connectionManager = new Metapage({debug:debug});
// var metaframe = null;
// var inputTypes = {};

// function sanitizeUrl(inputUrl) {
// 	var url = inputUrl;
// 	if (!url.startsWith('http')) {
// 		while(url.startsWith('/')) {
// 			url = url.substr(1);
// 		}
// 		url = location.protocol + '//' + location.hostname + (location.port != null && location.port != '' ? ':' + location.port: '') + '/' + url;
// 	}
// 	return url;
// }

// function getInputNamed(name) {
// 	name = name.trim();
// 	var children = document.getElementById("inputs").children;
// 	for (var i = 0; i < children.length; i++) {
// 		var inputDiv = children[i];
// 		var nameElement = inputDiv.getElementById("InputName");
// 		if (nameElement.value.trim() == name) {
// 			return inputDiv;
// 		}
// 	}
// 	return null;
// }

// function createOutput(name, value) {
// 	var table = document.getElementById("outputs-table");
// 	var row = table.insertRow(row, table.rows);

// 	var cellName = document.createElement("td");
// 	row.appendChild(cellName);
// 	cellName.textContent = name;
// 	cellName.id = "OutputName" + name;

// 	var cellValue = document.createElement("td");
// 	row.appendChild(cellValue);
// 	var cellTextArea = document.createElement("textarea");
// 	cellValue.appendChild(cellTextArea);

// 	cellTextArea.textContent = value;
// 	cellTextArea.id = "OutputValue" + name;

// 	return row;
// }

// function getOutput(name) {
// 	return document.getElementById("OutputValue" + name.trim());
// }

// function setOutput(name, value) {
// 	var element = getOutput(name);
// 	if (element == null) {
// 		createOutput(name, value);
// 		element = getOutput(name);
// 	}
// 	// if (typeof(value) == 'string' && value.startsWith('http')) {
// 	// 	value = '<a href="' + value + '">' + value + '</a>';
// 	// }
// 	element.innerHTML = value;
// }

// function createInput(name, type, value) {
// 	console.log('createInput ' + name + ' value=' + value);
// 	var table = document.getElementById("inputs-table");
// 	var row = table.insertRow(row, table.rows);

// 	var cellName = document.createElement("td");
// 	row.appendChild(cellName);
// 	var nameInput = document.createElement("input");
// 	nameInput.class = "form-control";
// 	cellName.appendChild(nameInput);

// 	var cellType = document.createElement("td");
// 	row.appendChild(cellType);
// 	if (!type) {
// 		type = 'string';
// 	}
// 	cellType.innerHTML = type;

// 	var cellValue = document.createElement("td");
// 	row.appendChild(cellValue);
// 	var valueInput = document.createElement("textarea");
// 	valueInput.class = "form-control";

// 	cellValue.appendChild(valueInput);
// 	if (value) {
// 		valueInput.value = value;
// 	}

// 	var removeElement = document.createElement("td");
// 	row.appendChild(removeElement);
// 	var removeButton = document.createElement("button");
// 	removeButton.class = "btn btn-default";
// 	removeButton.type = "submit";
// 	removeButton.innerHTML = '-';
// 	removeElement.appendChild(removeButton);
// 	removeButton.onclick = function(e) {
// 		table.deleteRow(row.rowIndex);
// 	};

// 	var changeName = function(newName) {
// 		nameInput.value = newName;
// 		nameInput.id = "InputName" + newName;
// 		valueInput.id = "InputValue" + newName;
// 	}

// 	if (name) {
// 		changeName(name);
// 	}

// 	valueInput.addEventListener('keypress', function (e) {
// 		var key = e.which || e.keyCode;
// 		if (key === 13) { // 13 is enter
// 			sendInputs();
// 		}
// 	});

// 	return row;
// }

// function getConvertedValue(input) {
// 	if (input.value !== '' && inputTypes[input.name]) {
// 		switch(inputTypes[input.name]) {
// 			case 'json':
// 				return JSON.parse(input.value);
// 				break;
// 			case 'float':
// 			case 'number':
// 				try {
// 					return parseFloat(input.value);
// 				} catch(err) {
// 					console.error(err);
// 				}
// 				break;
// 			default:
// 				return input.value;
// 		}
// 	} else {
// 		return input.value;
// 	}
// }

// function sendInputs() {
// 	var table = document.getElementById("inputs-table");
// 	var rows = table.rows;
// 	var inputs = [];
// 	for (var i = 1; i < rows.length; i++) {
// 		var row = rows[i];
// 		var name = row.cells[0].children[0].value;
// 		var value = row.cells[2].children[0].value;
// 		// value = getConvertedValue({name, value});
// 		inputs.push({name:name, value:value});
// 	}
// 	if (metaframe) {
// 		metaframe.setInputs(inputs);
// 	}
// }

// /**
//  * If we got a blob JSON describing the metaframe
//  * then we can pre-create the input fields
//  */
// function setInputs(inputs) {
// 	var table = document.getElementById("inputs-table");
// 	while (table.rows.length > 1) {
// 		table.deleteRow(table.rows.length - 1);
// 	}
// 	for (var i = 0; i < inputs.length; i++) {
// 		var inputData = inputs[i];
// 		createInput(inputData.name,inputData.type);
// 		inputTypes[inputData.name] = inputData.type;
// 		if (inputData.value) {
// 			var valueElement = document.getElementById("InputValue" + inputData.name);
// 			var value = inputData.value;
// 			if (typeof(value) == 'object') {
// 				value = JSON.stringify(inputData.value);
// 			}
// 			// if (inputData.type == 'json') {
// 			// 	value = JSON.stringify(inputData.value);
// 			// }
// 			valueElement.value = value;//JSON.stringify(inputData.value);
// 			if (metaframe) {
// 				metaframe.setInput(inputData.name, {value:inputData.value});
// 			}
// 		} else {
// 			console.log('no value for ', inputData);
// 		}
// 	}
// }
// $('#addInputButton').on('click', function (e) {
// 	createInput('NEW ROW');
// });

// $('#sendButton').on('click', function (e) {
// 	var table = document.getElementById("outputs-table");
// 	var rows = table.rows;
// 	var i = rows.length;
// 	while (--i) {
// 		table.deleteRow(i);
// 	}
// 	sendInputs();
// });

// $('#buttonGoToUrl').on('click', function (e) {
// 	var currentUrl = document.getElementById("inputUrl").value;
// 	onNewUrl(currentUrl);
// });

// /**
//  * Reset everything, and rebuild
//  */
// function onNewUrl(url) {
// 	//update the visible link
// 	var a = document.createElement('a');
// 	a.setAttribute('href', url);
// 	a.innerHTML = 'Go to metaframe';
// 	const urlContainer = document.getElementById('urlLink');
// 	while (urlContainer.firstChild) {
// 	    urlContainer.removeChild(urlContainer.firstChild);
// 	}
// 	urlContainer.appendChild(a);

// 	//Update the metaframe
// 	connectionManager.removeAll();
// 	metaframe = connectionManager.createIFrame(url);
// 	metaframe.iframe.id = 'metaframe';
// 	document.getElementById("metaframes").appendChild(metaframe.iframe);
// 	// Make a request for a user with a given ID
// 	var metaframeJsonUrl = url;
// 	console.log('url', url);
// 	var tokens = url.split('?');
// 	console.log('tokens', tokens);
// 	metaframeJsonUrl = tokens.shift();
// 	var secondHalf = tokens.join('?');
// 	console.log('secondHalf', secondHalf);
// 	if (!metaframeJsonUrl.endsWith('/')) {
// 		metaframeJsonUrl = metaframeJsonUrl + '/';
// 	}
// 	metaframeJsonUrl = metaframeJsonUrl + 'metaframe.json';
// 	metaframeJsonUrl = metaframeJsonUrl + '?' + secondHalf;
// 	console.log('metaframeJsonUrl', metaframeJsonUrl);
// 	axios.get(metaframeJsonUrl)
// 		.then(function (response) {
// 			console.log(response.data);
// 			if (response.data && response.data.inputs) {
// 				//Clear out the original inputs
// 				response.data.inputs.forEach(function(e) {
// 					if (e.value && typeof(e.value) == 'object') {
// 						e.value = JSON.stringify(e.value);
// 						// delete e.type;
// 					}
// 				});
// 				setInputs(response.data.inputs);
// 			} else {
// 				console.log('Got metapage.json but no inputs array.');
// 			}
// 		})
// 		.catch(function (error) {
// 			console.warn('No metaframe.json @ ' + metaframeJsonUrl, error);
// 		});

// 	metaframe.onOutput(function(pipeName, dataBlob) {
// 		var value = dataBlob.value;
// 		if (dataBlob.encoding === 'base64') {
// 			value = atob(value);
// 		}
// 		setOutput(pipeName, value);
// 	});
// }

// if (url != null) {
// 	url = sanitizeUrl(url);
// 	document.getElementById("inputUrl").value = url;
// 	onNewUrl(url);
// }
