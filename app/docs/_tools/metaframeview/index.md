---
layout: vanilla
---

<head>
<link rel="stylesheet" href="{{site.baseurl}}{{site.data.urls.bulma}}">

{% include metapage_lib_script.html %}
</head>

<body>

<h1>Metaframe viewer</h1>

<div id="url" >
</div>
<div class="horizontal" >
	<div class="column-inputs-outputs" id="container-inputs" ></div>
	<div class="column-metaframe"      id="container-metaframe" ></div>
	<div class="column-inputs-outputs" id="container-outputs" ></div>
</div>

</body>

<script src="index.js"></script>
